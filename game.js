// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.shootingDirection = motionType.RIGHT;
    this.verticalSpeed = 0;
    // this.numBullet = 8;
    // svgdoc.getElementById("numBullet").textContent = this.numBullet;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 400);     // The initial position of the player
// var PLAYER_INIT_POS  = new Point(0, 20);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 12;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;           // The speed of a bullet
                                    //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var canShoot = true;                // A flag indicating whether the player can shoot a bullet
var numBullet = 8;

var MONSTER_SIZE = new Size(40, 40);  // The size of a monster

var EXIT_SIZE = new Size(45, 40);       // the size of the exit gate
var GD_SIZE = new Size(20, 25);       // the size of the goodie

// Score formula
var SCORE_MONSTER = 50;
var SCORE_GOODTHING = 10;
var SCORE_LEVEL = 200;
var SCORE_TIME = 1;

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var gameTimer = null;
var time = 60;
var level = 1;
var defaultPlayerName = "";
var cheatModeOn = false;

//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Create the game platform
    createPlatforms();

    setupGame(1);

    // hide the starting screen
    var node = svgdoc.getElementById("startingscreen");
    node.style.setProperty("visibility", "hidden", null);

    // hide the scoreTable in initial
    var node = svgdoc.getElementById("highscoretable");
    node.style.setProperty("visibility", "hidden", null);
}

// Set up the game environment for each level
function setupGame(level) {
  resetGame();
  console.log("Setting up game... level " + level);

  // Create the player
  player = new Player();

  if(level == 1) {
    setScore(0);

    // prompt for player name input
    var input = prompt("What is your name? ^_^", defaultPlayerName);
    if(input == null || input.trim() == "") {
      defaultPlayerName= "Anonymous";
    }
    else {
      defaultPlayerName = input;
    }
  }

  // reset Bullet
  if(! cheatModeOn) {
    setBullet(8);
  }

  player.name = defaultPlayerName;  // when level up, keep the player name
  player.node.children[0].textContent= defaultPlayerName; // set the player name on the player svg

  // Generate monsters according to the level
  // initial: 4 monsters, add 4 each time
  spawnMonsters(6 + (level - 1) * 4);

  // Spawn good thing
  spawnGoodies(8);

  // create exit
  createExit(100,50);

  // reset time
  setTime(60);

  // Start the game interval
  gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

  // start game timer
  gameTimer = setInterval("updateGameTimer()", 1000);
}

// game OVER
function endGame() {
  // Clear the game interval
  clearInterval(gameInterval);
  clearInterval(gameTimer);

  // Get the high score table from cookies
  var scoreTable = getHighScoreTable();

  // Create the new score record
  var newRecord = new ScoreRecord(player.name, score);
  newRecord.curPlayerFlag = true; // additional flag in record to indicate current player socre

  // Insert the new score record
  var index = 0;
  // append the record sort by score, higher score in front
  for(var i = 0; i < scoreTable.length; i++) {
    if(score < scoreTable[i].score) {
      index ++;
    }
  }

  // only top5 highest score
  if(index < 5) {
    // add new score to score table
    scoreTable.splice(index, 0, newRecord);
  }

  // Store the new high score table
  setHighScoreTable(scoreTable);

  // Show the high score table
  showHighScoreTable(scoreTable);
}

// level up
function levelUp() {

  // increase the level and difficulties
  console.log("Level up!!");

  // + LEVEL * 200
  setScore(score + (SCORE_LEVEL * level));

  // + Remaining time
  setScore(score + (SCORE_TIME * time));

  // level up by 1
  setLevel(level + 1);

  // Clear the game interval
  clearInterval(gameInterval);
  clearInterval(gameTimer);

  setupGame(level);
}

// Restart game, when restart btn is clicked
function restartGame() {
  // hide the scoreTable
  var node = svgdoc.getElementById("highscoretable");
  node.style.setProperty("visibility", "hidden", null);
  setLevel(1);
  setScore(0);  // reset score
  cheatModeOn = false // disable cheat mode
  setupGame(1);
}

function resetGame() {
  // Remove text nodes in the 'platforms' group
  cleanUpGroup("platforms", true);
  // Remove old elements
  cleanUpGroup("monsters", false);
  cleanUpGroup("bullets", false);
  // cleanUpGroup("platforms", false);
  cleanUpGroup("exitpos", false);
  cleanUpGroup("goodies", false);
}

