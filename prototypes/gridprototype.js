	//Global variables
	var sec = 0;
	var msec = 0;
	var time = "";
	var tiles = ["1.1","1.2","1.3","1.4","1.5","2.1","2.2","2.3","2.4","2.5","3.1","3.2","3.3","3.4","3.5","4.1","4.2","4.3","4.4","4.5","5.1","5.2","5.3","5.4","5.5"];

//used for testing stuff... don't question my methods!	
//	function test(){document.getElementById("timer").innerHTML = "test";}

	function timer(){
		document.getElementById("timer").innerHTML = sec;		
		sec = sec + 1;		

		if(sec > 60){
			document.clearTimeout(myVar);
			return;
		}
		
		var myVar = setTimeout(function(){timer()}, 1000);
	}
	
	function revealTile(){
		var randInt = Math.floor(Math.random() * tiles.length); //determine a random index
		document.getElementById(tiles[randInt]).style.visibility = "hidden";
		
		var randSplice = tiles.splice(randInt, 1);	//splice out the random element
		
		if(tiles.length == 0){
			document.clearTimeout(myVar);
			return;
		}
		
		var reveal = setTimeout(function(){revealTile()},2000);
	}
	
	function playDemo(){
		timer();
		revealTile();
		//required to format setInterval this way for Chrome compatibility.
	}