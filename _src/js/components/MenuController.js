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
