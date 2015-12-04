var waitFor = require('waitFor');
var PlaneBox = angular.module('PlaneBox',[]);

waitFor('.test', function() {

    console.log('test');

    PlaneBox.controller('GreetingController', ['$scope', function($scope) {
        $scope.greeting = 'Hola!';
        console.log('help me');
    }]);
});