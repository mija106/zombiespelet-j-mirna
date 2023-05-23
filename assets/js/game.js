function playGame() {
	// Hämta canvas-elementet och dess kontext
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	// Anropa resize-funktionen när fönstret ändrar storlek
	window.addEventListener("resize", resizeCanvas);
	// Anropa resize-funktionen en gång i början
	resizeCanvas();
	// Definera canvas storlek
	var width = canvas.width;
	var height = canvas.height;
	// Definiera några konstanter
	var PI = Math.PI;
	var TWO_PI = PI * 2;
	// Definiera några variabler
	var score = 0; // Den nuvarande poängen
	var gameOver = false; // Flagga för spelets slut
	var player; // Spelarobjektet
	var zombies = []; // Arrayen av zombies
	var bullets = []; // Arrayen av kulor
	// Definiera några färger
	var playerColor = "lime";
	var zombieColor = "red";
	var bulletColor = "yellow";
	// Definiera några ljud
	var shootSound = new Audio("assets/effects/shoot.wav");
	var hitSound = new Audio("assets/effects/hit.wav");
	var dieSound = new Audio("assets/effects/die.wav");

	// Definiera några variabler för intervallet och hastigheten
	var zombieInterval = 1000; // Det nuvarande intervallet för att skapa zombies (i millisekunder)
	var zombieSpeed = 1; // Den nuvarande hastigheten för zombies (i pixlar per bildruta)
	var zombieIntervalId; // Deklarera en variabel för intervallet för att skapa zombies


	// Lägg till en global variabel för pausläget
	var paused = false;


	// Sätt canvas storlek till att matcha fönsterstorleken
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	// Skapa spelarobjektet med egenskaper och metoder
	player = createPlayer(width / 2, height / 2, 20, PI / -2, 5);

	// Skapa en funktion för att skapa ett spelarobjekt
	function createPlayer(x, y, r, a, speed) {
		return {
			x: x, // x-koordinaten
			y: y, // y-koordinaten
			r: r, // Radien
			a: a, // Vinkeln (vänder uppåt)
			speed: speed, // Hastigheten
			lives: 3,
			invulnerable: false, // Flagga för odödlighet

			update: function () { // Uppdateringsmetoden
				// Flytta spelaren enligt tangentbordsinmatningen
				if (keys[37]) { // Vänsterpilknappen
					this.a -= PI / 60; // Rotera vänster
				}
				if (keys[39]) { // Högerpilknappen
					this.a += PI / 60; // Rotera höger
				}
				if (keys[38]) { // Upppilknappen
					this.x += Math.cos(this.a) * this.speed; // Flytta framåt i x-riktningen
					this.y += Math.sin(this.a) * this.speed; // Flytta framåt i y-riktningen
				}
				if (keys[40]) { // Nedpilknappen
					this.x -= Math.cos(this.a) * this.speed; // Flytta bakåt i x-riktningen
					this.y -= Math.sin(this.a) * this.speed; // Flytta bakåt i y-riktningen
				}
				// Håll spelaren inom canvas-gränserna
				if (this.x < this.r) {
					this.x = this.r;
				}
				if (this.x > width - this.r) {
					this.x = width - this.r;
				}
				if (this.y < this.r) {
					this.y = this.r;
				}
				if (this.y > height - this.r) {
					this.y = height - this.r;
				}

				// Rita spelaren som en cirkel med en linje som indikerar riktningen
				ctx.fillStyle = playerColor;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.r, 0, TWO_PI);
				ctx.fill();
				ctx.strokeStyle = "white"; // Ändra färgen till vit
				ctx.lineWidth = 3; // Gör linjen tjockare
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(this.x + Math.cos(this.a) * this.r, this.y + Math.sin(this.a) * this.r);
				ctx.stroke();
			}
		};
	}

	// Skapa en funktion för att skapa ett zombieobjekt
	function Zombie(x, y) {
		return {
			x: x,
			y: y,
			r: (Math.random() * 10) + 10,
			speed: zombieSpeed,
			a: Math.atan2(player.y - y, player.x - x),
			health: 2,
			update: function () { // Uppdateringsmetoden
				if (!gameOver) {
					// Flytta zombien mot spelaren enligt vinkeln och hastigheten
					this.x += Math.cos(this.a) * this.speed;
					this.y += Math.sin(this.a) * this.speed;
					// Kolla om zombien kolliderar med spelaren
					var dx = this.x - player.x;
					var dy = this.y - player.y;
					var d = Math.sqrt(dx * dx + dy * dy);
					if (d < this.r + player.r && player.lives == 0) {
						// Spelet är över
						gameOver = true;
						dieSound.play();
						document.getElementById("lives").style.display = "none";
						document.getElementById("gameover").style.display = "block";
					} else if (d < this.r + player.r && player.lives > 0 && player.invulnerable === false) {
						hitSound.play();
						player.lives--;
						player.invulnerable = true;
						setTimeout(() => {
							player.invulnerable = false;
						}, 500)

					}

				}
				// Rita zombien som en cirkel
				ctx.fillStyle = zombieColor;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.r, 0, TWO_PI);
				ctx.fill();
			}
		};
	}
	// Funktionen för att hantera poäng
	function setScore(r) {
		if (r > 15) { // Om Zombie större än 15 px 
			score += 2; // Ge två poäng
		} else { // Om inte 
			score++; // Ge en poäng
		}
	}

	// Skapa en funktion för att skapa ett kulobjekt
	function createBullet(x, y, a) {
		return {
			x: x, // x-koordinaten
			y: y, // y-koordinaten
			r: 5, // Radien
			a: a, // Vinkeln
			speed: 10, // Hastigheten
			damage: 1,
			update: function () { // Uppdateringsmetoden
				if (!gameOver) {
					// Flytta kulan enligt vinkeln och hastigheten
					this.x += Math.cos(this.a) * this.speed;
					this.y += Math.sin(this.a) * this.speed;
					// Kolla om kulan kolliderar med någon zombie
					for (var i = 0; i < zombies.length; i++) {
						var zombie = zombies[i];
						var dx = this.x - zombie.x;
						var dy = this.y - zombie.y;
						var d = Math.sqrt(dx * dx + dy * dy);
						if (d < this.r + zombie.r && zombie.health == 0) {
							// Ta bort kulan och zombien från deras arrayer
							bullets.splice(bullets.indexOf(this), 1);
							zombies.splice(i, 1);
							// Hantera poängen beroende på storlek
							setScore(zombie.r);
							hitSound.play();
							updateDifficulty(); // Anropa funktionen updateDifficulty här
							// Stoppa loopen
							break;
						} else if (d < this.r + zombie.r && zombie.health > 0) {
							bullets.splice(bullets.indexOf(this), 1);
							zombie.health -= this.damage;
						}
					}
				}
				// Rita kulan som en cirkel
				ctx.fillStyle = bulletColor;
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.r, 0, TWO_PI);
				ctx.fill();
			}
		};
	}
	// Definiera ett objekt för att lagra tangentbordsinmatningens tillstånd
	var keys = {};
	// Lägg till en händelselyssnare för keydown-händelser
	window.addEventListener("keydown", function (e) {
		keys[e.keyCode] = true;
		if (e.key == ' ') { // Mellanslagstangenten
			if (paused) return;
			if (!gameOver) {
				// Skapa en ny kula vid spelarens position och vinkel
				var bullet = createBullet(player.x + Math.cos(player.a) * player.r, player.y + Math.sin(player.a) * player.r, player.a);
				// Lägg till kulan i arrayen av kulor
				bullets.push(bullet);
				shootSound.play();
			} else {
				// Starta om spelet
				restart();
				keys[e.keyCode] = false; // Lägg till den här raden kod
			}
		}
		if (e.keyCode == 27) { // ESC-tangenten
			togglePause(); // Anropa en funktion för att växla pausläget
		}
	});
	// Lägg till en händelselyssnare för keyup-händelser
	window.addEventListener("keyup", function (e) {
		keys[e.keyCode] = false;
	});
	// Lägg till en funktion för att växla pausläget
	function togglePause() {
		paused = !paused; // Vänd på det booleska värdet
		if (paused) { // Om spelet är pausat
			clearInterval(zombieIntervalId); // Rensa intervallet
		} else { // Om spelet inte är pausat
			requestAnimationFrame(loop); // Anropa loop-funktionen igen
			zombieIntervalId = setInterval(createZombie, zombieInterval); // Ställ in intervallet igen
		}
	}

	// Skapa en funktion för att återställa spelets tillstånd
	function restart() {
		ctx.reset();
		// Återställ poängen
		score = 0;
		// Återställ flaggan för spelets slut
		gameOver = false;
		// Återställ flaggan för paus
		paused = false;
		// Återställ spelarens position och vinkel
		player.x = width / 2;
		player.y = height / 2;
		player.a = PI / -2;
		// Rensa arrayerna av zombies och kulor
		zombies = [];
		bullets = [];
		// Rensa intervallet
		clearInterval(zombieIntervalId); 
		
		// Återställ spelarens liv
		player.lives = 3;

		// Återställ zombies interval för att skapas och hastighet
		zombieInterval = 1000;
		zombieSpeed = 1;

		// Göm meddelandet om spelets slut och visa antal liv
		document.getElementById("gameover").style.display = "none";
		document.getElementById("lives").style.display = "block";
	
		// Starta ny interval
		zombieIntervalId = setInterval(createZombie, zombieInterval);
		loop();
	}
	// Skapa en funktion för att rensa canvasen
	function clear() {
		ctx.clearRect(0, 0, width, height);
	}
	// Skapa en funktion för att skapa en ny zombie vid en slumpmässig position utanför canvas-gränserna
	function createZombie() {
		var x, y;
		var side = Math.floor(Math.random() * 4); // Välj en slumpmässig sida (0: topp, 1: höger, 2: botten, 3: vänster)
		switch (side) {
			case 0: // Topp
				x = Math.random() * width;
				y = -20;
				break;
			case 1: // Höger
				x = width + 20;
				y = Math.random() * height;
				break;
			case 2: // Botten
				x = Math.random() * width;
				y = height + 20;
				break;
			case 3: // Vänster
				x = -20;
				y = Math.random() * height;
				break;
		}
		var zombie = Zombie(x, y); // Skapa ett nytt zombieobjekt med den slumpmässiga positionen
		zombies.push(zombie); // Lägg till zombien i arrayen av zombies
	}
	// Skapa en funktion för att uppdatera och rita allt på canvasen
	function loop() {
		clear(); // Rensa canvasen
		player.update(); // Uppdatera och rita spelaren
		for (var i = 0; i < zombies.length; i++) {
			zombies[i].update(); // Uppdatera och rita varje zombie
		}
		for (var i = 0; i < bullets.length; i++) {
			bullets[i].update(); // Uppdatera och rita varje kula
		}
		document.getElementById("score").innerHTML = "Poäng: " + score; // Visa poängen
		document.getElementById("lives").innerHTML = "Lives: " + player.lives; // Visa liv
		if (!gameOver && !paused) { // Kontrollera om spelet inte är över och inte pausat
			requestAnimationFrame(loop); // Upprepa loopen
		}
	}

	// Skapa en funktion för att uppdatera intervallet och hastigheten baserat på poängen
	function updateDifficulty() {
		// Kolla om poängen är ett jämnt tal av 10
		if (score % 10 == 0) {
			// Minska intervallet med 50 millisekunder
			zombieInterval = zombieInterval - 50;
			// Öka hastigheten med 0.1 pixel per bildruta
			zombieSpeed += 0.1;
			
			// Rensa ursprungliga intervallet 
			clearInterval(zombieIntervalId); 
			// Starta ny intervall
			zombieIntervalId = setInterval(createZombie, zombieInterval);
		}
	}

	// Starta spel-loopen
	loop();

	// Ställ in det ursprungliga intervallet när spelet startar
	zombieIntervalId = setInterval(createZombie, zombieInterval);
}