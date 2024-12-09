// Project Name: Tic Tac Toe
// 481 - Project 1
// Authors: Lupita, Lucero


// Gameboard module
const Gameboard = (() => {
    // Initialize the game board as a 3x3 array of empty strings
   // Lupita - I changed the board to a 1D array
    const board = 
    [
        "","","",
        "","","",
        "","",""
    ];
    // Function to add a player's marker to the board at a specified index
    const addMark = (squareIndex, player) => {
        board[squareIndex] = player
    }
    // Return the board and addMark function to make them accessible
    return { board, addMark }
})()

// createPlayer factory function
const createPlayer = (name, marker) => {
    // Return a player object with name and marker properties
    return {name, marker}
}

// Game controller module
const Game = (gameMode) => {
    // Get player names and markers from the DOM
    const playerName1 = document.querySelector("#player1").value
    const playerName2 = document.querySelector("#player2").value
    let playerOneMarker = document.querySelector(`input[name="marker"]:checked`).value
    let playerTwoMarker = document.querySelector(`input[name="marker"]:not(:checked)`).value

    // Create player objects
    let _player1 = createPlayer(playerName1, playerOneMarker)
    let _player2 = createPlayer(playerName2, playerTwoMarker)

    // Adjust players based on game mode
    if(gameMode === "PVP") {
        _player2 = createPlayer(playerName2, playerTwoMarker)
    }
    if(gameMode === "PVC" || gameMode === "PVC-hard") {
        _player1 = createPlayer(playerName1, playerOneMarker)
        _player2 = createPlayer("Computer", playerTwoMarker)
    }

    // Initialize game state variables
    let _currentPlayer = _player1
    let isFinished = false
    let legalMoves = [0,1,2,3,4,5,6,7,8]

    // Function to handle a player's turn
    const playTurn = (squareIndex) => {
        if(gameMode === "PVP"){
            Gameboard.addMark(squareIndex, getCurrentPlayer().marker);
            checkWin(_currentPlayer)
            switchPlayer()
        }
        if(gameMode === "PVC") {
            legalMoves = legalMoves.filter(item => item != squareIndex)
            let randomIndex = legalMoves[Math.floor(Math.random()*legalMoves.length)]
            if(squareIndex === undefined) { // If we choose "O" and start/restart game, computer starts first without a squareIndex
                switchPlayer()
                Gameboard.addMark(randomIndex, getCurrentPlayer().marker)
                legalMoves = legalMoves.filter(item => item != randomIndex)
                checkWin(_currentPlayer)
                switchPlayer()
                computerPlays = false
            } else {
                Gameboard.addMark(squareIndex, getCurrentPlayer().marker);
                computerPlays = true
                checkWin(_currentPlayer)
                switchPlayer()
                if(isFinished === true) return
                setTimeout(()=> {
                    Gameboard.addMark(randomIndex, getCurrentPlayer().marker)
                    legalMoves = legalMoves.filter(item => item != randomIndex)
                    checkWin(_currentPlayer)
                    switchPlayer()
                    computerPlays = false
                }, 300)
            }
        }
        if(gameMode === "PVC-hard") {
            if(squareIndex === undefined){
                playMove(0, _player2)
                return
            } else {
                legalMoves = legalMoves.filter(item => item != squareIndex)
                playMove(squareIndex, _player1)
            }
            function playMove(squareIndex, player) {
                Gameboard.addMark(squareIndex, player.marker);
                computerPlays = true
                ScreenController.render()
                if(winning(Gameboard.board, player) && player.marker === "X") {
                    checkWin(_player1)
                } else if(Gameboard.board.filter(mark => mark === "").length === 0){
                    checkWin(_currentPlayer)
                } else {
                    let minimaxIndex = minimax(Gameboard.board, _player2).index
                    setTimeout(() => {
                        Gameboard.addMark(minimaxIndex, _player2.marker);
                        legalMoves = legalMoves.filter(item => item != minimaxIndex)
                        checkWin(_player2)
                        ScreenController.render()
                        if(winning(Gameboard.board, _player2)){
                            checkWin(_player2)
                        }
                        computerPlays = false
                    }, 300);
                }
            }
            
            // Minimax algorithm for optimal computer moves
            function minimax(newBoard, player){
                let availableSquares = legalMoves
                if(winning(newBoard, _player1)){
                    return {score: 10}
                } else if(winning(newBoard, _player2)){
                    return {score: -10}
                } else if(legalMoves.length === 0) {
                    return {score: 0}
                }
                let moves = []
                for(let i = 0; i < availableSquares.length; i++){
                    let move = {}
                    move.index = availableSquares[i]
                    Gameboard.addMark(move.index, player.marker); // Place the player's marker
                    legalMoves = legalMoves.filter(item => item != move.index)
                    if(player === _player1){
                        let result = minimax(newBoard, _player2)
                        move.score = result.score
                    } else if(player === _player2){
                        let result = minimax(newBoard, _player1)
                        move.score = result.score
                    }
                    newBoard[availableSquares[i]] = "" // Reset the board squares
                    legalMoves.push(availableSquares[i])
                    moves.push(move)
                }
                let bestMove 
                if(player === _player1){
                    let bestScore = -10000
                    for(let i = 0; i < moves.length; i++){
                        if(moves[i].score > bestScore){
                            bestScore = moves[i].score
                            bestMove = i
                        }
                    }
                } else {
                    let bestScore = 10000
                    for(let i = 0; i < moves.length; i++){
                        if(moves[i].score < bestScore){
                            bestScore = moves[i].score
                            bestMove = i
                        }
                    }
                }
                return moves[bestMove]
            }
        }
    }

    // Function to switch the current player
    const switchPlayer = () => {
        _currentPlayer = _currentPlayer === _player1 ? _player2 : _player1
    }

    // Function to get the current player
    const getCurrentPlayer = () => _currentPlayer

    // Winning combinations
    const combinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

    // Function to check if a player has won
    function winning(board, player) {
        for (let i = 0; i < combinations.length; i++) {
            if(board[combinations[i][0]] === player.marker && 
                board[combinations[i][1]] === player.marker &&
                board[combinations[i][2]] === player.marker){
                return true
                }
            }
        return false
    }

    // Function to check for a win or tie
    /// Lucero - I added the getWinIndexes function to get the winning indexes
    const checkWin = (player) => {
        let winCombination = null;
    
        // Check all win combinations
        for (let i = 0; i < combinations.length; i++) {
            const [a, b, c] = combinations[i];
            if (Gameboard.board[a] === player.marker && 
                Gameboard.board[b] === player.marker &&
                Gameboard.board[c] === player.marker) {
                winCombination = combinations[i];
                winner = player;
                finishGame(`${winner.name} wins!`);
                getWinIndexes(a, b, c);
                break;
            }
        }
    
        // Check for a tie
        if (!winCombination && Gameboard.board.every(mark => mark !== "") && !isFinished) {
            isTie = true;
            finishGame("Game is a tie!");
        }
    
        // Re-render the game state
        ScreenController.render();
    };
    
    // Function to get the winning indexes
    let getWinIndexes = (a, b, c) => {
        winArr = [a,b,c]
    }

    // Initialize game state variables
    let msg
    let winner
    let isTie = false
    let winArr
    let computerPlays = false

    // Function to finish the game with a message
    const finishGame = (message) => {
        isFinished = true
        msg = message
    }

    // Function to check the game mode
    const checkGameMode = () => gameMode

    // Function to check if it's the computer's turn
    const checkComputerTurn = () => computerPlays

    // Function to get the winner
    const getWinner = () => isTie ? isTie : winner

    // Function to get the winning indexes
    const getWinArr = () => winArr

    // Function to check if the game is a tie
    const checkTieStatus = () => isTie

    // Function to get the game message
    const getMessage = () => msg

    // Function to clear the game message
    const clearMessage = () => msg = ""

    // Function to check if the game is finished
    const checkFinished = () => isFinished

    // Function to restart the game
    const restartGame = () => {
        for(let i = 0 ; i < Gameboard.board.length; i ++){
            Gameboard.board[i] = ""
        }
        isFinished = false
        isTie = false
    }

    // Return the game functions and variables to make them accessible
    return { playerOneMarker, playerTwoMarker, checkGameMode, checkComputerTurn, playTurn, checkFinished, checkWin, restartGame, getWinner, getWinArr, checkTieStatus, getMessage, clearMessage }
}

