import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import time
from datetime import datetime
import memcache
import json

GPIO.setmode(GPIO.BCM)

TRIG = 20 
ECHO = 26
PROX_SENSOR = 'ON'
THRESHOLD = 20

def on_connect(mosq, obj, rc):
    mqttc.subscribe([("PROX_STATUS", 0), ("SET_THRESHOLD", 0)])
    print("rc: " + str(rc))

def on_message(mosq, obj, msg):
	
	global PROX_SENSOR
	global THRESHOLD
	print(msg.topic + " " + str(msg.qos) + " " + str(msg.payload))
	if msg.topic == 'PROX_STATUS':
		PROX_SENSOR = str(msg.payload)
	if msg.topic == 'SET_THRESHOLD':
		THRESHOLD = int(msg.payload)

def on_subscribe(mosq, obj, mid, granted_qos):
    print("Subscribed: " + str(mid) + " " + str(granted_qos))

def on_log(mosq, obj, level, string):
    print(string)

def rc_distance(TRIG,ECHO):
	
	GPIO.setup(TRIG,GPIO.OUT)
	GPIO.setup(ECHO,GPIO.IN)
	
	GPIO.output(TRIG, False)
	time.sleep(2)

	GPIO.output(TRIG, True)
	time.sleep(0.00001)
	GPIO.output(TRIG, False)
	time.sleep(0.00006)
	
	pulse_start = time.time()
	while GPIO.input(ECHO)==0:
	  pulse_start = time.time()
	
	pulse_end = time.time()
	while GPIO.input(ECHO)==1:
	  pulse_end = time.time()

	pulse_duration = pulse_end - pulse_start

	distance = pulse_duration * 17150

	distance = round(distance, 2)

	return distance

#Catch when script is interrupted, cleanup correctly
try:
		# Proximity Json Object
		prox_json = {}
		GPIO.setup(17, GPIO.OUT)
		mqttc = mqtt.Client()
		# Assign event callbacks
		mqttc.on_message = on_message
		mqttc.on_connect = on_connect
		mqttc.on_subscribe = on_subscribe
		# Connect on Mosquitto - AWS Instance
		mqttc.connect("52.33.59.166", 1883,60)
		# Continue the network loop
		mqttc.loop_start()
		print "Started"
	
		while True:
			shared = memcache.Client(['127.0.0.1:11211'],debug=0)

			if shared.get('lightStatus') == "ON" and PROX_SENSOR == "ON":
				GPIO.output(17, GPIO.HIGH)
			else:
				GPIO.output(17, GPIO.LOW)
		
			if PROX_SENSOR == 'ON':
				proxData = rc_distance(TRIG,ECHO)
				shared = memcache.Client(['127.0.0.1:11211'], debug=0)    
	
				# Low light conditions = 50%			
				if shared.get('Value')	> 50:
					if proxData < THRESHOLD:
						mqttc.publish("Notification", proxData)	
				
				prox_json['type'] = "proximity"
				prox_json['proxVal'] = proxData
				prox_json['time'] = str(datetime.now())
				prox_json['threshold'] = THRESHOLD
				format_json = json.dumps(prox_json)
				mqttc.publish("ProximityRT", format_json)
			
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
