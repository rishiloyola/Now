# CheckedIn
History of foursquare and swarmapp. Use of foursquare.

We built an app for showing live foursquare check-ins.

Specific technology we used to make it - Twitter streaming api, Foursquare api, Appbase api, Elasticsearch, Google maps api, Angularjs, Bootstrap, Nodejs, forever.js.

Key Ingredients
The Now recipe can be broken into two key pieces: the backend worker and the user interface.
Backend Worker : 
We use the Twitter’s streaming api to get the data of swarmapp checkins. At first we are extracting data from this particular url. To filter out tweets we are using Twitter’s Public api.
From these tweets we can only get particular check in’s url and its id. Now to get further details about check ins we are using Foursquare’s HTTP get requests.
We then store this data in appbase.io, which provides us a convenient way to query both historical data and realtime feeds - we call it the streaming DB ;).
The logic of data filtration and data storing coded in nodejs technology.

User Interface:
The UI / UX logic maintained with a Angularjs frontend. And we use Bootstrap for displaying the user interface.
To render check ins on the map we use Google maps. Specifically we are using their  angularjs directives.
User can query appbase.io in four different ways to get datas of check ins.
Search by city 
Live streaming 
Dragging the map
Search suggestions
What is NOW?
Now shows live Foursquare checkins from people across the globe. It has some neat filters that allow you to select a city and the check-in categories.

Image: Let's check the all the check ins tagged in San Francisco.
Now when a person RSVPs for a singles meetup, you would see it show up on the now feed. Now don't get any ideas for stalking unsuspecting people. It's a cool way to find the most happening meetups!
A fun fact: While building this app, we noticed that there are about 120 RSVPs on meetup.com every minute, that's 2 every second. Or in 30 days, we would see over 5 million RSVPs - that's a good data set size to query in realtime ;).
NEED HELP OF SID =========>
Deep Dive
Now that we know what now does, let's get into the meat of how the app works.
Backend Worker
Our backend worker is a simple Node.JS code that keeps running forever on a digitalocean droplet.

A diagram on the workflow.

stream.on('tweet' , function (tweet) {
    var swarmappUrl = tweet.entities.urls[0].display_url;//swarmapp url for the check in 
    var FSid = swarmappUrl.split("/")[2];
    var FSurl = "https://api.foursquare.com/v2/checkins/resolve?shortId="+FSid+"&oauth_token="+jsonContent.foursquare.oauth_token+"&v=20150919";//created url to get data of that checkin from foursquare 
    request(FSurl , function(error, response, body) {
       var parsedbody = JSON.parse(body);
     }
  }

This worker provides us a JSON object for every Check ins. We then write this data into appbase.io as soon as it arrives. appbase.io is built as a streaming layer on 


// collection to store the data into
appbaseObj.index({
    type: 'city',
    id: parsedbody.response.checkin.id,
    body: {
       shout: parsedbody.response.checkin.shout,
       city: cityDetails,
       category: parsedbody.response.checkin.venue.categories[0].shortName,
       latitude: parsedbody.response.checkin.venue.location.lat,
       longitude: parsedbody.response.checkin.venue.location.lng,
       venue: parsedbody.response.checkin.venue.name,
       city_suggest: String(parsedbody.response.checkin.venue.location.city),
       url: swarmappUrl,
       username: parsedbody.response.checkin.user.firstName,
       photourl: parsedbody.response.checkin.user.photo.prefix,                         
       state: parsedbody.response.checkin.venue.location.state,
       country: parsedbody.response.checkin.venue.location.country,
       location: [parsedbody.response.checkin.venue.location.lat,parsedbody.response.checkin.venue.location.lng]
     }
}).on('data', function(res) {
     console.log("successfully indexed one meetup RSVP");
});

ElasticSearch, and provides a continuous query interface for streaming JSON results.
A Check in JSON data looks like this:
{
 "shout": "Columbus Realtors Directors Meeting",
 "city": "columbus",
 "category": "Office",
 "latitude": 39.996149824327,
 "longitude": -82.93393505324137,
 "venue": "Columbus REALTORS®",
 "city_suggest": "Columbus",
 "url": "swarmapp.com/c/96gB6gzzl34",
 "username": "Kathy",
 "photourl": "https://irs3.4sqi.net/img/user/50x50/2765688-MLBTNEFSNDM2QEO0.jpg",
 "state": "OH",
 "country": "United States",
 "location": [
  39.996149824327,
  -82.93393505324137
 ]
}
User Interface
The User Interface is a small frontend that queries appbase.io for realtime checkins based on either city name or map geolocation coordinates.

Image: Showing Check ins by city and by live streaming - try it live.
The app directory structure looks like this:
now/
|_ _ _ _ src/
|        |_ _ _ _ index.html
|        |_ _ _ _ index.css
|        |_ _ _ _ index.js
|_ _ _ _ data-controller.js


The codebase can be accessed at the now github repo.
data-contoller.js
Creates a check in requests prototype which is responsible for four different queries.
Return check ins of particular city,
A realtime query fetching live check in data from the overall world,
Pagination showing older check ins when a user drags the map.
Fetch the database and returns the JSON object which matches to the search text. Its useful to give suggestions while searching for a city.
index.js
This file contains view controller which controllers the map rendering and rest of the view parts. Instantiates a check in prototype object which is responsible for the check box selection logic when a user ticks a category checkbox and displaying check ins in map according to that. 


A sneakpeak into continuous queries
Here's a sneakpeak into how the continuous query for fetching live check in data works how appbase helps to fetch similar data and how it helps to find check ins nearer to certain point (Geo distance filter). 
We use the appbase-js library (available via bower and npm) for making continuous queries over the meetup feed data.
streamingClient = new Appbase({
    url: "https://qz4ZD8xq1:a0edfc7f-5611-46f6-8fe1-d4db234631f3@scalr.api.appbase.io",
    appname: "checkin"
})


To stream live data
streamingClient.searchStream({
          type: 'city',
          size: 200,
          body: {
             query: {
                match: {
                    match_all : {}
                  }
             }
          },
          streamonly: true
      });



searchStream() provides a data handler that returns :
ASK SID TO WRITE MORE OVER HERE ======>

To give fetch similar data according to the query
streamingClient.search({
         index: 'checkin',
         body: {
           suggest: {
              mysuggester: {
                 text: text,completion: { 
                   field: 'city_suggest'
                 }
              }
            }
         }
   })

Query type for Geo distance filter
streamingClient.search({
        type: 'city',
        body: {
          query : {
            match_all : {}
          },
          filter : {
            geo_distance : {
              distance : "2000km",
              location : [lat,lng]
            }
          }
        }
  })
Summary
We created now as a way to find realtime checkins around the globe.
We use the Twitter streaming API for finding all the tweets with a swarmapp link, which we then send to the Foursquare API for getting the check-in JSON response.
We use appbase.io to transform this into queriable live data.
We put together a small frontend that allows neat filtering based on city selection and categories or by browsing the map view.
Without further ado, here are the important links: now worker code, now and the demo.

