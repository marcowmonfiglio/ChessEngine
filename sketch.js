let black;
let white;
let brown;
let red;
let masterBoard = [];
let currentBoard = masterBoard;
let blankTestBoard = [];
let pieces = [];
let boardX;
let boardY;
let newMX;
let newMY;
let move = [];
let gameHistory = [];
let turnCounter = 0;
let squares = {"A": 0, "B": 50, "C": 100, "D": 150, "E": 200, "F": 250, "G": 300, "H": 350,
               "8": 0, "7": 50, "6": 100, "5": 150, "4": 200, "3": 250, "2": 300, "1": 350};

let notationList= ["a", "b", "c", "d", "e", "f", "g", "h", "8", "7", "6", "5", "4", "3", "2", "1"];

function setup(){
  black = color(0,0,0);
  white = color(255,255,255);
  beige = color(247, 208, 153);
  brown = color(138, 81, 1);
  red = color(255,0,0);
  boardX = displayWidth/2 - 200;
  boardY = displayHeight/2 - 250;
  createCanvas(displayWidth,displayHeight);
  noStroke();
  background(150);
  setupPieces();
  setupBoard();
  update();
  //console.log(currentBoard);
}

function mousePressed() {
  roundCoords();
  if (move.length != 0) {
    play();
  }
  update();
}

function play() {
  if (move.length == 1) {
    checkEmptySquare();
  } else if (move.length == 2) {
    move[0].selected = false;
    if (legalMove(move) && safetyCheck(move)) { //MOVE PIECE
      logMove();
      logHistory();
      if (captureMove(move)) {
        pieces.splice((pieces.indexOf(move[1].piece)), 1);
      }
      turnCounter += 1;
      move[0].piece.moveCounter += 1;
      movePiece(move);
    }
    move = [];
  }
}

function logMove() {
  //console.log(move[0].notation + "-" + move[1].notation); //(SQUARE NOTATION)
  if (move[0].piece.type != "P") {
    if (captureMove(move)) {
      console.log(move[0].piece.type + "x" + move[1].notation);
    } else {
    console.log(move[0].piece.type + move[1].notation);
    }
  } else {
    if (captureMove(move)) {
      console.log(move[0].notX + "x" + move[1].notation);
    } else {
    console.log(move[1].notation);
    }
  }
}

function logHistory() {
  let newBoard = Array(64);
  arrayCopy(currentBoard, newBoard);
  gameHistory.push(newBoard);
  console.log(gameHistory);
}

function checkEmptySquare() {
  if (!(move[0].piece) || (whoseMove(turnCounter) != move[0].piece.color)) {
    move.pop();
  } else {
    move[0].selected = true;
  }
}

function whoseMove(turns) {
  if (turns % 2 == 0) {
    return white;
  } else {
    return black;
  }
}

function movePiece(currMove) {
  currMove[1].piece = currMove[0].piece;
  currMove[1].piece.x = currMove[1].x;
  currMove[1].piece.y = currMove[1].y;
  currMove[0].piece = null;
}

function legalMove(selectMove) { //NEW CONCEPT: CHANGE REFERRING BOARD
  let changeX = selectMove[1].x - selectMove[0].x;
  let changeY = selectMove[1].y - selectMove[0].y;
  if (selectMove[0] == selectMove[1]) { //SAME SQUARE - CANCEL MOVE
    return false;
  }
  if (selectMove[1].piece && selectMove[1].piece.color == selectMove[0].piece.color) { //SAME COLOR PIECE ON SQUARE
      return false;
  }
  let type = selectMove[0].piece.type
  if (type == "K") {
    return kingMove(changeX, changeY, selectMove);
  }
  if (type == "Q") {
    return queenMove(changeX, changeY, selectMove);
  }
  if (type == "R") {
    return rookMove(changeX, changeY, selectMove);
  }
  if (type == "B") {
    return bishopMove(changeX, changeY, selectMove);
  }
  if (type == "N") {
    return knightMove(changeX, changeY, selectMove);
  }
  if (type == "P") {
    return pawnMove(changeX, changeY, selectMove);
  }
}

