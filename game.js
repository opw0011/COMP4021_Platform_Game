// The point and size class used in this program
function Point(x, y) {
    this.x = (x) ? parseFloat(x) : 0.0;
    this.y = (y) ? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w) ? parseFloat(w) : 0.0;
    this.h = (h) ? parseFloat(h) : 0.0;
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
    this.shootingDirection = motionType.LEFT;
    this.verticalSpeed = 0;
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
        if (node.id == "movingplatform") continue;

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

Player.prototype.collideVerticalPlatform = function(position) {
    var node = svgdoc.getElementById("movingplatform");
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    var pos = new Point(x, y);
    var size = new Size(w, h);

    if (intersect(position, PLAYER_SIZE, pos, size)) {
        if (!(Math.abs(this.position.y + PLAYER_SIZE.h - y) <= PLATFORM_VERTICAL_DISPLACEMENT))
            position.x = this.position.x;
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            if (this.position.y >= y + h - 5) {
                // below the platform
                position.y = y + h ;
                this.verticalSpeed = -2;
            } else {
                // place on top of platform
                position.y = y - PLAYER_SIZE.h;
                // console.log(123);
                // console.log(this.position);
                // console.log(position);
                // console.log(pos);
                this.verticalSpeed = -2;
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

Player.prototype.isOnVerticalPlatform = function() {
    var node = svgdoc.getElementById("movingplatform");
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));

    var onPlatform = (this.position.x + PLAYER_SIZE.w > x) && (this.position.x < x + w);
    onPlatform = onPlatform && (Math.abs(this.position.y + PLAYER_SIZE.h - y) <= 1); // stand on platform
    onPlatform = onPlatform && (this.position.y < y + h);

    return onPlatform;
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40); // The size of the player
var SCREEN_SIZE = new Size(600, 560); // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 400);     // The initial position of the player
// var PLAYER_INIT_POS  = new Point(0, 20);     // The initial position of the player
// var PLAYER_INIT_POS = new Point(450, 400); // The initial position of the player

var MOVE_DISPLACEMENT = 5; // The speed of the player in motion
var JUMP_SPEED = 13; // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1; // The displacement of vertical speed

var GAME_INTERVAL = 25; // The time interval of running the game

var BULLET_SIZE = new Size(12, 12); // The size of a bullet
var SBULLET_SIZE = new Size(10, 10); // The size of a bullet

var BULLET_SPEED = 10.0; // The speed of a bullet
//  = pixels it moves each game loop
var SHOOT_INTERVAL = 500.0; // The period when shooting is disabled
var canShoot = true; // A flag indicating whether the player can shoot a bullet
var numBullet = 8;

var smonsterCanShoot = true;

var MONSTER_SIZE = new Size(40, 40); // The size of a monster

var EXIT_SIZE = new Size(45, 40); // the size of the exit gate
var GD_SIZE = new Size(20, 25); // the size of the goodie
var TP_SIZE = new Size(30, 35); // the size of the transmission portal

// Score formula
var SCORE_MONSTER = 50;
var SCORE_GOODTHING = 10;
var SCORE_LEVEL = 200;
var SCORE_TIME = 1;

var PLATFORM_VERTICAL_DISPLACEMENT = 2; // The displacement of vertical speed
var MONSTER_MAX_DISPLACEMENT = 60; // The displacement of vertical speed


//
// Variables in the game
//
var motionType = {
    NONE: 0,
    LEFT: 1,
    RIGHT: 2
}; // Motion enum

var svgdoc = null; // SVG root document node
var player = null; // The player object
var gameInterval = null; // The interval
var zoom = 1.0; // The zoom level of the screen
var score = 0; // The score of the game
var gameTimer = null;
var time = 80;
var level = 1;
var defaultPlayerName = "";
var cheatModeOn = false;
// var smonster = null;

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

    // set music volumn
    var bgAudio = document.getElementById("bgmusic");
    bgAudio.volumn = 0.1;

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

    if (level == 1) {
        setScore(0);

        // prompt for player name input
        var input = prompt("What is your name? ^_^", defaultPlayerName);
        if (input == null || input.trim() == "") {
            defaultPlayerName = "Anonymous";
        } else {
            defaultPlayerName = input;
        }
    }

    // reset Bullet
    if (!cheatModeOn) {
        setBullet(8);
    }

    player.name = defaultPlayerName; // when level up, keep the player name
    player.node.children[0].textContent = defaultPlayerName; // set the player name on the player svg

    // create d platforms
    createDisappearingPlatform(80, 380, 60, 20);
    createDisappearingPlatform(80, 220, 100, 20);
    createDisappearingPlatform(260, 80, 60, 20);


    // Generate monsters according to the level
    // initial: 4 monsters, add 4 each time
    spawnMonsters(6 + (level - 1) * 4);

    // special monster
    spawnSpecialMonster();
    smonsterCanShoot = true;

    // Spawn good thing
    spawnGoodies(8);

    // create exit
    createExit(0, 40);

    // create portals
    createPortal(565, 85, "tp1");
    createPortal(0, 180, "tp1");


    // reset time
    setTime(80);

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

    // start game timer
    gameTimer = setInterval("updateGameTimer()", 1000);
}

