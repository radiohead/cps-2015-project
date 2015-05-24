#include <DHT.h>
#define DHTPIN 7
#define DHTTYPE DHT11
/*
         _________
        |         |
        |  Module |
        |  Front  |
        |_________|
          |  |  |
          S  5V GND
*/
DHT dht(DHTPIN, DHTTYPE);

void initHumSensor() 
{
  dht.begin();
}

float getHumidity()
{
  float hum = dht.readHumidity();
  return isnan(hum) ? -999 : hum;
}

float getTemperature()
{
  float temp = dht.readTemperature();
  return isnan(temp) ? -999 : temp;
}
