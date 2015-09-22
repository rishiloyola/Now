
var myApp = angular.module('myApp', ['elasticsearch']);
 
 myApp.controller('controller', function ($scope, esFactory) {
    var streamingClient = new appbase({
        url: XXXX,
        appname: XXXX,
        username: XXXX,
        password: XXXX
    });
     $scope.checktext = function(){
        if($scope.searchtext!=null && $scope.searchtext.replace(/\s/g,'').length){
        streamingClient.streamSearch({
            stream: true,
            index: "Check In"     // we pass stream: true parameter to fetch current results and then stream new results.
            body: {
              type : {
                value : $scope.searchtext
                }
            }
         }).on('data', function(res) {
              console.log(res);
         }).on('error', function(err) {
              console.log("caught a stream error", err)
         })
     }
     };
 });
