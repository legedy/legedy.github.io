var PI = Math.PI;
var TAU = PI * 2;

var SHADOW_LENGTH = 3000;

var LightPosition = {
	X: 160,
	Y: 200
};

document.documentElement.addEventListener("mouseleave", () =>
  console.log("out")
);
document.documentElement.addEventListener("mouseenter", () =>
  console.log("in")
);

function Lerp(a, b, t) {
	return a + (b - a) * t;
}

var colors = ["#f5c156", "#e6616b", "#5cd3ad"];

class Fart {
	constructor(Canvas, Draw) {
		this._Canvas = Canvas;
		this._DrawObj = Draw;

		this.HalfSize = Math.floor((Math.random() * 50) + 1);
		this.Position = {
			X: Math.floor((Math.random() * Canvas.width) + 1),
			Y: Math.floor((Math.random() * Canvas.height) + 1)
		};
		this.Rotation = Math.random() * Math.PI;
		this.Color = colors[Math.floor((Math.random() * colors.length))];
	}

	GetPoints() {
		var quarter = TAU / 4;

		return {
			p1: {
				X: this.Position.X + this.HalfSize * Math.sin(this.Rotation),
				Y: this.Position.Y + this.HalfSize * Math.cos(this.Rotation)
			},
			p2: {
				X: this.Position.X + this.HalfSize * Math.sin(this.Rotation + quarter),
				Y: this.Position.Y + this.HalfSize * Math.cos(this.Rotation + quarter)
			},
			p3: {
				X: this.Position.X + this.HalfSize * Math.sin(this.Rotation + quarter * 2),
				Y: this.Position.Y + this.HalfSize * Math.cos(this.Rotation + quarter * 2)
			},
			p4: {
				X: this.Position.X + this.HalfSize * Math.sin(this.Rotation + quarter * 3),
				Y: this.Position.Y + this.HalfSize * Math.cos(this.Rotation + quarter * 3)
			}
		};
	};
	Step() {
		var speed = (60 - this.HalfSize) / 20;
		this.Rotation += speed * 0.002;
		this.Position.X += speed;
		this.Position.Y += speed;
	};
	Render() {
		var Canvas = this._Canvas;
		var Draw = this._DrawObj;
		var dots = this.GetPoints();

		Draw.beginPath();
		Draw.moveTo(dots.p1.X, dots.p1.Y);
		Draw.lineTo(dots.p2.X, dots.p2.Y);
		Draw.lineTo(dots.p3.X, dots.p3.Y);
		Draw.lineTo(dots.p4.X, dots.p4.Y);
		Draw.fillStyle = this.Color;
		Draw.fill();


		if (this.Position.Y - this.HalfSize > Canvas.height) {
			this.Position.Y -= Canvas.height + 100;
		}
		if (this.Position.X - this.HalfSize > Canvas.width) {
			this.Position.X -= Canvas.width + 100;
		}
	};
	drawShadow() {
		var dots = this.GetPoints();
		var Draw = this._DrawObj;
		var angles = [];
		var points = [];

		for (var dot in dots) {
			var angle = Math.atan2(LightPosition.Y - dots[dot].Y, LightPosition.X - dots[dot].X);
			var endX = dots[dot].X + SHADOW_LENGTH * Math.sin(-angle - Math.PI / 2);
			var endY = dots[dot].Y + SHADOW_LENGTH * Math.cos(-angle - Math.PI / 2);
			angles.push(angle);
			points.push({
				endX: endX,
				endY: endY,
				startX: dots[dot].X,
				startY: dots[dot].Y
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
	};
}

window.addEventListener('load', function() {

	var Canvas = document.getElementById("display");
	var Draw = Canvas.getContext("2d");

	function resize() {
		var box = Canvas.getBoundingClientRect();
		Canvas.width = box.width;
		Canvas.height = box.height;
	}
	
	function drawLight() {
		Draw.beginPath();
		Draw.arc(LightPosition.X, LightPosition.Y, 3000, 0, 2 * Math.PI);
		var gradient = Draw.createRadialGradient(LightPosition.X, LightPosition.Y, 0, LightPosition.X, LightPosition.Y, 1000);
		gradient.addColorStop(0, "#3b4654");
		gradient.addColorStop(1, "#2c343f");
		Draw.fillStyle = gradient;
		Draw.fill();
	}
	
	var boxes = [];
	
	function Render() {
		Draw.clearRect(0, 0, Canvas.width, Canvas.height);
		drawLight();
	
		for (var i = 0; i < boxes.length; i++) {
			boxes[i].Step();
			boxes[i].drawShadow();
		};
		for (var i = 0; i < boxes.length; i++) {
			collisionDetection(i)
			boxes[i].Render();
		};
		requestAnimationFrame(Render);
	}
	
	resize();
	Render();
	
	while (boxes.length < 14) {
		boxes.push(new Fart(Canvas, Draw));
	}
	
	window.onresize = resize;
	Canvas.onmousemove = function (e) {
		LightPosition.X = Lerp(LightPosition.X, e.offsetX == undefined ? e.layerX : e.offsetX, 0.1);
		LightPosition.Y = Lerp(LightPosition.Y, e.offsetY == undefined ? e.layerY : e.offsetY, 0.1);
	}
	
	
	function collisionDetection(b) {
		for (var i = boxes.length - 1; i >= 0; i--) {
			if (i != b) {
				var dx = (boxes[b].X + boxes[b].HalfSize) - (boxes[i].X + boxes[i].HalfSize);
				var dy = (boxes[b].Y + boxes[b].HalfSize) - (boxes[i].Y + boxes[i].HalfSize);
				var d = Math.sqrt(dx * dx + dy * dy);
				if (d < boxes[b].HalfSize + boxes[i].HalfSize) {
					boxes[b].HalfSize = boxes[b].HalfSize > 1 ? boxes[b].HalfSize -= 1 : 1;
					boxes[i].HalfSize = boxes[i].HalfSize > 1 ? boxes[i].HalfSize -= 1 : 1;
				}
			}
		}
	}

});