function updateGameTimer() {
    setTime(time - 1);
    // game over
    if(time <= 0) {
      console.log("GAME OVER: Timeout");
      endGame();
    }
}

//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

//
// This function creates the monsters in the game
//
function createMonster(x, y) {
  var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
  monster.setAttribute("x", x);
  monster.setAttribute("y", y);
  svgdoc.getElementById("monsters").appendChild(monster);
}

// create N monsters in map randomly
function spawnMonsters(n) {
  var playerProtectZone = new Size(PLAYER_SIZE.w + 100, PLAYER_SIZE.h + 100); // area to protect monster spawn near player
  for(var i = 0; i < n; i++) {
    var monster = {};
    var x = getRandomInt(0, SCREEN_SIZE.w - MONSTER_SIZE.w);
    var y = getRandomInt(0, SCREEN_SIZE.h - MONSTER_SIZE.h);
    monster.position = new Point(x, y);
    console.log("monster " + i + "  x:" + x + " y:" + y);

    // make sure monster cannot spawn close to player
    while(true) {
      if(! intersect(player.position, playerProtectZone, monster.position, MONSTER_SIZE))
        break;
      // console.log("monster collides with player");
      console.log(player.position);
      console.log(monster.position);
      monster.position.x = getRandomInt(0, SCREEN_SIZE.w - MONSTER_SIZE.w);
      monster.position.y = getRandomInt(0, SCREEN_SIZE.h - MONSTER_SIZE.h);
      // console.log("new");
      // console.log(monster.position);
    }
    createMonster(monster.position.x , monster.position.y);
  }
}

function createGoodie(x, y) {
  var goodie = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  goodie.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodie");
  goodie.setAttribute("x", x);
  goodie.setAttribute("y", y);
  svgdoc.getElementById("goodies").appendChild(goodie);
}

function spawnGoodies(n) {
  for(var i = 0; i < n; i++) {
    var goodie = {};
    var x = getRandomInt(0, SCREEN_SIZE.w - GD_SIZE.w);
    var y = getRandomInt(0, SCREEN_SIZE.h - GD_SIZE.h);
    goodie.position = new Point(x, y);
    // make sure goodies cannot spawn insides platforms

    while(true) {
      if(! iscollideWithPlatform(goodie.position, GD_SIZE))
        break;

      // console.log("gd collides with walls");
      // console.log(goodie.position);
      goodie.position.x = getRandomInt(0, SCREEN_SIZE.w - GD_SIZE.w);
      goodie.position.y = getRandomInt(0, SCREEN_SIZE.h - GD_SIZE.h);
    }
    createGoodie(goodie.position.x, goodie.position.y);
  }
}

function iscollideWithPlatform(pos, size) {
  var platforms = svgdoc.getElementById("platforms");
  for (var i = 0; i < platforms.childNodes.length; i++) {
      var node = platforms.childNodes.item(i);
      if (node.nodeName != "rect") continue;

      var x = parseFloat(node.getAttribute("x"));
      var y = parseFloat(node.getAttribute("y"));
      var w = parseFloat(node.getAttribute("width"));
      var h = parseFloat(node.getAttribute("height"));
      var wpos = new Point(x, y);
      var wsize = new Size(w, h);

      if (intersect(pos, size, wpos, wsize)) {
        return true;
      }
  }
  return false;
}


function createExit(x, y) {
  // TODO: check not collides with walls
  var exit = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
  exit.setAttribute("x", x);
  exit.setAttribute("y", y);
  svgdoc.getElementById("exitpos").appendChild(exit);
}


//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    canShoot = false;

    // update number of bullets remaining
    if(! cheatModeOn) {
      setBullet(numBullet - 1);
    }

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

    // set shooting direction of bullet
    bullet.setAttribute("direction", player.shootingDirection);

    // Calculate and set the position of the bullet
    if(player.shootingDirection == motionType.RIGHT) {
      bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2);
      bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    }
    else {
      bullet.setAttribute("x", player.position.x - PLAYER_SIZE.w / 2);
      bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    }

    // Set the href of the use node to the bullet defined in the defs node
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    // Append the bullet to the bullet group
    svgdoc.getElementById("bullets").appendChild(bullet);
    // enable shooting again
    setTimeout("canShoot = true", SHOOT_INTERVAL);
}

