let collectibles = [];
let numCollectibles = 10;
let numCollected = 0;
let playerPos;
let playerSize = 40;
let playerSpeed = 5; // Increased speed slightly for better feel

let timeLimit = 10; 
let timer = 0;
let state = 0;

let flyImg, gameBg, wonBg, lostBg; 
let caveMusic, victoryMusic, loseMusic; 

let confetti = [];

// DISABLE SCROLLING FOR ARROW KEYS
window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

function preload() {
  flyImg = loadImage('fly.png');
  gameBg = loadImage('game.png');
  wonBg = loadImage('won.png');
  lostBg = loadImage('lost.png');

  caveMusic = loadSound('cave.mp3');
  victoryMusic = loadSound('victory.mp3');
  loseMusic = loadSound('higher.mp3');
}

function setup() {
  let cnv = createCanvas(600, 400);
  cnv.parent('game-container');
  
  // 1. Initialize variables first
  playerPos = createVector(width / 2, height / 2);
  
  // 2. Set styles
  textSize(40);
  textFont('Times New Roman');
  
  // 3. Ready to reset
  resetGame();
}

function resetGame() {
  collectibles = [];
  for (let i = 0; i < numCollectibles; i++) {
    collectibles.push(new collectible());
  }
  numCollected = 0;
  timer = timeLimit * 60;
  
  playerPos.x = width / 2;
  playerPos.y = height / 2;
  confetti = [];
}

function draw() {
  switch (state) {
    case 0: mainMenu(); break;
    case 1: game(); break;
    case 2: winScreen(); break;
    case 3: loseScreen(); break;
  }
}

function mainMenu() { 
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Collect the Bugs", width / 2, height / 2 - 50);
  textSize(20);
  text("Click to Start", width / 2, height / 2 + 20);
}

function game() {
  background(gameBg);

  if (caveMusic.isLoaded() && !caveMusic.isPlaying()) {
    caveMusic.loop();
  }

  fill(255, 255, 0);
  ellipse(playerPos.x, playerPos.y, playerSize);

  for (let i = collectibles.length - 1; i >= 0; i--) {
    collectibles[i].display();
    collectibles[i].move();
    if (collectibles[i].pos.dist(playerPos) < (playerSize + collectibles[i].size) / 2) {
      collectibles.splice(i, 1);
      numCollected++;
      if (collectibles.length === 0) {
        caveMusic.stop();
        for (let j = 0; j < 100; j++) {
          confetti.push(new Confetti());
        }
        state = 2; 
      }
    }
  }

  checkForKeys();

  fill(255);
  textSize(30);
  text(`Score: ${numCollected}`, 100, 40);
  text(`Time: ${int(timer / 60)}`, 500, 40);

  timer--;
  if (timer <= 0) {
    caveMusic.stop();
    state = 3; 
  }
}

function winScreen() {
  background(wonBg);
  if (victoryMusic.isLoaded() && !victoryMusic.isPlaying()) {
    victoryMusic.play();
  }
  for (let i = 0; i < confetti.length; i++) {
    confetti[i].update();
    confetti[i].display();
  }
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("You won!", width / 2, height - 50);
}

function loseScreen() {
  background(lostBg);
  if (loseMusic.isLoaded() && !loseMusic.isPlaying()) {
    loseMusic.play();
  }
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("You lost!", width / 2, height - 50);
}

function mousePressed() {
  // Start audio context on user click (Required by GitHub/Chrome)
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (state == 0 || state == 2 || state == 3) {
    resetGame();
    caveMusic.stop();
    victoryMusic.stop();
    loseMusic.stop();
    state = 1;
  }
}

function checkForKeys() {
  if (keyIsDown(LEFT_ARROW)) playerPos.x -= playerSpeed;
  if (keyIsDown(RIGHT_ARROW)) playerPos.x += playerSpeed;
  if (keyIsDown(UP_ARROW)) playerPos.y -= playerSpeed;
  if (keyIsDown(DOWN_ARROW)) playerPos.y += playerSpeed;

  playerPos.x = constrain(playerPos.x, 0, width);
  playerPos.y = constrain(playerPos.y, 0, height);
}

class collectible {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.size = 40;
    this.xSpeed = random(-2, 2);
    this.ySpeed = random(-2, 2);
  }
  display() {
    image(flyImg, this.pos.x - this.size / 2, this.pos.y - this.size / 2, this.size, this.size);
  }
  move() {
    this.pos.x += this.xSpeed;
    this.pos.y += this.ySpeed;
    if (this.pos.x > width || this.pos.x < 0) this.xSpeed *= -1;
    if (this.pos.y > height || this.pos.y < 0) this.ySpeed *= -1;
  }
}

class Confetti {
  constructor() {
    this.x = random(width);
    this.y = random(-100, -10);
    this.size = random(5, 10);
    this.speed = random(2, 5);
    this.color = color(random(255), random(255), random(255));
  }
  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = random(-100, -10);
      this.x = random(width);
    }
  }
  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}