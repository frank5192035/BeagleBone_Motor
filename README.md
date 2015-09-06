# BeagleBone_Motor
---
Using BeagleBone to control Grundfos hot water pump on 5~20 minutes and automatically turn off when time is up. 
Through web browser to turn it on.

## File Description
* Grundfos.js: Control server program on BeagleBone.
* Grundfos.html: Control page on BeagleBone. Through static IP to control pumping time at browser.

## Static IP Setting
nano /etc/network/interfaces

add or modify ⇒ 

auto wlan0

iface wlan0 inet static

   wpa-ssid "your WiFI network name"
   
   wpa-psk  "your password"
   
   address 192.168.0.xxx        ⇒  same subnet with Home WAN/LAN router 
   
   netmask 255.255.255.0
   
   gateway 192.168.0.1          ⇒ Home WAN/LAN router address


## Update History
* v0.1 @ Aug 21, 2015: Major functions are working. 
Setting network or WiFi as static IP is more convinient for application. 