function safetyCheck(selectMove) { //true means you are clear, false means still in check

  /* SECOND TEST OF SAFETYCHECK
  blankTestBoard = Array(64);
  arrayCopy(currentBoard, blankTestBoard);
  currentBoard = blankTestBoard;
  movePiece(selectMove);
  push();
  translate(414, -125);
  drawBoard();
  pop();
  currentBoard = masterBoard;
  return false;
  */

  ///* 1ST TEST OF SAFETYCHECK
  //blankBoard(blankTestBoard);
  arrayCopy(currentBoard, blankTestBoard);
  currentBoard = blankTestBoard;
  push();
  translate(414, -125);
  drawBoard();
  pop();
  currentBoard = masterBoard;
  return true;
  //*/

}

/*  returns true if a horizontal move, false if not  */
function horizontalMove(changeX, changeY) {
  if (changeY == 0) {
    if (abs(changeX) > 50) {
      return legalPass(changeX, changeY, "H");
    }
    return true;
  } else {
    return false;
  }
}

/*  returns true if a vertical move, false if not  */
function verticalMove(changeX, changeY) {
  if (changeX == 0) {
    if (abs(changeY) > 50) {
      return legalPass(changeX, changeY, "V");
    }
    return true;
  } else {
    return false;
  }
}

/*  returns true if a diagonal move, false if not  */
function diagonalMove(changeX, changeY) {
  if (abs(changeY) == abs(changeX)) {
    if (abs(changeX) > 50) {
      return legalPass(changeX, changeY, "D");
    }
    return true;
  } else {
    return false;
  }
}

function legalPass(changeX, changeY, direction) {
  let signX = changeX / abs(changeX);
  let loopX = abs(changeX) / 50;
  let signY = changeY / abs(changeY);
  let loopY = abs(changeY) / 50;

  if (direction == "H") {
    for (var i = 1; i < loopX; i += 1) {
      var incrementX = move[0].x + 50*i*signX;
      var checking = findSquare(incrementX, move[0].y);
      if (checking.piece) {
        return false;
      }
    }
    return true;
  }
  if (direction == "V") {
    for (var i = 1; i < loopY; i += 1) {
      var incrementY = move[0].y + 50*i*signY;
      var checking = findSquare(move[0].x, incrementY);
      if (checking.piece) {
        return false;
      }
    }
    return true;
  }
  if (direction == "D") {
    for (var i = 1; i < loopX; i += 1) {
      var incrementX = move[0].x + 50*i*signX;
      var incrementY = move[0].y + 50*i*signY;
      var checking = findSquare(incrementX, incrementY);
      if (checking.piece) {
        return false;
      }
    }
    return true;
  }
}

function captureMove(currMove) {
  if (currMove[1].piece) {
    return currMove[0].piece.color != currMove[1].piece.color;
  }
  return false;
}

function castleMove(currMove) {

}

/*  returns true if a legal king move, false if not   */
function kingMove(changeX, changeY, currMove) {
  if (abs(changeX) == 100 && changeY == 0) {
    //check for a castle move
    return false;
  } else {
    return (abs(changeX) <= 50 && abs(changeY) <= 50) && (horizontalMove(changeX, changeY) ||
    verticalMove(changeX, changeY) || diagonalMove(changeX, changeY));
  }
}

/*  returns true if a legal queen move, false if not  */
function queenMove(changeX, changeY, currMove) {
  return horizontalMove(changeX, changeY) ||
    verticalMove(changeX, changeY) || diagonalMove(changeX, changeY);
}

/*  returns true if a legal rook move, false if not  */
function rookMove(changeX, changeY, currMove) {
  return horizontalMove(changeX, changeY) || verticalMove(changeX, changeY);
}

/*  returns true if a legal bishop move, false if not  */
function bishopMove(changeX, changeY, currMove) {
  return diagonalMove(changeX, changeY);
}

/*  returns true if a legal knight move, false if not  */
function knightMove(changeX, changeY, currMove) {
  return (abs(changeX) == 100 && abs(changeY) == 50)
    || (abs(changeX) == 50 && abs(changeY) == 100);
}

