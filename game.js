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
var PLAYER_INIT_POS  = new Point(0, 0);     // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;           // The speed of a bullet
                                    //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;         // The period when shooting is disabled
var canShoot = true;                // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);  // The size of a monster

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game

//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();

    // reset score
    score = 0;

    // prompt for player name input
    var input = prompt("What is your name? ^_^", "");
    if(input == null || input.trim() == "") {
      player.name = "Anonymous";
    }
    else {
      player.name = input;
    }
    console.log(player.name);

    // set the player name on the player svg
    player.node.children[0].textContent= player.name;

    // Create the game platform
    createPlatforms();

    // Create the monsters
    createMonster(200, 15);
    createMonster(400, 270);

    // hide the starting screen
    var node = svgdoc.getElementById("startingscreen");
    node.style.setProperty("visibility", "hidden", null);

    // hide the scoreTable in initial
    var node = svgdoc.getElementById("highscoretable");
    node.style.setProperty("visibility", "hidden", null);

    // clear previosu game interval
    if(gameInterval) {
      clearInterval(gameInterval);
    }
    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
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

//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    canShoot = false;
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
            if (canShoot) shootBullet();
            break;

        case "C".charCodeAt(0): // cheat mode
            // kill all monster
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
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            // Clear the game interval
            clearInterval(gameInterval);

            // Get the high score table from cookies
            var scoreTable = getHighScoreTable();

            // Create the new score record
            var newRecord = new ScoreRecord(player.name, score);

            // Insert the new score record
            var index = 0;
            // append the record sort by score, higher score in front
            for(var i = 0; i < scoreTable.length; i++) {
              if(score < scoreTable[i].score) {
                index ++;
              }
            }

            // only the 10 highest score
            if(index < 10) {
              // add new score to score table
              scoreTable.splice(index, 0, newRecord);
            }

            // Store the new high score table
            setHighScoreTable(scoreTable);

            // Show the high score table
            showHighScoreTable(scoreTable);

            return;
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
                score += 100;
                // var scoreTxt = svgdoc.getElementById("score").firstChild.data;
                svgdoc.getElementById("score").firstChild.data = score;
            }
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
      pkc.setAttribute("transform", "translate(43,0) scale(-1,1) scale(0.05375, 0.0499)");
    }
    else if (player.motion == motionType.LEFT){
      pkc.setAttribute("transform", "scale(0.05375, 0.0499)");
    }

    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");

}
