const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');


const cryptoPath = path.resolve(__dirname, '..', '..', 'blockchain', 'crypto-config');
const keyDirectoryPath = path.resolve(cryptoPath, 'peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore');
const certPath = path.resolve(cryptoPath, 'peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem');
const tlsCertPath = path.resolve(cryptoPath, 'peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt');
const peerEndpoint = 'localhost:7051'; 
const peerHostAlias = 'peer0.org1.example.com'; 

class BlockchainService {
    constructor() {
        this.gateway = null;
        this.network = null;
        this.contract = null;
        this.client = null;
    }

    async init() {
        try {
            console.log('Initializing Blockchain Gateway...');
            console.log('Connecting to peer at:', peerEndpoint);
            console.log('Using certificate path:', certPath);
            
            this.client = await this.newGrpcConnection();
            console.log('✓ gRPC connection established');
            
            this.gateway = connect({
                client: this.client,
                identity: await this.newIdentity(),
                signer: await this.newSigner(),
                evaluateOptions: () => { return { deadline: Date.now() + 10000 }; },
                submitOptions: () => { return { deadline: Date.now() + 10000 }; },
            });
            console.log('✓ Gateway connected');

            this.network = this.gateway.getNetwork('smartfarmchannel');
            console.log('✓ Network obtained: smartfarmchannel');
            
            this.contract = this.network.getContract('smartfarm');
            console.log('✓ Contract obtained: smartfarm');
            console.log('Blockchain Gateway Initialized Successfully');
            
            // Test the connection with a simple evaluate transaction
            try {
                await this.contract.evaluateTransaction('GetHash', 'test-connection-check');
            } catch (testErr) {
                if (!testErr.message.includes('does not exist') && !testErr.message.includes('not found')) {
                    console.warn('⚠ Connection test failed (chaincode may not be ready):', testErr.message);
                }
            }
        } catch (error) {
            console.error('Failed to initialize Blockchain Gateway:', error.message);
            console.error('Full error:', error);
            throw error;
        }
    }

    async newGrpcConnection() {
        const tlsRootCert = await fs.readFile(tlsCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        return new grpc.Client(peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': peerHostAlias,
        });
    }

    async newIdentity() {
        const credentials = await fs.readFile(certPath);
        return { mspId: 'Org1MSP', credentials };
    }

    async newSigner() {
        const files = await fs.readdir(keyDirectoryPath);
        const keyPath = path.resolve(keyDirectoryPath, files[0]);
        const privateKeyPem = await fs.readFile(keyPath);
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        return signers.newPrivateKeySigner(privateKey);
    }

    // Hash any object or string using SHA-256
    generateHash(data) {
        const content = typeof data === 'string' ? data : JSON.stringify(data);
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    // Submit a hash to the blockchain
    async setHash(id, dataToHash, dataType = 'GENERAL') {
        if (!this.contract) await this.init();
        const hashValue = this.generateHash(dataToHash);
        console.log(`Submitting hash to blockchain for ID: ${id} [Type: ${dataType}]`);
        console.log(`Hash value: ${hashValue}`);
        try {
            const result = await this.contract.submitTransaction('SetHash', id, hashValue, dataType);
            console.log(`Successfully submitted to blockchain. Result: ${Buffer.from(result).toString('utf8')}`);
            return hashValue;
        } catch (error) {
            console.error('=== BLOCKCHAIN SUBMISSION ERROR ===');
            console.error('Error Message:', error.message);
            console.error('Error Code:', error.code);
            console.error('Full Error Object:', JSON.stringify(error));
            
            // Try to extract endorsement details
            if (error.details) {
                console.error('Error Details:', error.details);
            }
            if (error.cause) {
                console.error('Error Cause:', error.cause);
            }
            
            throw new Error(`Blockchain submission failed for ${dataType}: ${error.message}`);
        }
    }

    // Retrieve and verify a hash
    async verifyIntegrity(id, currentData) {
        if (!this.contract) await this.init();
        try {
            const storedHash = await this.contract.evaluateTransaction('GetHash', id);
            const storedHashStr = Buffer.from(storedHash).toString('utf8');
            const currentHash = this.generateHash(currentData);

            const isMatch = storedHashStr === currentHash;
            if (!isMatch) {
                console.error(`!!!! ALERT: TAMPER DETECTED for ID: ${id} !!!!`);
            }
            return {
                isMatch,
                storedHash: storedHashStr,
                currentHash
            };
        } catch (error) {
            // If the record isn't on the blockchain yet (new user), we don't treat it as tampered
            if (error.message.includes('does not exist') || error.message.includes('not found')) {
                return { isMatch: true, status: 'NOT_ON_BLOCKCHAIN' };
            }
            console.error(`Could not verify integrity for ID ${id}:`, error.message);
            throw error;
        }
    }

    async close() {
        if (this.gateway) this.gateway.close();
        if (this.client) this.client.close();
    }
}

module.exports = new BlockchainService();
