"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
    //session.send("Getting 1");
    var request = require('request');

    var message = session.message.text;
    message = message.replace("giphyBot", "");
    //session.send("Getting");
    var randomNumber = Math.floor((Math.random() * 10) + 1);

    request.get(
        'http://api.giphy.com/v1/gifs/search?q=' + message + '&api_key=dc6zaTOxFJmzC&offset=' + randomNumber,
        {},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var jsonObject = JSON.parse(body);
                //console.log(jsonObject);
                if (jsonObject == 'undefined' || jsonObject.data == 'undefined' || jsonObject.data[0] == 'undefined'
                    || jsonObject == undefined || jsonObject.data == undefined || jsonObject.data[0] == undefined) {
                    //session.send("gif not found");



                    // second round
                    request.get(
                        'http://api.giphy.com/v1/gifs/search?q=' + message + '&api_key=dc6zaTOxFJmzC',
                        {},
                        function (errorsecond, responsesecond, bodysecond) {
                            if (!errorsecond && responsesecond.statusCode == 200) {
                                var jsonObjectSecond = JSON.parse(bodysecond);
                                //console.log(jsonObject);
                                if (jsonObjectSecond == 'undefined' || jsonObjectSecond.data == 'undefined' || jsonObjectSecond.data[0] == 'undefined'
                                    || jsonObjectSecond == undefined || jsonObjectSecond.data == undefined || jsonObjectSecond.data[0] == undefined) {
                                    session.send("gif not found");
                                }else{
                                      var urlSecond = jsonObjectSecond.data[0].images.fixed_height.url;
                                      if(urlSecond.indexOf("https") == -1){
                                          urlSecond = urlSecond.replace("http", "https");
                                      }

                                        //var card = createCard("Animation card", session,url);
                                        var cardSecond = createCard("Hero card", session, urlSecond);

                                        // attach the card to the reply message
                                        var msgSecond = new builder.Message(session).addAttachment(cardSecond);

                                        session.send(msgSecond);
                                }
                            }
                        }
                    );

                } else {
                    var url = jsonObject.data[0].images.fixed_height.url;
                      if(url.indexOf("https") == -1){
                                          url = url.replace("http", "https");
                                      }
                  

                    //var card = createCard("Animation card", session,url);
                    var card = createCard("Hero card", session, url);

                    // attach the card to the reply message
                    var msg = new builder.Message(session).addAttachment(card);

                    session.send(msg);
                }

            } else {
                session.send("Er is een probleem opgetreden.");
            }
        }
    );
});


var HeroCardName = 'Hero card';
var ThumbnailCardName = 'Thumbnail card';
var ReceiptCardName = 'Receipt card';
var SigninCardName = 'Sign-in card';
var AnimationCardName = "Animation card";
var VideoCardName = "Video card";
var AudioCardName = "Audio card";
var CardNames = [HeroCardName, ThumbnailCardName, ReceiptCardName, SigninCardName, AnimationCardName, VideoCardName, AudioCardName];

function createCard(selectedCardName, session, url) {
    switch (selectedCardName) {
        case HeroCardName:
            return createHeroCard(session, url);
        case ThumbnailCardName:
            return createThumbnailCard(session);
        case ReceiptCardName:
            return createReceiptCard(session);
        case SigninCardName:
            return createSigninCard(session);
        case AnimationCardName:
            return createAnimationCard(session, url);
        case VideoCardName:
            return createVideoCard(session);
        case AudioCardName:
            return createAudioCard(session);
        default:
            return createHeroCard(session);
    }
}
// Sends attachment using an Internet url
function createAnimationCard(session, urlCard) {
    return new builder.AnimationCard(session)
        .image(builder.CardImage.create(session, 'https://docs.botframework.com/en-us/images/faq-overview/botframework_overview_july.png'))
        .media([
            { url: '' + urlCard }
        ]);
}

function createHeroCard(session, urlCard) {
    return new builder.HeroCard(session)
        .subtitle('Powered by Giphy')
        .images([
            builder.CardImage.create(session, urlCard)
        ]);
}

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = { default: connector.listen() }
}
