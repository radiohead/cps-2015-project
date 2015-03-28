#include "pulse_sensor.h"

PulseSensor::PulseSensor(int _sensor_pin, int _led_pin) {
  sensor_pin = _sensor_pin;
  led_pin = _led_pin;

  bpm_value = 0;
  signal_value = 0;
  beats_interval = 600;
  sample_counter = 0;
  peak_value = 512;
  trough_value = 512;
  threshold_value = 512;

  pulse = false;
  quantified_self = false;
  first_beat = false;
  second_beat = false;

  sample_counter = 0;
  last_beat_time = 0;
}

boolean PulseSensor::bpm_value_ready() {
  return this->quantified_self;
}

int PulseSensor::get_bpm_value() {
  // quantified_self = false;
  return bpm_value;
}

int PulseSensor::get_pulse_value() {
  return signal_value;
}

void PulseSensor::read_pulse(int _period) {
  // read the Pulse Sensor 
  signal_value = analogRead(sensor_pin);

  // keep track of the time in mS with this variable
  sample_counter += _period;

  // monitor the time since the last beat to avoid noise
  int delta_time = sample_counter - last_beat_time;

  // find the peak and trough of the pulse wave
  if (signal_value < trough_value) {
    trough_value = signal_value;
  }

  if (signal_value > peak_value) {
    peak_value = signal_value;
  }

  // NOW IT'S TIME TO LOOK FOR THE HEART BEAT
  // signal_value surges up in value every time there is a pulse
  // avoid high frequency noise
  if (delta_time > 250) {
    if ((signal_value >= peak_value) && (pulse == false) && (delta_time > (beats_interval / 5) * 3)) {        
      digitalWrite(led_pin, HIGH);

      pulse = true;
      beats_interval = delta_time;
      last_beat_time = sample_counter;

      if (second_beat) {
        second_beat = false;

        // seed the running total to get a realisitic BPM at startup
        for (int i = 0; i < 10; ++i) {
          rates[i] = beats_interval;                      
        }
      }

      if (first_beat) {
        first_beat = false;
        second_beat = true;
        return;
      }   

      unsigned int average_interval = 0;
      // Shift data in the rates array
      for (int i = 0; i < 9; ++i) {
        rates[i] = rates[i + 1];
        average_interval += rates[i];
      }

      rates[9] = beats_interval;
      average_interval += rates[9];
      average_interval /= 10;

      int next_value = 60000 / average_interval;
      // We can't jump that much!
      if ((next_value > bpm_value * 1.25) && bpm_value != 0) {
        bpm_value = (next_value + bpm_value) / 2;
      }
      else {
        bpm_value = next_value;
      }      
    }
  }

  if (signal_value < threshold_value && pulse == true) {
    digitalWrite(led_pin,  LOW);

    pulse = false;
    threshold_value = (peak_value - trough_value) / 2 + trough_value;
  }

  // 2.5 seconds without a beat
  if (delta_time > 2500) {
    threshold_value = 512;
    peak_value = 512;
    trough_value = 512;
    last_beat_time = sample_counter;
    first_beat = true;
    second_beat = false;
  }
}
