#define GASPIN 0
#define PULSEPIN 1
#define DHTPIN 2
#define LEDPIN 13

int BPM;                   // used to hold the pulse rate
int Signal;                // holds the incoming raw data
int IBI = 600;             // holds the time between beats, must be seeded! 
boolean Pulse = false;     // true when pulse wave is high, false when it's low
boolean QS = false;        // becomes true when Arduoino finds a beat.

int rate[10];                    // array to hold last ten IBI values
unsigned long sampleCounter = 0;          // used to determine pulse timing
unsigned long lastBeatTime = 0;           // used to find IBI
int P = 512;                      // used to find peak in pulse wave, seeded
int T = 512;                     // used to find trough in pulse wave, seeded
int thresh = 525;                // used to find instant moment of heart beat, seeded
int amp = 100;                   // used to hold amplitude of pulse waveform, seeded
boolean firstBeat = true;        // used to seed rate array so we startup with reasonable BPM
boolean secondBeat = false;      // used to seed rate array so we startup with reasonable BPM

void setup() {
  pinMode(blinkPin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  if (millis() % 2 == 0) {
    noInterrupts();
    calculate_pulse();
    interrupts();
  }
    if (millis() % 500 == 0 && QS == true) {                       // Quantified Self flag is true when arduino finds a heartbeat
            fadeRate = 255;                  // Set 'fadeRate' Variable to 255 to fade LED with pulse
            sendDataToProcessing('B',BPM);   // send heart rate with a 'B' prefix
            QS = false;                      // reset the Quantified Self flag for next time    
    }
}

void sendDataToProcessing(char symbol, int data ){
  Serial.print(symbol);                // symbol prefix tells Processing what type of data is coming
  Serial.println(data);                // the data to send culminating in a carriage return
}







