let canvas;
let ctx;

// DIRECTIONS
const UP = 1;
const DOWN = 2;
const LEFT = 3;
const RIGHT = 4;

// GAME SETTINGS
const DIRECTION = UP;
const BLOCK_RESOLUTION = 16;
const SAFE_ZONE = 10;
const KILL_ZONE = 19;

const PLAY_AREA = KILL_ZONE + 2 * SAFE_ZONE;

const SIZE = BLOCK_RESOLUTION * PLAY_AREA;

// BOARD IDS
const EMPTY = 0;
const BLACK = 1;

let BOARD = new Array(PLAY_AREA).fill(0).map(() => new Array(PLAY_AREA).fill(0));

BOARD[Math.floor(PLAY_AREA/2)][Math.floor(PLAY_AREA/2)] = BLACK
/*BOARD[Math.ceil(PLAY_AREA/2 + 1)][Math.ceil(PLAY_AREA/2) - 1] = BLACK
BOARD[Math.ceil(PLAY_AREA/2 + 1)][Math.ceil(PLAY_AREA/2) - 2] = BLACK*/

const BASE_SPEED = 3
let speed = BASE_SPEED

// PIECE IDS
const IPIECE = 2;
const JPIECE = 3;
const LPIECE = 4;
const OPIECE = 5;
const SPIECE = 6;
const TPIECE = 7;
const ZPIECE = 8;

// PIECES
const START_LOCATION = [Math.floor(PLAY_AREA/2) - 1, 0]

const iPiece = {
    id: IPIECE,
    shape: [[0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],],
    location: START_LOCATION,
    fill: "deepskyblue",
    border: "cornflowerblue",
    origin: [3, 1]};

const jPiece = {
    id: JPIECE,
    shape: [[0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]],
    location: START_LOCATION,
    fill: "blue",
    border: "darkblue",
    origin: [1, 1]};

const lPiece = {
    id: LPIECE,
    shape: [[0, 0, 0],
            [1, 1, 1],
            [0, 0, 1]],
    location: START_LOCATION,
    fill: "orange",
    border: "orangered",
    origin: [0, 1]};

const oPiece = {
    id: OPIECE,
    shape: [[1, 1],
            [1, 1]],
    location: START_LOCATION,
    fill: "yellow",
    border: "gold",
    origin: [0, 0]};

const sPiece = {
    id: SPIECE,
    shape: [[0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]],
    location: START_LOCATION,
    fill: "lime",
    border: "green",
    origin: [0, 1]};

const tPiece = {
    id: TPIECE,
    shape: [[0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]],
    location: START_LOCATION,
    fill: "purple",
    border: "darkmagenta",
    origin: [1, 1]};

const zPiece = {
    id: ZPIECE,
    shape: [[1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]],
    location: START_LOCATION,
    fill: "red",
    border: "darkred",
    origin: [1, 1]};

const pieces = [iPiece, jPiece, lPiece, oPiece, sPiece, tPiece, zPiece];

let moving

// TIMERS
let timer = Date.now();
let lockTimer = Date.now();

window.addEventListener("load", () => {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    ctx.imgeSmoothingEnabled = false;

    canvas.width = SIZE;
    canvas.height = SIZE;

    canvas.style.background = "gray"

    window.requestAnimationFrame(gameLoop)
});

window.addEventListener("keydown", (e) => {
    if (e.key == "ArrowLeft") {
        moving.location[0]--;
        if (intersects()) {
            moving.location[0]++;
        }
    }
    else if (e.key == "ArrowRight") {
        moving.location[0]++;
        if (intersects()) {
            moving.location[0]--;
        }
    }
    else if (e.key == "ArrowUp" ||e.key == "x") {
        //moving.rotation < 3? moving.rotation++ : moving.rotation = 0;
        let oldShape = JSON.parse(JSON.stringify(moving.shape));
        moving.shape = rotate(moving.shape, 1, "clockwise");
        if (intersects()) {
            console.log("intersect when rotating!!!");
            if (!canMoveDown()) {
                moving.location[1]--;
                if (intersects()) { 
                    moving.location[1]++;
                    moving.shape = oldShape;
                }
            } else {
                moving.shape = oldShape;
            }
        }

        if (moving.shape != oldShape) {
            lockTimer = Date.now();
        }
    }
    else if (e.key == "ArrowDown") {
        speed = BASE_SPEED * 4;
    }
    else if (e.key == " ") {
        hardDrop();
    }
    else if (e.key == "Escape") {
        window.location.reload();
    }
    
    // DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG DEBUG 
    else if (e.key == "d") {
        BOARD = rotate(BOARD, 1, "clockwise");
        window.requestAnimationFrame(gameLoop);
    }
})

