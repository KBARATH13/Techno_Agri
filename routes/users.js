const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
let User = require('../models/user.model');
const blockchainService = require('../utils/BlockchainService');

// Register
router.route('/register').post(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Store hash on Blockchain
    try {
      await blockchainService.setHash(savedUser._id.toString(), {
        username: savedUser.username,
        email: savedUser.email,
      }, 'USER_PROFILE');
      console.log(`Blockchain hash stored for user: ${savedUser._id}`);
    } catch (bcError) {
      console.error('Blockchain storage failed but user saved to DB:', bcError.message);
      // We still return success but log the blockchain error
    }

    res.json(savedUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.route('/login').post(async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User
router.route('/').get(auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Verify Integrity
    let integrity = true;
    try {
      const verification = await blockchainService.verifyIntegrity(user._id.toString(), {
        username: user.username,
        email: user.email,
      });
      integrity = verification.isMatch;
      if (!integrity) {
        console.error(`!!!! ALERT: TAMPER DETECTED FOR USER ${user._id} !!!!`);
      }
    } catch (err) {
      console.warn('Could not verify blockchain integrity:', err.message);
      // We continue but integrity remains true (or unknown)
    }

    res.json({
      ...user.toObject(),
      integrityStatus: integrity ? "VALID" : "TAMPERED"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
