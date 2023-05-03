
var gamePlay = window.gamePlay || {};

//const ws = new WebSocket("ws://localhost:8082");
var connection = new signalR.HubConnectionBuilder().withUrl("/wofChatHub").configureLogging(signalR.LogLevel.Information).build();

function callGod(msg) {
    gamePlay.messageUsers(msg);
}


function initializeTeams() {

    connection.logging = true;

    connection.start().then(function () {
        console.log("SignalR Connection Started!");
    }).catch(function (err) {
        return console.error(err.toString());
    });

    }

initializeTeams();

gamePlay = (function () {


    let theWheel;
    let teamsCnt = 0;
    let fpiTeams = [];
    let vuevm;

    const GAMEREADY = 0;

    function wofActions(action, paramsObjAry) {
        this.action = action;
        this.params = paramsObjAry;
    }

    function paramsObj(name, val) {
        this.paramName = name;
        this.paramVal = val;
    }


    // Vars used by the code in this page to do power controls.
    let wheelPower = 0;
    let wheelSpinning = false;
    let audio = new Audio('/sound/tick.mp3');
    let loseMoney = new Audio('/sound/bankrupt.wav');
    let lostTurn = new Audio('/sound/LoseTurn.mp3');
    let wrong = new Audio('/sound/WrongAnswer.mp3');

    //function FPIWofTeam(name, id, current) {
    //    this.name = name;
    //    this.turnCnt = 0;
    //    this.currentTeam = current;
    //    this.id = id;
    //}


    function TeamsContext(id, name) {
        this.id = id;
        this.name = name;
    }

    function CurrentWheelPuzzle(puzzle) {
        this.id = puzzle.id;
        this.selected = puzzle.selected;
        this.category = puzzle.category;
        this.answer = puzzle.answer;
        this.lines = puzzle.lines;
    }

    var loadWheel = function LoadWheel() {
        theWheel = new Winwheel({
            'outerRadius': 212,        // Set outer radius so wheel fits inside the background.
            'innerRadius': 75,         // Make wheel hollow so segments don't go all way to center.
            'textFontSize': 24,         // Set default font size for the segments.
            'textOrientation': 'vertical', // Make text vertial so goes down from the outside of wheel.
            'textAlignment': 'outer',    // Align text to outside of wheel.
            'numSegments': 24,         // Specify number of segments.
            'segments':             // Define segments including colour and text.
                [                               // font size and test colour overridden on backrupt segments.
                    { 'fillStyle': '#ee1c24', 'text': '300' },
                    { 'fillStyle': '#3cb878', 'text': '450' },
                    { 'fillStyle': '#f6989d', 'text': '600' },
                    { 'fillStyle': '#00aef0', 'text': '750' },
                    { 'fillStyle': '#f26522', 'text': '500' },
                    { 'fillStyle': '#000000', 'text': 'BANKRUPT', 'textFontSize': 16, 'textFillStyle': '#ffffff' },
                    { 'fillStyle': '#e70697', 'text': '3000' },
                    { 'fillStyle': '#fff200', 'text': '600' },
                    { 'fillStyle': '#f6989d', 'text': '700' },
                    { 'fillStyle': '#ee1c24', 'text': '350' },
                    { 'fillStyle': '#3cb878', 'text': '500' },
                    { 'fillStyle': '#f26522', 'text': '800' },
                    { 'fillStyle': '#a186be', 'text': '300' },
                    { 'fillStyle': '#fff200', 'text': '400' },
                    { 'fillStyle': '#00aef0', 'text': '650' },
                    { 'fillStyle': '#ee1c24', 'text': '1000' },
                    { 'fillStyle': '#f6989d', 'text': '500' },
                    { 'fillStyle': '#f26522', 'text': '400' },
                    { 'fillStyle': '#3cb878', 'text': '900' },
                    { 'fillStyle': '#000000', 'text': 'BANKRUPT', 'textFontSize': 16, 'textFillStyle': '#ffffff' },
                    { 'fillStyle': '#a186be', 'text': '600' },
                    { 'fillStyle': '#fff200', 'text': '700' },
                    { 'fillStyle': '#00aef0', 'text': '800' },
                    { 'fillStyle': '#ffffff', 'text': 'LOSE A TURN', 'textFontSize': 12 }
                ],
            'animation':           // Specify the animation to use.
            {
                'type': 'spinToStop',
                'duration': 10,    // Duration in seconds.
                'spins': 3,     // Default number of complete spins.
                'callbackFinished': alertPrize,
                'callbackSound': playSound,   // Function to call when the tick sound is to be triggered.
                'soundTrigger': 'pin'        // Specify pins are to trigger the sound, the other option is 'segment'.'
                
            },
            'pins':				// Turn pins on.
            {
                'number': 24,
                'fillStyle': 'silver',
                'outerRadius': 4,
            }
        });
    }

    var initTheGameBoard = function InitTheGameBoard() {

        var vueinstance = {
            //components: { projecttree: "projecttree", editproject: "editproject"},
            //data only needs to get a blank copy of project, but that does include any lists 
            //required with the project to create a new one.

            //Should the lists be separate?
            data: function () {
                return dbContext.setUpGame();
            },
            mounted: function () {
                //this.loadTheGame();
                
                let myvue = this;
                connection.on("ReceiveMessage", function (user, message) {
                    myvue.msgToUsers(user + " " + message);
                });

                connection.on("ReceiveAction", function (action) {
                    myvue.processAction(action);
                });
            },
            computed: {
  
                amIAdmin() {
                    return this.whoami !== undefined && this.whoami !== null && this.whoami.amAdmin === true;
                },
                //amAdminOrCurrentContestant() {

                //    return (this.whoami !== null && this.whoami.amAdmin === true) || ();
                //},
                theCurrentPuzzle() {
                    if (this.currentPuzzle === undefined || this.currentPuzzle === null) {
                        this.currentPuzzle = { "category": "none", "answer": "", "id":-1, "selected": false, "lines":0 };
                    }

                    var currPuzzle = new CurrentWheelPuzzle(this.currentPuzzle);
                    return currPuzzle;
                },
                availablePlayers() {
                    let newlist = this.players.filter(x => x.list === true);
                    return newlist;
                },
                disabledWheel() {
                    return this.gameReady;
                },
                disabledUser() {
                    return !this.amOnline;
                },
                disabledCreateTeam() {

                    let cnt = this.players.filter(x => x.onATeam === true && x.list === true).length;

                    return this.teamInCreation.length < 1 || cnt < this.teamMembers;
                },
                disabledNewMatch() {
                    return this.disabledWheel;
                },
                disabledGuessRight() {
                    return this.disabledWheel;
                },
                disabledGuessLetter() {
                    return this.disabledWheel;
                },
                whoamiWhyAmIHere() {
                    return this.whoami === null || this.whoami === undefined ? "" : this.whoami.name;
                }
            },
            methods: {
                createrowid(id) {
                    return "wofboardrow" + id;
                },
                getGameModel() {
                    let parms = [];
                    parms.push(new paramsObj("user", this.whoami));
                    let user = (this.whoami === null || this.whoami === undefined) ? "User Not Set" : this.whoami.name;

                    console.log("Getting game model." + user);
                    let action = new wofActions("sendGameModel", parms);
                    this.callToAction(JSON.stringify(action));
                },
                sendGameModel() {
                    if (this.primo === true) {
                        let parms = [];
                        parms.push(new paramsObj("gamemodel", this.$data));

                        console.log("Sending game model. " + this.$data.whoami.name);
                        let action = new wofActions("setGameModel", parms);
                        this.callToAction(JSON.stringify(action));
                    }
                },
                guessRight: function () {

                    let action = new wofActions("showPuzzle", null);

                    this.callToAction(JSON.stringify(action));
                },
                guessWrong: function () {

                    loseMoney.pause();
                    loseMoney.currentTime = 0;
                    // Play the sound.
                    loseMoney.play();
                    alert('Sorry but you guessed WRONG!');

                    let action = new wofActions("setCurrentTeam", null);
                    this.callToAction(JSON.stringify(action));

                },
                setGameModel(data) {
                    console.log("Set game model.");
                    data.adminUser = this.adminUser;
                    data.whoami = this.whoami;

                    this.contextRows = data.contextRows;
                    this.timed = data.timed;
                    this.games = data.games;
                    this.maxTeams = data.maxTeams;
                    this.teamMembers = data.teamMembers;
                    this.teams = data.teams;
                    this.players = data.players;
                    this.adminUser = data.adminUser;
                    this.newGame = data.newGame;
                    this.currentPuzzle = data.currentPuzzle;
                    this.readyToSpin = data.readyToSpin;
                    this.readyToGuess = data.readyToGuess;
                    this.showWheel = data.showWheel;
                    this.teamInCreation = data.teamInCreation;
                    this.gameReady = data.gameReady;
                    this.whoami = data.whoami;
                    this.teamsDonePlaying = data.teamsDonePlaying;
                    this.message = data.message;
                    this.guessedLetters = data.guessedLetters;
                    this.currentGuess = data.currentGuess;
                    this.amountOnWheel = data.amountOnWheel;
                    this.changePlayer = data.changePlayer;
                    this.winningTeams = data.winningTeams
                    this.visibleCards = data.visibleCards
                    //this.loadPuzzleNonAdmin(data.currentPuzzle, data.teams, this.whoami.id)
                    this.gameBoard = data.gameBoard;

                    //this.loadGuessedLetters();
                },
                declareWinner: function (team) {
                    if (confirm("Is Team: " + team.name + " confirmed the winner?") === true) {
                        team.totalPrizeAmt = team.totalPrizeAmt + team.gamePrizeAmt
                        team.theWinner = true;
                        team.finishPlaying = true;
                        ///celebrate transition
                        this.winningTeams.push(team);


                        let parms = [];
                        parms.push(new paramsObj("teams", this.teams));
                        parms.push(new paramsObj("allwinners", this.winningTeams));

                        let action = new wofActions("processWinners", parms)
                        this.callToAction(JSON.stringify(action));
                    }
                },

                processWinners: function (teams, allwinners) {
                    this.teams = teams;
                    this.winningTeams = allwinners;
                    this.teams.forEach(x => x.gamePrizeAmt = 0);

                },
                setPrizeOnWheel: function (prizeAmt) {

                    if (prizeAmt === -1) {
                        this.amountOnWheel = 0;
                        let curr = this.teams.filter(x => x.currentTeam === true)[0];                 
                        curr.gamePrizeAmt = 0

                        loseMoney.pause();
                        loseMoney.currentTime = 0;
                        // Play the sound.
                        loseMoney.play();
                        return true;
                    }

                    this.amountOnWheel = parseInt(prizeAmt);
                    this.readyToGuess = true;
                },
                changePlayerOnGoodGuess: function () {

                    if (this.changePlayer === true) {
                        let curr = this.teams.filter(x => x.currentTeam === true)[0];

                        this.setCurrentPlayer(curr);
                    }
                },
                resetTeams: function () {
                    this.teams.forEach(x => x.hadATurn = false);
                    this.teams.forEach(x => x.currentTeam = false);
                },
                setCurrentTeam: function () {

                    let curr = this.teams.filter(x => x.currentTeam === true);

                    //First time, only happens once per game
                    if (curr === undefined || curr === null || curr.length === 0) {
                        let np = this.teams.filter(x => x.currentTeam === false);
                        let pos = Math.min(...np.map(x => x.orderpos));

                        let results = np.filter(x => x.orderpos = pos);
                        if (results === undefined || results === null || results.length === 0) {
                            return null;
                        }

                        curr = results[0];
                        curr.currentTeam = true;
                        this.setCurrentPlayer(curr);

                        return curr;
                    }

                    curr[0].hadATurn = true;
                    curr[0].currentTeam = false;

                    let np = this.teams.filter(x => x.hadATurn === false);

                    //If all teams have played
                    if (np === undefined || np === null || np.length === 0) {
                        this.teams.forEach(x => x.hadATurn = false);
                        np = this.teams.filter(x => x.hadATurn === false);
                    }

                    let pos = Math.min(...np.map(x => x.orderpos));
                    curr = np.filter(x => x.orderpos = pos)[0];
                    curr.currentTeam = true;
                    this.setCurrentPlayer(curr);

                    return curr;
                },
                setCurrentPlayer: function (currentteam) {

                    if (currentteam.players.length === 1) {
                        currentteam.players[0].myturn = true;

                        return true;
                    }

                    let currp = currentteam.players.filter(x => x.myturn === true);

                    if (currp === undefined || currp === null || currp.length === 0) {
                        let np = currentteam.players.filter(x => x.myturn === false);
                        let pos = Math.min(...np.map(x => x.orderpos));
                        currp = np.filter(x => x.orderpos === pos)[0];
                        currp.myturn = true;
                        return true;
                    }

                    currp[0].hadATurn = true;
                    currp[0].myturn = false;

                    let np = currentteam.players.filter(x => x.hadATurn === false);

                    //If all teams have played
                    if (np === undefined || np === null || np.length === 0) {
                        currentteam.players.forEach(x => x.hadATurn = false);
                        np = currentteam.players.filter(x => x.hadATurn === false);
                    }

                    let pos = Math.min(...np.map(x => x.orderpos));
                    currp = np.filter(x => x.orderpos = pos)[0];
                    currp.myturn = true;

                    return true;
                },
                sendMessage: function (msg) {
                    connection.invoke("SendMessage", user.name, "just joined").catch(function (err) {
                        return console.error(err.toString());
                    });

                },
                testIt: function () {
                    console.log("Method Works");
                },
                isThisYou: function (user) {
                    if (user.amOnline === true) {
                        console.log("I'm already online");
                        return true;
                    }

                    let askuser = "Are you " + user.name + "?";

                    if (confirm(askuser) === true) {
                        user.amOnline = true;
                        this.whoami = user;

                        let parms = [];
                        parms.push(new paramsObj("user", user.name));
                        parms.push(new paramsObj("msg", " is online"));

                        let action = new wofActions("logonUser", parms)
                        this.callToAction(JSON.stringify(action));
                    }
                },
                selectPlayer: function (player) {
                    let parms = [];
                    parms.push(new paramsObj("playerid", player.id));
                    let action = new wofActions("checkPlayer", parms)

                    this.callToAction(JSON.stringify(action));
                },
                checkPlayer: function (pid) {

                    let luser = this.players.filter(x => x.id === pid);
                    //luser[0].amOnline = !luser[0].amOnline;
                },
                callWheel: function () {

                    let action = new wofActions("hideTheWheel", null);
                    this.callToAction(JSON.stringify(action));
                },
                callToAction: function (action) {
                    
                    connection.invoke("SendAction", action).catch(function (err) {
                        return console.error(err.toString());
                    });
                },
                processAction: function (action) {

                    let actionIn = JSON.parse(action);

                    switch (actionIn.action) {
                        case "hideTheWheel":
                            this.hideTheWheel();
                            break;
                        case "logonUser":
                            
                            let params = actionIn.params;
                            let user = actionIn.params.filter(x => x.paramName === "user")[0];
                            let msg = actionIn.params.filter(x => x.paramName === "msg")[0];

                            if (user === undefined || msg === undefined) {
                                console.error("User or message was not returned error");
                                return false;
                            }

                            this.logonUser(user, msg);
                            break;
                        case "checkPlayer":

                            let id = actionIn.params[0];
                            this.checkPlayer(id.paramVal);
                            break;
                        case "beginSpin":

                            let wp = actionIn.params.filter(x => x.paramName === "wheelpower")[0];
                            let stop = actionIn.params.filter(x => x.paramName === "stopat")[0];
                            this.beginSpin(wp.paramVal, stop.paramVal);
                            break;
                        case "loadPuzzleNonAdmin":

                            let puzzle = actionIn.params[0];
                            let teamschange = actionIn.params[1];
                            let admin = actionIn.params[2];

                            this.loadPuzzleNonAdmin(puzzle.paramVal, teamschange.paramVal, admin.paramVal);
                            break; 
                        case "createTeamResp":

                            let team = actionIn.params[0];
                            let players = actionIn.params[1];
                            this.createTeamResp(team.paramVal, players.paramVal);
                            break; 
                        case "guessLetter":
                            let gues = actionIn.params[0];
                            this.guessLetter(gues.paramVal);
                            break;
                        case "setGameModel":
                            let model = actionIn.params[0];
                            this.setGameModel(model.paramVal);
                            break;
                        case "sendGameModel":
                            let usermodel = actionIn.params[0];
                            this.sendGameModel(usermodel.paramVal);
                            break;
                        case "showPuzzle":
                            this.showPuzzle();
                            break;
                        case "loadGameBoard":
                            this.loadGameBoard(actionIn.params[0].paramVal, actionIn.params[1].paramVal, actionIn.params[2].paramVal, actionIn.params[3].paramVal);
                            break;
                        case "setCurrentTeam":
                            this.setCurrentTeam();
                            break;
                        case "resetGameBoardByAdmin":

                            this.sendGameModel(actionIn.params[0].paramVal, actionIn.params[1].paramVal, actionIn.params[2].paramVal, actionIn.params[3].paramVal);
                            break;
                        case "processWinners":

                            this.processWinners(actionIn.params[0].paramVal, actionIn.params[1].paramVal);
                            break;
                        default:
                            break;
                    }
                },

                loadGameBoard: function (newboard, teams, adminid, puzzle) {
                    if (this.whoami !== null && this.whoami !== undefined &&
                        this.whoami.amAdmin === true && this.whoami.id == adminid) {
                        return true;
                    }

                    this.currentPuzzle = puzzle;
                    this.teams = teams;
                    this.gameBoard = newboard;
                    this.guessedLetters = [];
                },
                
                loadPuzzle: function () {
                    let puzzleloaded = false;
                    this.guessedLetters = [];
                    this.resetGameBoardByCard();
                    this.amountOnWheel = 0;
                    let tru = true;

                    while (tru) {
                        let puzzle = Math.floor((Math.random() * 30) + 1);
                        let found = this.puzzles.filter(pzl => pzl.id === puzzle && pzl.selected === false);
                        
                        //determine if puzzle's been found
                        tru = found.length === 0;
                        if (!tru) {
                            let newpuzzle = found[0];
                            found[0].selected = true;
                            this.currentPuzzle = newpuzzle;

                            let lines = newpuzzle.lines;
                            let ans = newpuzzle.answer.split(" ");
                            let max = 12; //restricts the length of the line to 12 characters

                            ///answer
                            if (lines === ans.length) {
                                for (var row = 0; row < ans.length; row++) {
                                    let word = ans[row].split("");
                                    let currentline = row;

                                    let rowofcards = this.gameBoard[row];

                                    //set up the word, per row
                                    //loop the word and place in card
                                    for (var col = 0; col < word.length; col++) {
                                        let colval = col;

                                        if (currentline === 0 || currentline === 3) {
                                            colval = colval + 1;
                                        }

                                        let card = rowofcards.rowCards[colval];

                                        card.guessed = false;
                                        card.letter = word[col];
                                        card.isInCurrentPuzzle = true;

                                    }
                                }
                            }
                            else {
                                let cardsAvail = max; ///max is 12 characters for line 0 and 3
                                let currentline = 0;
                                let space = 1;
                                let startpos = 1;

                                for (var wrd = 0; wrd < ans.length; wrd++) {
                                    let word = ans[wrd].split("");

                                    ///This does not work for a puzzle with 14 characters in one word...
                                    ///as it should forced to use the 2nd and 3rd lines
                                    if (cardsAvail < word.length) {
                                        currentline = currentline + 1
                                        cardsAvail = max + (currentline === 3 ? 0 : 2); //max is 14 for lines 1 and 2
                                        startpos = currentline === 3 ? 1 : 0;
                                    }

                                    let rowofcards = this.gameBoard[currentline];

                                    //set up the word, per row
                                    //loop the word and place in card
                                    for (var letterpos = 0; letterpos < word.length; letterpos++) {
                                        let boardpos = letterpos + startpos;

                                        let card = rowofcards.rowCards[boardpos];

                                        card.guessed = false;
                                        card.letter = word[letterpos];
                                        card.isInCurrentPuzzle = true;
                                        cardsAvail--;
                                    }
                                    cardsAvail--; ///substracyt space
                                    startpos += word.length + space;

                                }
                            }

                            puzzleloaded = true;
                            this.setCurrentTeam();

                        }


                        let parms = [];
                        parms.push(new paramsObj("gameboard", this.gameBoard));
                        parms.push(new paramsObj("nextplayer", this.teams));    //this should not be teams, but the update for the current players
                        parms.push(new paramsObj("adminid", this.whoami.id));
                        parms.push(new paramsObj("currentpuzzle", this.currentPuzzle));

                        let action = new wofActions("loadGameBoard", parms)
                        this.callToAction(JSON.stringify(action));
                    }
                }, 
                resetGameBoardByCard: function () {
                    this.gameBoard.forEach(row => {
                        row.rowCards.forEach(card => {
                            card.letter = "";
                            card.show = false;
                            card.isInCurrentPuzzle = false;
                            card.guessed = false;
                        });
                    });
                },

                callLetterGuess: function () {

                    let parms = [];

                    parms.push(new paramsObj("guess", this.currentGuess));
                    let action = new wofActions("guessLetter", parms)

                    this.callToAction(JSON.stringify(action));
                },
                guessLetter: function (letter) {
                    //let cards = document.querySelectorAll("td.play-card label");
                    //let letter = document.getElementById("inGuess").value;
                    let cntr = 0;

                    this.guessedLetters.push(letter);
                    this.currentGuess = letter;

                    this.gameBoard.forEach(row => {
                        let guessd = row.rowCards.filter(x => x.letter.toUpperCase() === letter.toUpperCase());
                        cntr = cntr + guessd.length;

                        guessd.forEach(card => {
                            card.guessed = true;
                        });
                    });

                    if (cntr === 0) {
                        //sound buzzer
                        this.msgToUsers("Sorry there are no " + letter.toUpperCase() + "s");
                        wrong.play();
                        this.setCurrentTeam();
                        this.readyToGuess = false;

                        return true;
                    }

                    //Get the current team
                    let team = this.teams.filter(x => x.currentTeam === true)[0];
                    //get values for math
                    team.gamePrizeAmt = team.gamePrizeAmt + (this.amountOnWheel * cntr);

                    //reset the prize value and disable guess button until wheel is spun
                    this.readyToGuess = false;
                    this.currentGuess = "";
                    this.changePlayerOnGoodGuess();

                    this.amountOnWheel = 0;
                },
                beginSpin: function (wheelpower, stopat) {
                    theWheel.rotationAngle = 0;
                    // Ensure that spinning can't be clicked again while already running.
                    if (wheelSpinning == false) {
                        // Based on the power level selected adjust the number of spins for the wheel, the more times is has
                        // to rotate with the duration of the animation the quicker the wheel spins.
                        if (wheelPower == 1) {
                            theWheel.animation.spins = 3;
                        } else if (wheelPower == 2) {
                            theWheel.animation.spins = 6;
                        } else if (wheelPower == 3) {
                            theWheel.animation.spins = 10;
                        }
                        this.readyToSpin = false;
                        // Disable the spin button so can't click again while wheel is spinning.
                        //document.getElementById('spin_button').src = "TheWheel/spin_off.png";


                        //-->document.getElementById('spin_button').className = "";

                        theWheel.animation.stopAngle = stopat;
                        // Begin the spin animation by calling startAnimation on the wheel object.
                        theWheel.startAnimation();

                        // Set to true so that power can't be changed and spin button re-enabled during
                        // the current animation. The user will have to reset before spinning again.
                        wheelSpinning = true;

                    }
                },

                startSpin: function () {
                    // Ensure that spinning can't be clicked again while already running.
                    if (wheelSpinning == false) {
                        // Based on the power level selected adjust the number of spins for the wheel, the more times is has
                        // to rotate with the duration of the animation the quicker the wheel spins.
                        if (wheelPower == 1) {
                            theWheel.animation.spins = 3;
                        } else if (wheelPower == 2) {
                            theWheel.animation.spins = 6;
                        } else if (wheelPower == 3) {
                            theWheel.animation.spins = 10;
                        }
                        this.readyToSpin = false;
                        // Disable the spin button so can't click again while wheel is spinning.
                        //document.getElementById('spin_button').src = "TheWheel/spin_off.png";


                        //-->document.getElementById('spin_button').className = "";
                        let val = Math.floor((Math.random() * 359) + 1);
                        if (val % 10 === 0) {
                            if (Math.random() > Math.random()) {
                                val = val + Math.floor(Math.random() * 10)
                            }
                            else {
                                val = val - Math.floor(Math.random() * 10)
                            }
                        }
                        theWheel.animation.stopAngle = val;
                        // Begin the spin animation by calling startAnimation on the wheel object.
                        theWheel.startAnimation();

                        // Set to true so that power can't be changed and spin button re-enabled during
                        // the current animation. The user will have to reset before spinning again.
                        wheelSpinning = true;

                    }
                },
                spinwheel: function () {
                    theWheel.rotationAngle = 0;
                    wheelPower = Math.floor(Math.random() * 3) + 1;
                    this.setupSpin();
                },
                startSpinWheel: function () {
                    let val = Math.floor((Math.random() * 359) + 1);
                    if (val % 10 === 0) {
                        if (Math.random() > Math.random()) {
                            val = val + Math.floor(Math.random() * 10)
                        }
                        else {
                            val = val - Math.floor(Math.random() * 10)
                        }
                    }

                    wheelPower = Math.floor(Math.random() * 3) + 1;
                    let parms = [];
                    
                    parms.push(new paramsObj("wheelpower", wheelPower));
                    parms.push(new paramsObj("stopat", val));

                    let action = new wofActions("beginSpin", parms)

                    this.callToAction(JSON.stringify(action));
                },

                hideTheWheel: function () {
                    

                    if (this.showWheel === true) {
                        this.showWheel = false;
                        this.readyToSpin = false;

                        return;
                    }

                    this.showWheel = true;
                    this.readyToSpin = true;
                },
                logonUser: function (usr, msg) {
                    let luser = this.players.filter(x => x.name === usr.paramVal);

                    luser[0].amOnline = true;
                    this.msgToUsers(usr.paramVal + " " + msg.paramVal);

                    if (this.whoami === undefined || this.whoami === null || this.whoami.amAdmin === false) {
                        this.primo = false;
                    }
                    this.getGameModel();
                },
                msgToUsers: function (msg, tymer) {
                    this.message = msg;
                    let tyme = tymer || 5000;
                    setTimeout(this.clearMsg, tyme);
                },

                clearMsg: function () {
                    this.message = "";
                },
                loadNewMatch: function () {
                    this.gameBoard.forEach(row => {
                        row.rowCards.forEach(card => {
                            card.guessed = false;
                            card.isInCurrentPuzzle = false;
                            card.letter = "";
                        });
                    });

                    this.loadPuzzle();
                },
                setPrimo: function () {
                    if (this.whoami.amAdmin === true) {
                        this.primo = true;
                    }
                },
                ///Creates a new game with new players and teams
                loadNewGame: function () {
                    //1.Save the team(s)
                    //2. Save the scores
                    let players = document.querySelectorAll('[id^="prize"]');

                    for (var player = 0; player < players.length; player++) {
                        players[player].setAttribute("data-val", 0);
                        players[player].value = "$ 0";
                    }

                    this.loadNewMatch();
                },
                winGame: function () {
                    //play game win sound
                    //Flash Winning Team and Prize Money
                    //Save prize money to team
                    //Show team in winners list
                    let curr = this.teams.filter(x => x.currentTeam === true)[0];

                    curr.totalPrizeAmount = curr.gamePrizeAmount;
                    this.showPuzzle();
                },
                showPuzzle: function () {

                    this.gameBoard.forEach(row => {
                        row.rowCards.filter(x => x.isInCurrentPuzzle === true).forEach(card => {
                            card.guessed = true;
                        });
                    });
                },
                getTeamId: function () {

                    let ids = this.teams.map(x => x.id);
                    if (ids.length === 0) {
                        return 0;
                    }

                    return Math.max(...ids);    

                },
                createTeam: function () {

                    if (this.maxTeams === this.teams.length) {
                        alert("The game can only have " + this.maxTeams + " teams");
                        return false;
                    }
                    let selPlayers = this.players.filter(x => x.onATeam === true && x.list === true);

                    ///set playing order of players
                    this.randomizeOrderByOrderPos(selPlayers);

                    ///gets the players selected for this team
                    ///& adds to the list to be added to the team
                    let idpos = this.getTeamId() + 1;
                    this.teams.push(new dbContext.WOFTeam(this.teamInCreation, selPlayers, idpos, idpos));

                    this.players.forEach(itm => { if (itm.onATeam === true) { itm.list = false; } });                  

                    this.checkState(GAMEREADY)

                    this.teamInCreation = "";

                    let parms = [];
                    parms.push(new paramsObj("team", this.teams));
                    parms.push(new paramsObj("players", this.players));

                    let action = new wofActions("createTeamResp", parms);

                    //once we've reached 3 teams randomize the order
                    if (this.maxTeams === this.teams.length) {
                        this.randomizeOrderByOrderPos(this.teams);
                    }
                    this.callToAction(JSON.stringify(action));
                },
                createTeamResp: function (teams, players) {

                    this.teams = teams;
                    this.players = players;

                },
                finishGame: function () {
                    let playing = this.teams.filter(x => x.finishPlaying === false);
                    let doneplaying = this.teams.filter(x => x.finishPlaying === true);

                    doneplaying.forEach((tm, ndx) =>
                    {
                        this.teamsDonePlaying.push(tm);
                    });

                    this.teams = playing;
                    
                    this.resetGameBoardByCard();
                    this.newGame = true;
                    this.guessedLetters = [];
                    this.currentPuzzle = { "category": "none", "answer": "", "id": -1, "selected": false, "lines": 0 };

                    let parms = [];

                    parms.push(new paramsObj("teams", this.teams));
                    parms.push(new paramsObj("gameboard", this.gameBoard));
                    parms.push(new paramsObj("newgame", this.newGame));
                    parms.push(new paramsObj("teamsdone", this.teamsDonePlaying));

                    let action = new wofActions("resetGameBoardByAdmin", parms);
                    this.callToAction(JSON.stringify(action));

                },

                resetGameBoardByAdmin(teams, board, newgame, teamsdone) {
                    this.teams = teams;
                    this.gameBoard = board;
                    this.newGame = newgame;
                    this.teamsDonePlaying = teamsdone;
                    this.resetTeams();

                },                
                randomizeOrderByOrderPos: function (objary) {
                    if (objary === null || objary === undefined || objary.length === 0) {
                        console.error("The object array to be randomize in method: randomizeOrderByOrderPos does not exist");
                        return false;
                    }

                    let cnt = objary.length;
                    let assigned = 1;
                    let tru = (cnt === assigned);

                    for (let x = 0; x < cnt; x++) {
                        objary[x].orderpos = Math.floor((Math.random() * 10000) + 1);
                    }

                    objary.sort((a, b) => {
                        if (a.orderpos > b.orderpos) {
                            return -1
                        }

                        return 1;
                    });

                    for (let x = 0; x < cnt; x++) {
                        objary[x].orderpos = assigned;
                        assigned++;
                    }
                },
                checkState: function (state) {


                    switch (state) {
                        case GAMEREADY:
                            this.gameReady = this.maxTeams === this.teams.length;
                            break;

                        default:
                    }
                    
                }

                ///END Method
            }

            ///END Vue Instance Object
        };

        var mainVueApp = Vue.createApp(vueinstance);

        vuevm = mainVueApp.mount("#theWheelContainer");

        loadWheel();
        //return vuevm;

        ///END InitBoard Function
    }

    function createVuejsTeam(team) {
        
        vuevm.createTeam(team);
    }


    // Loads the tick audio sound in to an audio object.
    

    // This function is called when the sound is to be played.
    function playSound() {
        // Stop and rewind the sound if it already happens to be playing.
        audio.pause();
        audio.currentTime = 0;

        // Play the sound.
        audio.play();
    }

    // -------------------------------------------------------
    // Function for reset button.
    // -------------------------------------------------------
    function resetWheel() {
        theWheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
        // Re-set the wheel angle to 0 degrees.
        theWheel.draw();                // Call draw to render changes to the wheel.

        //document.getElementById('pw1').className = "";  // Remove all colours from the power level indicators.
        //document.getElementById('pw2').className = "";
        //document.getElementById('pw3').className = "";

        wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
    }

    // -------------------------------------------------------
    // Called when the spin animation has finished by the callback feature of the wheel because I specified callback in the parameters.
    // -------------------------------------------------------
    function alertPrize(indicatedSegment) {
        // Just alert to the user what happened.
        // In a real project probably want to do something more interesting than this with the result.
        if (indicatedSegment.text == 'LOSE A TURN') {
            vuevm.msgToUsers('Sorry but you loose a turn.');
            lostTurn.play();
            vuevm.setCurrentTeam();
        } else if (indicatedSegment.text == 'BANKRUPT') {
            vuevm.msgToUsers('Oh no, you have gone BANKRUPT!');
            vuevm.setPrizeOnWheel(-1);
            vuevm.setCurrentTeam();
        } else {
            //alert("You have won " + indicatedSegment.text);
            //WheelVal.value = "$ " + indicatedSegment.text;
            vuevm.setPrizeOnWheel(indicatedSegment.text);
            WheelVal.setAttribute('data-val', indicatedSegment.text);
            //document.getElementById("thewheel").style.display = "none";
        }

        resetWheel();
        hideWheel();
    }

    function hideWheel() {

        vuevm.hideTheWheel();

    }


    function messageUsers(msg) {
        vuevm.msgToUsers(msg);
        console.log(msg);
    }


    //function closeTeamsAdd() {
    //    let playerdiv = document.getElementById("playersList");
    //    let teamsdiv = document.getElementById("playerteams");

    //    playerdiv.style.display = "none";
    //    teamsdiv.style.display = "none";
    //}

    var gamePlayApi = {
        initTheGameBoard: initTheGameBoard,
        createVuejsTeam: createVuejsTeam,
        messageUsers: messageUsers
        //spinwheel: spinwheel,
        //hideWheel: hideWheel,
        //guessLetter: guessLetter,
        //showPuzzle: showPuzzle,
        //loadTheGame: loadTheGame,
        //loadNewGame: loadNewGame,
        //loadNewMatch: loadNewMatch,
        //createTeam: createTeam,
        //closeTeamsAdd: closeTeamsAdd
    };

    return gamePlayApi;

})();