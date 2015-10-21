var myApp = angular.module('myApp', ['elasticsearch','ngMap']);

myApp.controller('viewcontroller',function ($scope, dataClient, esFactory, $interval, $window, $document) {

  var places = [],
      renderarray = [],
      categoryarray = [],
      streamedCheckin = [],
      searchedCheckinarray = [],
      draggedCheckin = [],
      citysearched,
      geocoder = new google.maps.Geocoder(),           //variable for geocoding
      infowindow = new google.maps.InfoWindow();      //variable for map infowindow

  $scope.init = function(){
      $scope.$on('mapInitialized', function(event, map) {
        $scope.mapobj = map;
        $scope.mapobj.setZoom(2);
        $scope.mapobj.setOptions({ minZoom: 2, maxZoom: 15 });
        $scope.mapobj.setCenter({lat: 0, lng: 0});
      });
      $scope.categoriesbox = false;
      $scope.checkinfrequency = "Count";
      $scope.$apply();
  };
  $scope.opencheckin = function(event,details){
   $window.open('https://'+details,'_blank');
  };
$scope.showwindow = function(e,data,visible){
   if(visible){
      infowindow.setContent('<table id="infowindow"><tr><td>' + '<img src="'+ data[6] +'">' + '</td>' + '<td>' + '<b>'+ data[8] + ' says ' +'</b>' + data[0] + '<br><b>Place : </b>' + data[7] + '</td></tr>'+'</table>');
      var center;
      switch($scope.mapobj.getZoom()){
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
      infowindow.open($scope.mapobj);
   }else{
      infowindow.close();
      infowindow = new google.maps.InfoWindow();
   }
 };
  $scope.searchquerry = function(){
       try{
          //searchtext variable referred to the text in the search box
          if($scope.searchtext!=null && $scope.searchtext.replace(/\s/g,'').length){  //to check if search text is null
              var suggestClient = dataClient.getSuggestions($scope.searchtext);
              suggestClient.then(function (resp) {
                $scope.row = true;
                $scope.suggestions = resp.mysuggester[0].options;
              }, function (err) {
                  console.trace(err.message);
              });
          }else{
              $scope.suggestions = null;
              $scope.row = false;
          }
      }catch(e){
          console.log('error');
      }
  };
  $scope.changesearchtext = function(text){
       $scope.searchtext = text;
       $scope.row = false;
  }
  $scope.getData = function(){
    var searchClient = dataClient.getSearchCheckin(angular.lowercase($scope.searchtext));
    searchClient.on('data', function(res) {
        console.log(res);
        searchedCheckinarray = [];
        categoryarray = [];
        places = [];
        citysearched = angular.lowercase($scope.searchtext);
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
             categoryarray[response.hits.hits[i]._source.category] = true;
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
             searchedCheckinarray.push(arr);
           }
         }
       }
       //GeoCoding to search the city
       geocoder.geocode( { "address": $scope.searchtext }, function(results, status) {
         if (status == google.maps.GeocoderStatus.OK && results.length > 0) {
           var location = results[0].geometry.location,
           latitude  = location.lat(),
           longitude  = location.lng();
           $scope.mapobj.setCenter({lat:latitude,lng:longitude});
           $scope.mapobj.setZoom(11);
           $scope.$apply();
         }
       });
       renderarray = [];
       places.push.apply(places,searchedCheckinarray);
       renderarray.push.apply(renderarray,searchedCheckinarray);
       if(draggedCheckin!=null) renderarray.push.apply(renderarray,draggedCheckin);
       if(streamedCheckin!=null) renderarray.push.apply(renderarray,streamedCheckin);
       $scope.places = renderarray;
       $scope.subjects = createJson(categoryarray,Object.keys(categoryarray));
       $scope.$digest();
       $scope.$apply();
       console.log($scope.places);
    }
 }
 var realtimeClient = dataClient.getliveData();
 realtimeClient.on('data', function(res) {
     streamProcess(res); //to fetch the data and to mark it on map
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
     renderarray.push(arr);
    //  if(places!=null) renderarray.push.apply(renderarray,places);
    //  renderarray.push.apply(renderarray,streamedCheckin);
    //  if(draggedCheckin!=null) renderarray.push.apply(renderarray,draggedCheckin);
     $scope.places = renderarray;
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
     $scope.$apply();
   }
 }

     $scope.draggedmap = function(){
       draggedCheckin = [];
       if($scope.mapobj.getZoom()>=5){
         var dragClient = dataClient.getDragData($scope.mapobj.getCenter().lat(),$scope.mapobj.getCenter().lng());
         dragClient.on('data', function(res) {
           dragProcess(res);  //to fetch the data and to mark it on map
         }).on('error', function(err) {
           console.log("caught a stream error", err);
         });
       }else if($scope.mapobj.getZoom()==4){
         draggedCheckin = [];
         renderarray = [];
         if(places!=null) renderarray.push.apply(renderarray,places);
         if(streamedCheckin!=null) renderarray.push.apply(renderarray,streamedCheckin);
         $scope.places = renderarray;
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
         if(places!=null) renderarray.push.apply(renderarray,places);
         renderarray.push.apply(renderarray,draggedCheckin);
         if(streamedCheckin!=null) renderarray.push.apply(renderarray,streamedCheckin);
         $scope.places = renderarray;
         $scope.$digest();
         $scope.$apply();
       }
     }
 $scope.showcategory = function(data){
     places = [];
     if(categoryarray[data]==true) categoryarray[data]=false;
     else categoryarray[data]=true;
     for(var i=0;i<searchedCheckinarray.length;i++){
         if(categoryarray[searchedCheckinarray[i][4]] == true){
             var arr = [];
             for(var j=0;j<10;j++){
               arr[j] = searchedCheckinarray[i][j];
             }
             places.push(arr);
         }
     }
     renderarray = [];
     if(places!=null)renderarray.push.apply(renderarray,places);
     if(draggedCheckin!=null) renderarray.push.apply(renderarray,draggedCheckin);
     if(streamedCheckin!=null)renderarray.push.apply(renderarray,streamedCheckin);
     $scope.places = renderarray;
 };
 //
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
        searchedCheckinarray.push(streamedCheckin[0]);
        categoryarray[streamedCheckin[0][4]] = true;
        $scope.subjects = createJson(categoryarray,Object.keys(categoryarray));
      }
      for(var i=places.length+draggedCheckin.length,j=0;i<places.length+streamedCheckin.length+draggedCheckin.length;i++,j++){
        if(nowTime-renderarray[i][11]<5)
         break;
        if(nowTime-renderarray[i][11]>=5){
         renderarray.splice(i,1);
         streamedCheckin.splice(j,1);
       }
      }
      // if(places!=null)renderarray.push.apply(renderarray,places);
      // if(draggedCheckin!=null) renderarray.push.apply(renderarray,draggedCheckin);
      // if(streamedCheckin!=null)renderarray.push.apply(renderarray,streamedCheckin);
         $scope.places = renderarray;
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
      $scope.$digest();
      $scope.$apply();
  }

 $interval(removecheckin,5000);
});
