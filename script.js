// Connections javascript

/********************************************************************************
 * Globals                                                                      *
 ********************************************************************************/

const BOARD_SIZE = 11;

var moves = [];  // list of position of moves, in order
var played_img = [];  // list of div images that were played, in order

// list of images chip available to play
var stone_h = []; // horizontal
var stone_v = []; // vertical

var board = new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(0));

var win_mark_img = new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(0));

var player_1_auto = false;
var player_2_auto = false;

// TBD MGouin: Still not working yet...
var won = false;


/********************************************************************************
 * Utilities                                                                    *
 ********************************************************************************/

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function isOdd(x) {
    return x % 2 != 0;
}

function isEven(x) {
    return !isOdd(x);
}

function positionToValue(row, col) {
    return 100 * row + col;
}

function valueToPosition(v) {
    var row = Math.floor(v / 100);
    var col = v % 100;
    return [row, col];
}

function getPositionType(row, col) {
    if (isOdd(row) && isEven(col))
        return 1;
    if (isEven(row) && isOdd(col))
        return 2;
    return 0;
}

function getCurrentPlayerNumber() {
    return 1 + moves.length % 2;
}

function is_current_player_auto() {
    if (getCurrentPlayerNumber() == 2) {
        return player_2_auto;
    } else {
        return player_1_auto;
    }
}

function canplay(row, col) {
    if (isOdd(row) && isEven(col))
        return false;
    if (isEven(row) && isOdd(col))
        return false;
    return board[row][col] == 0;
}

function is_board_full() {
    for (var i = 0; i < BOARD_SIZE; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] == 0) {
                return false;
            }
        }
    }
    return true;
}

/********************************************************************************
 * Initialization                                                               *
 ********************************************************************************/

function reset_board() {
    for (var i = 0; i < BOARD_SIZE; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = getPositionType(i, j);
        }
    }
}

// Run only once at page load
function init() {
    for (var i = 0; i < BOARD_SIZE; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            var img = $("<div/>");
            var positionType = getPositionType(i, j);
            
            var div_class = 'board';
            if (positionType == 1) {
                div_class = 'board_pin_red';
            } else if (positionType == 2) {
                div_class = 'board_pin_white';
            }

            img.addClass(div_class);
            img.css("top",  (i * 100 / BOARD_SIZE) + '%');
            img.css("left", (j * 100 / BOARD_SIZE) + '%');
            if (positionType == 0) {
                img.click(click_handler(i, j));
            }
            img.appendTo("#board");
        }
    }

    var orientation = ['h', 'v'];
    for (var i = 0; i < Math.ceil((BOARD_SIZE * BOARD_SIZE) / 2); i++) {
        for (var o of orientation) {
            var img = $("<div/>");
            if (i % 2 === 0)
                img.addClass("player1" + o);
            else
                img.addClass("player2" + o);
            img.hide();
            img.appendTo("#board");
            if (o == 'h')
                stone_h[i] = img;
            else
                stone_v[i] = img;
        }
    }
      
    // Winner mark
    for (var i = 0; i < BOARD_SIZE; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            var img = $("<div/>");
            img.addClass('win');
            img.css("top",  (i * 100 / BOARD_SIZE) + '%');
            img.css("left", (j * 100 / BOARD_SIZE) + '%');
            img.hide();
            img.appendTo("#board");

            win_mark_img[i][j] = img;
        }
    }

    reset_board();
    refresh_ui();

    // TBD periodically check if auto player can play.  Not sure this is best logic...
    var my_timer = setInterval(check_auto_play, 500);
}


/********************************************************************************
 * Button Handlers                                                              *
 ********************************************************************************/

function about_handler() {
    console.info("about_handler()");
    $("#about_div").fadeToggle();
}

// New game button click handler
function new_handler() {
    console.info("new_handler()");
    moves = [];
    played_img = [];

    reset_board();

    won = false;
    $(".player1h").hide();
    $(".player1v").hide();
    $(".player2h").hide();
    $(".player2v").hide();
    $(".win").hide();
    refresh_ui();
}

function back_handler() {
    console.info("back_handler()");
    if (moves.length > 0) {
        var combinedRowCol = moves.pop();
        var row = combinedRowCol[0];
        var col = combinedRowCol[1];
        console.info("back " + row + " " + col);

        played_img.pop().hide();

        board[row][col] = 0;  // mark board as empty

        if (won) {
            won = false;
            $(".win").hide();
        }

        if (is_current_player_auto()) {
            console.info("back again for auto player");
            back_handler();
        }

        refresh_ui();
    }
}