//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        var direction = node.getAttribute("direction");
        if(direction == motionType.RIGHT) {
          node.setAttribute("x", x + BULLET_SPEED);
        }
        else {
          node.setAttribute("x", x - BULLET_SPEED);
        }


        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            i--;
        }
    }
}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.shootingDirection = motionType.LEFT;
            break;

        case "M".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.shootingDirection = motionType.RIGHT;
            break;

        case "Z".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case 32: // spacebar = shoot
            if (canShoot && (numBullet > 0 || cheatModeOn)) {
              shootBullet();
            }
            break;

        case "C".charCodeAt(0): // cheat mode
            // Player not die and Unlimited bullets
            cheatModeOn = true;
            svgdoc.getElementById("numBullet").textContent = "Unlimited";
            setBullet(-1);
            break;

        case "V".charCodeAt(0): // exit cheat mode
            cheatModeOn = false;
            setBullet(8);
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "N".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "M".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}



//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    if(!cheatModeOn) {
      for (var i = 0; i < monsters.childNodes.length; i++) {
          var monster = monsters.childNodes.item(i);
          var x = parseInt(monster.getAttribute("x"));
          var y = parseInt(monster.getAttribute("y"));

          // player collides with a monster, GG GameOver
          if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
              endGame();
              return;
          }
      }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;

                //write some code to update the score
                setScore(score + SCORE_MONSTER);
            }
        }
    }

    // check whether a player reach the exit
    var exit = svgdoc.getElementById("exitpos").childNodes[0];
    {
      var x = parseInt(exit.getAttribute("x"));
      var y = parseInt(exit.getAttribute("y"));
      // console.log(x +" " + y);
      if (intersect(new Point(x, y), EXIT_SIZE, player.position, PLAYER_SIZE)) {
          // check if all the goodies are collected
          var goodies = svgdoc.getElementById("goodies");
          if(goodies.childNodes.length == 0) {
            levelUp();
          }
          else {
            console.log("Please collect all goodies first");
          }
      }
    }

    // check whether a player touch the good thing
    var goodies = svgdoc.getElementById("goodies");
    for (var i = 0; i < goodies.childNodes.length; i++) {
        var goodie = goodies.childNodes.item(i);
        var x = parseInt(goodie.getAttribute("x"));
        var y = parseInt(goodie.getAttribute("y"));

        // player collides with a monster, GG GameOver
        if (intersect(new Point(x, y), GD_SIZE, player.position, PLAYER_SIZE)) {
            goodies.removeChild(goodie);
            setScore(score + SCORE_GOODTHING);
            return;
        }
    }
}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT) {
        displacement.x = -MOVE_DISPLACEMENT;
    }
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets, call the movebullets when you create the monsters and bullets
    moveBullets();

    updateScreen();
}

function createPlatforms() {
    var platforms = svgdoc.getElementById("platforms");
    for (y = 0; y < GAME_MAP.length; y++) {
        var start = null, end = null;
        for (x = 0; x < GAME_MAP[y].length; x++) {
            if (start == null && GAME_MAP[y].charAt(x) == '#') start = x; if (start != null && GAME_MAP[y].charAt(x) == ' ') end = x - 1; if (start != null && x == GAME_MAP[y].length - 1) end = x;
            if (start != null && end != null) {
                var platform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
                platform.setAttribute("x", start * 20);
                platform.setAttribute("y", y * 20);
                platform.setAttribute("width", (end - start + 1) * 20);
                platform.setAttribute("height", 20);
                platform.setAttribute("fill", "orange");
                platforms.appendChild(platform);
                start = end = null;
                start = end = null;
            }
        }
    }
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    var pkc = svgdoc.getElementById("pikachu");
    // flip the character
    if(player.motion == motionType.RIGHT) {
      pkc.setAttribute("transform", "translate(" + PLAYER_SIZE.w +",0) scale(-1,1) scale(0.05375, 0.0499)");
    }
    else if (player.motion == motionType.LEFT){
      pkc.setAttribute("transform", "scale(0.05375, 0.0499)");
    }

    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
SETTERS
*/
function setScore(s) {
  if(s >= 0) {
    score = s;
    svgdoc.getElementById("score").textContent = score;
  }
}

function setLevel(l) {
  if(l >= 1) {
    level = l;
    svgdoc.getElementById("level").textContent = level;
  }
}

function setTime(t) {
  if(t >= 0) {
    time = t;
    svgdoc.getElementById("timer").textContent = time;
  }
}

function setBullet(n) {
  if(n >= 0) {
    numBullet = n;
    svgdoc.getElementById("numBullet").textContent = numBullet;
  }
  else {
    svgdoc.getElementById("numBullet").textContent = "Unlimited";
  }
}
