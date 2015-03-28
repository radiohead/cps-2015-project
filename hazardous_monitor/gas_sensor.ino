#define voltage 4.95

int read_co_volume() {
  int sensor_value = analogRead(A0);
  return (sensor_value / 1023 * voltage);
}

