// create angular app
var apiUrl = "http://api-planebox.fredlawl.com/auth/password";

// create angular controller
PlaneBox.controller('passwordController', ['$scope', '$http', function($scope, $http) {
  // function to submit the form after all validation has occurred            
	$scope.resetPassword = function() {
		//test message. remove when finished testing this method
		console.log("sending to server");
		
		var request = $http({
		method 	: 'PUT',
		url	 	: apiUrl,
		data : {password : $scope.password,
				password_confirmation : $scope.confirmPw,
				email : $scope.email,
				token : $scope.token
				}
		}).then(function(response){
					console.log('You have reset your password successfully.');
					window.location.href='/index.html';
				},
				function(data){
					//show message on error
					//window.alert("Error: "+data.status);
					console.log(data);
				});
    };
}]);