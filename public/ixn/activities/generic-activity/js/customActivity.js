requirejs.config({
    paths: {
        postmonger: 'js/postmonger'
    }
});

define(['postmonger'], function(Postmonger) {
    'use strict';

 	var connection = new Postmonger.Session();

	var tokens;
	var endpoints;
	var inArgPayload = {};
	var step = 1; 

    // get the # of steps
	var numSteps = getUrlParameter('numSteps');
	// do some error checking on the inbound num steps

    $(window).ready(function() {
        connection.trigger('ready');
		connection.trigger('requestEndpoints');
    });

   connection.on('clickedNext', function() {		
		console.log("clicked next step: " + step);
		step++;
        connection.trigger('nextStep');				
    });

    connection.on('clickedBack', function() {
		step--;
        connection.trigger('prevStep');
    });

 	connection.on('gotoStep', function () {
        gotoStep(step);
        connection.trigger('ready');
    });

	// This listens for Journey Builder to send tokens
	// Parameter is either the tokens data or an object with an
	// "error" property containing the error message
	connection.on('getTokens', function( data ) {
		if( data.error ) {
			console.error( data.error );
		} else {
			tokens = data;
		}
	});
	
	connection.on('initActivity', function(payload) {
        if (payload) {
        	inArgPayload = payload;
            console.log('payload',JSON.stringify(payload));

			var jsonPayload = payload['arguments'].execute.inArguments;

			if (typeof jsonPayload != "undefined" && jsonPayload.length > 0) {

				// get the keys from the arguments array
				for (var i = 0; i < jsonPayload.length; i++) {
					
					var obj = jsonPayload[i];
				    var formKey = Object.keys(obj);     
					var selector = '#' + formKey;					
					var value = obj[formKey];  

					$(selector).val(value);
				}
			}			

        }
        
		gotoStep(step);

    });

    function gotoStep(step) {
        $('.step').hide();
		var stepStr = '#step' + step;

		var event = new CustomEvent('isVisible', 
			{
				detail: {
				step: step
			},
			bubbles: true,
			cancelable: false
		});

		// console.log('Current step:'  + step);
		// console.log('Step String: ' + stepStr);
       // remove the case statement ... better handled by if statement
	   // special cases ... first step and last step ..
	   // if step 1, remove the back button
	   // else, we have moved past step 1 and less than num steps, add a back button
	   // if step == numSteps (add the done button)
	   // if step < numSteps (add the next button)
	   // if step > numSteps - we done
       if (step == 1) {
		    console.log('Do not show back button');
     		$(stepStr).show();			
			connection.trigger('updateButton', { button: 'back', visible: false });
	   }
	   else if (step > 1 && step < numSteps) {			
		    console.log('Show back button');
    		$(stepStr).show();
    		connection.trigger('updateButton', { button: 'back', visible: true, enabled: true });
	   }

	   if (step == numSteps) {
		if(step != 1) {
			$(stepStr).show();
		}
		connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });
	   } else {
		console.log('Show next button');
		connection.trigger('updateButton', { button: 'next', text: 'next', enabled: true });
	   } 

	   if (step > numSteps) {
		   console.log('Saving');
		   save();
	   }
	
		document.dispatchEvent(event);  
    }

	connection.on('updateStep', function( data ) {
		// Called if the configuration flow needs to change

	});

	// This listens for Journey Builder to send endpoints
	// Parameter is either the endpoints data or an object with an
	// "error" property containing the error message
	connection.on('getEndpoints', function( data ) {
		if( data.error ) {
			console.error( data.error );
		} else {
			endpoints = data;
		}
	});

    connection.on('requestPayload', function() {
	 var payload = {};
 
        payload.options = {
           
        };

		//TODO: Shouldn't this come from the data?
        payload.flowDisplayName = 'Custom Activity';
 
        connection.trigger('getPayload', payload);
    });

	// Journey Builder broadcasts this event to us after this module
	// sends the "ready" method. JB parses the serialized object which
	// consists of the Event Data and passes it to the
	// "config.js.save.uri" as a POST
    connection.on('populateFields', function(payload) {
    });
	
	function getUrlParameter(name) {
		name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
		var results = regex.exec(location.search);
		return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}

    function preparePayload() {    

		var value = getMessage();		


		// inArgPayload['arguments'].execute.inArguments.push({"displayMessage": value});

		console.log('Message: ' + value);
		
	}

	function save() {

		inArgPayload['arguments'].execute.inArguments = []; // remove all the args, only save the last one

		// push all of the form names / values onto the args stack		
		$('#genericActivity *').filter(':input').each(function(){
   			 console.log("ID: " + this.id + " Name: " + this.name + " Value: " + this.value); //your code here
			 var key;	

			 this.id ? key = this.id : key = this.name; 

			 var formArg = {};
			 formArg[key] = this.value;

			 inArgPayload['arguments'].execute.inArguments.push(formArg);
		});				

		connection.trigger('updateActivity',inArgPayload);
		inArgPayload.metaData.isConfigured = true;		
	}
});
