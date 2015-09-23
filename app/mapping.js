const HOSTNAME = "scalr.api.appbase.io"
const APPNAME = "Check In"
const USERNAME = "RhOzFtk2Y"
const PASSWORD = "9e9ddeb0-4e82-41bd-bc8d-39bb80f142bd"
//Initialize twitter and appbase modules
var Twit = require('twit')
var request = require("request");
var appbase = require("appbase-js")
var elasticsearch = require('elasticsearch')
//Required authetication of twitter api

var client = new elasticsearch.Client({
    host: 'https://'+USERNAME+":"+PASSWORD+"@"+HOSTNAME,
  });

 client.indices.putMapping({
    index: 'Check In',
    type: 'city',
    body: {
        properties:{
          city : {"type" : "string"},
          query_suggest : {
          "type" : "completion"
        }
      }
    }
    }).then(function(response) {
        console.log(response);
    }, function(error) {
        console.log(error);
    });