// game OVER
function endGame() {
    // play sound
    document.getElementById("a_die").play();

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
    for (var i = 0; i < scoreTable.length; i++) {
        if (score < scoreTable[i].score) {
            index++;
        }
    }

    // only top5 highest score
    if (index < 5) {
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

    // play sound
    document.getElementById("a_levelup").play();

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
    setScore(0); // reset score
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

    var platforms = svgdoc.getElementById("platforms");
    // reset visibility of disappearing platforms
    for (var i = 0; i < platforms.childNodes.length; i++) {
      var node = platforms.childNodes.item(i);
      if (node.nodeName != "rect") continue;
      if (node.getAttribute("type") == "disappearing") {
        node.setAttribute("disappear", "false");
        node.style.setProperty("opacity", "1.0", null);
      }
    }
}

function updateGameTimer() {
    setTime(time - 1);
    // game over
    if (time <= 0) {
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
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "monster.svg#monster");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttribute("rotate", getRandomInt(0,40));
    monster.setAttribute("animation", 0);
    monster.setAttribute("speed", getRandomInt(1,3));
    monster.setAttribute("motion", getRandomInt(0,1));
    monster.setAttribute("anchorx", x);
    monster.setAttribute("canShoot", "false");
    svgdoc.getElementById("monsters").appendChild(monster);
    return monster;
}

// create N monsters in map randomly
function spawnMonsters(n) {
    var playerProtectZone = new Size(PLAYER_SIZE.w + 150, PLAYER_SIZE.h + 150); // area to protect monster spawn near player
    for (var i = 0; i < n; i++) {
        var monster = {};
        var x = getRandomInt(0, SCREEN_SIZE.w - MONSTER_SIZE.w);
        var y = getRandomInt(0, SCREEN_SIZE.h - MONSTER_SIZE.h);
        monster.position = new Point(x, y);
        console.log("monster " + i + "  x:" + x + " y:" + y);

        // make sure monster cannot spawn close to player
        var playerOffSetPosition = new Point(player.position.x - playerProtectZone.w/2, player.position.y - playerProtectZone.h/2);

        while (true) {
            // if (!intersect(player.position, playerProtectZone, monster.position, MONSTER_SIZE))
            if (!intersect(playerOffSetPosition, playerProtectZone, monster.position, MONSTER_SIZE))
                break;
            // console.log("monster collides with player");
            console.log(player.position);
            console.log(monster.position);
            monster.position.x = getRandomInt(0, SCREEN_SIZE.w - MONSTER_SIZE.w);
            monster.position.y = getRandomInt(0, SCREEN_SIZE.h - MONSTER_SIZE.h);
            // console.log("new");
            // console.log(monster.position);
        }
        createMonster(monster.position.x, monster.position.y);
    }
}

function spawnSpecialMonster() {
    // spawn on platform, away from player
    // random spawn
    // TODO: Random x, y and on platform
    var x = getRandomInt(0, SCREEN_SIZE.w - MONSTER_SIZE.w);
    var y = getRandomInt(0, SCREEN_SIZE.h - MONSTER_SIZE.h);

    var playerProtectZone = new Size(PLAYER_SIZE.w + 150, PLAYER_SIZE.h + 150); // area to protect monster spawn near player
    var playerOffSetPosition = new Point(player.position.x - playerProtectZone.w/2, player.position.y - playerProtectZone.h/2);
    while (true) {
        // if (!intersect(player.position, playerProtectZone, monster.position, MONSTER_SIZE))
        var ok = ! intersect(playerOffSetPosition, playerProtectZone, new Point(x, y), MONSTER_SIZE);
        // ensure smonster do not spwan and can shoot player at first

        ok = ok && ((y + MONSTER_SIZE.h < player.position.y) || (player.position.y + PLAYER_SIZE.y > y))
        // if (!intersect(playerOffSetPosition, playerProtectZone, new Point(x, y), MONSTER_SIZE))
        if (ok)
            break;
        // console.log("monster collides with player");
        console.log(player.position);
        // console.log(monster.position);
        x = getRandomInt(0, SCREEN_SIZE.w - MONSTER_SIZE.w);
        y = getRandomInt(0, SCREEN_SIZE.h - MONSTER_SIZE.h);
        // console.log("new");
        // console.log(monster.position);
    }

    var smonster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    smonster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "smonster.svg#smonster");
    smonster.setAttribute("x", x);
    smonster.setAttribute("y", y);
    smonster.setAttribute("rotate", getRandomInt(0,40));
    smonster.setAttribute("animation", 0);
    smonster.setAttribute("speed", getRandomInt(1,2));
    smonster.setAttribute("motion", getRandomInt(0,1));
    smonster.setAttribute("anchorx", x);
    smonster.setAttribute("canShoot", "true");
    smonster.setAttribute("id", "smonster");
    svgdoc.getElementById("monsters").appendChild(smonster);
    return smonster;
}

