myApp.service('dataClient',function(client){

    var streamingClient = new Appbase({
       url: 'https://scalr.api.appbase.io',
       appname: 'checkin',
       username: 'Uxa3m5nPP',
       password: 'ae4d2bf0-7669-4ba7-8849-3475576501c3'
     });

    this.getSuggestions = function(text){

        return client.suggest({
          index: 'checkin',
          body: {
            mysuggester: {
              text: text,
              completion: {
                field: 'city_suggest'
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
        host: 'https://Uxa3m5nPP:ae4d2bf0-7669-4ba7-8849-3475576501c3@scalr.api.appbase.io',
    });
});
