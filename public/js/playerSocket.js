var socket = io();

/*
  Game State variables for rendering
 */
var $boardContainer = $('.container');
var $welcomePage = $('.welcome.page');
var $decksPage = $('.list-decks.page');
var $waitingPage = $('.waiting.page');
var $gamePage = $('.game.page');
var $usernameInput = $('.usernameInput');
var $currentInput = $usernameInput.focus();
var $deckDisplay = $('#deck-display');
var $mySlots = $('#my-board-area');
var $oppSlots = $('#opp-board-area');
var $statDisplay = $('.stat-display');

var username;
var mydeck;
var pid;
var r1 = false;
var removeRound = false;
var r2 = false;
var r3 = false;
var userPicks = [];
var colorPicked;
var allDecks;
var c1;
var c2;

socket.on('welcome', function(data) {
  console.log('User joined');
  allDecks = data;
  console.log(data);
});

// Code involved with User joining game
socket.on('waiting', function(data) {
  console.log('waiting');
  $waitingPage.show();
  mydeck = data.p1deck;
  pid = data.pid;
  console.log(pid);
  console.log(mydeck);
});

socket.on('gameFull', function() {
  window.alert('Sorry game is full returning home');
  window.location = '/';
});

socket.on('game start', function(data) {
  $waitingPage.fadeOut();
  $gamePage.fadeIn();
  console.log('Game Starting');
  // console.log(data);
  if (!pid) {
    pid = data.pid;
    mydeck = data.p2deck;
    console.log('Reached for p2');
  }
  c1 = data.c1;
  c2 = data.c2;
  var $roundOne = $('<div class="well col-md-3" id="round-one">Ready</div>');
  r1 = true;
  window.alert('The Colors are ' + c1 + ' and ' + c2);
  $gamePage.append($roundOne);
  displayDeck();
});

socket.on('round wait', function() {
  $gamePage.hide();
  $waitingPage.fadeIn();
});

socket.on('roundOneDone', function(data) {
  console.log(data);
  $waitingPage.fadeOut();
  $gamePage.fadeIn();
  updateStats(data.p1Score, data.p1C1Cnt, data.p1C2Cnt, data.p2Score,
    data.p2C1Cnt, data.p2C2Cnt);
  updateBoard(data.p1board, data.p2board);
  window.alert('Please Choose if you want to remove cards');
  var $removeRound = $('<div class="well col-md-3" id="remove-cards">Ready</div>');
  r1 = false;
  removeRound = true;
  $('#round-one').remove();
  $gamePage.append($removeRound);
});

socket.on('new hand', function(data) {
  mydeck = mydeck.concat(data.newHand);
  console.log('Updated Deck');
  displayDeck();
  var $r2Round = $('<div class="well col-md-3" id="round-two">Ready</div>');
  removeRound = false;
  r2 = true;
  $('#remove-cards').remove();
  $gamePage.append($r2Round);
});

socket.on('roundTwoDone', function(data) {
  console.log(data);
  $waitingPage.fadeOut();
  $gamePage.fadeIn();
  updateStats(data.p1Score, data.p1C1Cnt, data.p1C2Cnt, data.p2Score,
    data.p2C1Cnt, data.p2C2Cnt);
  updateBoard(data.p1board, data.p2board);
  window.alert('Please Select a Color');
  var $r3Round = $('<div class="well col-md-3" id="final-round">Ready</div>');
  r2 = false;
  r3 = true;
  $('#round-two').remove();
  var $colorList = createColorList();
  $gamePage.append($colorList);
  $gamePage.append($r3Round);
});

socket.on('finalDone', function(data) {
  console.log(data);
  $waitingPage.fadeOut();
  $gamePage.fadeIn();
  updateStats(data.p1Score, data.p1C1Cnt, data.p1C2Cnt, data.p2Score,
    data.p2C1Cnt, data.p2C2Cnt);
  updateBoard(data.p1board, data.p2board);
  setTimeout(function() {
    if (data.winner === username) {
      window.alert('You Win!!!');
    } else {
      window.alert('You Lose you loser you should stop playing!!!');
    }
  }, 3000);
});

/*
  Handle User input
 */
$usernameInput.on('keydown', function(e) {
  if (e.keyCode == 13) {
    username = $('.usernameInput').val();
    console.log(username);
    $welcomePage.fadeOut();
    showDeckChoices();
    $decksPage.show();
  }
});

