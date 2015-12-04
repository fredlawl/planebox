
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