function createGoodie(x, y) {
    var goodie = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    goodie.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodie");
    goodie.setAttribute("x", x);
    goodie.setAttribute("y", y);
    svgdoc.getElementById("goodies").appendChild(goodie);
}

function spawnGoodies(n) {
    for (var i = 0; i < n; i++) {
        var goodie = {};
        var x = getRandomInt(0, SCREEN_SIZE.w - GD_SIZE.w);
        var y = getRandomInt(0, SCREEN_SIZE.h - GD_SIZE.h);
        goodie.position = new Point(x, y);
        // make sure goodies cannot spawn insides platforms

        while (true) {
            if (!iscollideWithPlatform(goodie.position, GD_SIZE))
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

function createDisappearingPlatform(x, y, w, h) {
    var dp = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    dp.setAttribute("type", "disappearing");
    dp.setAttribute("x", x);
    dp.setAttribute("y", y);
    dp.setAttribute("width", w);
    dp.setAttribute("height", h);
    dp.setAttribute("disappear", "false");
    dp.setAttribute("style", "fill:#1c9205;opacity:1;");
    svgdoc.getElementById("platforms").appendChild(dp);
}

function createPortal(x, y, id) {
    var portal = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    portal.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "portal.svg#portal");
    portal.setAttribute("x", x);
    portal.setAttribute("y", y);
    portal.setAttribute("pid", id);
    svgdoc.getElementById("portals").appendChild(portal);
}

//
// This function shoots a bullet from the player
//
function shootBullet() {
    // play sound
    document.getElementById("a_pika").play();

    // Disable shooting for a short period of time
    canShoot = false;

    // update number of bullets remaining
    if (!cheatModeOn) {
        setBullet(numBullet - 1);
    }

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

    // set shooting direction of bullet
    bullet.setAttribute("direction", player.shootingDirection);

    // Calculate and set the position of the bullet
    if (player.shootingDirection == motionType.RIGHT) {
        bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2);
        bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    } else {
        bullet.setAttribute("x", player.position.x - PLAYER_SIZE.w / 2);
        bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    }

    // Set the href of the use node to the bullet defined in the defs node
    // bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "pokeball.svg#bullet");

    // Append the bullet to the bullet group
    svgdoc.getElementById("bullets").appendChild(bullet);
    // enable shooting again
    setTimeout("canShoot = true", SHOOT_INTERVAL);
}

function monsterShootBullet() {
    // play sound
    // document.getElementById("a_pika").play();

    // Disable shooting for a short period of time
    smonsterCanShoot = false;

    var smonster = svgdoc.getElementById("smonster");
    console.log(smonster);

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");

    var motion = smonster.getAttribute("motion");
    var x = parseInt(smonster.getAttribute("x"));
    var y = parseInt(smonster.getAttribute("y"));

    // set shooting direction of bullet
    bullet.setAttribute("direction", motion);
    bullet.setAttribute("shootBy", "monster");
    bullet.setAttribute("id", "sbullet");

    // Calculate and set the position of the bullet
    bullet.setAttribute("x", x + MONSTER_SIZE.w / 2);
    bullet.setAttribute("y", y + MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2);

    // Set the href of the use node to the bullet defined in the defs node
    // bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");

    console.log(bullet);
    // Append the bullet to the bullet group
    svgdoc.getElementById("bullets").appendChild(bullet);
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
        if (direction == motionType.RIGHT) {
            node.setAttribute("x", x + BULLET_SPEED);
        } else {
            node.setAttribute("x", x - BULLET_SPEED);
        }


        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            bullets.removeChild(node);
            i--;

            // set monster canshootbullet to true
            var shootBy = node.getAttribute("shootBy");
            console.log(shootBy);
            if(shootBy != null && shootBy == "monster") {
              smonsterCanShoot = true;
            }
        }
    }
}

