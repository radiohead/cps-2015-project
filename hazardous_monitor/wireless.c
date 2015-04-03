// AT commands ref : https://nurdspace.nl/ESP8266
#include "wireless.h"

boolean initDevice()
{
	Serial.println("AT+RST"); // reset the module
  	delay(1000);
  	deviceReady = (Serial.find("ready")) 
	delay(1000);
	//while not connected try to reconnect
	while(!connected)
		connected = connectWiFi();
	delay(5000);
	//set the single connection mode
	Serial.println("AT+CIPMUX=0");
}

boolean sendData(int size,string data)
{
	// prepare device to send
	// append data size to at command
	Serial.print("AT+CIPSEND=");
	Serial.println(cmd.length());
	//if device did not answer
	if(!Serial.find(">"))
	{
		//close connection wait for device and abort
		closeConnection();
		return false;
	}
	// @igor do we need to include GET or POST before the msg ? noob here
	// tell me how do i have to send the data to the server or whatever we will be using
	//device answered send data
	Serial.print(data);
	return (Serial.find("OK"));
}

boolean closeConnection()
{
	Serial.println("AT+CIPCLOSE");
	delay(1000);
	return true;
}

boolean openTCPconnection()
{
	//build connection cmd
	String cmd = "AT+CIPSTART=\"TCP\",\"";
	cmd += DST_IP;
	cmd += "\",80";
	//check if connection successfully opened
	return (Serial.find("Error"));
}


boolean connectWiFi()
{
	//set device mode standard (2= Access point, 3= both AP and Std)
	Serial.println("AT+CWMODE=1");
	//build AT cmd to login into network SSID / PSWD
	String cmd="AT+CWJAP=\"";
	cmd+=SSID;
	cmd+="\",\"";
	cmd+=PSWD;
	cmd+="\"";
	//send command to device
	Serial.println(cmd);
	delay(2000);
	//check device answer 
	return (Serial.find("OK"));
}