window.addEventListener("keyup", (e) => {
    if (e.key == "ArrowDown") {
        speed = BASE_SPEED;
    }
})


const gameLoop = () => {
    if (!ctx) window.requestAnimationFrame(gameLoop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!moving) {
        moving = JSON.parse(JSON.stringify(pieces[Math.floor(Math.random() * pieces.length)]));
    }
    
    drawBoard(); 
    //drawPieces();
    drawZone();
    drawMoving();

    const time = Date.now();
    const deltaTime = time - timer;
    const lockDeltaTime = time - lockTimer;

    if (deltaTime > 1000 / speed) {
        timer = Date.now();
        if (canMoveDown()) {
            moving.location[1]++;
        } else {
            if (lockDeltaTime > 1000) {
                console.log("BOARD IS: " + BOARD.length + " x " + BOARD[0].length);
                if (!canMoveDown()) {
                    placePiece();
                }
            }
        }
    }

    window.requestAnimationFrame(gameLoop);
}

function rotate(matrix, count, direction = 'counterclockwise') {
    const rows = matrix.length, cols = matrix[0].length;
    const size = Math.max(rows, cols);
    const grid = [];
    for (let j = 0; j < size; j++) {
        grid[j] = Array(size).fill(0);
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let x = i, y = j;
            for (let k = 0; k < count; k++) {
                if (direction === 'clockwise') {
                    [x, y] = [size - y - 1, x];
                } else {
                    [x, y] = [y, size - x - 1];
                }
            }
            grid[x][y] = matrix[i][j];
        }
    }
    return grid;
}

const canMoveDown = () => {
    //console.log(moving.shape);

    for (let i = 0; i < moving.shape.length; i++) {
        for (let j = 0; j < moving.shape[0].length; j++) {
            if (moving.shape[i][j] == 1) {
                let x = moving.location[0] + i + 1;
                let y = moving.location[1] + j + 1;
                if (BOARD[x][y + 1] != EMPTY) {
                    return false;
                }
            }
        }
    }
    return true;
}

const intersects = () => {
    for (let i = 0; i < moving.shape.length; i++) {
        for (let j = 0; j < moving.shape[0].length; j++) {
            if (moving.shape[i][j] == 1) {
                let x = moving.location[0] + i + 1;
                let y = moving.location[1] + j + 1;
                //console.log(BOARD[x][y])
                if (BOARD[x][y] != EMPTY) {
                    return true;
                }
            }
        }
    }
    return false;
}

const hardDrop = () => {
    while (canMoveDown()) {
        moving.location[1]++;
    }
    placePiece();
}

const placePiece = () => {
    for (let i = 0; i < moving.shape.length; i++) {
        for (let j = 0; j < moving.shape[0].length; j++) {
            if (moving.shape[i][j] == 1) {
                let x = moving.location[0] + i + 1;
                let y = moving.location[1] + j + 1;
                if (BOARD[x][y] != EMPTY) {
                    window.location.reload()   //GAME OVER
                } else {
                    BOARD[x][y] = moving.id;
                } 
            }
        }
    }
    moving = null;
    //BOARD = rotate(BOARD, 1, "clockwise");  
    checkLines();
    window.requestAnimationFrame(gameLoop);
}

const checkLines = () => {

    completeLines = [];

    for (let x = SAFE_ZONE; x < SAFE_ZONE + KILL_ZONE; x++) {

        // Horizontal lines
        if (BOARD[SAFE_ZONE][x] != EMPTY && BOARD[SAFE_ZONE + KILL_ZONE - 1][x] != EMPTY) {
            let complete = true;
            for (let block = SAFE_ZONE; block < SAFE_ZONE + KILL_ZONE - 1; block++) {
                if (BOARD[block][x] == EMPTY) {
                    complete = false;
                    break;
                }
            }
            if (complete) {
                console.log("LINE COMPLETED!" );
                for (let block = 0; block < PLAY_AREA; block++) {
                    if (BOARD[block][x] != BLACK) {
                        BOARD[block][x] = EMPTY;
                    }
                }
                completeLines.push(['x', x])
            }
        } else {
            console.log(BOARD[SAFE_ZONE][x] + " " + BOARD[SAFE_ZONE + KILL_ZONE - 1][x]);
        }

        // Vertical lines
        if (BOARD[x][SAFE_ZONE] != EMPTY && BOARD[x][SAFE_ZONE + KILL_ZONE - 1] != EMPTY) {
            let complete = true;
            for (let block = SAFE_ZONE; block < SAFE_ZONE + KILL_ZONE - 1; block++) {
                if (BOARD[x][block] == EMPTY) {
                    complete = false;
                    break;
                }
            }
            if (complete) {
                console.log("LINE COMPLETED!" );
                for (let block = 0; block < PLAY_AREA; block++) {
                    if (BOARD[x][block] != BLACK) {
                        BOARD[x][block] = EMPTY;
                    }
                }
                completeLines.push(['y', x])
            }
        }
    }
    if (completeLines.length > 0) {
        console.log("COMPLETED: ");
        console.log(completeLines);
    }
    
}

