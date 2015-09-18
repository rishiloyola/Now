var Twit = require('twit')

var T = new Twit({
    consumer_key: '',        
    consumer_secret: '',     
    access_token: '',     
    access_token_secret: ''
})

var stream = T.stream('statuses/filter', { track: 'swarmapp', language: 'en' })

stream.on('tweet', function (tweet) {
  var swarmappUrl = tweet.entities.urls[0].display_url;
  var FSid = swarmappUrl.split("/")[2];
  console.log(FSid);
})
