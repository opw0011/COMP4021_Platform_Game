var COOKIE_EXPIRE_DAYS = 30;

// UNIT TESTING
// setHighScoreTable([new ScoreRecord("Funk", 1), new ScoreRecord("GG", 44)]);
// END TESTING

//
// A score record JavaScript class to store the name and the score of a player
//
function ScoreRecord(name, score) {
    this.name = name;
    this.score = score;
}


//
// This function reads the high score table from the cookies
//
function getHighScoreTable() {
    var table = new Array();

    for (var i = 0; i < 10; i++) {
        // Contruct the cookie name
        var cookieName = "player" + i;
        // Get the cookie value using the cookie name
        var cookie = getCookie(cookieName);

        // If the cookie does not exist exit from the for loop
        if(!cookie) break;

        // Extract the name and score of the player from the cookie value
        console.log(cookie);
        var cookieArray = cookie.split("~");  // NAME~SCORE
        var playername = cookieArray[0];
        var score = parseInt(cookieArray[1]);

        // Add a new score record at the end of the array
        table.push(new ScoreRecord(playername, score));
    }

    return table;
}


//
// This function stores the high score table to the cookies
//
function setHighScoreTable(table) {
    for (var i = 0; i < 10; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) break;

        // Contruct the cookie name
        var cookieName = "player" + i;
        var value = table[i].name + "~" + table[i].score;
        var date = new Date();
        date.setTime(date.getTime()+(COOKIE_EXPIRE_DAYS *24*60*60*1000));
        console.log(cookieName + value + date);
        // Store the ith record as a cookie using the cookie name
        setCookie(cookieName, value, date, null, null, null);
    }
}


//
// This function adds a high score entry to the text node
//
function addHighScore(record, node) {
    // Create the name text span
    var name = svgdoc.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text

    // Add the name to the text node

    // Create the score text span
    var score = svgdoc.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text

    // Add the name to the text node
}


//
// This function shows the high score table to SVG
//
function showHighScoreTable(table) {
    // Show the table
    var node = svgdoc.getElementById("highscoretable");
    node.style.setProperty("visibility", "visible", null);

    // Get the high score text node
    var node = svgdoc.getElementById("highscoretext");

    for (var i = 0; i < 10; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) break;

        // Add the record at the end of the text node
        addHighScore(table[i], node);
    }
}


//
// The following functions are used to handle HTML cookies
//

//
// Set a cookie
//
function setCookie(name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    document.cookie = curCookie;
}


//
// Get a cookie
//
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else
        begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
        end = dc.length;
    return unescape(dc.substring(begin + prefix.length, end));
}


//
// Delete a cookie
//
function deleteCookie(name, path, domain) {
    if (get_cookie(name)) {
        document.cookie = name + "=" +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}
