/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask KetoCalc what is the exchange for cucumbers"
 *  Alexa: "(reads back exchanges for cucumbers)"
 */
 
 /**
 TODO: Handle plural/singular
 TODO: Handle querying by some subset of words for items with multiple words, but make sure response explicitly shows what is returned.
 */

'use strict';

var AlexaSkill = require('./AlexaSkill'),
    exchanges = require('./exchanges');

var natural = require('natural'),
    stemmer = natural.LancasterStemmer;

console.log(stemmer.stem('strawberries'));

var APP_ID = 'amzn1.echo-sdk-ams.app.6fe112b7-1942-4d63-8f68-1bd582604d7f'; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * KetoCalculator is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var KetoCalculator = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
KetoCalculator.prototype = Object.create(AlexaSkill.prototype);
KetoCalculator.prototype.constructor = KetoCalculator;

KetoCalculator.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to the Keto Calculator. You can ask a question like, what's the exchange for a Mayonnaise? ... Now, what can I help you with?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

KetoCalculator.prototype.intentHandlers = {
    "LookupIntent": function (intent, session, response) {
        var itemSlot = intent.slots.Item,
            itemName;
        if (itemSlot && itemSlot.value){
            itemName = itemSlot.value.toLowerCase();
        }

        var cardTitle = "Exchange for " + itemName,
            exchange = exchanges[itemName],
            speechOutput,
            repromptOutput;
            
        //let's check to see if we found it. if not, try again with singular, then plural
        if (!exchange) {//exchange is empty
        	if (itemName) { //itemName is not empty
        		if (itemName.substr(-1) == "s") { //it's plural
        			//try again without the trailing s
        			exchange = exchanges[itemName.substr(0,itemName.length - 1)],
						speechOutput,
						repromptOutput;
				}
        		else //its singular, add an s
        		{
        			exchange = exchanges[itemName+"s"],
						speechOutput,
						repromptOutput;
        		}
        	}
        }
            
        if (exchange) { //If the item was in the list
            speechOutput = {
                speech: exchange,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tellWithCard(speechOutput, cardTitle, exchange);
        } else { //the item was not in the list
            var speech;
            if (itemName) {
                speech = "I'm sorry, I currently do not know the exchange for " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know that exchange. What else can I help with?";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help with?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions about keto such as, what's the exchange for a mayonnaise, or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, what's the exchange for mayonnaise, or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

exports.handler = function (event, context) {
    var ketoCalculator = new KetoCalculator();
    ketoCalculator.execute(event, context);
};