/*  returns true if a legal pawn move, false if not  */
function pawnMove(changeX, changeY, currMove) {
  /*  if (capture() && !diagonalMove()) || (diagonalMove() && !capture()) {return false}  */
  /*  en passant */
  let pawn = currMove[0].piece;

  if (pawn.color == white && changeY > 0) { //WRONG DIRECTION
    return false;
  }
  if (pawn.color == black && changeY < 0) { //WRONG DIRECTION
    return false;
  }
  if (changeX != 0) { //NOT A PUSHED PAWN
    if (!captureMove(currMove)) { //NOT A CAPTURE
      return false;
    } else {
      if (!(abs(changeX) == 50)) { //NOT ONE COLUMN OVER
        return false;
      }
      if (!(abs(changeY) == 50)) { //NOT ONE ROW CAPTURE
        return false;
      }
    }
  } else {
    if (captureMove(currMove)) {
      return false;
    }
    if (pawn.moveCounter == 0) {
      return abs(changeY) <= 100;
    }
    if (pawn.moveCounter > 0) {
      return abs(changeY) == 50;
    }
  }
  return true;
}

function update() {
  push();
  translate(-114, -125);
  drawBoard();
  pop();
}

function roundCoords() {
  newMX = mouseX - 406;
  newMY = mouseY - 76;
  //console.log("(" + newMX + ", " + newMY + ")");
  let roundMX = newMX - newMX % 50;
  let roundMY = newMY - newMY % 50;
  if (newMX >= 0 && newMY >= 0) {
    let found = findSquare(roundMX, roundMY);
    if (found) {
    move.push(found);
    }
  }
}

function findSquare(coordX, coordY) {
  let search = [];
  for (var i = 0;  i < currentBoard.length; i += 1) {
    if (currentBoard[i].x == coordX) {
      search.push(currentBoard[i]);
    }
  }
  for (var j = 0;  j < search.length; j += 1) {
    if (search[j].y == coordY) {
      return search[j];
    }
  }
  return null;
}

function setupPieces() {
  //WHITE PIECES
  {
  var wRook1 = new Piece("R", white, "A1");
  var wKnight1 = new Piece("N", white, "B1");
  var wBishop1 = new Piece("B", white, "C1");
  var wQueen = new Piece("Q", white, "D1");
  var wKing = new Piece("K", white, "E1");
  var wBishop2 = new Piece("B", white, "F1");
  var wKnight2 = new Piece("N", white, "G1");
  var wRook2 = new Piece("R", white, "H1");
  }

  {
  var wPawn1 = new Piece("P", white, "A2");
  var wPawn2 = new Piece("P", white, "B2");
  var wPawn3 = new Piece("P", white, "C2");
  var wPawn4 = new Piece("P", white, "D2");
  var wPawn5 = new Piece("P", white, "E2");
  var wPawn6 = new Piece("P", white, "F2");
  var wPawn7 = new Piece("P", white, "G2");
  var wPawn8 = new Piece("P", white, "H2");
  }

  //BLACK PIECES
  {
  var bRook1 = new Piece("R", black, "A8");
  var bKnight1 = new Piece("N", black, "B8");
  var bBishop1 = new Piece("B", black, "C8");
  var bQueen = new Piece("Q", black, "D8");
  var bKing = new Piece("K", black, "E8");
  var bBishop2 = new Piece("B", black, "F8");
  var bKnight2 = new Piece("N", black, "G8");
  var bRook2 = new Piece("R", black, "H8");
  }
  {
  var bPawn1 = new Piece("P", black, "A7");
  var bPawn2 = new Piece("P", black, "B7");
  var bPawn3 = new Piece("P", black, "C7");
  var bPawn4 = new Piece("P", black, "D7");
  var bPawn5 = new Piece("P", black, "E7");
  var bPawn6 = new Piece("P", black, "F7");
  var bPawn7 = new Piece("P", black, "G7");
  var bPawn8 = new Piece("P", black, "H7");
  }

  //FIRST SET
  pieces.push(bRook1);
  pieces.push(bKnight1);
  pieces.push(bBishop1);
  pieces.push(bQueen);
  pieces.push(bKing);
  pieces.push(bBishop2);
  pieces.push(bKnight2);
  pieces.push(bRook2);

  //SECOND SET
  pieces.push(bPawn1);
  pieces.push(bPawn2);
  pieces.push(bPawn3);
  pieces.push(bPawn4);
  pieces.push(bPawn5);
  pieces.push(bPawn6);
  pieces.push(bPawn7);
  pieces.push(bPawn8);

  //THIRD SET
  pieces.push(wPawn1);
  pieces.push(wPawn2);
  pieces.push(wPawn3);
  pieces.push(wPawn4);
  pieces.push(wPawn5);
  pieces.push(wPawn6);
  pieces.push(wPawn7);
  pieces.push(wPawn8);

  //FOURTH SET
  pieces.push(wRook1);
  pieces.push(wKnight1);
  pieces.push(wBishop1);
  pieces.push(wQueen);
  pieces.push(wKing);
  pieces.push(wBishop2);
  pieces.push(wKnight2);
  pieces.push(wRook2);
}

