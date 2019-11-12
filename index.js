const _ = require('lodash');
const rl = require('readline-sync');

class Game {
  constructor() {
    var defenderSeed = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.defender = [
      _getRandomValue(defenderSeed),
      _getRandomValue(defenderSeed),
      _getRandomValue(defenderSeed)
    ];
    this.round = 1;
    this.stauts = undefined;
  }

  printDefender() {
    console.log(this.defender);
  }

  getRound() {
    return this.round;
  }

  getStatus() {
    return this.status;
  }

  testValue(value) {
    var s = 0;
    var b = 0;

    _.forEach(value, (v, i) => {
      var index = this.defender.indexOf(v);
      if (index === i) {
        ++s;
      } else if (index >= 0) {
        ++b;
      }
    });

    ++this.round;

    // Win the game
    if (s === 3) {
      this.status = true;
    }
    // Over 15 rounds...yet not seen final
    else if (this.round > 15) {
      this.status = false;
    }

    return {
      round: this.round - 1,
      s,
      b
    };
  }

  printResult(result) {
    if (result.s > 0 && result.b > 0) {
      console.log(`${result.round} Result : ${result.s} S ${result.b} B`);
    } else if (result.s > 0) {
      console.log(`${result.round} Result : ${result.s} S`);
    } else if (result.b > 0) {
      console.log(`${result.round} Result : ${result.b} B`);
    } else {
      console.log(`${result.round} Result : OUT`);
    }
  }
}

class GameSolver {
  constructor() {
    this.pool = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 5, 6, 7, 8, 9]
    ];
    this.r1 = [];
    this.r2 = [];
    this.game = new Game();
  }

  step(s, zs) {
    s = s || 1;
    var value = [];
    var poolBackup = [];
    _.forEach(this.pool, x => poolBackup.push(Object.assign(x)));
    if (s === 1) {
      value = [1, 2, 3];
    } else {
      for (var i = 0; i < 3; i++) {
        if (i === 0) {
          zs = zs >= this.pool[i].length ? 0 : zs;
          value.push(this.pool[i][zs]);
        } else {
          _.forEach(this.pool[i], p => {
            if (this.validR1(value, p) && this.validR2(value, p)) {
              value.push(p);
              return false;
            }
          });
        }

        for (var j = i + 1; j < 3; j++) {
          this.pool[j].splice(this.pool[j].indexOf(value[i]), 1);
        }
      }
    }

    var result = this.game.testValue(value);
    var k = result.s + result.b;

    // OUT
    if (k === 0) {
      _.forEach(this.pool, x => {
        _.forEach(value, y => x.splice(x.indexOf(y), 1));
      });
    } else if (k === 1) {
      this.r1.push(Object.assign(value));
    } else if (k === 2) {
      this.r2.push(Object.assign(value));
    } else if (k === 3) {
      for (var i = 0; i < 3; i++) {
        this.pool[i] = this.pool[i].filter(x => value.indexOf(x) >= 0);
      }
    }

    console.log(this.pool);

    rl.keyInPause();
    this.step(s + 1, zs + 1);
  }

  validR1(value, test) {
    var result = true;
    _.forEach(this.r1, r => {
      if (r.indexOf(test) < 1)
        return true;
      var cnt = 0;
      _.forEach(value, v => {
        var index = r.indexOf(v);
        cnt += (index >= 0 ? 1 : 0);
      });
      if (cnt > 1) {
        result = false;
        return false;
      }
    });
    return result;
  }

  validR2(value, test) {
    var result = true;
    _.forEach(this.r2, r => {
      if (r.indexOf(test) < 1)
        return true;
      var cnt = 0;
      _.forEach(value, v => {
        var index = r.indexOf(v);
        cnt += (index >= 0 ? 1 : 0);
      });
      if (cnt > 2) {
        result = false;
        return false;
      }
    });
    return result;
  }
}

function _getRandomValue(seed) {
  var index = parseInt(Math.random() * seed.length);
  var value = seed[index];
  seed.splice(index, 1);
  return value;
}

function _getValue(game) {
  var round = game.getRound();
  var value = rl.question(`${round} Round > `);
  if (['exit', 'quit'].indexOf(String(value || '').toLowerCase()) >= 0) {
    console.log('Quit game.');
    return false;
  }

  var data = String(value || '').trim().toLowerCase().split('');
  data = data.map(x => parseInt(x)).filter(x => [1, 2, 3, 4, 5, 6, 7, 8, 9].indexOf(x) >= 0);
  data = data.filter((x, i) => data.indexOf(x) === i);
  if (data.length !== 3) {
    console.log('Please input three numbers between 1 and 9.');
  } else {
    // Test status
    game.printResult(game.testValue(data));
  }
  return true;
}

function _startGame() {
  var game = new Game();
  // game.printDefender();
  process.stdout.write('\033c');
  console.log('Start new game. use \'quit\' or \'exit\' to quit current game.');
  while (game.getStatus() === undefined) {
    if (!_getValue(game))
      return;
  }

  if (game.getStatus()) {
    console.log('Win.');
  } else {
    console.log('Loose.');
  }
  rl.keyInPause();
}

// Process
var run = true;

while (run) {
  process.stdout.write('\033c');
  console.log('1. Start new game');
  console.log('2. Run with algorithm');
  console.log('3. Exit');

  var command = rl.question('> ');

  // Start game
  if (command == 1) {
    _startGame();
  }
  // Run with algorithm
  else if (command == 2) {
    var gameSolver = new GameSolver();
    gameSolver.step();
  }
  // Exit
  else if (command == 3) {
    console.log('Good bye.');
    run = false;
  }
  // Unknown command
  else {
    console.log('Unknown command.');
  }
}
