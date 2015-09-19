const HOSTNAME = "scalr.api.appbase.io"
const APPNAME = "Check In"
const USERNAME = "XXXX"
const PASSWORD = "XXXX"
//Initialize twitter and appbase modules
var Twit = require('twit')
var request = require("request");
var appbase = require("appbase-js")
var elasticsearch = require('elasticsearch')
//Required authetication of twitter api
var T = new Twit({
    	consumer_key: 'XXXX',        
    	consumer_secret: 'XXXX',     
    	access_token: 'XXXX',     
    	access_token_secret: 'XXXX'
	})

var client = new elasticsearch.Client({
 		host: 'https://'+USERNAME+":"+PASSWORD+"@"+HOSTNAME,
	});
//Filter tweets related to swarmapp
var stream = T.stream('statuses/filter', { track: 'swarmapp', language: 'en' })
//Streaming of twitter tweets
stream.on('tweet', function (tweet) {
  var swarmappUrl = tweet.entities.urls[0].display_url;
  var FSid = swarmappUrl.split("/")[2];
  var FSurl = "https://api.foursquare.com/v2/checkins/resolve?shortId="+FSid+"&oauth_token=XXXX&v=20150919";
  //Getting data from foursquare
  request(FSurl, function(error, response, body) {
  		var parsedbody = JSON.parse(body);
  		var cityDetails = String(parsedbody.response.checkin.venue.location.city);
  		if(!(cityDetails === "undefined")){
  		  	console.log(cityDetails);
  		  	//Storing data using appbase api
 			client.index({
  				index: 'Check In',
 		  	  	type: cityDetails,
 		  	  	id: parsedbody.response.checkin.id,
 				body: body
			}).then(function(response) {
    			console.log(response);
  		 	}, function(error) {
   				console.log(error);
  			});
  		}         
    });
})


