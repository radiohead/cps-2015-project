void setup() {
  Serial.begin(9600);
  Serial1.begin(9600);
  initDevice();
  initHumSensor();
  initHeartBeatSensor();
}

void loop() {
  String data = "{\"humidity\": " + String(getHumidity()) + ", \"Temperature\":" + String(getTemperature()) + ", \"Gas\":" + String(getCOValue()) + ", \"Pulse\":" + String(getBPMValue()) + "}";
  if(updateServer(data))
    Serial.println("data sent");
  Serial.println(data);
  //delay(1000);
}
