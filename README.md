# Night Proximity Sensor - IoT Full Stack

-- [Device] Build a night proximity sensor that:
● Can send a notification to the web UI when an object is closer to the sensor than a set threshold.
● Has a sensor that makes it operate only in night mode (i.e. low light conditions)
● Can be turned on or off (both sensors) from the web UI.
● Should have an LED to indicate whether the sensors are on or off.
● Has a configurable threshold from the web UI.

-- [Cloud] Build, connect and deploy the infrastructure from Lab Tutorials 5 and 6 (Kafka is optional)
● Write a filter in the Logstash configuration file so that its output contains light sensor data for low light conditions only.
● Create relevant visualizations (graphs) in Kibana for light sensor data and corresponding current distance from the range sensor
● Create a Dashboard in Kibana for the above visualizations and embed it into the web UI.

-- [Web App] Create a web interface that:
● Has a basic Login Page (Registration not required) and a logout button.
● Can display light sensor data (all; not just low light) and current distance data in real time.
● Should receive a notification when an object crosses the threshold limit set for the sensor. (like Facebook/LinkedIn/Twitter; do not show a JS alert box)
● Should show a count that aggregates the number of times it receives a notification.
● Should allow the user to set / reset the threshold for the range sensor.
● Should have the Kibana dashboard embedded into the page.
● Should have a button to turn the sensors on/off.
● Can display user readable sensor data (Eg: convert light sensor range to 0% to 100%)
● The app should be deployed on a web server and should be usable from any computer.
● The app should be functional, accessible and should have a good visual design.


-- See the Lab2_VivekMaheshwari_Report.pdf for Circuit Connections, Setup and how to execute the code and screenshots of the web app.
