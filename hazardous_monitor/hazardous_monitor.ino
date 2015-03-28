#include <DHT.h>
#include <pulse_sensor.h>

#define GASPIN 0
#define PULSEPIN 1
#define DHTPIN 2
#define LEDPIN 13

DHT dht_sensor(DHTPIN, DHT11);
PulseSensor pulse_sensor(PULSEPIN, LEDPIN);

int bpm_value;
int co_value;
int temp_value;
int humid_value;
long int now;

boolean values_read; 

void setup() {
  pinMode(LEDPIN, OUTPUT);

  bpm_value = 0;
  co_value = 0;
  temp_value = 0;
  humid_value = 0;
  now = 0;

  Serial.begin(9600);
  dht_sensor.begin();
}

void loop() {
  if (millis() % 2000 == 0) {
    bpm_value = pulse_sensor.get_bpm_value();

    sendDataToProcessing('B', bpm_value);
    sendDataToProcessing('T', temp_value);
    sendDataToProcessing('H', humid_value);
    sendDataToProcessing('G', co_value);

    values_read = false;
    now = millis();
  }
  
  if (millis() - now < 1500){
    if (millis() % 5 == 0) {
      noInterrupts();
      pulse_sensor.read_pulse(5);
      interrupts();
    }
  }
  else {
    if (!values_read) {
      temp_value = dht_sensor.readTemperature();
      humid_value = dht_sensor.readHumidity();
  //    bpm_value = pulse_sensor.get_bpm_value();
      co_value = read_co_volume();
      values_read = true;
    }
    
//    delay(500);
  }
}

void sendDataToProcessing(char symbol, int data ){
  Serial.print(symbol);
  Serial.println(data);
}

