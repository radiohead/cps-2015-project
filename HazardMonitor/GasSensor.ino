#define GASSENSORPIN 0
#define voltage 4.95

float getCOValue() 
{
  float sensor_value = analogRead(GASSENSORPIN);
  //return sensor_value;
  return (sensor_value / 1023 * voltage);
}
