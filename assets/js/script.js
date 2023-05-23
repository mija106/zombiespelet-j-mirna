var startScreenDiv = document.getElementById("start-screen");
var howToPlayButton = document.getElementById("how-to-play-button");
var gameDiv = document.getElementById("game");
var howToPlayDiv = document.getElementById("how-to-play");
var howToPlayShown = false;
var closeButton = document.getElementById("close-button");


document.getElementById("play-button").addEventListener("click", () => {
    startScreenDiv.style.display = "none";
    gameDiv.style.display = "block";
    playGame();
});

howToPlayButton.addEventListener("click", () => {
    if (howToPlayShown) {
        howToPlayDiv.style.display = "none";
        howToPlayShown = false;
    } else {
        howToPlayDiv.style.display = "block";
        howToPlayShown = true;
    }
});

closeButton.addEventListener("click", function () {
    howToPlayDiv.style.display = "none";
    howToPlayShown = false;
});
