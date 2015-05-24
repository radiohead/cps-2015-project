#define SSID "SSID"
#define PASS "PSWD"
#define IP "10.125.25.102"

void initDevice()
{
  Serial1.println("AT");
  delay(5000);
  if (Serial1.find("OK")) 
    connectWiFi();
}

bool updateServer(String data) 
{
  String cmd = "AT+CIPSTART=\"TCP\",\"";
  cmd += IP;
  cmd += "\",3000";
  Serial1.println(cmd);
  delay(1000);
  if (Serial1.find("Error"))
    return false;
  cmd = "STARTREQ\r\n" + data + "\r\nENDREQ";
  Serial1.print("AT+CIPSEND=");
  Serial1.println(cmd.length()-2);
  delay(3000);
  if (Serial1.find(">"))
    Serial1.println(cmd);
  delay(1000);
  Serial1.println("AT+CIPCLOSE");
  return true;
}

boolean connectWiFi() {
  Serial1.println("AT+CWMODE=1");
  delay(2000);
  String cmd = "AT+CWJAP=\"";
  cmd += SSID;
  cmd += "\",\"";
  cmd += PASS;
  cmd += "\"";
  Serial1.println(cmd);
  delay(5000);
  if (Serial1.find("OK")) 
    return true;
  else
    return false;
}
