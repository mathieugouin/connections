// Connections javascript

var BOARD_SIZE = 11;

var moves = [];
var played_img = [];

var stone_h = []; // horizontal
var stone_v = []; // vertical

var board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

var win_mark = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

var player_1_auto = false;
var player_2_auto = false;

// TBD MGouin: Still not working yet...
var won = false;

var my_timer = setInterval(check_auto_play, 500);

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
    
    moves.push(100 * row + col);
    print_solution();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

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
    if (is_current_player_auto() && moves.length < Math.ceil(BOARD_SIZE * BOARD_SIZE / 2)) {
        auto_play();
    }
}

function click_handler(row, col) {
    return function () {
        console.info("click on " + row + " " + col);
        if (!is_current_player_auto()) {
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

function drop(img, row, col) {
    img.css("left", (-1 * 100.0 / BOARD_SIZE) + '%');
    if (getCurrentPlayerNumber() == 1) {
        img.css("top",  (-1 * 100.0 / BOARD_SIZE) + '%');
    } else {
        img.css("top",  (100.0) + '%');
    }
    
    img.show();

    img.animate(
        {
            top:  ((BOARD_SIZE - 1 - row) * 100 / BOARD_SIZE) + '%',
            left: (col * 100 / BOARD_SIZE) + '%'
        },
        400,  // ms
        "linear"
    );
}

function print_solution() {
    update_next_player();
    return;
}

function back_handler() {
    if (moves.length > 0) {
        var combinedRowCol = moves.pop();
        var row = Math.floor(combinedRowCol / 100);
        var col = combinedRowCol % 100;
        console.info("back " + row + " " + col);

        played_img.pop().hide();

        board[row][col] = 0;  // mark board as empty

        if (won) {
            won = false;
        }

        if (is_current_player_auto()) {
            console.info("back again for auto player");
            back_handler();
        }

        print_solution();
    }
}

// New game button click handler
function new_handler() {
    moves = [];
    played_img = [];

    // TBD Reset board
    for (var i = 0; i < BOARD_SIZE; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = 0;
        }
    }

    won = false;
    $(".player1h").hide();
    $(".player1v").hide();
    $(".player2h").hide();
    $(".player2v").hide();
    $(".win").hide();
    print_solution();
}

function isOdd(x) {
    return x % 2 != 0;
}

function isEven(x) {
    return !isOdd(x);
}

function getPositionType(row, col) {
    if (isOdd(row) && isEven(col))
        return "board_pin_red";
    if (isEven(row) && isOdd(col))
        return "board_pin_white";
    return "board";
}

// Run only once at page load
function init() {
    for (var i = 0; i < BOARD_SIZE; i++) {
        for (var j = 0; j < BOARD_SIZE; j++) {
            var img = $("<div/>");
            var positionType = getPositionType(i, j);
            img.addClass(positionType);
            img.css("left", (j * 100 / BOARD_SIZE) + '%');
            img.css("top",  ((BOARD_SIZE - 1 - i) * 100 / BOARD_SIZE) + '%');
            if (positionType == "board") {
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
            img.css("left", (j * 100 / BOARD_SIZE) + '%');
            img.css("top",  ((BOARD_SIZE - 1 - i) * 100 / BOARD_SIZE) + '%');
            img.hide();
            img.appendTo("#board");

            win_mark[i][j] = img;
        }
    }

    print_solution();
}

function about_handler() {
    $("#about_div").fadeToggle();
}

function toggle_player1_handler() {
    if (player_1_auto) {
        $("#player_1").text("manual");
        player_1_auto = false;
    }
    else {
        $("#player_1").text("auto");
        //TBD MGouin: $("#player_2").text("manual");
        player_1_auto = true;
        //TBD MGouin: player_2_auto = false;
        print_solution();
    }
}

function toggle_player2_handler() {
    if (player_2_auto) {
        $("#player_2").text("manual");
        player_2_auto = false;
    }
    else {
        $("#player_2").text("auto");
        //TBD MGouin: $("#player_1").text("manual");
        player_2_auto = true;
        //TBD MGouin: player_1_auto = false;
        print_solution();
    }
}

$(window).on('load', function(){init();});
