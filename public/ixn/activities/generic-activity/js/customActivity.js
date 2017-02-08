function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

define( function( require ) {
	var Postmonger = require( 'postmonger' );
	var $ = require( 'vendor/jquery.min' );

    var connection = new Postmonger.Session();
	var tokens;
	var endpoints;
	var inArgPayload = {};
	var step = 1; 

    // get the # of steps
	var numSteps = getUrlParameter('numSteps');
	// do some error checking on the inbound num steps
	console.log("numSteps " + numSteps);

    $(window).ready(function() {
        connection.trigger('ready');
		connection.trigger('requestTokens');
		connection.trigger('requestEndpoints');
		//connection.trigger('requestPayload');
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

				var message = inArgPayload['arguments'].execute.inArguments[0].displayMessage;
				
				$("#messageInput").val(message);
			}			

        }
        
		gotoStep(step);

    });

    function gotoStep(step) {
        $('.step').hide();
		var stepStr = '#step' + step;
		console.log('Current step:'  + step);
		console.log('Step String: ' + stepStr);
       // remove the case statement ... better handled by if statement
	   // special cases ... first step and last step ..
	   // if step 1, remove the back button
	   // else, we have moved past step 1 and less than num steps, add a back button
	   // if step == numSteps (add the done button)
	   // if step < numSteps (add the next button)
	   // if step > numSteps - we done
       if (step == 1) {
		    console.log('Do not show back button');
     		$("#show").val("'" + stepStr + "'");
			connection.trigger('updateButton', { button: 'back', visible: false });
	   }
	   else if (step > 1 && step < numSteps) {			
		    console.log('Show back button');
			$("#show").val("'" + stepStr + "'"); // If you still want to display single quotes
    		$(stepStr).show();
    		connection.trigger('updateButton', { button: 'back', visible: true, enabled: true });
	   }

	   if (step == numSteps) {
		console.log('Show done button');
		$("#show").val("'" + stepStr + "'");
		connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });
	   } else {
		console.log('Show next button');
		connection.trigger('updateButton', { button: 'next', text: 'next', enabled: true });
	   } 

	   if (step > numSteps) {
		   console.log('Saving');
		   save();
	   }
	
        // switch(step) {
        //     case 1:
        //         $('#step1').show();
        //         //connection.trigger('updateButton', { button: 'next', text: 'next', enabled: Boolean(getMessage()) });
        //         //connection.trigger('updateButton', { button: 'back', visible: false });
        //         connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });				
        //         break;
        //     // case 2:
        //     //     $('#step2').show();
        //     //     $('#showMessage').html(getMessage());
        //     //     connection.trigger('updateButton', { button: 'back', visible: true });
        //     //     connection.trigger('updateButton', { button: 'next', text: 'done', visible: true });
        //     //     break;
        //     case 2: // Only 2 steps, so the equivalent of 'done' - send off the payload
        //         save();
        //         break;
        // }
    };

    connection.on('clickedNext', function() {
        step++;
        gotoStep(step);
        connection.trigger('ready');
		connection.trigger('nextStep');
    });

    connection.on('clickedBack', function() {
        step--;
        gotoStep(step);
        connection.trigger('ready');
    });

	connection.on('updateStep', function( data ) {
        console.log("calling preparePayload");
		preparePayload();

        connection.trigger('updateActivity',inArgPayload);		
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
	
    // this is essentially DONE
	connection.on('clickedNext', function() {

    	
    });


    function preparePayload() {    

		var value = getMessage();		

        console.log("inArgPayload: " + JSON.stringify(inArgPayload));
		inArgPayload['arguments'].execute.inArguments = []; // remove all the args, only save the last one
		inArgPayload['arguments'].execute.inArguments.push({"displayMessage": value});

		console.log('Message: ' + value);
		
	}

	function save() {
		console.log("Save");
		connection.trigger('updateActivity',inArgPayload);
		inArgPayload.metaData.isConfigured = true;		
	}

	function getMessage () {
		console.log("getMessage being called");
		if($('messageInput') === 'undefined') {
			console.log("messageInput undefined on this page ... return true.");
			return true;	
		} else {
			return $('#messageInput').val().trim();	
		}
	}
});
