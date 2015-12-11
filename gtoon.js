var gtoons = require('./gtoon.json');

var Gtoon = function Gtoon(name, character, points,
  color, type1, type2, type3, type4, member, power, set) {
  this.name = name;
  this.character = character;
  this.points = points;
  this.color = color;
  this.type1 = type1;
  this.type2 = type2;
  this.type3 = type3;
  this.type4 = type4;
  this.member = member;
  this.power = power;
  this.set = set;
}

var generateRandomTestDeck = function() {
  var deck = [];
  var colors = ['red', 'blue', 'green', 'orange', 'silver'];
  for (var i = 0; i < 12; i++) {
    var num = getRandomIntInclusive(1, 12);
    var r2 = getRandomIntInclusive(0, 4);
    var g = [num, colors[r2]];
    deck.push(g);
  }
  return deck;
}

var generateRandomGtoonDeck = function(num) {
  var deck = [];
  var gSize = gtoons.length;
  for (var i = 0; i < 12; i++) {
    // var r1 = getRandomIntInclusive(0, gSize - 1);
    var gt = gtoons[(i + num) + i];
    deck.push(gt);
  }
  return deck;
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var deck1 = generateRandomGtoonDeck(0);
var deck2 = generateRandomGtoonDeck(40);
var deck3 = generateRandomGtoonDeck(80);
var deck4 = generateRandomGtoonDeck(120);

module.exports = {
  deck0: deck1,
  deck1: deck2,
  deck2: deck3,
  deck3: deck4
}
