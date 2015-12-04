// profile variables
var apiUrl = "http://api-planebox.fredlawl.com/profile";
var msgSuccess = "User Profile created. You are now logged in."
var msgFail = "Email already in use."

// create angular controller
PlaneBox.controller('mainController', ['$scope', '$http', function($scope, $http) {
  //options for Gender select drop down
	$scope.genderOptions = [{value:0, text:"Female"},{value:1, text:"Male"}];
  	
  // function to submit the form after all validation has occurred            
	$scope.submitForm = function() {
		//test message. remove when finished testing this method
		console.log("sending to server");
		
		var request = $http({
		method 	: 'POST',
		url	 	: apiUrl,
		data : {name : $scope.name,
				email : $scope.email,
				password : $scope.password,
				age : $scope.age,
				gender : $scope.genderSelect,
				occupation : $scope.occupation
				}
		}).then(function(response){
					window.alert(msgSuccess);
					window.location.href='/index.html';
				},
				function(data){
					//this isn't perfect. but it'll do for the demo.
					window.alert("Error "+data.status+': '+ msgFail);
				});
		
		/*.success(function(data, status, headers, config){
			window.alert("Your profile has been created. You are now logged in.");
		}).catch(function(data){
			window.alert("Sorry, an error occurred creating your profile: "+data.Message);
		});
		*/		
    };
}]);
