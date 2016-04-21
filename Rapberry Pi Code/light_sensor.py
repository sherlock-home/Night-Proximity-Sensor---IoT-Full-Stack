import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import time
import json
from datetime import datetime
import memcache

GPIO.setmode(GPIO.BCM)
LIGHT_SENSOR = 'ON'

#define the pin that goes to the circuit
pin_to_circuit = 18

def on_connect(mosq, obj, rc):
    mqttc.subscribe("LIGHT_STATUS", 0)
    print("rc: " + str(rc))

def on_message(mosq, obj, msg):
    global LIGHT_SENSOR
    print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))
    LIGHT_SENSOR = msg.payload

def on_subscribe(mosq, obj, mid, granted_qos):
    print("Subscribed To: " + str(mid) + " " + str(granted_qos))

def on_log(mosq, obj, level, string):
    print(string)

def rc_time (pin_to_circuit):
    low_count = 0
    
    #Output on the pin for 
    GPIO.setup(pin_to_circuit, GPIO.OUT)
    GPIO.output(pin_to_circuit, GPIO.LOW)
    time.sleep(0.1)

    #Change the pin back to input
    GPIO.setup(pin_to_circuit, GPIO.IN)
  
    #Count until the pin goes high
    while (GPIO.input(pin_to_circuit) == GPIO.LOW):
        low_count += 1
        if low_count>1000:
        	break
    return low_count/10

#Catch when script is interrupted, cleanup correctly
try:
		# Light Json Object
		light_json = {}
	
		# Main loop
		mqttc = mqtt.Client()
		# Assign event callbacks
		mqttc.on_message = on_message
		mqttc.on_connect = on_connect
		mqttc.on_subscribe = on_subscribe
		# Connect to Mosquitto Broker - AWS Instance
		mqttc.connect("52.33.59.166", 1883,60)
		# Continue the network loop
		mqttc.loop_start()
		print "Started"
	
		while True:
			shared = memcache.Client(['127.0.0.1:11211'],debug=0)
			shared.set('lightStatus', LIGHT_SENSOR)
		
			if LIGHT_SENSOR == 'ON':
				lightData = rc_time(pin_to_circuit)
				shared.set('Value', lightData)
				light_json['type'] = "light"
				light_json['val'] = lightData
				light_json['time'] = str(datetime.now())
				format_json = json.dumps(light_json)			
				mqttc.publish("LightRT", format_json)
	
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
