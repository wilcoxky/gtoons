var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Player = require('./player.js');
var Board = require('./board.js');
var Gtoon = require('./gtoon.js');

/*
  Game Vriables Required for state
 */
var p1;
var p2;
var players = 0;
var time = 0;
var gameReady = false;
var colorsShown = false;
var board;

var p1Round1Moves;
var p2Round1Moves;
var r1Moves = 0;

var p1Round2Moves;
var p2Round2Moves;
var r2Moves = 0;

var p1Round3Moves;
var p2Round3Moves;
var r3Moves = 0;

// Express
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index');
});

// Handle User Game Input
io.on('connection', function(socket) {
  console.log('a user connected: ' + socket.id);
  socket.emit('welcome', Gtoon);
  socket.added = false;

  socket.on('join', function(data) {
    player = new Player(data.name, data.deck);
    player.id = socket.id;
    // Add Players to Game
    if (players < 2) {
      // If No players
      if (players == 0) {
        p1 = player;
        socket.emit('waiting', {
          p1deck: p1.deck.slice(0, 6),
          pid: 1
        });
      } else {
        // Add player2 Then start game
        p2 = player
        board = new Board(p1, p2);
        board.setColors();
        io.emit('game start', {
          p2deck: p2.deck.slice(0, 6),
          pid: 2,
          c1: board.c1,
          c2: board.c2
        });
      }
      players += 1;
      socket.added = true;
    } else {
      // Don't allow user in if the server is full
      socket.emit('gameFull');
    }
  });

  socket.on('roundOne', function(data) {
    if (socket.id === p1.id) {
      p1Round1Moves = data.index;
      r1Moves++;
    } else {
      p2Round1Moves = data.index;
      r1Moves++;
    }
    if (r1Moves == 2) {
      board.insertMoves(p1Round1Moves, p2Round1Moves);
      board.updateState();
      io.emit('roundOneDone', {
        p1Score: board.p1Score,
        p1C1Cnt: board.p1C1Cnt,
        p1C2Cnt: board.p1C2Cnt,
        p2Score: board.p2Score,
        p2C1Cnt: board.p2C1Cnt,
        p2C2Cnt: board.p2C2Cnt,
        p1board: board.p1Slots,
        p2board: board.p2Slots,
      });
    } else {
      socket.emit('round wait');
    }
  });

  socket.on('cards removed', function(data) {
    var numRemoved = data.numRemoved;
    if (socket.id === p1.id) {
      socket.emit('new hand', {
        newHand: p1.deck.slice(6, 10 + numRemoved)
      });
    } else {
      socket.emit('new hand', {
        newHand: p2.deck.slice(6, 10 + numRemoved)
      });
    }
  });

  socket.on('roundTwo', function(data) {
    if (socket.id === p1.id) {
      p1Round2Moves = data.index;
      r2Moves++;
    } else {
      p2Round2Moves = data.index;
      r2Moves++;
    }
    if (r2Moves == 2) {
      board.insertMoves(p1Round2Moves, p2Round2Moves);
      board.updateState();
      // console.log(board);
      io.emit('roundTwoDone', {
        p1Score: board.p1Score,
        p1C1Cnt: board.p1C1Cnt,
        p1C2Cnt: board.p1C2Cnt,
        p2Score: board.p2Score,
        p2C1Cnt: board.p2C1Cnt,
        p2C2Cnt: board.p2C2Cnt,
        p1board: board.p1Slots,
        p2board: board.p2Slots,
      });
    } else {
      socket.emit('round wait');
    }
  });

  socket.on('final round', function(data) {
    if (socket.id === p1.id) {
      p1Round3Moves = data;
      r3Moves++;
    } else {
      p2Round3Moves = data;
      r3Moves++;
    }
    if (r3Moves == 2) {
      board.insertFinalMove(p1Round3Moves, p2Round3Moves);
      board.updateState();
      board.declareWinner();
      // console.log(board);
      io.emit('finalDone', {
        p1Score: board.p1Score,
        p1C1Cnt: board.p1C1Cnt,
        p1C2Cnt: board.p1C2Cnt,
        p2Score: board.p2Score,
        p2C1Cnt: board.p2C1Cnt,
        p2C2Cnt: board.p2C2Cnt,
        p1board: board.p1Slots,
        p2board: board.p2Slots,
        winner: board.winner.name
      });
    } else {
      socket.emit('round wait');
    }
  });


  socket.on('disconnect', function() {
    console.log('user disconnected');
    if (socket.added) {
      console.log('Players Decreased');
      players -= 1;
    }
  });

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
