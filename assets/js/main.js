(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var storage = require('store');

PlaneBox.service('APIService', ['$http', function($http) {
    var url = 'http://api-planebox.fredlawl.com';

    function makeCall (method, endpoint, data, callback) {
        var request,
            loginToken = storage.get('login-token'),
            config = {
                method: method,
                url: url + endpoint,
                data: data
            };

        if (typeof loginToken !== 'undefined') {
            config.headers = {
                Authorization: 'Bearer ' + loginToken
            }
        }

        request = $http(config).then(function(response){

            if (isFunction(callback))
                callback(response.data);

        }, function(data) {
            console.log('Error occurred making service request.')
        });
    }

    function setupPostObj (settings, obj) {
        //return $.extend({}, settings, data);
        return obj;
    }

    function isFunction (func) {
        return (typeof func !== 'undefined' && typeof func === 'function');
    }

     this.sendPictureStatistics = function (data, callback) {
         var settings = {
                 category: '',
                 picture: '',
                 won: 0
             },
             postObj = setupPostObj(settings, data);

         makeCall('POST', '/data/picture', postObj, function (response) {
             if (isFunction(callback))
                 callback();
         });
    };

    this.sendStatistics = function (data, callback) {
        var settings = {
                level: '',
                clicks:'',
                won: 0,
                time_taken: 0,
                category: ''
            },
            endpoint = '/data/' + storage.get('session-token'),
            postObj = setupPostObj(settings, data);

        makeCall('PUT', endpoint, postObj, function (response) {
            if (isFunction(callback))
                callback();
        });
    };

    this.createSession = function (data, callback) {
        var settings = {
            city: '',
            state: '',
            zip: '',
            country: '',
            difficulty: ''
        },
        postObj = setupPostObj(settings, data);

        makeCall('POST', '/data', postObj, function (response) {
            storage.set('session-token', response.session);

            if (isFunction(callback))
                callback();
        });
    };

}]);

},{"store":19}],2:[function(require,module,exports){

PlaneBox.controller('GameController', function($scope, $timeout, createGrid, menuService, APIService) {
	//scope variables created on page open
	$scope.size = menuService.getGridSize();
	createGrid.setRows($scope.size);
	createGrid.setColumns($scope.size);
	$scope.rows = createGrid.rows;
	$scope.columns = createGrid.columns;
	$scope.tileWidth = createGrid.getTileWidth();
	$scope.tileHeight = createGrid.getTileHeight();
	$scope.secondsTimer = 0;
	$scope.category = menuService.getCategory();
	$scope.levelNo = 1;
	$scope.winMsg = "";
	$scope.timeMsg = "";
	$scope.winCountMsg = "";
	$scope.loseCountMsg = "";
	$scope.completeMsg = "";
	$scope.guessCount = 0;

	//variables tied to the actual game
	var timeLimit = $scope.rows*$scope.columns-1; //timeLimit = 5 * (Number of tiles)
    var prevMainImg = "initialValue"; //What the last main image was. Used to prevent same image from being used twice in a row. Setting it to an arbitrary string to make first comparison easier.
    var popup = document.getElementById("popup");
    var btnNextLevel = document.getElementById("btnNextLevel");
    var btnComplete = document.getElementById("btnComplete");
    var totalTime = 0;
    var winCount = 0;
    var loseCount = 0;
    var imageNumber = 0;


	//this function contains EVERYTHING that's necessary for loading the game. It it need to be done at the beginning of each level, put it here.
	function buildGameControls(){
		$scope.gameRunning = false;
		buildGuessList($scope.category);//method call builds the guess list displayed at bottom of page.
	}
	$scope.createTile = function(xIndex, yIndex) {
		var id = createGrid.addTile(xIndex, yIndex);
		return id;
	}
	
	buildGameControls();//call this method to load the controls on the inital load.{putting this in $scope.startGame() had an undesirable outcome. Wonky and slow.
	
	$scope.range = function(num) {
		//creates an array of a set length for ng-repeat
		return new Array(num);
	}
	//each image in the guess list will call this function when clicked. 
	$scope.guess = function (fileName){
		$scope.guessCount += 1;
		if ($scope.gameRunning == true) {
			if ($scope.mainImg == fileName){
				//window.alert('match');//replace this by putting the 'match' icon over image
				endLevel("SUCCEED");
			}
			else{
				//window.alert('try again');//replace this by putting the 'x' icon over image
			}
		}
	}
	
	function setMainImage(imgCategory, imgArray){
		//set the main image to be a random image from imgArray
		do{
			randIndex = Math.floor(Math.random() * 8);//choose a random index between 0 and 7
		}while(prevMainImg == imgArray[randIndex]);// do while loop will prevent 1 image from being used twice in a row.
		$scope.mainImg = imgCategory+"/"+imgCategory+imgArray[randIndex]+".jpg";//build the image url
        imageNumber = imgArray[randIndex];
		prevMainImg = imgArray[randIndex];
	}
	
	$scope.removeRandomTile = function() {
		//Works when the createTile function only runs once upon creation
		var tileID = createGrid.getRandomTile();
		document.getElementById(tileID).style.visibility = "hidden";
		createGrid.removeTileFromArray(tileID);
	}
		
	//in case of shuffling, run method!
	function shuffle(array){
		var currIndex = array.length, tempVal, randInt;
		
		//while an element has not been shuffled... umm, shuffle it!
		while(0!==currIndex){
			randInt = Math.floor(Math.random() * currIndex);
			currIndex -= 1;
			//swap the indexes
			tempVal = array[currIndex];
			array[currIndex] = array[randInt];
			array[randInt] = tempVal;
		}
	}

	function formatTime(timeSec){
		var mins=0;
		var secs=0;
		if(timeSec>60){
			mins = Math.floor(timeSec/60);
			secs = timeSec%60;
		}
		else{
			secs = timeSec;
		}
		if(secs < 10){
			return (mins+":0"+secs)
		}
		else{
			return (mins+":"+secs)
		}
	}

	//function for what happens when a level ends.
	function endLevel(winCondition){
        var postObj,
            pictureObj;

		$timeout.cancel(secondTimeout);
		$timeout.cancel(outOfTime);
		$timeout.cancel(timer);
		$scope.gameRunning = false;

        //display level details.
        $scope.timeMsg = formatTime($scope.secondsTimer);
        popup.style.visibility = "visible";
        //store and reset timer variable
        btnNextLevel.style.visibility = "visible";
        totalTime += $scope.secondsTimer;

        postObj = {
            level: $scope.levelNo,
            clicks: $scope.guessCount,
            won: 0,
            time_taken: $scope.secondsTimer,
            category: $scope.category
        };

        pictureObj = {
            picture:  imageNumber,
            category: $scope.category,
            won: 0
        };
		//do the following if user guessed correctly.
		if (winCondition == "SUCCEED"){
			$scope.winMsg = "Congratulations!";
			winCount += 1;

            postObj.won = 1;
            pictureObj.won = 1;
            APIService.sendStatistics(postObj);
            APIService.sendPictureStatistics(pictureObj);
		}
		//do the following if user ran out of time.
		else{
			$scope.winMsg = "Try again!";
			loseCount += 1;
            APIService.sendStatistics(postObj);
            APIService.sendPictureStatistics(pictureObj);
		}
		//Initialize Timer to 0.
		$scope.secondsTimer = 0;
		//if completed 10 levels show total score and go back to main menu
		if($scope.levelNo >= 10){
			btnNextLevel.style.visibility = "hidden";
			btnComplete.style.visibility = "visible"
			$scope.winMsg = "Level Stats";//displaying the user's score will go here.
			$scope.timeMsg = formatTime(totalTime);
			$scope.winCountMsg = "Wins: "+winCount;
			$scope.loseCountMsg = "Loses: "+loseCount; 
			popup.style.visibility = "visible";
		}
		//increment level count and rebuild level
		$scope.levelNo += 1;
		//reset the game controls
		buildGameControls();
		rebuildTileIDArray();
		resetTiles();
		//setTimeout($scope.startGame, 5000);

	}
	
	function rebuildTileIDArray() {
		for (var x = 0; x < $scope.columns; x++) {
			for (var y = 0; y < $scope.rows; y++) {
				$scope.createTile(x, y);
			}
		}
	};
	
	function buildGuessList(category){
		//Temp test code
		var imgList = ["1","2","3","4","5","6","7","9","10"];
		shuffle(imgList);
		$scope.img1= category+"/"+category+imgList[0]+".jpg";
		$scope.img2= category+"/"+category+imgList[1]+".jpg";
		$scope.img3= category+"/"+category+imgList[2]+".jpg";
		$scope.img4= category+"/"+category+imgList[3]+".jpg";
		$scope.img5= category+"/"+category+imgList[4]+".jpg";
		$scope.img6= category+"/"+category+imgList[5]+".jpg";
		$scope.img7= category+"/"+category+imgList[6]+".jpg";
		$scope.img8= category+"/"+category+imgList[7]+".jpg";
		setMainImage(category, imgList);
    }

	//set all the tiles (that cover main image) to visible
	function resetTiles(){
		var tiles = document.getElementsByClassName("tile");
		for (tileCount = 0; tileCount < tiles.length; tileCount ++){
			tiles[tileCount].style.visibility = "visible";
		}
	}

    $scope.startGame = function () {
		if ($scope.gameRunning == false) {
			$scope.gameRunning = true;
			$timeout($scope.timer(),1000);
			$scope.onTimeout();
			outOfTime = $timeout($scope.outOfTime, timeLimit*5000+1000);
		}
    }
	
	//   var secondTimeout = $timeout($scope.onTimeout,1000); //this line is not needed. Game functions fine without it.
    $scope.timer = function(){
    	$scope.secondsTimer++;
    	timer = $timeout($scope.timer,1000);
    }

    $scope.onTimeout = function(){
        $scope.removeRandomTile();
        secondTimeout = $timeout($scope.onTimeout,5000);
    }
	//sends "FAIL" to the end level funciton when out of time.
	$scope.outOfTime = function(){
		endLevel("FAIL");
	}
	//hide the popup and statistics messages.
	$scope.hidePopUp = function(){
		popup.style.visibility = "hidden";
		btnNextLevel.style.visibility = "hidden";
		//reset guess count
		$scope.guessCount = 0;
		//start new level.
		setTimeout($scope.startGame, 5000);
	}
	//this is the call that starts the game when the page is first loaded
	setTimeout($scope.startGame, 5000);
})

},{}],3:[function(require,module,exports){
//This module controls the game's difficulty and category select menu

PlaneBox.controller('MenuController', function ($scope, menuService, APIService) {
    saveToSessionStorage(); //runs first to store something for getDifficulty to read
    $scope.difficulty = menuService.getDifficulty();
    $scope.category = menuService.getCategory();
    
    $scope.changeDifficulty = function(diff) {
        menuService.setDifficulty(diff);
        $scope.difficulty = diff;
    }
    $scope.changeCategory = function(cat) {
        menuService.setCategory(cat);
        $scope.category = cat;
    }

    $scope.startGame = function () {
        var geo = window.data.geoData,
            obj = {
                city: geo.address.city,
                state: geo.address.region,
                zip: geo.address.postalCode,
                country: geo.address.country,
                difficulty: menuService.getDifficultyAsNumber(),
                category: $scope.category
            };

        APIService.createSession(obj, function () {
            window.location = 'main-game.html';
        });
    };

});


//This service stores the settings chosen at the start of the game and passes them to the main game
PlaneBox.service('menuService', function($window) {
    var KEY = 'App.SelectedValue';
    var settings = {
        Difficulty: 'easy',
        Category: 'city',
        Size: 3
    };
    saveToSessionStorage = function() {
        $window.sessionStorage.setItem(KEY, JSON.stringify(settings));
    };
    setDifficulty = function(newDifficulty) {
        settings.Difficulty = newDifficulty;
        setGridSize(); //Grid size changes only when difficulty is changed
        saveToSessionStorage();
    };
    setCategory = function(newCategory) {
        settings.Category = newCategory;
        saveToSessionStorage();
    };
    setGridSize = function() {
        if (settings.Difficulty == 'easy') {
            settings.Size = 3;
        };
        if (settings.Difficulty == 'medium') {
            settings.Size = 4;
        };
        if (settings.Difficulty == 'hard') {
            settings.Size = 5;
        };
    };
    
    getDifficulty = function() {
        var loadedSettings = loadFromSessionStorage();
        settings.Difficulty = loadedSettings.Difficulty;
        return settings.Difficulty;
    };

    getDifficultyAsNumber = function() {
        var loadedSettings = loadFromSessionStorage(),
            diff = 0;
        settings.Difficulty = loadedSettings.Difficulty;

        if (settings.Difficulty == 'medium') {
            diff = 1;
        } else if (settings.Difficulty == 'hard') {
            diff = 2;
        }

        return diff;
    };

    getCategory = function() {
        var loadedSettings = loadFromSessionStorage();
        settings.Category = loadedSettings.Category;
        return settings.Category;
    };
    getGridSize = function() {
        var loadedSettings = loadFromSessionStorage();
        settings.Size = loadedSettings.Size;
        return settings.Size;
    };
    loadFromSessionStorage = function() {
        return JSON.parse($window.sessionStorage.getItem(KEY));
    };
    
    return {
        setDifficulty: setDifficulty,
        setCategory: setCategory,
        setGridSize: setGridSize,
        getDifficulty: getDifficulty,
        getCategory: getCategory,
        getGridSize: getGridSize,
        getDifficultyAsNumber: getDifficultyAsNumber
    };
});

},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){

PlaneBox.service('createGrid', function() {
    this.rows = 0;
    this.columns = 0;
    this.imageHeightWidth = 480;
    this.tiles = [];
    
    this.setRows = function(num) {
        this.rows = num;
    };
    this.setColumns = function(num) {
        this.columns = num;
    };
    this.getTileWidth = function() {
        return (this.imageHeightWidth / this.columns);
    };
    this.getTileHeight = function() {
        return (this.imageHeightWidth / this.rows);
    }
    this.addTile = function(xIndex, yIndex) {
        var tileID = xIndex+"."+yIndex;
        if (this.tiles.indexOf(tileID) == -1) {
            this.tiles.push(tileID);
            return this.tiles[this.tiles.length-1];
        }
        else {
            return tileID;
        }
    };
    this.getRandomTile = function() {
        var randomInt = Math.floor(Math.random() * this.tiles.length);
        return this.tiles[randomInt];
    };
    this.removeTileFromArray = function(tileID) {
        this.tiles.splice(this.tiles.indexOf(tileID), 1);
    }
    
});
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
//Login variables
var apiLoginUrl = "http://api-planebox.fredlawl.com/auth/login";
var msgSuccess = "You are now logged in.";
var msgFail = "Username and password combination is not valid.";
var storage = require('store');

// create angular controller
PlaneBox.controller('loginController', ['$scope', '$http', function($scope, $http) {
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

},{"store":19}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
/**
 * waitFor
 * @param  {String}   selector DOM element to check for on every page load
 * @param  {Function} callback The code to execute when the element is on the page
 * @return {Boolean}
 */
module.exports = function(selector, callback) {
  if (document.querySelectorAll(selector).length > 0) {
    callback();
  } else {
    return false;
  }
};
},{}],10:[function(require,module,exports){
var store = require('store');

module.exports = (function () {

    var callbacks = [];

    function init () {
        var geo = store.get('geoData');
        if ( window.data.geoData.length == 0 && geo == null) {

            geolocator.locate(function (location) {
                window.data.geoData = location;
                store.set('geoData', window.data.geoData);
                runCallbacks();
            }, function (error) {
                // console.log(error);
            }, true);

        } else {
            window.data.geoData = geo;
            runCallbacks();
        }
    }

    function runCallbacks () {
        if (callbacks.length > 0)
            return;

        for (var i = 0; i < callbacks.length; i++) {
            var call = callbacks[i];
            call(window.data.geoData);
        }
    }

    init();

    return {
        attachCallback: function (func) {
            if ($.isFunction(func)) {
                callbacks.push(func);
                return true;
            }

            return false;
        }
    }

})();

},{"store":19}],11:[function(require,module,exports){
var waitFor = require('waitFor');
var sassqwatch = require('sassqwatch');

waitFor('.sassqwatch', function() {
  // make those images responsive
  sassqwatch.responsiveImages(); 
});
},{"sassqwatch":18,"waitFor":9}],12:[function(require,module,exports){
/**
 * Returns an element object from an element identifier
 * @param  {String} el An element identifier – Must be a class or ID reference
 * @return {Element}   The element object reference
 */
module.exports = function(el) {
  if (typeof el === 'string') {
    var identifier = el.slice(0, 1),
      string = el.slice(1, el.length);

    if (identifier == '.') {
      return document.getElementsByClassName(string);
    } else if (identifier == '#') {
      return document.getElementsById(string);
    }
  } else {
    return el;
  }
};
},{}],13:[function(require,module,exports){
/**
 * Returns a new merged object from two objects
 * @param  {Object} obj1 The object to extend
 * @param  {Object} obj2 The object to merge into the original
 * @return {Object}      The merged object
 */
module.exports = function(obj1, obj2) {
  for(key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}
},{}],14:[function(require,module,exports){
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}
},{}],15:[function(require,module,exports){
/**
 * Returns the data attribute labels and values from a given element
 * @param  {Element} $el The element to get the data
 * @return {Object}      The data attributes
 */
module.exports = function($el) {
  if ($el.hasAttributes()) {
    var i = 0,
      data = {},
      mqName = '',
      attr;
    
    for(i; i < $el.attributes.length; i++) {
      attr = $el.attributes[i];
      
      if (attr.name.indexOf('data-') != -1) {
        mqName = attr.name.slice(5);
        data[mqName] = attr.value;
      }
    }
    
    return data;
  }
}
},{}],16:[function(require,module,exports){
/**
 * Preload an image and call a function onload
 * @param  {String}   src      The source url to preload
 * @param  {Object}   obj      An object to pass through for reference in the callback
 * @param  {Function} callback The function to call when the image is done loading
 */
var preloader = function(src, obj, callback) {
  var
    loaded = false,
    img = new Image();

  var loadHandler = function() {
    if (loaded) {
      return;
    }
    loaded = true;
    callback(src, obj);
    img = null;
  };

  img.addEventListener('load', loadHandler);
  img.src = src;
  if (img.complete) {
    loadHandler();
  }
};

module.exports = preloader;
},{}],17:[function(require,module,exports){
/**
 * Module to automatically swap image src's across css @media breakpoints
 * @param  {Object} options Options for module
 * @return {Object}         The SassQwatch object, for method chaining
 */
module.exports = function(options) {

  // Dependencies
  var
    sassqwatch      = require('./sassqwatch'),
    elementify      = require('./elementify'),
    preloader       = require('./preloader'),
    extend          = require('./extend'),
    getData         = require('./getData');

  // Module Variables
  var
    defaultSelector = elementify('.sassqwatch'),
    settings = extend({ selector: defaultSelector }, options),
    knownSizes = [],
    retina = (window.devicePixelRatio >= 1.5) ? true : false,
    i = 0;

  /**
   * Stores the image sources attached to each responsive image, making each check on mq change more effecient
   * @param  {Element} $image The element to receive the image sizes from
   */
  var storeSizes = function($image) {
    var
      src = getSource($image),
      sizes = {
        $image: $image,
        loaded: [],
        originalSrc: src,
        activeSrc: src
      };

    // merge the pre-existing sizes object with the object of image size urls
    sizes = extend(sizes, getData($image));
    // add the original src as a loaded src
    sizes.loaded.push(sizes.originalSrc);
    // add the sizes for this image to the known sizes
    knownSizes.push(sizes);
  };

  /**
   * Returns the source url on an element
   * @param  {Element} $el The element to get the source from
   * @return {String}      The source URL
   */
  var getSource = function ($el) {
    var src = '';
    // check if this the element is an img with a src
    // or is another element with a background image
    if ($el.tagName == 'IMG') {
      src = $el.getAttribute('src');
    } else {
      // get the computed style of the element
      src = getComputedStyle($el).getPropertyValue('background-image');
      // get the html css collection if getComputedStyle doesn't work
      src = src ? src : $el.style.backgroundImage;
      // remove the 'url()'
      src = src.replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'');
    }

    return src;
  };

  /**
   * Swap out either an <img>s source or the background image of an element.
   * @param  {Element} $el         The element that needs its source swapped
   * @param  {String}  newImageSrc The new src to show
   */
  var swapImage = function($el, newImageSrc) {
    if ($el.tagName === 'IMG') {
      $el.setAttribute('src', newImageSrc);
    } else {
      $el.style.backgroundImage = 'url(' + newImageSrc + ')';
    }
  };

  /**
   * Checks to see if there is a retina src provided on an image
   * @param  {object} imageObject An object in the array of known image sizes
   * @param  {string} mediaQuery  The name of the media query to check against
   * @return {string}             The image src
   */
  var checkForRetinaSrc = function(imageObject, mediaQuery) {
    // if this is a retina screen and there is a retina src
    if (retina && imageObject[mediaQuery + '-2x']) {
      return imageObject[mediaQuery + '-2x'];
    } else {
      return imageObject[mediaQuery];
    }
  };

  /**
   * Run through each responsive image and see if an image exists at that media query
   */
  var updateImages = function() {
    var
      newMediaQuery = sassqwatch.fetchMediaQuery(),
      isLoaded      = false,
      thisMQ        = undefined,
      thisImage     = undefined,
      newSource     = undefined,
      i             = 0,
      ii            = 0;

    // Loop over each known size
    // and update the image src if it has one for this breakpoint
    for(i; i < knownSizes.length; i++) {
      thisImage = knownSizes[i];
      // checks if we're on a retina screen and if there is a 2x src defined
      newSource = checkForRetinaSrc(thisImage, newMediaQuery);

      // if a new source isn't set
      if (!newSource) {
        // get the index of the current media query to start from
        ii = sassqwatch.fetchMqIndex(newMediaQuery);

        // decrement through the numbered mq's
        for (ii; ii > 0; ii--) {
          thisMQ = sassqwatch.fetchMqName(ii);
          newSource = checkForRetinaSrc(thisImage, thisMQ);

          // break the loop if a source is found
          if (newSource) break;
        }
        // if after all that no source was found
        // then just revert back to the original source
        newSource = newSource ? newSource : thisImage.originalSrc;
      }

      // if the new source is not the active source
      if (newSource.indexOf(thisImage.activeSrc) === -1) {
        ii = 0;

        // loop over all loaded src's for this image
        // and see if the new source has been loaded
        for(ii; ii < thisImage.loaded.length; ii++) {
          if (thisImage.loaded[ii].indexOf(newSource) != -1) {
            isLoaded = true;
            break;
          }
        };

        // if the new source has been loaded
        if (isLoaded) {
          swapImage(thisImage.$image, newSource);
        } else {
          // preload the image to swap
          // and update the list of loaded src's
          preloader(newSource, thisImage, function(src, obj) {
            swapImage(obj.$image, src);
            obj.loaded.push(src);
          });
        }

        // update the active src
        thisImage.activeSrc = newSource;
      }
    };
  };

  // if a custom 'el' has been passed in
  // make sure that it is actually a jquery element
  // before initializing the module
  if (settings.selector !== defaultSelector) {
    settings.selector = elementify(settings.selector);
  }

  // Loop through each element and store its original source
  for(i; i < settings.selector.length; i++) {
    storeSizes(settings.selector[i]);
  }

  updateImages();

  // Listen for media query changes
  sassqwatch.onChange(updateImages);

  return sassqwatch;
};
},{"./elementify":12,"./extend":13,"./getData":15,"./preloader":16,"./sassqwatch":18}],18:[function(require,module,exports){
// Polyfills
require('./forEach');

// Elements
var
  $body              = document.getElementsByTagName('body')[0],
  $orderElement      = document.getElementsByTagName('title')[0],
  $listenElement     = document.getElementsByTagName('head')[0];

// Module variables
var
  currentMediaQuery  = '',
  lastMediaQuery     = '',
  mqOrderNamed       = {},
  mqOrderNumbered    = [],
  callbackQueue      = [];

/**
 * Internal: Creates a queue of functions to call when the media query changes. 
 * @param  {String}  currentMediaQuery The current media query.
 * @param  {String}  lastMediaQuery    The previous media query.
 */
var hasChanged = function(currentMediaQuery, lastMediaQuery) {
  var i = 0;
  for(i; i < callbackQueue.length; i++) {
    callbackQueue[i].call(this, currentMediaQuery, lastMediaQuery);
  }
};

/**
 * Internal: When the browser is resized, update the media query
 */
var onResize = function() {
  lastMediaQuery = currentMediaQuery;

  // Set the global current media query
  currentMediaQuery = fetchMediaQuery();

  // The media query does not match the old
  if (currentMediaQuery != lastMediaQuery) {
    // Fire an event noting that the media query has changed
    hasChanged(currentMediaQuery, lastMediaQuery);
  }
};

/**
 * Internal: Sets the order of media queries
 */
var setOrder = function() {
  var mediaQueries = getComputedStyle($orderElement).getPropertyValue('font-family');
  mqOrderNumbered = mediaQueries.replace(/['"\s]/g, "").split(',');

  mqOrderNumbered.forEach(function(value, index) {
    mqOrderNamed[value] = index;
  });
};

/**
 * Public: Event fires when the media query changes
 * @param  {Function} callback The function to call when the media query changes
 * @return {Object}            The SassQwatch object
 */
var onChange = function(callback) {
  callbackQueue.push(callback);
  return this;
};

/**
 * Internal: Returns the correct query method (isAbove, isBelow, or matches) given a string
 * @param  {String} type 'min', 'max', or 'only'
 * @return {Function}    The method.
 */
var getQueryMethod = function(type) {
  type = type.toLowerCase();

  if (type === 'min') {
    return isAbove;
  } else if (type === 'max') {
    return isBelow;
  } else if (type === 'only') {
    return matches;
  } else {
    return function() {
      return false;
    }
  }
};

/**
 * Public: A CSS-like query function to check against a min or max breakpoint. For convenience you can also query on a specific breakpoint.
 * @param  {String}   type     "min", "max", or "only"
 * @param  {String}   which    The name of the media query to check against
 * @param  {Function} callback The callback function
 * @return {Object}            The SassQwatch object
 */
var query = function(type, which, callback, fireOnce) {
  var
    firedCount = 0,
    method = getQueryMethod(type),
    check = function(newMediaQuery, oldMediaQuery) {
      if (method(which)) {
        // Prevent the callback from firing again
        // if the condition was previously true
        if (!!fireOnce && firedCount > 0) {
          return false;
        }
        callback(newMediaQuery, oldMediaQuery);
        firedCount++;
      } else {
        firedCount = 0;
        return false;
      }
    };

  check(currentMediaQuery, lastMediaQuery);
  onChange(check);

  return this;
};

/**
 * Public: A convenience function to call query with a 'min' value
 * @param  {String}   which    The name of the media query to check against
 * @param  {Function} callback The callback function
 * @return {Object}            The SassQwatch object
 */
var min = function(which, callback, fireOnce) {
  query('min', which, callback, fireOnce);
  return this;
};

/**
 * Public: A convenience function to call query with a 'max' value
 * @param  {String}   which    The name of the media query to check against
 * @param  {Function} callback The callback function
 * @return {Object}            The SassQwatch object
 */
var max = function(which, callback, fireOnce) {
  query('max', which, callback, fireOnce);
  return this;
};

/**
 * Public: A convenience function to call query with a 'only' value
 * @param  {String}   which    The name of the media query to check against
 * @param  {Function} callback The callback function
 * @return {Object}            The SassQwatch object
 */
var only = function(which, callback) {
  query('only', which, callback);
  return this;
};

/**
 * Public: Checks if the current media query is greater than or equal to the specified breakpoint
 * @param  {String}  which The name of the media query to check against
 * @return {Boolean}       Is the current media query greater than or equal to the specified breakpoint?
 */
var isAbove = function (which) {
  var currentMq = mqOrderNamed[fetchMediaQuery()],
    whichMq = mqOrderNamed[which];

  return (currentMq >= whichMq);
};

/**
 * Public: Checks if the current media query is less than the specified breakpoint
 * @param  {String}  which The name of the media query to check against
 * @return {Boolean}       Is the current media query less than the specified breakpoint?
 */
var isBelow = function (which) {
  var currentMq = mqOrderNamed[fetchMediaQuery()],
    whichMq = mqOrderNamed[which];

  return (currentMq < whichMq);
};

/**
 * Public: Checks if the current media query is the same as the the specified breakpoint
 * @param  {String}  which The name of the media query to check against
 * @return {Boolean}       Is the current media query the same as the specified breakpoint?
 */
var matches = function(which) {
  // See if the current media query matches the requested one
  return (fetchMediaQuery() == which);
};

/**
 * Public: Manually returns the current media query
 */
var fetchMediaQuery = function() {
  // We read in the media query name from the html element's font family
  var mq = getComputedStyle($listenElement).getPropertyValue('font-family');

  // Strip out quotes and commas
  mq = mq.replace(/['",]/g, '');

  return mq;
};

/**
 * Public: Fetch the index of a named breakpoint
 * @param  {String} mediaQuery The name of the media query
 * @return {Number}            The index of the media query in the array of ordered media queries
 */
var fetchMqIndex = function(mediaQuery) {
  return mqOrderNamed[mediaQuery];
};

/**
 * Public: Fetch the name of breakpoint by its index
 * @param  {Number} index The index of the media query in the ordered array of media queries
 * @return {String}       The name of the media query
 */
var fetchMqName = function(index) {
  return mqOrderNumbered[index];
};

/**
 * Public: Responsive Images module
 */
var responsiveImages = require('./responsiveImages');

/**
 * Internal: Immediately invoked constructor function
 * Sets everything up and then returns all the public methods.
 */
var constructor = function() {
  // set the order of the breakpoints
  setOrder();

  // fetch the current media query
  currentMediaQuery = fetchMediaQuery();

  window.onresize = onResize;

  // return the public methods
  return {
    responsiveImages:   responsiveImages,
    fetchMediaQuery:    fetchMediaQuery,
    fetchMqIndex:       fetchMqIndex,
    fetchMqName:        fetchMqName,
    onChange:           onChange,
    isAbove:            isAbove,
    isBelow:            isBelow,
    matches:            matches,
    query:              query,
    only:               only,
    min:                min,
    max:                max
  };
}.call();

module.exports = constructor;
},{"./forEach":14,"./responsiveImages":17}],19:[function(require,module,exports){
;(function(win){
	var store = {},
		doc = win.document,
		localStorageName = 'localStorage',
		scriptTag = 'script',
		storage

	store.disabled = false
	store.version = '1.3.17'
	store.set = function(key, value) {}
	store.get = function(key, defaultVal) {}
	store.has = function(key) { return store.get(key) !== undefined }
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (defaultVal == null) {
			defaultVal = {}
		}
		var val = store.get(key, defaultVal)
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {}
	store.forEach = function() {}

	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key, defaultVal) {
			var val = store.deserialize(storage.getItem(key))
			return (val === undefined ? defaultVal : val)
		}
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.getAll = function() {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = function(callback) {
			for (var i=0; i<storage.length; i++) {
				var key = storage.key(i)
				callback(key, store.get(key))
			}
		}
	} else if (doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<'+scriptTag+'>document.w=window</'+scriptTag+'><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		var withIEStorage = function(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys cannot start with a digit or contain certain chars.
		// See https://github.com/marcuswestin/store.js/issues/40
		// See https://github.com/marcuswestin/store.js/issues/83
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		function ieKeyFix(key) {
			return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key, defaultVal) {
			key = ieKeyFix(key)
			var val = store.deserialize(storage.getAttribute(key))
			return (val === undefined ? defaultVal : val)
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=0, attr; attr=attributes[i]; i++) {
				storage.removeAttribute(attr.name)
			}
			storage.save(localStorageName)
		})
		store.getAll = function(storage) {
			var ret = {}
			store.forEach(function(key, val) {
				ret[key] = val
			})
			return ret
		}
		store.forEach = withIEStorage(function(storage, callback) {
			var attributes = storage.XMLDocument.documentElement.attributes
			for (var i=0, attr; attr=attributes[i]; ++i) {
				callback(attr.name, store.deserialize(storage.getAttribute(attr.name)))
			}
		})
	}

	try {
		var testKey = '__storejs__'
		store.set(testKey, testKey)
		if (store.get(testKey) != testKey) { store.disabled = true }
		store.remove(testKey)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled

	if (typeof module != 'undefined' && module.exports && this.module !== module) { module.exports = store }
	else if (typeof define === 'function' && define.amd) { define(store) }
	else { win.store = store }

})(Function('return this')());

},{}]},{},[11,10,1,8,2,5,7,3,6,4]);
