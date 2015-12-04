// create angular app
var apiUrl = "http://api-planebox.fredlawl.com/auth/reset";

// create angular controller
PlaneBox.controller('forgotPwController', ['$scope', '$http', function($scope, $http) {
  // function to submit the form after all validation has occurred            
	$scope.remindPassword = function() {
		//test message. remove when finished testing this method
		console.log("sending to server");
		
		var request = $http({
		method 	: 'POST',
		url	 	: apiUrl,
		data : {email : $scope.email}
		}).then(function(response){
					console.log('Success. Email is on its way.');
					window.location.href='/passwordreset.html';
				},
				function(data){
					//show message on error
					//window.alert("Error: "+data.status);
					console.log(data);
				});
    };
}]);