function moveMonsters() {
  var monsters = svgdoc.getElementById("monsters");
  // return;
  for (var i = 0; i < monsters.childNodes.length; i++) {

      var node = monsters.childNodes.item(i);
      var rotate = parseInt(node.getAttribute("rotate"));
      var motion = node.getAttribute("motion");
      var canShoot = node.getAttribute("canShoot");
      var anchorx = parseInt(node.getAttribute("anchorx"));
      var speed = parseInt(node.getAttribute("speed"));
      var x = parseInt(node.getAttribute("x"));
      var y = parseInt(node.getAttribute("y"));

      // Moving Left or RIGHT
      if(x < anchorx && anchorx - x > MONSTER_MAX_DISPLACEMENT || x <= 0) {
        motion = motionType.RIGHT;
      }
      if(x >= anchorx && x - anchorx > MONSTER_MAX_DISPLACEMENT || x >= SCREEN_SIZE.w - MONSTER_SIZE.w) {
        motion = motionType.LEFT;
      }
      node.setAttribute("motion", motion);

      if(motion == motionType.LEFT) {
        x -= speed;
        if(canShoot == "false")
          node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "monster.svg#monster");
        else {
          node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "smonster.svg#smonster");
        }
      }
      else {
        x += speed;
        if(canShoot == "false")
          node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "monster1.svg#monster");
        else
          node.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "smonster1.svg#smonster");

      }
      // node.setAttribute("transform", "");

      node.setAttribute("x", x);

      if(canShoot == "true")  continue; // special monster dont rotate
      // Rotate animation
      if(rotate > 40) {
        node.setAttribute("animation", 1);
      }
      if(rotate < -40) {
        node.setAttribute("animation", 0);
      }

      var animation = node.getAttribute("animation");
      if(animation == 1)  {
        rotate -= 1;
      }
      else {
        rotate += 2;
      }

      var rotateParam = "rotate(" + rotate + "," + x + "," + y +")";
      node.setAttribute("rotate", rotate);
      node.setAttribute("transform", rotateParam);
  }
}

