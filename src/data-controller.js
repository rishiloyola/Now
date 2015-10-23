myApp.service('dataClient',function(client){

    var streamingClient = new Appbase({
       url: 'https://scalr.api.appbase.io',
       appname: 'checkin',
       username: '6PdfXag4h',
       password: 'b614d8fa-03d8-4005-b6f1-f2ff31cd0f91'
     });

    this.getSuggestions = function(text){

    return streamingClient.search({
          index: 'checkin',
          body: {
            suggest: {
              mysuggester: {
                text: text,
                completion: {
                  field: 'city_suggest'
                }
              }
            }
          }
      });
    }

    this.getSearchCheckin = function(text){
      return streamingClient.search({
        index: 'checkin',
        type: 'city',
        body: {
          query : {
            match: {
              city : text
            }
          }
        }
      });
    }

    this.getliveData = function(){
      return streamingClient.searchStream({
        type: 'city',
        size: 200,
        body: {
          query: {
            match_all: {}
          }
        },
        streamonly: true
      });
    }

    this.getDragData = function(lat,lng){
      return streamingClient.search({
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
      });
    }

});

myApp.service('client', function (esFactory) {
    return esFactory({
        host: 'https://6PdfXag4h:b614d8fa-03d8-4005-b6f1-f2ff31cd0f91@scalr.api.appbase.io',
    });
});
