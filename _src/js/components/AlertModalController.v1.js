var app = angular.module("Demo",["ngAnimate"]);

app.controller(
	"AppController", 
	function($scope, modals){

		$scope.alertSomething = function(){
			var promise = modals.open(
				"alert",
				{
					message: "This is a test of the emergency Plane Box system"
				}
			);
			promise.then(
				function handleResolve(response){
					console.warn("Alert rejected.");
				}
			);
		};

		$scope.confirmSomething = function(){
			var promise = modals.open(
				"confirm",
				{
					message: "Are you sure you want to do this?"
				}
			);
			promise.then(
				function handleResolve(response){
					console.log("Confirm resolved.");
				}
			);
		};

		$scope.promptSomething = function(){
			var promise = modals.open(
				"prompt",
				{
					message: "Who rocks the party the rocks the body?",
					placeholder: "Mc Lyte."
				}
			);
			promise.then(
				function handleResolve(response){
					console.log("Prompt resolved with [%s].", response);
				},
				function handleReject(error){
					console.warn("Prompt rejected!");
				}
			);
		};
	}
);

app.controller(
	"AlertModalController",
	function($scope, modals){
		$scope.message = (modals.params().message ||"Whoah!");

		//pub methods...
		$scope.close = modals.resolve;

		$scope.jumpToConfirm = function(){
			modals.proceedTo(
				"confirm",
				{
					message: "I just came from Alert - did I just freak your mind?",
					confirmButton: "I can't even!",	
					denyButton: "No way!"
				}
			)
			.then(
				funciton handleResolve(){
					console.log("Piped confirm resolved.");
				},
				function handleReject(){

					console.warn("Piped confirm rejected");
				}
			);
		};
	}
);

app.controller(
	"ConfirmModalController",
	function($scope, modals){

		var params = modals.params();

		$scope.message = (params.message || "Are you sure?");
		$scope.confirmButton = (params.message || "Yes");
		$scope.denyButton = (params.denyButton || "Hell No");

		//pub methods
	}
);

app.controller(
	"PromptModalController",
	function($scope, modals){
		$scope.message = (modals.params().message ||"Gimme.");
		$scope.form={
			input: (modals.params().placeholder || "")
		};
		$scope.errorMessage = null;
		$scope.cancel = modals.reject;

		$scope.submit = function(){
			if(!$scope.form.input){
				return($scope.errorMessage = "Please provide your iformation!");
			}
			modals.resolve($scope.form.input);

		};
	}
);

// I manage the modals within the application.
app.service(
    "modals",
    function( $rootScope, $q ) {
        // I represent the currently active modal window instance.
        var modal = {
            deferred: null,
            params: null
	    };
        // Return the public API.
        return({
            open: open,
            params: params,
            proceedTo: proceedTo,
            reject: reject,
            resolve: resolve
        });

        //pub methods

        function open(type, params, pipeResponse){
        	var previousDeff
        }