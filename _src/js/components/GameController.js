
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
