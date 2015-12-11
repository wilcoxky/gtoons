var MAX_DECK_SIZE = 11;
var MIN_DECK_SIZE = 0;

var Board = function Board(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
  this.p1Slots = [];
  this.p2Slots = [];
  this.p1Score = 0;
  this.p2Score = 0;
  this.p1C1Cnt = 0;
  this.p2C1Cnt = 0;
  this.p1C2Cnt = 0;
  this.p2C2Cnt = 0;
  this.time = 0;
  // console.log(p1);
  // console.log("In Between P1 and P2");
  // console.log(p2);
}

Board.prototype.setColors = function() {
  var r1 = getRandomIntInclusive(MIN_DECK_SIZE, MAX_DECK_SIZE);
  var r2 = getRandomIntInclusive(MIN_DECK_SIZE, MAX_DECK_SIZE);
  var c1 = this.p1.deck[r1].Color;
  var c2 = this.p2.deck[r2].Color;
  console.log(c1);
  console.log(c2);
  if (c1 === c2) {
    this.c1 = c1;
    this.c2 = c1;
  } else {
    this.c1 = c1;
    this.c2 = c2;
  }
};

Board.prototype.insertMoves = function(p1Moves, p2Moves) {
  // Notes to update, SCORES and color Count
  for (var i = 0; i < p1Moves.length; i++) {
    this.p1Slots.push(this.p1.deck[p1Moves[i]]);
    this.p2Slots.push(this.p2.deck[p2Moves[i]]);
  }
};

Board.prototype.updateState = function() {
  board = this;
  this.p1Score = 0;
  this.p2Score = 0;
  this.p1C1Cnt = 0;
  this.p1C2Cnt = 0;
  this.p2C1Cnt = 0;
  this.p2C2Cnt = 0;
  // Check for matching cards
  this.p1Slots.forEach(function(p1Gtoon) {
    board.p2Slots.forEach(function (p2Gtoon) {
      if (p1Gtoon.Name === p2Gtoon.Name) {
        p1Gtoon.Points = 0;
        p2Gtoon.Points = 0;
      }
    });
  });
  // Update p1 Score
  this.p1Slots.forEach(function(gtoon) {
    board.p1Score += gtoon.Points;
    if (board.c1 === gtoon.Color) {
      board.p1C1Cnt += 1;
    } else if (board.c2 === gtoon.Color) {
      board.p1C2Cnt += 1;
    }
    console.log('p1 Score is: ' + board.p1Score);
  });
  // Update p2 score
  this.p2Slots.forEach(function(gtoon) {
    board.p2Score += gtoon.Points;
    if (board.c1 === gtoon.Color) {
      board.p2C1Cnt += 1;
    } else if (board.c2 === gtoon.Color) {
      board.p2C2Cnt += 1;
    }
    console.log('p2 Score is: ' + board.p2Score);
  });
};

Board.prototype.insertFinalMove = function (p1Move, p2Move) {
  // if (p1Move.move) {
  //   this.p1Slots.pop();
  //   this.p1Slots.push(this.p1.deck[p1Move.move]);
  // }
  // if (p2Move.move) {
  //   this.p2Slots.pop();
  //   this.p2Slots.push(this.p2.deck[p2Move.move]);
  // }
  // console.log(this.p1Slots.length);
  // console.log(this.p2Slots.length);
  // console.log(this.p1Slots);
  // console.log(this.p2Slots);
  var p1Color = p1Move.color;
  var p2Color = p2Move.color;
  this.p1Slots.forEach(function (gtoon) {
    console.log(gtoon);
    if (gtoon.Color === 'Silver') {
      gtoon.Color = p1Color;
    }
  });
  this.p2Slots.forEach(function (gtoon) {
    // console.log('P2 ' + gtoon);
    if (gtoon.Color === 'Silver') {
      gtoon.Color = p2Color;
    }
  });
};

Board.prototype.declareWinner = function () {
  var p1MaxColor = Math.max(this.p1C1Cnt, this.p1C2Cnt);
  var p2MaxColor = Math.max(this.p2C1Cnt, this.p2C2Cnt);
  if (p1MaxColor > p2MaxColor) {
    this.p1Score += 15;
  } else if (p1MaxColor < p2MaxColor) {
    this.p2Score += 15;
  }
  if (this.p1Score > this.p2Score) {
    this.winner = this.p1;
  } else if (this.p1Score < this.p2Score) {
    this.winner = this.p2;
  } else {
    this.winner = null;
  }
}

var getRandomIntInclusive = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = Board;
