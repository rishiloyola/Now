var myApp = angular.module('myApp', ['elasticsearch','ngMap']);
myApp.service('client', function (esFactory) {
    return esFactory({
        host: 'https://RhOzFtk2Y:9e9ddeb0-4e82-41bd-bc8d-39bb80f142bd@scalr.api.appbase.io',
   });
});
myApp.controller('controller', function ($scope, client, esFactory) {
    var typesOfcat = [];
    var response;
    $scope.init = function(){
        $scope.$on('mapInitialized', function(event, map) {
            $scope.center = [0,0];
            $scope.objMapa = map;
            $scope.$apply();
        });
    }
    $scope.selectedvalue = true;
    $scope.detailbox=false;
    var streamingClient = new appbase({
      url: 'https://scalr.api.appbase.io',
      appname: 'Check In',
      username: 'RhOzFtk2Y',
      password: '9e9ddeb0-4e82-41bd-bc8d-39bb80f142bd'
    });
    $scope.changetext = function(text){
        $scope.searchtext = text;
        $scope.row = false;
    }
    $scope.showInfoWindow = function (event, p){
        var infowindow = new google.maps.InfoWindow();
        var center = new google.maps.LatLng(p[1],p[2]);
        infowindow.setContent('<h3>' + p[0] + '</h3>');
        infowindow.setPosition(center);
        infowindow.open($scope.objMapa);
    };
    $scope.checktext = function(){
        try{
            if($scope.searchtext!=null && $scope.searchtext.replace(/\s/g,'').length){
                client.suggest({
                    index: 'Check In',
                    body: {
                        mysuggester: {
                            text: $scope.searchtext,
                            completion: {
                             field: 'query_suggest'
                            }
                        }
                    }
                }, function (error, response) {
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
    }
    $scope.getcategory = function(data){
        var beaches = [];
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
                beaches[i] = arr;
            }
        }
        $scope.beaches = beaches;
    }
    $scope.getData = function(){
        $scope.row = false;
        streamingClient.streamSearch({
            stream: true,     // we pass stream: true parameter to fetch current results and then stream new results.
            type: 'city',
            body: {
               query : {
                    filtered : { 
                        query : {
                            match: {
                                city : $scope.searchtext
                            } 
                        }
                    }
                }
            }
        }).on('data', function(res) {
            response = res;
            $scope.$apply();
            console.log("res"+JSON.stringify(res));
            var categorylist = [];
            var beaches = [];
            $scope.center = [parseFloat(res.hits.hits[0]._source.latitude),parseFloat(res.hits.hits[0]._source.longitude)];
            for(var i=0;i<res.hits.hits.length;i++){
                if(!(res.hits.hits[i]._source.category === undefined)){
                    categorylist[res.hits.hits[i]._source.category] = true;
                    var arr = [];
                    arr[0] = res.hits.hits[i]._source.shout;
                    arr[1] = res.hits.hits[i]._source.latitude;
                    arr[2] = res.hits.hits[i]._source.longitude;
                    arr[3] = 1;
                    arr[4] = res.hits.hits[i]._source.category;
                    beaches[i] = arr;
                }
            }
            typesOfcat = categorylist;
            $scope.beaches = beaches;
            $scope.subjects = Object.keys(categorylist);
            $scope.$digest() 
            $scope.$apply();
        }).on('error', function(err) {
            console.log("caught a stream error", err)
        })
        
        

    }
});
