//********** setup and init **********

var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;

var paused = false;

var context = canvas.getContext('2d');

//***** object creation *****

var player = new Player();
var computer = new Computer();
var ball = new Ball(200, 300);

//***** event listeners *****

var keysDown = {};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});

//***** init *****

window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};

var step = function() {
	if(paused) return;
  update();
  render();
  animate(step);
};

var update = function() {
	ball.update();
	player.update();
	computer.update();
};

var render = function() {
  context.fillStyle = "#FF00FF";
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
};

//********** game objects **********

//***** paddle *****

function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.xSpeed = 0;
  this.ySpeed = 0;
}

Paddle.prototype.move = function(x) {
  this.x += x;

  if (this.x + this.width >= canvas.width) {
  	this.x = canvas.width - this.width;
  }

  if (this.x <= 0) {
  	this.x = 0;
  }
}

Paddle.prototype.render = function() {
  context.fillStyle = "#0000FF";
  context.fillRect(this.x, this.y, this.width, this.height);
};

//***** ball *****

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.xSpeed = 0;
  this.ySpeed = 3;
  this.radius = 5;
}

Ball.prototype.render = function() {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = "#000000";
  context.fill();
};

Ball.prototype.update = function() {
  this.x += this.xSpeed;
  this.y += this.ySpeed;
  this.checkForCollisionsWithPaddle(player.paddle);
  this.checkForCollisionsWithPaddle(computer.paddle);
  this.checkForCollisionWithWalls();
};

Ball.prototype.checkForCollisionsWithPaddle = function(paddle) {
	if (this.x > paddle.x && this.x < (paddle.x + paddle.width)) {
		if (Math.abs(this.y - paddle.y - this.radius) <= paddle.height) {
			this.ySpeed *= -1;
			this.xSpeed = (this.x - (paddle.x + paddle.width/2))/4;
		}
	}
};

Ball.prototype.checkForCollisionWithWalls = function() {
	if ((this.y - this.radius <= 0) || (this.y + this.radius >= canvas.height)) {
		paused = true;
		return;
	}

	if ((this.x <= 0) || (this.x + this.radius >= canvas.width)) {
		this.xSpeed *= -1;
	}
}

//***** player *****

function Player() {
   this.paddle = new Paddle(175, 580, 50, 10);
   this.paddle.xSpeed = 4;
}

Player.prototype.render = function() {
  this.paddle.render();
};

Player.prototype.checkForMove = function() {
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37) { // left arrow
      this.paddle.move(-this.paddle.xSpeed);
    } else if (value == 39) { // right arrow
      this.paddle.move(this.paddle.xSpeed);
    }
  }
};

Player.prototype.update = function() {
	this.checkForMove();
}

//***** computer *****

function Computer() {
  this.paddle = new Paddle(175, 10, 50, 10);
  this.paddle.xSpeed = 4;
}

Computer.prototype.render = function() {
  this.paddle.render();
};

Computer.prototype.update = function() {
	if ((this.paddle.x + this.paddle.width/2) - ball.x > this.paddle.width*0.25) {
		this.paddle.move(-this.paddle.xSpeed);
	} else if (ball.x - (this.paddle.x + this.paddle.width/2) > this.paddle.width*0.25) {
    this.paddle.move(this.paddle.xSpeed);
	}
}
