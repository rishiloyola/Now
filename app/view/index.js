var myApp = angular.module('myApp', ['elasticsearch']);
myApp.service('client', function (esFactory) {
    return esFactory({
        host: 'https://RhOzFtk2Y:9e9ddeb0-4e82-41bd-bc8d-39bb80f142bd@scalr.api.appbase.io',
   });
});
myApp.controller('controller', function ($scope, client, esFactory) {
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
                    console.log(response.mysuggester[0].options[0].text);
                });
            }else{
                $scope.suggestions = null;
                $scope.row = false;
            }
        }catch(e){
            console.log('error');
        }
    }
});