function toggle_player1_handler() {
    console.info("toggle_player1_handler()");
    if (player_1_auto) {
        $("#player_1").text("manual");
        player_1_auto = false;
    }
    else {
        $("#player_1").text("auto");
        //TBD MGouin: $("#player_2").text("manual");
        player_1_auto = true;
        //TBD MGouin: player_2_auto = false;
        refresh_ui();
    }
}

function toggle_player2_handler() {
    console.info("toggle_player2_handler()");
    if (player_2_auto) {
        $("#player_2").text("manual");
        player_2_auto = false;
    }
    else {
        $("#player_2").text("auto");
        //TBD MGouin: $("#player_1").text("manual");
        player_2_auto = true;
        //TBD MGouin: player_1_auto = false;
        refresh_ui();
    }
}


/********************************************************************************
 * Win logic                                                                    *
 ********************************************************************************/

// posList in combined value format
function displayWinMark(posList) {
    for (var posValue of posList) {
        var pos = valueToPosition(posValue);
        win_mark_img[pos[0]][pos[1]].show();
    }
}

/*
Reference:
https://www.redblobgames.com/pathfinding/a-star/introduction.html
*/
function checkWinGenericEndToEnd(horizontal) {
    var winnerFound = false;
    var row = 0;
    var col = 0;
    for (var i = 0; i < BOARD_SIZE && !winnerFound; i++) {
        if (horizontal) {
            // On the left column, check all row
            row = i;
        } else {
            // On the top row, check all column
            col = i;
        }

        if (board[row][col] != 0) {  // A player already played there
            var start = positionToValue(row, col);
            var posToTry = [];  // In combined value for search to work
            posToTry.push(start);  // Start here

            var cameFrom = {};  // In combined value for search to work
            cameFrom[start] = -1; // none

            while (posToTry.length > 0) {
                var currentPosValue = posToTry.shift();
                var currentPos = valueToPosition(currentPosValue);

                // early exit logic
                if (
                        currentPos[1] == BOARD_SIZE - 1 && horizontal ||   // col ([1]) reached the right of the board
                        currentPos[0] == BOARD_SIZE - 1 && !horizontal     // row ([0]) reached the bottom of the board
                    ) {
                    winnerFound = true;

                    // get the winning path
                    var earlyExit = false;
                    var path = [];
                    while (currentPosValue != start) {
                        path.push(currentPosValue);
                        currentPos = valueToPosition(currentPosValue);
                        if (
                                currentPos[1] == 0 && horizontal ||   // col ([1]) reached the left of the board
                                currentPos[0] == 0 && !horizontal     // row ([0]) reached the top of the board
                            ) {
                            earlyExit = true;
                            break;
                        }
                        currentPosValue = cameFrom[currentPosValue];
                    }
                    if (!earlyExit) {
                        path.push(start);
                    }
                    displayWinMark(path);

                    break;
                }

                for (var neighbor of get_neighbors(currentPos[0], currentPos[1])) {
                    var neighborValue = positionToValue(neighbor[0], neighbor[1]);
                    // Prevent duplicated tries
                    if (!(neighborValue in cameFrom)) {
                        posToTry.push(neighborValue);
                        cameFrom[neighborValue] = currentPosValue;
                    }
                }
            }
        }
    }
    return winnerFound;
}

