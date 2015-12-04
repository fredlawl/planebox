

// create angular controller
PlaneBox.controller('loginController', ['$scope', '$http', function($scope, $http) {
    //Login variables
    var apiLoginUrl = window.data.apiURL + "/auth/login";
    var msgSuccess = "You are now logged in.";
    var msgFail = "Username and password combination is not valid.";
    var storage = require('store');

	//function to submit form after validation is done.
	$scope.submitLogin = function(){
		var request = $http({
		method 	: 'POST',
		url	 	: apiLoginUrl,
		data : {email : $scope.emailLogin,
				password : $scope.passwordLogin
				}
		}).then(function(response){
                storage.set('login-token', response.token);
				window.alert(msgSuccess);
				window.location.href='/index.html';
				console.log(response);
				storage.set("login-token", response.data.token);
				},
				function(data){
					//this isn't perfect. but it'll do for the demo.
					window.alert("Error "+data.status+": "+msgFail);
				});
	};
}]);
