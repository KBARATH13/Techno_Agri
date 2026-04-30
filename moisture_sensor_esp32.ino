#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Replace with your network credentials
const char* ssid = "MOISTURE";
const char* password = "123123123";

WebServer server(80);

#define OLED_RESET -1 // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 display(128, 64, &Wire, OLED_RESET);

// Moisture sensor pin (example, adjust as needed)
const int MOISTURE_SENSOR_PIN = 34; // GPIO34 for ESP32 analog input

// Calibration values (adjust these based on your sensor and soil)
const int AIR_VALUE = 3000;   // Sensor value when dry in air
const int WATER_VALUE = 1000; // Sensor value when wet in water

unsigned long lastReconnect = 0;
const unsigned long RECONNECT_EVERY = 10000; // Reconnect every 10 seconds if disconnected



// Function to send CORS OPTIONS response
void sendCORSOptions(WiFiClient &client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Access-Control-Allow-Origin: http://localhost:3000"); // Allow your frontend origin
  client.println("Access-Control-Allow-Methods: GET, OPTIONS"); // Allow GET and OPTIONS requests
  client.println("Access-Control-Allow-Headers: Content-Type, x-auth-token"); // Allow Content-Type and x-auth-token
  client.println("Access-Control-Max-Age: 86400"); // Cache preflight response for 24 hours
  client.println("Content-Length: 0"); // No content for OPTIONS response
  client.println(); // End of headers
}

// Function to send moisture data response with CORS headers
void sendMoistureResponse(WiFiClient &client) {
  int rawMoisture = analogRead(MOISTURE_SENSOR_PIN);

  // Convert raw sensor value to percentage (0-100%)
  // Assuming AIR_VALUE is dry (0%) and WATER_VALUE is wet (100%)
  float percentage = map(rawMoisture, AIR_VALUE, WATER_VALUE, 0, 100);
  percentage = constrain(percentage, 0, 100); // Clamp between 0 and 100

  String jsonResponse = "{\"moisture\": " + String(rawMoisture) + ", \"percentage\": " + String(percentage, 1) + "}";

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Access-Control-Allow-Origin: http://localhost:3000"); // Allow your frontend origin
  client.println("Access-Control-Allow-Methods: GET"); // Allow GET requests
  client.println("Access-Control-Allow-Headers: Content-Type, x-auth-token"); // Allow Content-Type and x-auth-token
  client.println("Connection: close");
  client.print("Content-Length: ");
  client.println(jsonResponse.length());
  client.println(); // End of headers
  client.print(jsonResponse);
}

void updateDisplay() {
  display.clearDisplay();
  
  int rawMoisture = analogRead(MOISTURE_SENSOR_PIN);
  float percentage = map(rawMoisture, AIR_VALUE, WATER_VALUE, 0, 100);
  percentage = constrain(percentage, 0, 100);

  // Title
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Moisture Level");

  // Percentage Value (Large)
  display.setTextSize(3); // Larger font
  display.setCursor(10, 25); // Centered-ish
  display.print(percentage, 1);
  display.println("%");
  
  display.display();
}

void setup() {
  Serial.begin(115200);
  pinMode(MOISTURE_SENSOR_PIN, INPUT);

  // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3C for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }
  // display.display(); // REMOVED: Skip Adafruit splash screen
  // delay(2000); // REMOVED: No delay needed

  // Clear the buffer
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Connecting to WiFi...");
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  // Start the web server
  server.on("/moisture", HTTP_GET, []() {
    WiFiClient client = server.client();
    sendMoistureResponse(client);
  });
  server.on("/moisture", HTTP_OPTIONS, []() {
    WiFiClient client = server.client();
    sendCORSOptions(client);
  });
  server.begin();
  Serial.println("HTTP server started");

  display.clearDisplay();
  display.setCursor(0,0);
  display.println("WiFi connected!");
  display.println(WiFi.localIP());
  display.display();
  delay(2000);
}

void loop() {
  unsigned long now = millis();
  // Reconnect to WiFi if disconnected
  if (WiFi.status() != WL_CONNECTED && now - lastReconnect >= RECONNECT_EVERY) {
    lastReconnect = now;
    Serial.println("Reconnecting...");
    WiFi.disconnect();
    WiFi.begin(ssid, password);
  }

  // Update OLED — only moisture value
  updateDisplay();

  // ─── HTTP server ─ handle requests and include CORS headers ───
  server.handleClient(); // <--- This is the corrected line
  delay(500); // Small delay to prevent busy-waiting
}