// Screen controller module
const ScreenController = (() => {
    // Get DOM elements
    const container = document.getElementById("game-board");
    const result = document.querySelector(".result");
    let game = Game();
    let boardCreated = false;

    // Function to create the game board
    const createBoard = () => {
        for (let i = 0; i < 9; i++) {
            const square = document.createElement("div");
            square.classList.add("square");
            container.append(square);
        }
        // Apply new border styles and colors
        container.childNodes[0].classList.add("tl-border");
        container.childNodes[1].classList.add("t-border");
        container.childNodes[2].classList.add("tr-border");
        container.childNodes[3].classList.add("l-border");
        container.childNodes[5].classList.add("r-border");
        container.childNodes[6].classList.add("bl-border");
        container.childNodes[7].classList.add("b-border");
        container.childNodes[8].classList.add("br-border");
        render();
        boardCreated = true;
    };

    // Function to render the game board
    const render = () => {
        removeColors(); // Remove previous colors
        Gameboard.board.forEach((marker, index) => {
            container.childNodes[index].textContent = marker;
            // Add new marker colors
            if (Gameboard.board[index] === game.playerOneMarker) container.childNodes[index].classList.add("pink");
            if (Gameboard.board[index] === game.playerTwoMarker) container.childNodes[index].classList.add("purple");
        });
        if (game.checkFinished()) {
            if (game.checkTieStatus() === false) game.getWinArr().forEach(index => container.childNodes[index].classList.add("squareWin"));
            result.textContent = `${game.getMessage()}`;
            if (game.getWinner() === true) result.style.color = "rgb(29, 66, 118)";
            if (game.getWinner().marker === game.playerOneMarker) result.classList.add("pink");
            if (game.getWinner().marker === game.playerTwoMarker) result.classList.add("purple");
        } else {
            result.textContent = `${game.clearMessage()}`;
        }
    };

    // Function to remove colors from the game board
    const removeColors = () => {
        container.childNodes.forEach(square => {
            square.classList.remove("pink");
            square.classList.remove("purple");
            result.classList.remove("pink");
            result.classList.remove("purple");
            result.style.color = "";
            square.classList.remove("squareWin");
        });
    };

    // Event listeners
    const startBtn = document.getElementById("btn-start");
    const startBotBtn = document.getElementById("btn-start-bot");
    const startBotHardBtn = document.getElementById("btn-start-bot-hard");
    const restartBtn = document.getElementById("btn-restart");
    const exitBtn = document.getElementById("btn-exit");
    const title = document.querySelector(".title");
    const pvpTitle = document.querySelector(".pvp-title");
    const players = document.querySelector(".players");
    const markerSelectX = document.querySelector("#markerX");
    const markerSelectO = document.querySelector("#markerO");
    const markerSelectX2 = document.querySelector(".markerX-2");
    const markerSelectO2 = document.querySelector(".markerO-2");

    // Marker selection event listeners
    markerSelectO.addEventListener("click", () => markerSelectX2.checked = true);
    markerSelectX.addEventListener("click", () => markerSelectO2.checked = true);
    markerSelectO2.addEventListener("click", () => markerSelectX.checked = true);
    markerSelectX2.addEventListener("click", () => markerSelectO.checked = true);

    // Start button event listener
    startBtn.addEventListener("click", () => {
        toggleButtons();
        game = Game("PVP");
        if (boardCreated === false) createBoard();
    });

    // Start bot button event listener
    startBotBtn.addEventListener("click", () => {
        toggleButtons();
        game = Game("PVC");
        if (boardCreated === false) createBoard();
        if (game.playerOneMarker === "O") game.playTurn();
    });

    // Start hard bot button event listener
    startBotHardBtn.addEventListener("click", () => {
        toggleButtons();
        game = Game("PVC-hard");
        if (boardCreated === false) createBoard();
        if (game.playerOneMarker === "O") game.playTurn();
    });

    // Function to toggle button visibility
    const toggleButtons = () => {
        startBtn.classList.toggle("hidden");
        startBotBtn.classList.toggle("hidden");
        startBotHardBtn.classList.toggle("hidden");
        container.classList.toggle("hidden");
        restartBtn.classList.toggle("hidden");
        exitBtn.classList.toggle("hidden");
        title.classList.toggle("hidden");
        pvpTitle.classList.toggle("hidden");
        players.classList.toggle("hidden");
    };

    // Restart button event listener
    restartBtn.addEventListener("click", () => {
        if (game.checkGameMode() === "PVP") game = Game("PVP");
        if (game.checkGameMode() === "PVC") game = Game("PVC");
        if (game.checkGameMode() === "PVC-hard") game = Game("PVC-hard");
        game.restartGame();
        render();
        removeColors();
        if (game.checkGameMode() === "PVC" && game.playerOneMarker === "O") game.playTurn();
        if (game.checkGameMode() === "PVC-hard" && game.playerOneMarker === "O") game.playTurn();
    });

    // Exit button event listener
    exitBtn.addEventListener("click", () => {
        game.restartGame();
        toggleButtons();
        render();
        removeColors();
    });

    // Game board click event listener
    container.addEventListener("click", (e) => {
        let squareIndex = Array.from(container.childNodes).indexOf(e.target);
        if (Gameboard.board[squareIndex] === "" && game.checkFinished() === false && game.checkComputerTurn() === false) {
            game.playTurn(squareIndex);
        }
    });

    // Return the render function to make it accessible
    return { render };
})();