$(document).on('click', '.deck-title', function() {
  console.log('Attempting to change deck picked');
  $('.deck-title[id="deck-picked"]').removeAttr('id');
  $(this).attr('id', 'deck-picked');
  console.log('Index of deck is: ' + $(this).parent().data('index'));
  // var $deck = $(this).parent();
  // console.log($deck);
  // $('.deck-picked').removeClass('deck-picked');
  // $deck.addClass('deck-picked');
});

$(document).on('click', '#join-game', function() {
  var $deck = $('#deck-picked').parent();
  var deckPicked = $deck.data('index') || 0;
  console.log(deckPicked);
  $decksPage.fadeOut();
  socket.emit('join', {
    name: username,
    deck: deckPicked
  });
});

$(document).on('click', '.gtoonCard', function() {
  if ($(this).hasClass('selected')) {
    $(this).removeClass('selected');
    var index = userPicks.indexOf($(this));
    userPicks.splice(index, 1);
  } else if (userPicks.length < 4 && r1) {
    $(this).addClass('selected');
    userPicks.push($(this));
  } else if (userPicks.length < 3 && r2) {
    $(this).addClass('selected');
    userPicks.push($(this));
  } else if (userPicks.length < 2 && removeRound) {
    $(this).addClass('selected');
    userPicks.push($(this));
  } else if (userPicks.length < 1 && r3) {
    $(this).addClass('selected');
    userPicks.push($(this));
  } else {
    window.alert('Out of selections');
  }
});

$(document).on('click', '.citem', function() {
  if ($(this).hasClass('selected')) {
    $(this).removeClass('selected');
    var index = userPicks.indexOf($(this));
    userPicks.splice(index, 1);
  } else if (!colorPicked) {
    $(this).addClass('selected');
    colorPicked = $(this);
  } else {
    window.alert('Out of selections');
  }
});

$(document).on('click', '#round-one', function() {
  // Get index of ones placed in field
  // This is attachted to data-index
  // Get Rid of Round one "Ready Button"
  var deckIndexes = getDeckIndexes(userPicks);
  var internalIndexes = getInternalIndexes(userPicks);
  if (deckIndexes.length < 4) {
    window.alert('Please choose 4 cards');
    return;
  }
  console.log(deckIndexes);
  console.log(internalIndexes);
  deckIndexes.sort(function(a, b) {
    return b - a;
  });
  for (var i = 0; i < deckIndexes.length; i++) {
    mydeck.splice(deckIndexes[i], 1);
  }
  socket.emit('roundOne', {
    index: internalIndexes
  });
  userPicks = [];
  displayDeck();
});


$(document).on('click', '#remove-cards', function() {
  var cardsRemoved = userPicks;
  cardsRemoved.sort(function(a, b) {
    return b - a;
  });
  for (var i = 0; i < cardsRemoved.length; i++) {
    mydeck.splice(cardsRemoved[i], 1);
  }
  socket.emit('cards removed', {
    numRemoved: cardsRemoved.length
  });
  userPicks = [];
});

$(document).on('click', '#round-two', function() {
  // Get index of ones placed in field
  // This is attachted to data-index
  // Get Rid of Round one "Ready Button"
  var deckIndexes = getDeckIndexes(userPicks);
  var internalIndexes = getInternalIndexes(userPicks);
  if (deckIndexes.length < 3) {
    window.alert('Please choose 3 cards');
    return;
  }
  deckIndexes.sort(function(a, b) {
    return b - a;
  });
  for (var i = 0; i < deckIndexes.length; i++) {
    mydeck.splice(deckIndexes[i], 1);
  }
  socket.emit('roundTwo', {
    index: internalIndexes
  });
  userPicks = [];
  displayDeck();
});

$(document).on('click', '#final-round', function() {
  var color = colorPicked.data('color');
  var deckIndexes = getDeckIndexes(userPicks);
  var internalIndexes = getInternalIndexes(userPicks);
  deckIndexes.sort(function(a, b) {
    return b - a;
  });
  for (var i = 0; i < deckIndexes.length; i++) {
    mydeck.splice(deckIndexes[i], 1);
  }
  socket.emit('final round', {
    move: internalIndexes,
    color: color
  });
});

/*
  UI update functions
 */
var displayDeck = function() {
  var $myHand = $('<div class="my-hand row"></div>');
  var count = 0;
  mydeck.forEach(function(gtoon) {
    var $gt = $('<div class="gtoon' + gtoon.Color + ' gtoonCard well col-md-2"> \
              <p>' + gtoon.Name + '</p> \
              <p>' + gtoon.Points + '</p> \
            </div>').data('index', gtoon.index).data('arrIndex', count)
      .draggable({
        revert: true
      });
    $myHand.append($gt);
    count++;
  });
  $deckDisplay.children().remove();
  $deckDisplay.append($myHand);
}

