#ifndef PULSE_SENSOR_H
#define PULSE_SENSOR_H
#if ARDUINO >= 100
  #include "Arduino.h"
#else
  #include "WProgram.h"
#endif

class PulseSensor {
  // Pin definitions
  int led_pin;
  int sensor_pin;

  // Signal-related variables
  int bpm_value;
  int signal_value;
  int beats_interval;
  int peak_value;
  int trough_value;
  int threshold_value;

  boolean pulse;
  boolean quantified_self;
  boolean first_beat;
  boolean second_beat;

  int rates[10];

  unsigned long sample_counter;
  unsigned long last_beat_time;

public:
  PulseSensor (int, int);
  boolean bpm_value_ready(void);

  int get_bpm_value(void);
  int get_pulse_value(void);

  void read_pulse(int);
};
#endif
