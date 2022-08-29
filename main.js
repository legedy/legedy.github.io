var PI = Math.PI;
var TAU = PI * 2;

var SHADOW_LENGTH = 2000;

var Canvas = document.getElementById("display");
var Draw = Canvas.getContext("2d");

function resize() {
	var box = Canvas.getBoundingClientRect();
	Canvas.width = box.width;
	Canvas.height = box.height;
}

var LightPosition = {
	x: 160,
	y: 200
}

var colors = ["#f5c156", "#e6616b", "#5cd3ad"];

function drawLight() {
	Draw.beginPath();
	Draw.arc(LightPosition.x, LightPosition.y, 2000, 0, 2 * Math.PI);
	var gradient = Draw.createRadialGradient(LightPosition.x, LightPosition.y, 0, LightPosition.x, LightPosition.y, 1000);
	gradient.addColorStop(0, "#3b4654");
	gradient.addColorStop(1, "#2c343f");
	Draw.fillStyle = gradient;
	Draw.fill();
}

function Box() {
	this.HalfSize = Math.floor((Math.random() * 50) + 1);
	this.Position = {
		X: Math.floor((Math.random() * Canvas.width) + 1),
		Y: Math.floor((Math.random() * Canvas.height) + 1)
	};
	this.Rotation = Math.random() * Math.PI;
	this.color = colors[Math.floor((Math.random() * colors.length))];

	this.getDots = function () {
		var PosOffsetX = this.Position.X + this.HalfSize;
		var PosOffsetY = this.Position.Y + this.HalfSize;
		var quarter = TAU / 4;

		return {
			p1: {
				X: PosOffsetX * Math.sin(this.Rotation),
				Y: PosOffsetY * Math.cos(this.Rotation)
			},
			p2: {
				X: PosOffsetX * Math.sin(this.Rotation + quarter),
				Y: PosOffsetY * Math.cos(this.Rotation + quarter)
			},
			p3: {
				X: PosOffsetX * Math.sin(this.Rotation + quarter * 2),
				Y: PosOffsetY * Math.cos(this.Rotation + quarter * 2)
			},
			p4: {
				X: PosOffsetX * Math.sin(this.Rotation + quarter * 3),
				Y: PosOffsetY * Math.cos(this.Rotation + quarter * 3)
			}
		};
	}
	this.Step = function () {
		var speed = (60 - this.HalfSize) / 20;
		this.Rotation += speed * 0.002;
		this.Position.X += speed;
		this.Position.Y += speed;
	}
	this.draw = function () {
		var dots = this.getDots();
		Draw.beginPath();
		Draw.moveTo(dots.p1.X, dots.p1.Y);
		Draw.lineTo(dots.p2.X, dots.p2.Y);
		Draw.lineTo(dots.p3.X, dots.p3.Y);
		Draw.lineTo(dots.p4.X, dots.p4.Y);
		Draw.fillStyle = this.color;
		Draw.fill();


		if (this.Position.Y - this.HalfSize > Canvas.height) {
			this.Position.Y -= Canvas.height + 100;
		}
		if (this.Position.X - this.HalfSize > Canvas.width) {
			this.Position.X -= Canvas.width + 100;
		}
	}
	this.drawShadow = function () {
		var dots = this.getDots();
		var angles = [];
		var points = [];

		for (dot in dots) {
			var angle = Math.atan2(LightPosition.y - dots[dot].y, LightPosition.x - dots[dot].x);
			var endX = dots[dot].x + SHADOW_LENGTH * Math.sin(-angle - Math.PI / 2);
			var endY = dots[dot].y + SHADOW_LENGTH * Math.cos(-angle - Math.PI / 2);
			angles.push(angle);
			points.push({
				endX: endX,
				endY: endY,
				startX: dots[dot].x,
				startY: dots[dot].y
			});
		};

		for (var i = points.length - 1; i >= 0; i--) {
			var n = i == 3 ? 0 : i + 1;
			Draw.beginPath();
			Draw.moveTo(points[i].startX, points[i].startY);
			Draw.lineTo(points[n].startX, points[n].startY);
			Draw.lineTo(points[n].endX, points[n].endY);
			Draw.lineTo(points[i].endX, points[i].endY);
			Draw.fillStyle = "#2c343f";
			Draw.fill();
		};
	}
}

var boxes = [];

function draw() {
	Draw.clearRect(0, 0, Canvas.width, Canvas.height);
	drawLight();

	for (var i = 0; i < boxes.length; i++) {
		boxes[i].Step();
		boxes[i].drawShadow();
	};
	for (var i = 0; i < boxes.length; i++) {
		collisionDetection(i)
		boxes[i].draw();
	};
	requestAnimationFrame(draw);
}

resize();
draw();

while (boxes.length < 14) {
	boxes.push(new Box());
}

window.onresize = resize;
Canvas.onmousemove = function (e) {
	LightPosition.x = e.offsetX == undefined ? e.layerX : e.offsetX;
	LightPosition.y = e.offsetY == undefined ? e.layerY : e.offsetY;
}


function collisionDetection(b) {
	for (var i = boxes.length - 1; i >= 0; i--) {
		if (i != b) {
			var dx = (boxes[b].x + boxes[b].HalfSize) - (boxes[i].x + boxes[i].HalfSize);
			var dy = (boxes[b].y + boxes[b].HalfSize) - (boxes[i].y + boxes[i].HalfSize);
			var d = Math.sqrt(dx * dx + dy * dy);
			if (d < boxes[b].HalfSize + boxes[i].HalfSize) {
				boxes[b].HalfSize = boxes[b].HalfSize > 1 ? boxes[b].HalfSize -= 1 : 1;
				boxes[i].HalfSize = boxes[i].HalfSize > 1 ? boxes[i].HalfSize -= 1 : 1;
			}
		}
	}
}