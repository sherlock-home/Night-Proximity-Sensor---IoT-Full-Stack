var num_msg=0;

    $(document).ready(function(){

        var lightSensor;
        var proxSensor;
        var curr_threshold;

        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
            }
            return "NOT FOUND";
        }

        lightSensor = getCookie("lightSensor");
        proxSensor = getCookie("proxSensor");
        curr_threshold = getCookie("curr_threshold");

        if(lightSensor=="NOT FOUND"){
            lightSensor="ON";
            document.getElementById("toggleLight").checked = true;
            document.cookie ="lightSensor="+lightSensor;
        }

        if(proxSensor=="NOT FOUND") {
            proxSensor="ON";
            document.getElementById("toggleProx").checked = true;
            document.cookie ="proxSensor="+proxSensor;
        }
        
        if(lightSensor=="OFF") {
            document.getElementById("toggleLight").checked = false;
        }
        else {
            document.getElementById("toggleLight").checked = true;   
        }

        if(proxSensor=="OFF") {
            document.getElementById("toggleProx").checked = false;
        }
        else {
            document.getElementById("toggleProx").checked = true;   
        }

        // default threshold = 20 cm
        if(curr_threshold=="NOT FOUND") {
            document.getElementById("current_threshold").innerHTML = "20 cm";
        } else {
            document.getElementById("current_threshold").innerHTML = curr_threshold+" cm";
        }        

        if(num_msg==0){
            $("#noti_count").hide();
        }

        if(lightSensor=="OFF") {
            $("#lightSensorData").hide();
        }
        if (lightSensor=="ON") {                
            $("#lightSensorData").show();
        }

        // light
        $("#toggleLight").change(function() {
            console.log("clicked light")
            if ($(this).is(':checked')){
                console.log("turn on")
                $(this).prop('checked', true);
                lightSensor = "ON"
                 $("#lightSensorData").show();
                enableLightSensor();
            }    
            else {
                console.log("turn off")
                $(this).prop('checked', false);
                lightSensor = "OFF"
                 $("#lightSensorData").hide();
                disableLightSensor();
            }                     
        });

        // prox
        $("#toggleProx").change(function() {
            console.log("clicked prox")
            if ($(this).is(':checked')){
                console.log("turn on")
                $(this).prop('checked', true);
                proxSensor = "ON"
                 $("#proxSensorData").show();
                enableProxSensor();
            }    
            else {
                console.log("turn off")
                $(this).prop('checked', false);
                proxSensor = "OFF"
                 $("#proxSensorData").hide();
                disableProxSensor();
            }                     
        });

        if(proxSensor=="OFF") {
            $("#proxSensorData").hide();
        }
        if (proxSensor=="ON") {                
            $("#proxSensorData").show();
        }
    });        

    var mosq = new Mosquitto();

    function readNotifications() {
        num_msg = 0;
        $("#noti_count").hide();
    }


    function enableLightSensor()  {
        var topic="LIGHT_STATUS";
        var qos=0;
        var payload="ON"
        publish(topic,qos,payload);
        document.cookie ="lightSensor="+payload;
    }

    function enableProxSensor()  {
        var topic="PROX_STATUS";
        var qos=0;
        var payload="ON"
        publish(topic,qos,payload);
        document.cookie ="proxSensor="+payload;        
    }

    function disableLightSensor()   {
        var topic="LIGHT_STATUS";
        var qos=0;
        var payload="OFF"
        publish(topic,qos,payload);
        document.cookie ="lightSensor="+payload;
    }

    function disableProxSensor()  {
        var topic="PROX_STATUS";
        var qos=0;
        var payload="OFF"
        publish(topic,qos,payload);
        document.cookie ="proxSensor="+payload;
    }

    function setThreshold()     {
        var topic="SET_THRESHOLD";
        var qos=0;
        var threshold = document.getElementById("threshold").value;
        publish(topic,qos,threshold);
        document.getElementById("threshold").value = "";
        document.cookie = "curr_threshold="+threshold;
    }

    function publish(topic,qos,payload)  {
        console.log("Inside Pubish")
        mosq.publish(topic, payload, qos);
        // Update threshold on UI
        if(topic=="SET_THRESHOLD"){
            document.getElementById("current_threshold").innerHTML = payload+" cm";
        }
    }

    function pageLoadFunction() { 

        var url = "ws://" + "52.33.59.166" + ":" + "9001" + "/mqtt";
        mosq.connect(url);
        
        mosq.onconnect = function(rc){
            console.log("Connection Successful")
            mosq.subscribe("LightRT", 0);
            mosq.subscribe("ProximityRT", 0);
            mosq.subscribe("Notification",0);
        };

        mosq.onmessage = function(topic, payload, qos){
            console.log(topic)
            console.log(payload)
            console.log(qos)

            var json_data = JSON.parse(payload);

            if(topic=="LightRT"){
                document.getElementById("current_light").innerHTML = json_data.val+" %";
            }

            if(topic=="ProximityRT"){
                document.getElementById("current_prox").innerHTML = json_data.proxVal+" cm";
            }

            if(topic=="Notification"){

                if(num_msg==0){
                    $("#no-messages").hide();                    
                }

                num_msg++;
                if(num_msg==1) {
                    $("#noti_count").show();
                }                
                document.getElementById("noti_count").innerHTML = num_msg;

                var newMessage = document.createElement("LI");
                var a = document.createElement('a');
                a.href = "#";
                var newDiv = document.createElement("div");                    
                newDiv.innerHTML = '<i class="fa fa-comment fa-fw"></i>'+' Its dark and the object is '+ payload+ ' cm close.';
                a.appendChild(newDiv);
                newMessage.appendChild(a);

                var spacing = document.createElement("LI");
                spacing.classList.add("divider");

                var list = document.getElementById("notify_list");
                list.insertBefore(spacing, list.childNodes[0]);
                list.insertBefore(newMessage, list.childNodes[0]);
            }
        };

    }
    window.onload = pageLoadFunction;