function drawPieces(square) {
  if (square.piece != null) {
    square.piece.drawPiece();
  }
}

function setupBoard() {
  blankBoard(currentBoard);
  addPieces();
  logHistory();
}

function blankBoard(thisBoard) {
  let counter = 0;
  let color = beige;
  for (var i = 0; i < 8; i += 1) {
    for (var j = 0; j < 8; j += 1) {
      if (counter % 2 == 0) {
        color = beige
      } else {
        color = brown
      }
      var square = new Square(50*j, 50*i, 50, 50, color, null);
      thisBoard.push(square);
      counter += 1;
    }
    counter += 1;
  }
}

function addPieces() {
  //BLACK PIECES FIRST
  for (var i = 0; i < 16; i += 1) {
    currentBoard[i].piece = pieces[i];
  }
  //WHITE PIECES SECOND
  for (var i = 0; i < 16; i += 1) {
    currentBoard[currentBoard.length - 16 + i].piece = pieces[16 + i];
  }
}

function drawBoard() {
  push();
  translate(boardX, boardY)
  noStroke();
  fill(black);
  rect(-20, -20, 440, 440);
  currentBoard.forEach(drawEachSquare);
  pop();
  currentBoard.forEach(drawPieces);
}

function drawEachSquare(square){
  square.drawSquare()
}

class Square {

  constructor(x, y, width, height, color, piece) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.selected = false;
    this.piece = piece;
    this.notX = notationList[this.x / 50];
    this.notY = notationList[8 + this.y / 50];
    this.notation = this.notX + this.notY;
  }

  drawSquare() {
    if (this.selected) {
      red = color(255,0,0);
      fill(red);
    } else {
      fill(this.color);
    }
    rect(this.x, this.y, this.width, this.height);
  }
}

class Piece {

  constructor(type, color, square) {
    this.type = type;
    this.color = color;
    this.oppColor;
    this.x = squares[square.charAt(0)];
    this.y = squares[square.charAt(1)];
    this.translation;
    this.moveCounter = 0;

    if (this.color == white) {
      this.oppColor = black;
    } else {
      this.oppColor = white;
    }
  }

