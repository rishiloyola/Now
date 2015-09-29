var myApp = angular.module('myApp', ['elasticsearch','ngMap']);


myApp.service('client', function (esFactory) {
    return esFactory({
        host: 'https://VUFFYiAho:dc58e7a2-1638-46f7-bf8b-2e657b22b410@scalr.api.appbase.io',
   });
});


myApp.controller('controller', function ($scope, client, esFactory, $interval) {
  
    var streamingClient = new Appbase({
      url: 'https://scalr.api.appbase.io',
      appname: 'Check In',
      username: 'VUFFYiAho',
      password: 'dc58e7a2-1638-46f7-bf8b-2e657b22b410'
    });
    
    
    var typesOfcat = [],            //global variable to store categories of one city
        response,                   //global variable to store response from appbase
        geocoder = new google.maps.Geocoder(),
        infowindow = new google.maps.InfoWindow(),
        identifyStreaming,          //parameter to identify streaming
        checkin = [],               //global variable to store checkins of one city
        categorylist = [];          

    $scope.selectedvalue = true;
    $scope.detailbox=false;
    $scope.zoomlevel = 2;
    
    //initialize the map
    $scope.init = function(){
        $scope.$on('mapInitialized', function(event, map) {
            $scope.center = [0,0];
            $scope.objMapa = map;
            $scope.$apply();
        });
    };
    
    
    $scope.changesearchtext = function(text){
        $scope.searchtext = text;
        $scope.row = false;
        $scope.$apply();
    }
    
    $scope.showwindow = function (e,data,visible){
      
      if(visible){
         infowindow.setContent('<h3>' + data[0] + '</h3>');
         var center = new google.maps.LatLng(data[1],data[2]);
         infowindow.setPosition(center);
         infowindow.open($scope.objMapa);
      }else{
         infowindow.close();
         infowindow = new google.maps.InfoWindow();
      }
      
    };
    
    $scope.searchquerry = function(){
        try{
            //searchtext variable referred to the text in search box
            if($scope.searchtext!=null && $scope.searchtext.replace(/\s/g,'').length){  //to check if search text is null
              
                client.suggest({
                    index: 'Check In',
                    body: {
                      mysuggester: {
                        text: $scope.searchtext,
                        completion: {
                          field: 'city_suggest'
                        }
                      }
                    }
                }, function (error, response) {
                    //response contains suggested cities
                    $scope.suggestions = response.mysuggester[0].options;
                    $scope.row = true;
                });
                
            }else{
                $scope.suggestions = null;
                $scope.row = false;
            }
            
        }catch(e){
            console.log('error');
        }
        
    };
    
    $scope.showcategory = function(data){
      
        var places = [];
        
        if(typesOfcat[data]==true) typesOfcat[data]=false;
        else typesOfcat[data]=true;
        
        console.log(data);
        for(var i=0;i<response.hits.hits.length;i++){
          
            if(typesOfcat[response.hits.hits[i]._source.category] == true){
                var arr = [];
                arr[0] = response.hits.hits[i]._source.shout;
                arr[1] = response.hits.hits[i]._source.latitude;
                arr[2] = response.hits.hits[i]._source.longitude;
                arr[3] = 1;
                places.push(arr);
            }
            
        }
        
        $scope.beaches = places;
    }
    
    //streaming data from appbase
    $scope.getData = function(){
        identifyStreaming = false;
        try{
          streamingClient.streamSearch({
            type: 'city',
            size: 200,
            body: {
               query : {
                  term: {
                      city : $scope.searchtext
                  }
                }
             }
           }).on('data', function(res) {
             if(!identifyStreaming) {checkin = []; categorylist = [];}
             else console.log('streaming is now on !');
             $scope.row = false;    //to hide suggestions
             $scope.$apply();
             processStreams(res);  //to fetch the data and to mark it on map
             $scope.selectedvalue = true;
             console.log('hello');
           }).on('error', function(err) {
             console.log("caught a stream error", err);
           });
           
        }catch(err){
            console.log(err);
        }
        
    };
    
     function processStreams (res){
       identifyStreaming = true;
       if($scope.searchtext!=null && $scope.searchtext.replace(/\s/g,'').length){
         response = res;
         console.log($scope.searchtext);
         console.log("res"+JSON.stringify(res.hits));
            
         if(response.hits){
           
            for(var i=0;i<response.hits.hits.length;i++){
              
              if(response.hits.hits[i]){
                if( response.hits.hits[i]._source){
                  if(response.hits.hits[i]._source.category){
                    categorylist[response.hits.hits[i]._source.category] = true;
                    var arr = [];                 //creating array to publish details on map
                    arr[0] = response.hits.hits[i]._source.shout;
                    arr[1] = response.hits.hits[i]._source.latitude;
                    arr[2] = response.hits.hits[i]._source.longitude;
                    arr[3] = 1;
                    arr[4] = response.hits.hits[i]._source.category;
                    checkin.push(arr);
                  }
                }
              }
            }
          }
          //GeoCoding to search the city
          geocoder.geocode( { "address": $scope.searchtext }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
               var location = results[0].geometry.location,
               lat  = location.lat(),
               lng  = location.lng();
               $scope.center = [lat,lng];
               $scope.zoomlevel = 8;
               $scope.$apply();
            }
          });
          
          typesOfcat = categorylist;
          $scope.beaches = checkin;
          console.log('beach'+checkin);
         // $scope.subjects = Object.keys(categorylist);
          $scope.subjects = createJson(categorylist,Object.keys(categorylist));
          $scope.$digest(); 
          $scope.$apply();
       }
    }
    
    //Json data to render dynamic checkbox
    function createJson(key,array){
      var json = [];
      for(var i=0;i<array.length;i++){
        var object = {
                name: array[i],
                value: true
            };
            json.push(object);
        }
        return json;
    }
  
});