var getDeckIndexes = function(array) {
  var indexes = [];
  array.forEach(function($gtoon) {
    indexes.push($gtoon.data('arrIndex'));
  });
  return indexes;
}

var getInternalIndexes = function(array) {
  var indexes = [];
  array.forEach(function($gtoon) {
    indexes.push($gtoon.data('index'));
  });
  return indexes;
}

var createColorList = function() {
  var colors = ['Red', 'Blue', 'Green', 'Purple', 'Yellow', 'Orange', 'Black'];
  var $list = $('<div class="colors row"></div>');
  colors.forEach(function(color) {
    $c = $('<div class="citem gtoon' + color + ' well col-md-1">\
      </div>').data('color', color);
    $list.append($c);
  });
  return $list;
}

var updateBoard = function(p1Slots, p2Slots) {
  var $p1Hand = $('<div class="p1hand row"></div>');
  p1Slots.forEach(function(gtoon) {
    var $gt = $('<div class="gtoon' + gtoon.Color + ' gtoonCard well col-md-2"> \
              <p>' + gtoon.Name + '</p> \
              <p>' + gtoon.Points + '</p> \
            </div>');
    $p1Hand.append($gt);
  });
  var $p2Hand = $('<div class="my-hand row"></div>');
  p2Slots.forEach(function(gtoon) {
    var $gt = $('<div class="gtoon' + gtoon.Color + ' gtoonCard well col-md-2"> \
              <p>' + gtoon.Name + '</p> \
              <p>' + gtoon.Points + '</p> \
            </div>');
    $p2Hand.append($gt);
  });
  $oppSlots.children().remove();
  $mySlots.children().remove();
  if (pid === 1) {
    $mySlots.append($p1Hand);
    $oppSlots.append($p2Hand);
  } else {
    $mySlots.append($p2Hand);
    $oppSlots.append($p1Hand);
  }
}

var updateStats = function(p1Score, p1C1Cnt, p1C2Cnt, p2Score, p2C1Cnt, p2C2Cnt) {
  if (pid !== 1) {
    p1Score = [p2Score, p2Score = p1Score][0];
    p1C1Cnt = [p2C1Cnt, p2C1Cnt = p1C1Cnt][0];
    p1C2Cnt = [p2C2Cnt, p2C2Cnt = p1C2Cnt][0];
  }
  var $p1Score = $('<p className="score">My Score: ' + p1Score + '</p>');
  var $p1Color1 = $('<p className="c1Cnt">My ' + c1 + ': ' + p1C1Cnt + '</p>');
  var $p1Color2 = $('<p className="c2Cnt">My ' + c2 + ': ' + p1C2Cnt + '</p>');
  var $p2Score = $('<p className="score"> Rival Score: ' + p2Score + '</p>');
  var $p2Color1 = $('<p className="c1Cnt">Rival: ' + c1 + ': ' + p2C1Cnt + '</p>');
  var $p2Color2 = $('<p className="c2Cnt">Rival: ' + c2 + ': ' + p2C2Cnt + '</p>');
  $statDisplay.children().remove();
  $statDisplay.append($p1Score);
  $statDisplay.append($p1Color1);
  $statDisplay.append($p1Color2);
  $statDisplay.append($p2Score);
  $statDisplay.append($p2Color1);
  $statDisplay.append($p2Color2);
}

var showDeckChoices = function() {
  var $listHolder = $('<div class="list-holder row"></div>');
  var count = 0;
  for (var key in allDecks) {
    var $deckHolder = $('<div class="col-md-3 deck-holder"></div>');
    var deck = allDecks[key];
    var $deck = $('<div class="deck-choice list-group"> \
      <h3 class="deck-title">Deck ' + (count + 1) + '</h3> \
    </div>');
    $deck.data('index', count);
    deck.forEach(function(gtoon) {
      var $gtoonData = $('<div class="gtoon' + gtoon.Color + ' list-group-item">\
        <p class="gtoonName">' + gtoon.Name + '</p> \
        <p class="gtoonPoints">' + gtoon.Points + '</p> \
        </div>');
      $deck.append($gtoonData);
      $deckHolder.append($deck);
    });
    $listHolder.append($deckHolder);
    count++;
  };
  $decksPage.append($listHolder);
  var $joinButton = $('<span id="join-game" class="well">Join</span>');
  $decksPage.append($joinButton);
}
