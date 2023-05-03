
var gamePlay = window.gamePlay || {};

gamePlay = (function () {
    let theWheel;
    let teamsCnt = 0;
    let fpiTeams = [];

    function FPIWofTeam(name, id, current) {
        this.name = name;
        this.turnCnt = 0;
        this.currentTeam = current;
        this.id = id;
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
                    { 'fillStyle': '#ffffff', 'text': 'LOOSE TURN', 'textFontSize': 12 }
                ],
            'animation':           // Specify the animation to use.
            {
                'type': 'spinToStop',
                'duration': 10,    // Duration in seconds.
                'spins': 3,     // Default number of complete spins.
                'callbackFinished': alertPrize,
                'callbackSound': playSound,   // Function to call when the tick sound is to be triggered.
                'soundTrigger': 'pin'        // Specify pins are to trigger the sound, the other option is 'segment'.
            },
            'pins':				// Turn pins on.
            {
                'number': 24,
                'fillStyle': 'silver',
                'outerRadius': 4,
            }
        });

        loadTheGame();
    }

    // Loads the tick audio sound in to an audio object.
    let audio = new Audio('/sound/tick.mp3');

    // This function is called when the sound is to be played.
    function playSound() {
        // Stop and rewind the sound if it already happens to be playing.
        audio.pause();
        audio.currentTime = 0;

        // Play the sound.
        audio.play();
    }

    // Vars used by the code in this page to do power controls.
    let wheelPower = 0;
    let wheelSpinning = false;

    // -------------------------------------------------------
    // Function to handle the onClick on the power buttons.
    // -------------------------------------------------------
    function powerSelected(powerLevel) {
        // Ensure that power can't be changed while wheel is spinning.
        if (wheelSpinning == false) {
            // Reset all to grey incase this is not the first time the user has selected the power.
            document.getElementById('pw1').className = "";
            document.getElementById('pw2').className = "";
            document.getElementById('pw3').className = "";

            // Now light up all cells below-and-including the one selected by changing the class.
            if (powerLevel >= 1) {
                document.getElementById('pw1').className = "pw1";
            }

            if (powerLevel >= 2) {
                document.getElementById('pw2').className = "pw2";
            }

            if (powerLevel >= 3) {
                document.getElementById('pw3').className = "pw3";
            }

            // Set wheelPower var used when spin button is clicked.
            wheelPower = powerLevel;

            // Light up the spin button by changing it's source image and adding a clickable class to it.
            document.getElementById('spin_button').src = "TheWheel/spin_on.png";
            document.getElementById('spin_button').className = "clickable";
        }
    }

    // -------------------------------------------------------
    // Click handler for spin button.
    // -------------------------------------------------------
    function startSpin() {
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

            // Disable the spin button so can't click again while wheel is spinning.
            document.getElementById('spin_button').src = "TheWheel/spin_off.png";
            document.getElementById('spin_button').className = "";

            // Begin the spin animation by calling startAnimation on the wheel object.
            theWheel.startAnimation();

            // Set to true so that power can't be changed and spin button re-enabled during
            // the current animation. The user will have to reset before spinning again.
            wheelSpinning = true;

            //
            document.getElementById("btnGuess").removeAttribute("disabled");
        }
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
        if (indicatedSegment.text == 'LOOSE TURN') {
            alert('Sorry but you loose a turn.');
        } else if (indicatedSegment.text == 'BANKRUPT') {
            alert('Oh no, you have gone BANKRUPT!');
        } else {
            //alert("You have won " + indicatedSegment.text);
            WheelVal.value = "$ " + indicatedSegment.text;
            WheelVal.setAttribute('data-val', indicatedSegment.text);
            //document.getElementById("thewheel").style.display = "none";
        }

        resetWheel();
        hideWheel();
    }

    function hideWheel() {
        let elspin = document.getElementById("spin_button");

        if (document.getElementById("thewheel").style.display === "block") {
            document.getElementById("thewheel").style.display = "none";
            elspin.setAttribute('disabled', true);
            elspin.style.cursor = "not-allowed";
            elspin.style.color = "lightgray";

            return;
        }

        document.getElementById("thewheel").style.display = "block";

        elspin.style.cursor = "pointer";
        elspin.removeAttribute('disabled');
        elspin.style.color = "wheat";
        
    }

    function spinwheel() {
        theWheel.rotationAngle = 0;
        wheelPower = Math.floor(Math.random() * 3) + 1;
        startSpin();
    }

    function showPuzzle() {
        let cards = document.querySelectorAll("td.play-card label");

        for (var card = 0; card < cards.length; card++) {
            cards[card].style.visibility = "visible";
        }
    }

    function guessLetter() {
        let cards = document.querySelectorAll("td.play-card label");
        let letter = document.getElementById("inGuess").value;
        let cntr = 0;

        let guessed = document.getElementById("lblguesses").innerHTML;

        document.getElementById("inGuess").value = "";

        if (guessed === undefined || guessed.length === 0) {
            document.getElementById("lblguesses").innerHTML = letter;

        } else {
            document.getElementById("lblguesses").innerHTML = guessed + ", " + letter;
        }
        
        for (var card = 0; card < cards.length; card++) {
            if (cards[card].innerHTML.toUpperCase() === letter.toUpperCase()) {
                cntr++;
                cards[card].style.visibility = "visible";
            }
        }


        let team = fpiTeams.filter(x => x.currentTeam === true)[0];

        if (cntr === 0) {
            //sound buzzer
            team.turnCnt = team.turnCnt + 1
            team.currentTeam = false;

            let nextteam = fpiTeams.filter(x => x.currentTeam === false && x.turnCnt == team.turnCnt);

            if (nextteam === undefined || nextteam === null || nextteam.length === 0) {
                nextteam = fpiTeams.filter(x => x.currentTeam === false)[0];
            }

            document.getElementById(teamname.id).style.color = red;
            document.getElementById(teamname.id).style.webkitTextStroke = "1px gold";
            
            alert("Sorry there are no " + letter.toUpperCase() + "s");


            return;
        }


        //get values for math
        let cval = parseInt(document.getElementById("prize1").getAttribute("data-val"));
        let wheelval = parseInt(document.getElementById("WheelVal").getAttribute("data-val"));




        cval = cval + (wheelval * cntr);

        //reset the prize value and disable guess button until wheel is spun
        document.getElementById(team.id).value = "$ " + cval;
        document.getElementById(team.id).setAttribute("data-val", cval);
        document.getElementById("btnGuess").setAttribute("disabled", true);
    }


    function loadNewMatch() {
        let cards = document.querySelectorAll("td.wof-card label");
        let cardscontainer = document.querySelectorAll("td.wof-card.play-card");
        let wheelval = document.getElementById("WheelVal");
        wheelval.setAttribute("data-val", 0);
        wheelval.value = "$ 0";

        for (var card = 0; card < cardscontainer.length; card++) {
            cardscontainer[card].classList.remove("play-card");
            cardscontainer[card].classList.add("blank-card");
        }


        for (var card = 0; card < cards.length; card++) {
            cards[card].innerHTML = "";
            cards[card].style.visibility = "hidden";
        }

        loadTheGame();
    }

    function loadNewGame() {
        let players = document.querySelectorAll('[id^="prize"]');

        for (var player = 0; player < players.length; player++) {
            players[player].setAttribute("data-val", 0);
            players[player].value = "$ 0";
        }

        loadNewMatch();
    }

    function createTeam() {

        if (teamsCnt === 3) {
            alert("Can only have 3 teams");
            return false;
        }
        let playerslising = document.querySelectorAll("#playersList div");
        let teaminfo = document.getElementById("TeamInfo");
        let teamnamein = document.getElementById("teamName");
        let playerdiv = document.getElementById("playersList");

        //Create the team... team Name
        let teamdiv = document.createElement("div");            //container       
        let teamname = document.createElement("label");         //team
        let teamprizes = document.createElement("input");       //prizes
        let totalteamprizes = document.createElement("label");  //total prizes
        let totalteamprizesval = document.createElement("label");  //total prizes
        let teamMembers = document.createElement("label");      //team members
        let teamMemberslist = document.createElement("label");      //team members list


        let listopl = [];
        for (var div = 0; div < playerslising.length; div++) {

            let cbc = playerslising[div].firstChild;

            if (cbc.checked === true) {
                listopl.push(playerslising[div].lastChild.innerHTML);
                playerdiv.removeChild(playerslising[div]);
            }
        }


        teamsCnt = teamsCnt + 1;

        //Set up Team container
        let teamdivStyle = teamdiv.style;
        teamdivStyle.minWidth = "200px";
        teamdivStyle.minHeight = "50px";
        teamdivStyle.fontSize = "18pt";


        if (teamsCnt === 1) {

            //document.getElementById(teamname.id).style.color = red;
            //document.getElementById(teamname.id).style.webkitTextStroke = "1px gold";

            //teamdivStyle.border = "1px double purple";
            //teamdivStyle.padding = "5px";
        }
        //Set up the team Name
        teamname.innerHTML = teamnamein.value;
        teamnamein.value = "";


        //Set up the team prizes
        teamprizes.id = "prize" + teamsCnt;
        teamprizes.style.width = "100px";
        teamprizes.style.height = "30px";
        teamprizes.style.textAlign = "right";
        teamprizes.style.fontWeight = "600";
        teamprizes.style.fontSize = "18pt";
        teamprizes.style.fontWeight = "600";
        teamprizes.setAttribute('data-val', "0");
        teamprizes.setAttribute('value', "$ 0");

        //Set up the total team prizes
        totalteamprizes.style.fontSize = "8pt";
        totalteamprizesval.style.fontSize = "8pt";
        totalteamprizes.innerHTML = "Total Prizes";

        teamMembers.style.fontSize = "9pt";
        teamMembers.innerHTML = "Players: ";
        teamMemberslist.style.fontSize = "9pt";
        teamMemberslist.innerHTML = listopl.join(", ");

        teamdiv.appendChild(teamname);
        teamdiv.appendChild(teamprizes);
        teamdiv.appendChild(document.createElement("br"));
        teamdiv.appendChild(totalteamprizes);
        teamdiv.appendChild(totalteamprizesval);
        teamdiv.appendChild(document.createElement("br"));
        teamdiv.appendChild(teamMembers);
        teamdiv.appendChild(teamMemberslist);
        teamdiv.appendChild(document.createElement("br"));

        teaminfo.appendChild(teamdiv);

        fpiTeams.push(new FPIWofTeam(teamnamein.value, teamprizes.id, teamsCnt === 1));
    }
    function closeTeamsAdd() {
        let playerdiv = document.getElementById("playersList");
        let teamsdiv = document.getElementById("playerteams");

        playerdiv.style.display = "none";
        teamsdiv.style.display = "none";


    }


    function loadTheGame() {

        var gameboard = dbContext.setUpGame();
        var players = dbContext.setUpGamePlayers();

        let tru = players !== undefined && players !== null & players.length > 0;
        
        //'<input type="text" /> <input type="button" value="Set Team" />'
        if (tru) {
            let teamsdiv = document.getElementById("playerteams");
            teamsdiv.style.display = "inline-block";
            //Load the players
            let playerdiv = document.getElementById("playersList");
            
            let playerStyle = playerdiv.style;

            playerStyle.display = "flex";
            playerStyle.justifyContent = "space-between";
            playerStyle.flexDirection = "column";

            if (fpiTeams.length === 0) {
                for (var player = 0; player < players.length; player++) {
                    let localdiv = document.createElement("div");

                    let playername = document.createElement("label");
                    let checkbx = document.createElement("input");

                    checkbx.type = "checkbox";
                    checkbx.value = players[player].onATeam;

                    playername.id = "lbl" + players[player].id;
                    playername.innerHTML = players[player].name;
                    checkbx.id = "chbx" + players[player].id;

                    localdiv.appendChild(checkbx);
                    localdiv.appendChild(playername);
                    playerdiv.appendChild(localdiv);
                }
            }
        }

        //let textbx = document.createElement("input");

        tru = true;
        ///Loads the Puzzle
        while (tru) {
            let puzzle = Math.floor((Math.random() * 25) + 1);

            let found = gameboard.puzzles.filter(pzl => pzl.id === puzzle && pzl.selected === false);

            tru = found.length === 0;

            if (!tru) {
                let newpuzzle = found[0];
                document.getElementById("lblCategory").innerHTML = newpuzzle.category;
                newpuzzle.selected = true;
                let lines = newpuzzle.lines;
                let ans = newpuzzle.answer.split(" ");
                let max = 12;

                ///answer
                if (lines === ans.length) {
                    for (var row = 0; row < ans.length; row++) {
                        let word = ans[row].split("");
                        let currentline = row;

                        //set up the word, per row
                        //loop the word and place in card
                        for (var col = 0; col < word.length; col++) {
                            let colval = col;

                            if (currentline === 0 || currentline === 3) {
                                colval = colval + 1;
                            }

                            let lblid = row.toString() + "-" + colval
                            document.getElementById(lblid).innerHTML = word[col];
                            document.querySelector("td[data-row='" + currentline + "'][data-col='" + colval + "']").classList.add("play-card");

                        }
                    }
                }
                else {
                    let cardsAvail = max;
                    let currentline = 0;
                    let space = 1;
                    let pos = 0;

                    for (var wrd = 0; wrd < ans.length; wrd++) {
                        let word = ans[wrd].split("");

                        if (cardsAvail < word.length) {
                            currentline = currentline + 1
                            pos = 0;
                            cardsAvail = max;
                        }                        

                        //set up the word, per row
                        //loop the word and place in card
                        for (var col = 0; col < word.length; col++) {
                            let colpos = col + pos;

                            if (currentline === 0 || currentline === 3) {
                                colpos = colpos + 1;
                            }

                            let lblid = currentline.toString() + "-" + colpos
                            document.getElementById(lblid).innerHTML = word[col];
                            document.querySelector("td[data-row='" + currentline + "'][data-col='" + colpos + "']").classList.add("play-card");
                        }
                        pos = word.length + space;
                        cardsAvail = cardsAvail - pos;
                    }



                }
            }
        }
        


        //adminsect
    }

    var gamePlayApi = {
        loadWheel: loadWheel,
        spinwheel: spinwheel,
        hideWheel: hideWheel,
        guessLetter: guessLetter,
        showPuzzle: showPuzzle,
        loadTheGame: loadTheGame,
        loadNewGame: loadNewGame,
        loadNewMatch: loadNewMatch,
        createTeam: createTeam,
        closeTeamsAdd: closeTeamsAdd
    };

    return gamePlayApi;

}) ();