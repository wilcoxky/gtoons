var decks = require('./gtoon.js');

var Player = function Player(name, deck) {
  this.name = name;
  if (deck === 0){
    this.deck = shuffleArray(decks.deck0);
  } else if (deck === 1) {
    this.deck = shuffleArray(decks.deck1);
  } else if (deck === 2) {
    this.deck = shuffleArray(decks.deck2);
  } else {
    this.deck = shuffleArray(decks.deck3);
  }
}

function shuffleArray(array) {
    var shuffle = array.slice(0);
    for (var i = shuffle.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffle[i];
        shuffle[i] = shuffle[j];
        shuffle[j] = temp;
    }
    shuffle.forEach(assignIndex);
    return shuffle;
}

var assignIndex = function (gtoon, i) {
  gtoon.index = i;
}
module.exports = Player;
