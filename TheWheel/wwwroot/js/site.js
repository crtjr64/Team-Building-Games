// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
var dbContext = window.dbContext || {};
var dbGameData = window.dbGameData || {};
var ajaxLib = window.ajaxLib || {};


ajaxLib = (function () {

    function getOptions(url) {
        this.url = "";
        this.type = "GET";
        this.dataType = "json";
    };

    var getFetchOpts = {
        method: "GET",
        cache: "default",
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var postOptions = {
        url: "",
        type: "POST",
        dataType: "json",
        data: {},
        contentType: "application/json"
    };

    function postToAjxServer(options) {
        var opts = $.extend({}, postOptions, options);
        AjaxToServer(opts);
    }

    function getFromAjxServer(url) {
        var opts = new getOptions(url);
        AjaxToServer(opts);
    }

    //********Ajax**************
    function AjaxToServer(options) {

        $.ajax(options).done(function (data) {
            if (data.ErrorNumber === undefined || data.ErrorNumber === 0) {
                //ajaxCallback(data);
            }
            else {
                console.log(data.ErrorMessage);
            }
        });

        return false;
    }

    function AjaxToServerPromise(options) {
        return new Promise(function (resolve, reject) {
            $.ajax(options).done(function (data) {
                if (data.ErrorNumber === undefined) {
                    resolve(true);
                }
                else {
                    processAjaxErrors(data.ErrorMessage);
                    resolve(false);
                }
            });
        });
    }

    var processAjaxErrors = function AjaxErrors(jqXHR, textStatus, errorThrown) {
        //alert(textStatus);

        errorHandler.storeError(jqXHR);

    };

    var fetchData = function FetchData(url) {

        const req = new Request(url, getFetchOpts);

        return fetch(req).then(function (data) {
            return data.json();
        });
    }

    var fetchHtml = function FetchHtml(reqObj) {
        return fetch(reqObj).then(function (data) {
            return data.text();
        });
    }

    ///Library of Ajax methods
    var fetchPlayers = function FetchPlayers(url) {

        url = url || "/Home/GetPlayers";
        return fetchData(url).then((data) => {

            return data;
        });
    }

    var getPlayers = function GetPlayers() {
        getFromAjxServer("/Home/GetPlayers");
    }

    ajaxLibApi = {
        AjaxToServer: AjaxToServer,
        getFromAjxServer: getFromAjxServer,
        AjaxToServerPromise: AjaxToServerPromise,
        postToAjxServer: postToAjxServer,
        processAjaxErrors: processAjaxErrors,
        fetchData: fetchData,
        fetchHtml: fetchHtml,
        fetchPlayers: fetchPlayers,
        getPlayers: getPlayers
    };

    return ajaxLibApi;
})();

dbGameData = (function () {

    //function CurrentUser(user) {

    //    this.userId = user.userId;
    //    this.userName = user.name;
    //    this.onATeam = false;

    //};

    //function wofActions(action, paramsObjAry) {
    //    this.action = action;
    //    this.params = paramsObj;
    //}

    //function paramsObj(name, val) {
    //    this.paramName = name;
    //    this.paramVal = val;
    //}

    //let appActions = [];

    //appActions.push("hidewheel", "loadPuzzle",);

    var gameData = {
        "puzzles": [
            { "id":0, "selected":false, "category": "80's Slogan", "answer": "Hands Across America", "lines": 3 },
            { "id":1, "selected":false, "category": "David Miller's roots", "answer": "Anchorage", "lines":1 },
            { "id": 2, "selected": false, "category": "Student Life", "answer": "Falling Asleep In The Library", "lines": 3  },
            { "id": 3, "selected": false, "category": "Hometown Campaign", "answer": "The city that reads", "lines": 2  },
            { "id": 4, "selected": false, "category": "Hometown Campaign", "answer": "Believe", "lines": 1 },
            { "id": 5, "selected": false, "category": "Workplace Slogan", "answer": "SPIRIT of the FPI Way", "lines": 3 },
            { "id": 6, "selected": false, "category": "80's Toy Craze", "answer": "Cabbage Patch Kids", "lines": 2 },
            { "id": 7, "selected": false, "category": "80's Toy Craze", "answer": "Rubik's Cube", "lines": 1 },
            { "id": 8, "selected": false, "category": "90's Movie Quote", "answer": "Keep The Change Ya Filthy Animal", "lines": 3 },
            { "id": 9, "selected": false, "category": "70's Movie Quote", "answer": "You're Going to need a bigger boat", "lines": 3 },
            { "id": 10, "selected": false, "category": "Before & After", "answer": "Brooks Robinson Crusoe", "lines": 3 },
            { "id": 11, "selected": false, "category": "Before & After", "answer": "Inner Harbor East", "lines": 3 },
            { "id": 12, "selected": false, "category": "Before & After", "answer": "Adam Jones Falls", "lines": 3 },
            { "id": 13, "selected": false, "category": "Born in Baltimore", "answer": "Michael Phelps", "lines": 2 },
            { "id": 14, "selected": false, "category": "Born in Baltimore", "answer": "Thurgood Marshall", "lines": 2 },
            { "id": 15, "selected": false, "category": "Born in Baltimore", "answer": "Tom Clancy", "lines": 2 },
            { "id": 16, "selected": false, "category": "Born in Baltimore", "answer": "Emily Post", "lines": 2 },
            { "id": 17, "selected": false, "category": "Born in Baltimore", "answer": "Lance Reddick", "lines": 2 },
            { "id": 18, "selected": false, "category": "Early IT", "answer": "Mozilla Firefox", "lines": 2 },
            { "id": 19, "selected": false, "category": "Early IT", "answer": "Apple Macintosh", "lines": 2 },
            { "id": 20, "selected": false, "category": "Early IT", "answer": "Floppy Disk", "lines": 2 },
            { "id": 21, "selected": false, "category": "Early IT", "answer": "Netscape", "lines": 1 },
            { "id": 22, "selected": false, "category": "Early IT", "answer": "Commodore", "lines": 1 },
            { "id": 23, "selected": false, "category": "FPI ITM Bucket List", "answer": "Scuba Diving Instructor", "lines": 3 },
            { "id": 24, "selected": false, "category": "FPI ITM Bucket List", "answer": "YouTuber", "lines": 1 },
            { "id": 25, "selected": false, "category": "Style/Fashion History", "answer": "Scrunchies and Leg Warmers", "lines": 3 },
            { "id": 26, "selected": false, "category": "Born In Baltimore", "answer": "Damon Harris", "lines": 1 },
            { "id": 27, "selected": false, "category": "Baltimore's Own", "answer": "Natty Boh", "lines": 1 },
            { "id": 28, "selected": false, "category": "National Landmark", "answer": "Yellowstone National Park", "lines": 3 },
            { "id": 29, "selected": false, "category": "2000's Movie Quote", "answer": "If you ain't first, you're last", "lines": 3 },
            { "id": 30, "selected": false, "category": "Classic TV", "answer": "Charlie's Angels", "lines": 2 },
            { "id": 31, "selected": false, "category": "Star and Role", "answer": "John Travolta As Danny", "lines": 3}
        ],
        "contextRows": [],
        "timed": false,
        "games": 3,
        "maxTeams": 3,
        "teamMembers": 1,
        "teams": [],
        "players": [],
        "adminUser": false,
        "newGame": true,
        "currentPuzzle": {"category": "none", "answer":""},
        "readyToSpin":false,
        "readyToGuess": false,
        "showWheel": false,
        "teamInCreation": "",
        "gameReady": false,
        "whoami": null,
        "teamsDonePlaying": [],
        "message": "",
        "guessedLetters": [],
        "currentGuess":"",
        "amountOnWheel": 0,
        "changePlayer": true,
        "primo": false,
        "winningTeams": [],
        "visibleCards": [],
        "gameBoard":[]
        //"actions": appActions
    }

    var getData = function GetData() {

        return gameData;
    }

    var gameDataApi = {
        getData: getData
    }

    return gameDataApi;

})();

dbContext = (function () {
    var puzzles = [];
    var players = [];
    var teams = [];
    var gamedata = dbGameData.getData();

    function Card(id, row, col, val, trufals) {
        this.guessed = false;
        this.row = row;
        this.col = col;
        this.id = id;
        this.letter = val;
        this.isnotblank = trufals;
        this.isInCurrentPuzzle = false;
    }

    function BoardRow(id, puzzlecards) {
        this.rowid = id;
        this.rowCards = puzzlecards;
    }

    let setupGameBoard = function SetupGameBoard() {

        for (var l = 0; l < 4; l++) {
            let cards = [];
            for (var x = 0; x < 14; x++) {
                let show = ((x > 0 && x < 13) && (l == 0 || l == 3)) || (l === 1) || (l === 2);;
                let id = "card-" + l.toString() + x.toString();

                cards.push(new Card(id, l, x, "", show));
            }
            gamedata.gameBoard.push(new BoardRow(l, cards));
        }
        return gamedata;
    }

   

    //Player Object
    function WOFPlayer(name, isboss, id, admin) {
        this.id = id;
        this.name = name;
        this.boss = isboss;
        this.onATeam = false;
        this.hadATurn = false;
        this.myturn = false;
        this.list = true;
        this.orderpos = 0;
        this.amAdmin = admin || false;
        this.amOnline = false;
    }

    WOFPlayer.prototype.testMethod = function () {
        return "My name is " + this.name;
    };

    function WOFTeam(name, players, id, ordpos) {
        this.name = name;
        this.turnCnt = 0;
        this.currentTeam = false;
        this.hadATurn = false;
        this.gamePrizeAmt = 0;
        this.totalPrizeAmt = 0;
        this.id = id;
        this.players = players;
        this.orderpos = ordpos;
        this.finishPlaying = false;
        this.theWinner = false;
        this.showPlayers = false;
    }

    function Puzzle() {

    }

    var setUpGameTeams = function SetUpGameTeams() {
        //teams.push(new WOFTeam('Problem Solvers'));
        //teams.push(new WOFTeam('FPI Hackers'));
        //teams.push(new WOFTeam('Help Deskers'));

        return teams;
    }


    var getPlayers = function GetPlayers() {
        return ajaxLib.fetchPlayers().then((data) => {                
            return data;
        });
    }

    var setUpGamePlayers = function SetUpGamePlayers() {

        return getPlayers().then((data) => {
            if (data !== null & data.length > 0) {
                players = data;
            } else {

                players.push(new WOFPlayer('Clarence', false, 'clar1'));
                players.push(new WOFPlayer('Lolita', false, 'lol2'));
                players.push(new WOFPlayer('Emmanuel', false, 'emm3'));
                players.push(new WOFPlayer('Sarah', false, 'sar4'));
                players.push(new WOFPlayer('Mike', false, 'mik5'));
                players.push(new WOFPlayer('Colt', false, 'col6'));
                players.push(new WOFPlayer('Josh', false, 'jos7'));
                players.push(new WOFPlayer('Marvin', false, 'mar8'));
                players.push(new WOFPlayer('James', false, 'jam9'));
                players.push(new WOFPlayer('Suzanne', false, 'suz10'));
                players.push(new WOFPlayer('Carlton', false, 'carl11'));
                players.push(new WOFPlayer('George', false, 'geor12'));
                players.push(new WOFPlayer('Anthony', false, 'ant13'));
            }

            return players;
        });
    }



    var gettempplayers = function () {
        players.push(new WOFPlayer('Carl McCullough', false, 'cmccullough@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('George Sessine', false, 'GSessine@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Nancy Silvas ', false, 'nsilvas@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Aimee Schwartz', false, 'aschwartz@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Chris Young', false, 'CYoung@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Ryan Bonomo', false, 'rbonomo@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Adam Elliott', false, 'AwElliott@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Carl Passen', false, 'CPassen@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Ivo Stoyanov', false, 'IStoyanov@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Nick Argirakis', false, 'NickArg', false));
        players.push(new WOFPlayer('Gregg Wavle', false, 'gwavle@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Denisha Fullwood', false, 'DFullwood@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Scott Gruber', false, 'SGruber@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Tia Stokes', false, 'tstokes@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Charles Johnson', false, 'Cjohnson@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Lisa Triplett ', false, 'ltriplett@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Margaret Varndell', false, 'mvarndell@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Rick Wolff', false, 'RickWolff', false));
        players.push(new WOFPlayer('Bill Wolfe', false, 'bwolfe@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Val McMenamin', false, 'vmcmenam@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Betsy Owens', false, 'eowens@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Shannon Pijanowski', false, 'spijanowski@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Arkadiy', false, 'spijanowski@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Shannon Pijanowski', false, 'spijanowski@fpi.umaryland.edu', false));

        players.push(new WOFPlayer('Jake Shearer', false, 'jshearer@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Thomas Song', false, 'tsong@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Paul Wang', false, 'pwang1@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Larry Watkins', false, 'LWatkins@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Bao Nguyen', false, 'BNguyen@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Matt Kramer', false, 'mkramer@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Mike Busler', false, 'mbusler@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Chris Gaskins', false, 'cgaskins@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Tarq Haddad', false, 'thaddad@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Lou Fashina', false, 'AFashina@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Darrell McDonald', false, 'damcdona@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('David Miller', false, 'DMiller@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Romell Moon', false, 'rmoon@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Paul Morris', false, 'PMorris@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Josh Parker', false, 'joparker@fpi.umaryland.edu', false));
        players.push(new WOFPlayer('Brian Watson', false, 'BWatson@fpi.umaryland.edu', false));







        players.push(new WOFPlayer('Emmanuel Dzieketey', false, 'edzieketey@fpi.umaryland.edu', true));
        players.push(new WOFPlayer('Lolita Samuels ', false, 'lsamuels@fpi.umaryland.edu', true));
        players.push(new WOFPlayer('Clarence Tunstall', false, 'ctunstall@fpi.umaryland.edu', true));


        return players;
    }

    var setUpGame = function SetUpGame() {

        gamedata.teams = setUpGameTeams();
        gamedata.players = gettempplayers();
        setupGameBoard();
        return gamedata;
    }

    var dbContextApi = {
        setUpGamePlayers: setUpGamePlayers,
        setUpGame: setUpGame,
        WOFTeam: WOFTeam
    };


    return dbContextApi;

})();