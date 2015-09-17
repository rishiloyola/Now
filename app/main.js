var Twit = require('twit')

var T = new Twit({
    consumer_key: '',        
    consumer_secret: '',     
    access_token: '',     
    access_token_secret: ''
})

var stream = T.stream('statuses/filter', { track: 'mango' })

stream.on('tweet', function (tweet) {
  console.log(tweet)
})
// Console will print the message