//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode) ? evt.keyCode : evt.getKeyCode();

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
    var keyCode = (evt.keyCode) ? evt.keyCode : evt.getKeyCode();

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
    if (!cheatModeOn) {
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
        // mosnter bullet cant kill monster
        var shootBy = bullet.getAttribute("shootBy");
        if(shootBy != null && shootBy == "monster") {
          continue;
        }

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

                // play sound
                document.getElementById("a_beep").play();
                //write some code to update the score
                setScore(score + SCORE_MONSTER);
            }
        }
    }

    // check whether a player reach the exit
    var exit = svgdoc.getElementById("exitpos").childNodes[0]; {
        var x = parseInt(exit.getAttribute("x"));
        var y = parseInt(exit.getAttribute("y"));
        // console.log(x +" " + y);
        if (intersect(new Point(x, y), EXIT_SIZE, player.position, PLAYER_SIZE)) {
            // check if all the goodies are collected
            var goodies = svgdoc.getElementById("goodies");
            if (goodies.childNodes.length == 0) {
                levelUp();
            } else {
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

        if (intersect(new Point(x, y), GD_SIZE, player.position, PLAYER_SIZE)) {
            goodies.removeChild(goodie);
            setScore(score + SCORE_GOODTHING);
            // play sound
            document.getElementById("a_goodie").play();
            return;
        }
    }

    // check whether a player touch portal
    var portals = svgdoc.getElementById("portals");
    for (var i = 0; i < portals.childNodes.length; i++) {
        var portal = portals.childNodes.item(i);
        var x = parseInt(portal.getAttribute("x"));
        var y = parseInt(portal.getAttribute("y"));

        // player collides with a TP, move to another portal
        if (intersect(new Point(x, y), TP_SIZE, player.position, PLAYER_SIZE)) {
            console.log("TP");
            // hot fix, assume only 2 portal
            for(var j = 0; j < portals.childNodes.length; j++) {
              if(i == j)  continue;
              var portal2 = portals.childNodes.item(j);
              if(portal.getAttribute("pid") != portal2.getAttribute("pid")) continue;

              // same portal
              var x = parseInt(portal2.getAttribute("x"));
              var y = parseInt(portal2.getAttribute("y"));

              if(player.motion == motionType.LEFT) {
                // player.position.x = x - TP_SIZE.w;
                player.position.x = x - PLAYER_SIZE.w;
                player.position.y = y + TP_SIZE.h;
              }
              else {
                player.position.x = x + TP_SIZE.w;
                player.position.y = y + TP_SIZE.h;
              }
              player.verticalSpeed = 0;
              break;
            }

            // play sound
            document.getElementById("a_goodie").play();
        }
    }

    // TODO: check smonster bullet kill player
    var sbullet = svgdoc.getElementById("sbullet");
    if(sbullet != null && cheatModeOn == false) // ignore when cheat mode is on
    {
      var x = parseInt(sbullet.getAttribute("x"));
      var y = parseInt(sbullet.getAttribute("y"));
      if (intersect(new Point(x, y), SBULLET_SIZE, player.position, PLAYER_SIZE)) {
          // check if the monster bullet collide with the player
          endGame();
      }
    }
}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();

    // update vertical platform, moving up and down
    updateVerticalPlatform();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    // console.log(isOnPlatform);

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;

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
    player.collideVerticalPlatform(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // special monster shoot bullets
    if(smonsterCanShoot)
      monsterShootBullet();

    // Move the bullets, call the movebullets when you create the monsters and bullets
    moveBullets();

    UpdateDisappearingPlatform();

    moveMonsters();

    updateScreen();
}

function createPlatforms() {
    var platforms = svgdoc.getElementById("platforms");
    for (y = 0; y < GAME_MAP.length; y++) {
        var start = null,
            end = null;
        for (x = 0; x < GAME_MAP[y].length; x++) {
            if (start == null && GAME_MAP[y].charAt(x) == '#') start = x;
            if (start != null && GAME_MAP[y].charAt(x) == ' ') end = x - 1;
            if (start != null && x == GAME_MAP[y].length - 1) end = x;
            if (start != null && end != null) {
                var platform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
                platform.setAttribute("x", start * 20);
                platform.setAttribute("y", y * 20);

                platform.setAttribute("width", (end - start + 1) * 20);
                platform.setAttribute("height", 20);
                // platform.setAttribute("style", "fill:#B71919");
                platform.setAttribute("style", "fill:#7BBD62");
                platforms.appendChild(platform);
                start = end = null;
                start = end = null;
            }
        }
    }
}

function updateVerticalPlatform() {
    var node = svgdoc.getElementById("movingplatform");
    var y = parseInt(node.getAttribute("y"));
    if (y >= node.getAttribute("max")) {
        node.setAttribute("up", "true");
    }
    if (y <= node.getAttribute("min")) {
        node.setAttribute("up", "false");
    }
    if (node.getAttribute("up") == "true") {
        node.setAttribute("y", y - PLATFORM_VERTICAL_DISPLACEMENT);
    } else {
        node.setAttribute("y", y + PLATFORM_VERTICAL_DISPLACEMENT);
    }
}

function UpdateDisappearingPlatform() {
    // disappearing platform
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var platform = platforms.childNodes.item(i);
        if (platform.nodeName != "rect") continue;
        if (platform.getAttribute("type") == "disappearing") {
            // check if close to platform
            var x = parseInt(platform.getAttribute("x"));
            var y = parseInt(platform.getAttribute("y"));
            var w = parseInt(platform.getAttribute("width"));
            var h = parseInt(platform.getAttribute("height"));

            // if player touch a platform, it will disappear graduatly
            if (player.position.x >= x && player.position.x <= x + w && player.position.y + PLAYER_SIZE.h - y == 0) {
                platform.setAttribute("disappear", "true");
            }

            if (platform.getAttribute("disappear") == "true") {
                var platformOpacity = parseFloat(platform.style.getPropertyValue("opacity"));
                if (platformOpacity <= 0) {
                    platforms.removeChild(platform);
                }
                platformOpacity -= 0.1;
                platform.style.setProperty("opacity", platformOpacity, null);
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
    if (player.motion == motionType.RIGHT) {
        pkc.setAttribute("transform", "translate(" + PLAYER_SIZE.w + ",0) scale(-1,1) scale(0.05375, 0.0499)");
    } else if (player.motion == motionType.LEFT) {
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
    if (s >= 0) {
        score = s;
        svgdoc.getElementById("score").textContent = score;
    }
}

function setLevel(l) {
    if (l >= 1) {
        level = l;
        svgdoc.getElementById("level").textContent = level;
    }
}

function setTime(t) {
    if (t >= 0) {
        time = t;
        svgdoc.getElementById("timer").textContent = time;
    }
}

function setBullet(n) {
    if (n >= 0) {
        numBullet = n;
        svgdoc.getElementById("numBullet").textContent = numBullet;
    } else {
        svgdoc.getElementById("numBullet").textContent = "Unlimited";
    }
}