function checkWinLoop() {
    var winnerFound = false;

    var positionTried = new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(0));

    // We need to scan the whole board
    for (var i = 0; i < BOARD_SIZE && !winnerFound; i++) {
        for (var j = 0; j < BOARD_SIZE && !winnerFound; j++) {

            // A player played there and we never tried this position
            if (board[i][j] != 0 && positionTried[i][j] == 0) {
                var start = positionToValue(i, j);
                var posToTry = [];  // In combined value for search to work
                posToTry.push(start);  // Start here
                positionTried[i][j] = 1;

                var cameFrom = {};  // In combined value for search to work
                cameFrom[start] = -1; // none

                while (posToTry.length > 0 && !winnerFound) {
                    var currentPosValue = posToTry.shift();
                    var currentPos = valueToPosition(currentPosValue);

                    for (var neighbor of get_neighbors(currentPos[0], currentPos[1])) {
                        var neighborValue = positionToValue(neighbor[0], neighbor[1]);
                        // Prevent duplicated tries
                        if (!(neighborValue in cameFrom)) {
                            posToTry.push(neighborValue);
                            positionTried[neighbor[0]][neighbor[1]] = 1;
                            cameFrom[neighborValue] = currentPosValue;
                        } else if (neighborValue != cameFrom[currentPosValue]) {
                            winnerFound = true;

                            // TBD refactor?
                            // TBD create path from here
                            // start from both:
                            // - currentPosValue
                            // - neighborValue
                            {
                                // get the winning path
                                var path = [];
                                while (currentPosValue != -1) {
                                    path.push(currentPosValue);
                                    currentPos = valueToPosition(currentPosValue);
                                    currentPosValue = cameFrom[currentPosValue];
                                }
                                displayWinMark(path);
                            }
                            currentPosValue = neighborValue;
                            {
                                // get the winning path
                                var path = [];
                                while (currentPosValue != -1) {
                                    path.push(currentPosValue);
                                    currentPos = valueToPosition(currentPosValue);
                                    currentPosValue = cameFrom[currentPosValue];
                                }
                                displayWinMark(path);
                            }

                            break;
                        }
                    }
                }
            }

        }
    }
    return winnerFound;
}

function checkWin() {
    won = checkWinGenericEndToEnd(true) || checkWinGenericEndToEnd(false) || checkWinLoop();
}


/********************************************************************************
 * Auto Play                                                                    *
 ********************************************************************************/

// Crude random auto player
function auto_play() {
    var row;
    var col;
    do {
        row = getRandomInt(BOARD_SIZE);
        col = getRandomInt(BOARD_SIZE);
    } while (!canplay(row, col))
    play(row, col);
}

function check_auto_play() {
    if (is_current_player_auto() && !is_board_full() && !won) {
        auto_play();
    }
}

function get_neighbors(row, col) {
    var n = [];
    var p = board[row][col];
    if (p != 0) {
        // left
        if (col > 0 && board[row][col - 1] == p)
            n.push([row, col - 1])
        // right
        if (col < BOARD_SIZE - 1 && board[row][col + 1] == p)
            n.push([row, col + 1])
        // up
        if (row > 0 && board[row - 1][col] == p)
            n.push([row - 1, col])
        // down
        if (row < BOARD_SIZE - 1 && board[row + 1][col] == p)
            n.push([row + 1, col])
    }
    return n;
}

/********************************************************************************
 * General Play                                                                 *
 ********************************************************************************/

function drop(img, row, col) {
    img.css("left", (-1 * 100.0 / BOARD_SIZE) + '%');
    if (getCurrentPlayerNumber() == 1) {
        img.css("top",  '0%');
    } else {
        img.css("top",  ((BOARD_SIZE - 1) * 100.0 / BOARD_SIZE) + '%');
    }
    
    img.show();

    img.animate(
        {
            'top' : (row * 100 / BOARD_SIZE) + '%',
            'left': (col * 100 / BOARD_SIZE) + '%'
        },
        400,  // ms
        "linear"
    );
}

function play(row, col) {
    // place the player number (1 or 2) at the position
    board[row][col] = getCurrentPlayerNumber();
    var img;
    if (isEven(row) && isEven(col) && getCurrentPlayerNumber() == 1 ||
        isOdd(row) && isOdd(col) && getCurrentPlayerNumber() == 2) {
        // Drop vertical chip
        img = stone_v[moves.length];
    } else {
        // Drop horizontal chip
        img = stone_h[moves.length];
    }
    drop(img, row, col);
    played_img.push(img);
    
    moves.push([row, col]);

    checkWin();

    refresh_ui();
}

function click_handler(row, col) {
    return function () {
        console.info("click on " + row + " " + col);
        if (!is_current_player_auto() && !won) {
            if (canplay(row, col)) {
                play(row, col);
            } else {
                console.warn("canot play on " + row + " " + col);
            }
        }
    };
}

function update_next_player() {
    if (won) {
        $("#player_1").removeClass("active").addClass("inactive");
        $("#player_2").removeClass("active").addClass("inactive");
    }
    else if (getCurrentPlayerNumber() == 1) {
        $("#player_1").removeClass("inactive").addClass("active");
        $("#player_2").removeClass("active").addClass("inactive");
    }
    else {
        $("#player_1").removeClass("active").addClass("inactive");
        $("#player_2").removeClass("inactive").addClass("active");
    }
}

function refresh_ui() {
    update_next_player();
}

$(window).on('load', function(){init();});
