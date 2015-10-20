var myApp = angular.module('myApp', ['elasticsearch','ngMap']);


myApp.service('client', function (esFactory) {
    return esFactory({
        host: 'https://Uxa3m5nPP:ae4d2bf0-7669-4ba7-8849-3475576501c3@scalr.api.appbase.io',
    });
});


myApp.controller('controller', function ($scope, client, esFactory, $interval,$window,$document) {

    //initialize the map
    $scope.init = function(){
        $scope.$on('mapInitialized', function(event, map) {
          $scope.center = [0,0];
          $scope.objMapa = map;
          $scope.objMapa.setOptions({ minZoom: 2, maxZoom: 15 });
          $scope.zoomlevel = 2;
          $scope.$apply();
        });
    };
    //initialize the appbase client
    var streamingClient = new Appbase({
         url: 'https://scalr.api.appbase.io',
         appname: 'checkin',
         username: 'Uxa3m5nPP',
         password: 'ae4d2bf0-7669-4ba7-8849-3475576501c3'
    });

     $scope.opencheckin = function(event,details){
      $window.open('https://'+details,'_blank');
    };

    var  geocoder = new google.maps.Geocoder(),           //variable for geocoding
         infowindow = new google.maps.InfoWindow(),      //variable for map infowindow
         citysearched,
         searchedCheckin = [],                         //global array to store checkins of searched city
         streamedCheckin = [],                         //global array to store checkins which are recently streamed
         draggedCheckin = [],                          //global array to store checkins according to the map dragging
         categorylist = [],                            //global array to store categories of searched city
         renderarray = [],                             //final array of above three array
         places = [];                                  //this array used to show the checkins according to the selected categories

    $scope.changesearchtext = function(text){
         $scope.searchtext = text;
         $scope.row = false;
    }

    $scope.showwindow = function(e,data,visible){
      if(visible){
         infowindow.setContent('<table id="infowindow"><tr><td>' + '<img src="'+ data[6] + '">' + '</td>' + '<td>' + '<b>'+ data[8] + ' says ' +'</b>' + data[0] + '<br><b>Place : </b>' + data[7] + '</td></tr>'+'</table>');
         var center;
         switch($scope.objMapa.getZoom()){
           case 2:
                  center = new google.maps.LatLng(data[1]+9.6,data[2]-2.3);
                  break;
           case 3:
                  center = new google.maps.LatLng(data[1]+4.8,data[2]-1.7);
                  break;
           case 4:
                  center = new google.maps.LatLng(data[1]+2.4,data[2]-1.1);
                  break;
           case 5:
                  center = new google.maps.LatLng(data[1]+1.2,data[2]-0.5);
                  break;
           case 6:
                  center = new google.maps.LatLng(data[1]+0.6,data[2]-0.14);
                  break;
           case 7:
                  center = new google.maps.LatLng(data[1]+0.3,data[2]-0.09);
                  break;
           case 8:
                  center = new google.maps.LatLng(data[1]+0.15,data[2]-0.036);
                  break;
           case 9:
                  center = new google.maps.LatLng(data[1]+0.07,data[2]-0.02);
                  break;
           case 10:
                  center = new google.maps.LatLng(data[1]+0.04,data[2]-0.009);
                  break;
           case 11:
                  center = new google.maps.LatLng(data[1]+0.02,data[2]-0.005);
                  break;
           case 12:
                  center = new google.maps.LatLng(data[1]+0.01,data[2]-0.004);
                  break;
           case 13:
                  center = new google.maps.LatLng(data[1]+0.005,data[2]-0.0009);
                  break;
           case 14:
                  center = new google.maps.LatLng(data[1]+0.0025,data[2]-0.0005);
                  break;
           case 15:
                  center = new google.maps.LatLng(data[1]+0.0012,data[2]-0.00027);
                  break;
         }
         infowindow.setPosition(center);
         infowindow.setZIndex(2);
         infowindow.open($scope.objMapa);
         console.log($scope.objMapa.getZoom());
      }else{
         infowindow.close();
         infowindow = new google.maps.InfoWindow();
      }
    };


    $scope.searchquerry = function(){
         try{
            //searchtext variable referred to the text in the search box
            if($scope.searchtext!=null && $scope.searchtext.replace(/\s/g,'').length){  //to check if search text is null
                client.suggest({
                    index: 'checkin',
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
      console.log(data);
        places = [];
        if(categorylist[data]==true) categorylist[data]=false;
        else categorylist[data]=true;
        for(var i=0;i<searchedCheckin.length;i++){
            if(categorylist[searchedCheckin[i][4]] == true){
                var arr = [];
                for(var j=0;j<10;j++){
                  arr[j] = searchedCheckin[i][j];
                }
                places.push(arr);
            }
        }
        renderarray = [];
        if(streamedCheckin!=null)renderarray.push.apply(renderarray,streamedCheckin);
        if(draggedCheckin!=null) renderarray.push.apply(renderarray,draggedCheckin);
        if(places!=null)renderarray.push.apply(renderarray,places);
        $scope.beaches = renderarray;
    };

    //streaming data from appbase
    $scope.getData = function(){
      streamingClient.search({
        index: 'checkin',
        type: 'city',
        body: {
          query : {
            match: {
              city : $scope.searchtext
            }
          }
        }
      }).on('data', function(res) {
          searchedCheckin = [];
          categorylist = [];
          places = [];
          citysearched = $scope.searchtext;
          $scope.row = false;    //to hide suggestions
          $scope.$apply();
          searchProcess(res);  //to fetch the data and to mark it on map
        }).on('error', function(err) {
          console.log("caught a stream error", err);
        });
    };


     function searchProcess (response){
       if($scope.searchtext!=null && $scope.searchtext.replace(/\s/g,'').length){
         $scope.categoriesbox = true;
         if(response.hits){
            for(var i=0;i<response.hits.hits.length;i++){
              if(response.hits.hits[i]._source.category && response.hits.hits[i]._source.latitude && response.hits.hits[i]._source.longitude && response.hits.hits[i]._source.category){
                categorylist[response.hits.hits[i]._source.category] = true;
                var arr = [];                 //creating array to publish details on map
                arr[0] = response.hits.hits[i]._source.shout;
                arr[1] = response.hits.hits[i]._source.latitude;
                arr[2] = response.hits.hits[i]._source.longitude;
                arr[3] = 1;
                arr[4] = response.hits.hits[i]._source.category;
                arr[5] = response.hits.hits[i]._source.url;
                arr[6] = response.hits.hits[i]._source.photourl;
                arr[7] = response.hits.hits[i]._source.venue;
                arr[8] = response.hits.hits[i]._source.username;
                arr[9] = 'red_marker.png';
                searchedCheckin.push(arr);
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
              $scope.objMapa.setZoom(11);
              $scope.$apply();
            }
          });
          renderarray = [];
          places.push.apply(places,searchedCheckin);
          renderarray.push.apply(renderarray,searchedCheckin);
          if(streamedCheckin!=null) renderarray.push.apply(renderarray,streamedCheckin);
          if(draggedCheckin!=null) renderarray.push.apply(renderarray,draggedCheckin);
          $scope.beaches = renderarray;
          $scope.subjects = createJson(categorylist,Object.keys(categorylist));
          $scope.$digest();
          $scope.$apply();
       }
    }

    streamingClient.searchStream({
      type: 'city',
      size: 200,
      body: {
        query: {
          match_all: {}
        }
      },
      streamonly: true
    }).on('data', function(res) {
      streamProcess(res);  //to fetch the data and to mark it on map
    }).on('error', function(err) {
      console.log("caught a stream error", err);
    });

    function streamProcess(response){
      if(response._source.latitude!=null && response._source.longitude!=null){
        var arr = [];                 //creating array to publish details on map
        arr[0] = response._source.shout;
        arr[1] = response._source.latitude;
        arr[2] = response._source.longitude;
        arr[3] = 1;
        arr[4] = response._source.category;
        arr[5] = response._source.url;
        arr[6] = response._source.photourl;
        arr[7] = response._source.venue;
        arr[8] = response._source.username;
        arr[9] = 'blue_marker.png';
        arr[10] = response._source.city;
        arr[11] = new Date().getTime()/1000;
        streamedCheckin.push(arr);
        renderarray = [];
        if(places!=null) renderarray.push.apply(renderarray,places);
        if(draggedCheckin!=null) renderarray.push.apply(renderarray,draggedCheckin);
        renderarray.push.apply(renderarray,streamedCheckin);
        $scope.beaches = renderarray;
        $scope.$apply();
      }
    }


    //Json data to render dynamic checkbox

    $scope.draggedmap = function(){
      draggedCheckin = [];
      if($scope.objMapa.getZoom()>=5){
        streamingClient.search({
          type: 'city',
          body: {
            query : {
              match_all : {}
            },
            filter : {
              geo_distance : {
                distance : "2000km",
                location : [$scope.objMapa.getCenter().lat(),$scope.objMapa.getCenter().lng()]
              }
            }
          }
        }).on('data', function(res) {
          dragProcess(res);  //to fetch the data and to mark it on map
        }).on('error', function(err) {
          console.log("caught a stream error", err);
        });
      }else{
        draggedCheckin = [];
        renderarray = [];
        if(streamedCheckin!=null) renderarray.push.apply(renderarray,streamedCheckin);
        if(places!=null) renderarray.push.apply(renderarray,places);
        $scope.beaches = renderarray;
      }
    }

    function dragProcess(response){
      if(response.hits){
        for(var i=0;i<response.hits.hits.length;i++){
          if( response.hits.hits[i]._source){
            if(response.hits.hits[i]._source.latitude && response.hits.hits[i]._source.longitude){
              if(citysearched==response.hits.hits[i]._source.city)
              continue;
              var arr = [];                 //creating array to publish details on map
              arr[0] = response.hits.hits[i]._source.shout;
              arr[1] = response.hits.hits[i]._source.latitude;
              arr[2] = response.hits.hits[i]._source.longitude;
              arr[3] = 1;
              arr[4] = response.hits.hits[i]._source.category;
              arr[5] = response.hits.hits[i]._source.url;
              arr[6] = response.hits.hits[i]._source.photourl;
              arr[7] = response.hits.hits[i]._source.venue;
              arr[8] = response.hits.hits[i]._source.username;
              arr[9] = 'orange_marker.png';
              draggedCheckin.push(arr);
            }
          }
        }
      }
      if(draggedCheckin.length!=0){
        renderarray = [];
        if(streamedCheckin!=null) renderarray.push.apply(renderarray,streamedCheckin);
        if(places!=null) renderarray.push.apply(renderarray,places);
        renderarray.push.apply(renderarray,draggedCheckin);
        $scope.beaches = renderarray;
        $scope.$digest();
        $scope.$apply();
      }
    }

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

    var removecheckin = function (){
      var nowTime = new Date().getTime()/1000;
      if(streamedCheckin.length!=0){
        if(citysearched==streamedCheckin[0][10]){
          streamedCheckin[0][9] = 'red_marker.png';
          searchedCheckin.push(streamedCheckin[0]);
          categorylist[streamedCheckin[0][4]] = true;
          $scope.subjects = createJson(categorylist,Object.keys(categorylist));
        }
        for(var i=0;i<streamedCheckin.length;i++){
          if(nowTime-streamedCheckin[i][11]<5)
           break;
          if(nowTime-streamedCheckin[i][11]>=5)
           streamedCheckin.splice(i,1);

        }
        renderarray = [];
        if(streamedCheckin!=null)renderarray.push.apply(renderarray,streamedCheckin);
        if(places!=null)renderarray.push.apply(renderarray,places);
        $scope.beaches = renderarray;
        $scope.$apply();
        }
        if(streamedCheckin.length<3){
          $scope.checkinfrequency=streamedCheckin.length;
          $scope.color = 'rgb(255, 92, 92)';
        }else if(streamedCheckin.length>=3 && streamedCheckin.length<10){
          $scope.checkinfrequency=streamedCheckin.length;
          $scope.color = 'rgb(255, 153, 51)';
        }else if(streamedCheckin.length>=10){
          $scope.checkinfrequency=streamedCheckin.length;
          $scope.color = 'rgb(51, 204, 51)';
        }
    }


   $interval(removecheckin,5000);

});
