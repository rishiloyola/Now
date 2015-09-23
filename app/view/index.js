var myApp = angular.module('myApp', ['elasticsearch']);
myApp.service('client', function (esFactory) {
    return esFactory({
        host: 'https://RhOzFtk2Y:9e9ddeb0-4e82-41bd-bc8d-39bb80f142bd@scalr.api.appbase.io',
   });
});
myApp.controller('controller', function ($scope, client, esFactory) {

    var streamingClient = new appbase({
      url: 'https://scalr.api.appbase.io',
      appname: 'Check In',
      username: 'RhOzFtk2Y',
      password: '9e9ddeb0-4e82-41bd-bc8d-39bb80f142bd'
    });

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
                    console.log(response);
                });
            }else{
                $scope.suggestions = null;
                $scope.row = false;
            }
        }catch(e){
            console.log('error');
        }
    }
    $scope.getData = function(){
        streamingClient.streamSearch({
            stream: true,     // we pass stream: true parameter to fetch current results and then stream new results.
            type: 'books',
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
    
            console.log("city"+JSON.stringify(res.hits.hits[0]));
        }).on('error', function(err) {
            console.log("caught a stream error", err)
        })
    }
});