/*  kill-zone border:
    BOARD[SAFE_ZONE][x] = BLACK;
    BOARD[SAFE_ZONE + KILL_ZONE - 1][x] = BLACK
    BOARD[x][SAFE_ZONE] = BLACK;
    BOARD[x][SAFE_ZONE + KILL_ZONE - 1] = BLACK
*/

const drawBoard = () => {
    ctx.lineWidth = 2;
    for (let x = 0; x < PLAY_AREA; x++) {
        for (let y = 0; y < PLAY_AREA; y++) {
            const id = BOARD[x][y];

            //console.log(color);
            if (id == EMPTY) {
                ctx.strokeStyle = "rgb(120,120,120)";
                ctx.strokeRect(BLOCK_RESOLUTION + x * BLOCK_RESOLUTION, BLOCK_RESOLUTION +  y * BLOCK_RESOLUTION, BLOCK_RESOLUTION +  x * BLOCK_RESOLUTION + BLOCK_RESOLUTION, BLOCK_RESOLUTION +  y * BLOCK_RESOLUTION + BLOCK_RESOLUTION);
            }
            else if (id == BLACK) {
                ctx.fillStyle = "black";
                ctx.fillRect( BLOCK_RESOLUTION + x * BLOCK_RESOLUTION - BLOCK_RESOLUTION, BLOCK_RESOLUTION +  y * BLOCK_RESOLUTION - BLOCK_RESOLUTION, BLOCK_RESOLUTION, BLOCK_RESOLUTION)
                //console.log(BOARD);
            }
            else {
                const piece = pieces.filter((n) => n.id == id)[0];
                ctx.fillStyle = piece.fill;
                ctx.strokeStyle = piece.border;
                ctx.fillRect(BLOCK_RESOLUTION + x * BLOCK_RESOLUTION - BLOCK_RESOLUTION, BLOCK_RESOLUTION + y * BLOCK_RESOLUTION - BLOCK_RESOLUTION, BLOCK_RESOLUTION, BLOCK_RESOLUTION)
            }
        }
    }
}

const drawZone = () => {
    ctx.strokeStyle = "rgba(50,50,50, .25)";
    ctx.lineWidth = 3;
    ctx.strokeRect(SAFE_ZONE * BLOCK_RESOLUTION, SAFE_ZONE * BLOCK_RESOLUTION, (SIZE - (2 * SAFE_ZONE) * BLOCK_RESOLUTION), (SIZE - (2 * SAFE_ZONE) * BLOCK_RESOLUTION));
}

const drawMoving = () => {
    let shape = moving.shape
    //shape = rotate(shape, moving.rotation, moving.origin);

    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] == 1) {
                drawBlock(ctx, moving, i, j);
            } else {
                if (i == 0 && j == 0) {
                    ctx.strokeStyle = "black";
                    ctx.strokeRect(BLOCK_RESOLUTION + moving.location[0] * BLOCK_RESOLUTION + i * BLOCK_RESOLUTION + 1,BLOCK_RESOLUTION +  moving.location[1] * BLOCK_RESOLUTION + j * BLOCK_RESOLUTION + 1, BLOCK_RESOLUTION - 2, BLOCK_RESOLUTION - 2);
                } 
            }
        }
    }
}


const drawBlock = (ctx, piece, i, j) => {
    ctx.lineWidth = 2
    ctx.fillStyle = piece.fill;
    ctx.strokeStyle = piece.border;
    ctx.fillRect(BLOCK_RESOLUTION + piece.location[0] * BLOCK_RESOLUTION + i * BLOCK_RESOLUTION, BLOCK_RESOLUTION + piece.location[1] * BLOCK_RESOLUTION + j * BLOCK_RESOLUTION, BLOCK_RESOLUTION, BLOCK_RESOLUTION)
    ctx.strokeRect(BLOCK_RESOLUTION + piece.location[0] * BLOCK_RESOLUTION + i * BLOCK_RESOLUTION + 1, BLOCK_RESOLUTION + piece.location[1] * BLOCK_RESOLUTION + j * BLOCK_RESOLUTION + 1, BLOCK_RESOLUTION - 2, BLOCK_RESOLUTION - 2)
}


  
  