  drawPiece() {
    if (this.type == "K") {
      this.translation = [25, 20];
      push();
      translate(boardX + this.x + this.translation[0], boardY + this.y + this.translation[1]);
      scale(0.2);
      fill(this.color);
      stroke(this.oppColor);
      strokeWeight(5);
      bezier(0, 0, 100, -75, 150, 25, 50, 75);
      bezier(0, 0, -100, -75, -150, 25, -50, 75);
      bezier(0, -2, 25, -12, 25, -42, 0, -52);
      bezier(0, -2, -25, -12, -25, -42, 0, -52);
      noStroke();
      rect(-50, 0, 100, 75);
      stroke(this.oppColor);
      line(0, 0, 0, 65);
      line(0, -52, 0, -70);
      line(-10, -62, 10, -62);
      translate(-50, 75);
      noStroke();
      rect(0, 0, 100, 30);
      stroke(this.oppColor);
      bezier(0, 0, 20, -10, 80, -10, 100, 0);
      stroke(this.color);
      line(0, 0, 0, 30);
      line(100, 0, 100, 30);
      translate(0, 15);
      stroke(this.oppColor);
      bezier(0, 0, 20, -10, 80, -10, 100, 0);
      translate(0, 15);
      bezier(0, 0, 20, -10, 80, -10, 100, 0);
      bezier(0, 0, 20, 10, 80, 10, 100, 0);
      pop();

    } else if (this.type == "Q") {
      this.translation = [25, 6];
      push();
      translate(boardX + this.x + this.translation[0], boardY + this.y + this.translation[1]);
      scale(0.105);
      //translate(700, 300);
      let start = -160
      let diff = (-start - start)/5;

      {
      fill(this.color);
      noStroke();
      rect(start + 25, 200, 2 * (-start) - 50, 160);
      triangle(start, 200, start + 25, 200, start + 25, 250);
      triangle(-start, 200, -start - 25, 200, -start - 25, 250);
      triangle(start + 10, 360, start + 25, 365, start + 25, 310);
      triangle(-start - 10, 360, -start - 25, 365, -start - 25, 310);
      }

      {
      stroke(this.oppColor);
      strokeWeight(10);
      ellipse(0, 0, 40);
      ellipse(100, 20, 40);
      ellipse(-100, 20, 40);
      ellipse(200, 60, 40);
      ellipse(-200, 60, 40);
      bezier(start, 200, -100, 180, 100, 180, -start, 200);
      triangle(start, 200, -190, 91, start + diff, 190);
      triangle(start + diff, 190, -100, 55, start +2*diff, 185);
      triangle(start + 2*diff, 185, 0, 37, start + 3*diff, 185);
      triangle(start + 3*diff, 185, 100, 55, start +4*diff, 190);
      triangle(start + 4*diff, 190, 190, 91, -start, 200);
      bezier(start + 25, 270, -100, 250, 100, 250, -start - 25, 270);
      bezier(start + 25, 310, -100, 290, 100, 290, -start - 25, 310);
      bezier(start + 10, 360, -100, 380, 100, 380, -start - 10, 360);
      bezier(start + 20, 330, start + 13, 340, start + 10, 360, start + 10, 360);
      bezier(-start - 20, 330, -start - 13, 340, -start - 10, 360, -start - 10, 360);
      }

      {
      noFill();
      bezier(start+1, 204, start + 20, 200, start + 30, 310, start + 20, 330);
      bezier(-start-1, 204, -start - 20, 200, -start - 30, 310, -start - 20, 330);
      }

      pop();

    } else if (this.type == "R") {
      push();
      this.translation = [-31, -14];
      let X = 60;
      let remainder = (355 - 3*X) / 2
      translate(boardX + this.x + this.translation[0], boardY + this.y + this.translation[1]);
      scale(0.095);
      scale(0.85, 1);
      translate(500, 600);
      fill(this.color);
      noStroke();
      triangle(25, -50, 60, -100, 60, -50);
      triangle(375, -50, 340, -100, 340, -50);
      rect(60, -50, 280, -50);

      triangle(60, -300, 25, -350, 60, -350);
      triangle(340, -300, 340, -350, 375, -350);
      rect(60, -300, 280, -50);

      stroke(this.oppColor);
      strokeWeight(10);
      rect(0, 0, 400, 25);
      rect(25, -50, 350, 50);

      line(25, -50, 60, -100);
      line(375, -50, 340, -100);
      translate(60, -300);
      rect(0, 0, 280, 200);

      line(0, 0, -35, -50);
      line(280, 0, 320, -50);

      translate(-35, -50);
      noStroke();
      rect(0, 0, 355, -25);
      rect(0, -50, X, 25);
      rect(remainder+X, -50, X, 25);
      rect(355-X, -50, X, 25);

      stroke(this.oppColor);
      line(0, 0, 355, 0);
      line(0, 0, 0, -50);
      line(355, 0, 355, -50);

      line(0, -50, X, -50);
      line(X, -25, X, -50);
      line(X, -25, remainder+X, -25);
      line(remainder+X, -25, remainder+X, -50);
      line(remainder+X, -50, remainder+2*X, -50);
      line(remainder+2*X, -25, remainder+2*X, -50);
      line(remainder+2*X, -25, 2*(remainder+X), -25);
      line(2*(remainder+X), -25, 2*(remainder+X), -50);
      line(2*(remainder+X), -50, 355, -50);
      pop();

    } else if (this.type == "B") {

      let X = 80;
      let Y = 160;
      let Z = 35;

      push();
      this.translation = [25, 30];
      translate(boardX + this.x + this.translation[0], boardY + this.y + this.translation[1]);
      scale(0.105);
      //translate(600, 600);

      {
      fill(this.color);
      noStroke();
      triangle(-100, 0, 0, -228, 100, 0);
      triangle(-95, 0, 0, 114, 95, 0);
      rect(-220, 160-Z, 215, 25);
      rect(5, 160-Z, 215, 25);
      rect(-5, 155-Z, 10, 20);

      triangle(225, 162, 225, 150, 160, 150);
      triangle(-225, 162, -225, 150, -160, 150);
      }

      {
      stroke(this.oppColor);
      strokeWeight(10);
      let width = (Y-X)/2
      bezier(-76, 0, -171, 0, -133, -190, 0, -228); //Times 50 * 3/4 (times 38)
      bezier(76, 0, 171, 0, 133, -190, 0, -228);
      line(-76, 0, 76, 0);
      ellipse(0, -248, 40);
      line(0, -X, 0, -Y);
      line(-width, -(X+width), width, -(X+width));
      bezier(-95, 0, -137, 100, -90, 100, 0, 114);
      bezier(95, 0, 137, 100, 90, 100, 0, 114);
      line(-110, 57, 110, 57);
      }

      {
      noFill();
      bezier(0, 150-Z, 0, 170-Z, -225, 150-Z, -225, 170-Z);
      bezier(0, 150-Z, 0, 170-Z, 225, 150-Z, 225, 170-Z);
      bezier(0, 170-Z, 0, 210-Z, -225, 170-Z, -225, 210-Z);
      bezier(0, 170-Z, 0, 210-Z, 225, 170-Z, 225, 210-Z);
      line(-225, 175-Z, -225, 205-Z);
      line(225, 175-Z, 225, 205-Z);
      }

      pop();

    } else if (this.type == "N") {
      push();
      this.translation = [-6, 47];
      translate(boardX + this.x + this.translation[0], boardY + this.y + this.translation[1]);
      scale(0.125);
      {
        fill(this.color);
        noStroke();
        bezier(400, 0, 400, -332, 240, -332, 240, -332);
        bezier(240, -332, 240, -332, 133, -332, 80, -200);
        triangle(240, -332, 80, -200, 310, -240);
        triangle(310, -240, 400, 0, 150, 0);
        triangle(200, 0, 200, -115, 150, 0);
        triangle(200, -115, 310, -240, 200, -50);
        triangle(200, -115, 290, -250, 310, -240);
        triangle(238, -173, 300, -240, 255, -240);
      }

      {
        stroke(this.oppColor);
        strokeWeight(5);
        bezier(80, -200, 80, -200, 80, -100, 250, -230);
        triangle(220, -332, 215, -350, 200, -326);
        triangle(190, -323, 175, -345, 175, -316);
      }

      {
        noFill();
        bezier(400, 0, 400, -400, 160, -400, 80, -200); //Times 80
        bezier(150, 0, 150, -80, 250, -150, 250, -230);

        fill(this.color);
        bezier(150, 0, 150, -50, 200, -115, 200, -115);
        line(150, 0, 400, 0);
      }

      {
        fill(this.color);
        noStroke();

        triangle(217, -334, 206, -331, 217, -300);
        triangle(206, -331, 200, -319, 220, -300);

        triangle(177, -321, 186, -324, 180, -300);
        triangle(186, -324, 180, -318, 200, -300);
      }

      {
        fill(this.oppColor);
        noStroke();
        translate(160, -280);
        rotate(-PI/3);
        ellipse(-5, 10, 50, 20);
        rotate(PI/3);
        ellipse(-55, 75, 20);
        stroke(this.oppColor);
        strokeWeight(12);
        line(-40, 112, -30, 100);
      }

      pop();

    } else { //Pawn
      push();
      this.translation = [25, 45];
      translate(boardX + this.x + this.translation[0], boardY + this.y + this.translation[1]);
      scale(0.15);
      fill(this.color);
      noStroke();
      triangle(0, -100, -100, 0, 100, 0);
      stroke(this.oppColor);
      strokeWeight(8);
      bezier(0, -100, 55, -100, 100, -55, 100, 0);
      bezier(0, -100, -55, -100, -100, -55, -100, 0);
      line(-100, 0, 100, 0);
      ellipse(0, -140, 120, 120);
      ellipse(0, -230, 80, 80);
      noStroke();
      rect(-38, -100, 76, 30);
      rect(-21, -210, 42, 30);
      pop();
    }
  }
}
