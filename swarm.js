import * as autoui from "./autoui.js";

const View = {
	svgNS : "http://www.w3.org/2000/svg",
	width : 800,
	height : 600,
	mouseClickStart : null,
	init : function init(id) {
		const containerEl = document.getElementById(id || "view");
		this.svgEl = document.createElementNS(this.svgNS, "svg");
		this.svgEl.setAttributeNS(null, "width", this.width);
		this.svgEl.setAttributeNS(null, "height", this.height);
		
		this.svgEl.addEventListener("mousedown", this.getMouseClickStart.bind(this));
		this.svgEl.addEventListener("mouseup", this.mouseUp.bind(this));
		
		const imgEl = containerEl.querySelector("img");
		this.sugarCanvas = document.createElement('canvas');
		this.sugarCanvas.width = imgEl.width;
		this.sugarCanvas.height = imgEl.height;
		this.sugarCanvas.getContext('2d').drawImage(imgEl, 0, 0, imgEl.width, imgEl.height);
		
		containerEl.prepend(this.svgEl);
		containerEl.prepend(this.sugarCanvas);
		
		const playPauseButton = document.getElementById("buttonPausePlay");
		playPauseButton.addEventListener("click", this.playPause.bind(this));
	},
	getMouseRelative : function getMouseRelative(mouseEvent) {
		const rect = this.svgEl.getBoundingClientRect();
		return new Vector(mouseEvent.clientX - rect.left, mouseEvent.clientY - rect.top);
	},
	getMouseClickStart : function getMouseClickStart(event) {
		this.mouseClickStart = this.getMouseRelative(event);
	},
	mouseUp : function mouseUp(event) {
		if(this.mouseClickStart !== null) {
			let position = this.getMouseRelative(event);
			let speed = new Vector(position.x - this.mouseClickStart.x, position.y - this.mouseClickStart.y);
			this.mouseClickStart = null;
			let dude = Model.spawnDude(position, speed);
			this.renderNewDude(dude);
		}
	},
	renderNewDude : function renderNewDude(dude) {
		const gEl = document.createElementNS(this.svgNS, "g");
		gEl.id = "dude" + dude.id;
		gEl.classList.add("dude");
		
		const circleEl = document.createElementNS(this.svgNS, "circle");
		this._moveCircleOnDude(circleEl, dude);
		gEl.appendChild(circleEl);
		
		const lineEl = document.createElementNS(this.svgNS, "line");
		this._moveLineOnDude(lineEl, dude);
		gEl.appendChild(lineEl);
		
		this.svgEl.appendChild(gEl);
	},
	updateDude : function updateDude(dude) {
		const dudeEl = document.getElementById("dude" + dude.id);
		
		const circleEl = dudeEl.getElementsByTagName("circle")[0];
		this._moveCircleOnDude(circleEl, dude);
		
		const lineEl = dudeEl.getElementsByTagName("line")[0];
		this._moveLineOnDude(lineEl, dude);
	},
	playPause : function playPause(event) {
		Controller.playPause();
		
		const playPauseButton = document.getElementById("buttonPausePlay");
		if (Controller.state === "running") {
			playPauseButton.textContent = "pause";
		} else if (Controller.state === "paused") {
			playPauseButton.textContent = "play";
		};
	},
	getSugarPixel : function getSugarPixel(vector) {
		/* returns [red, green, blue, alpha] pixel values in [0, 255] */
		return this.sugarCanvas.getContext('2d').getImageData(vector.x, vector.y, 1, 1).data;
	},
	updateSugarPixel : function updateSugarPixel(vector, pixelData) {
		/* returns [red, green, blue, alpha] pixel values in [0, 255] */
		const imgData = this.sugarCanvas.getContext('2d').createImageData(1,1);
		for(let i = 0 ; i < pixelData.length ; i++) {
			imgData.data[i] = pixelData[i];
		}
		this.sugarCanvas.getContext('2d').putImageData(imgData, vector.x, vector.y);
	},
	_moveCircleOnDude : function _moveCircleOnDude(circleEl, dude) {
		circleEl.setAttributeNS(null, "cx", dude.position.x);
		circleEl.setAttributeNS(null, "cy", dude.position.y);
		circleEl.setAttributeNS(null, "r", dude.size / 2);
	},
	_moveLineOnDude : function _moveLineOnDude(lineEl, dude) {
		lineEl.setAttributeNS(null, "x1", dude.position.x);
		lineEl.setAttributeNS(null, "y1", dude.position.y);
		lineEl.setAttributeNS(null, "x2", dude.position.x + dude.direction.x * dude.size / 2);
		lineEl.setAttributeNS(null, "y2", dude.position.y + dude.direction.y * dude.size / 2);
	}
};

/* Vector
	arithmetic operations are not in-place
*/
function Vector(x, y) {
	this.x = x || 0;
	this.y = y || 0;
	
	this.copy = function copy() {
		return new Vector(this.x, this.y);
	};
	
	this.distanceTo = function distanceTo(other) {
		return this.sub(other).length();
	};
	
	this.length = function length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	};
	
	this.getUnitVector = function getUnitVector() {
		const l = this.length();
		if(l) {
			return this.div(l);
		} else {
			return new Vector(1, 0);
		};
	};
	
	this.angle = function getAngleDegrees() {
		return Math.atan2(this.y, this.x) * 180.0 / Math.PI;
	};
	
	this.rotate = function rotateRadians(angle) {
		return new Vector(
			this.length() * Math.cos((this.angle() + angle) * Math.PI / 180.0),
			this.length() * Math.sin((this.angle() + angle) * Math.PI / 180.0)
		);
	};
	
	this.add = function add() {
		let output = new Vector();
		if (arguments.length === 1) {
			let [other] = arguments;
			output.x = this.x + other.x;
			output.y = this.y + other.y;
		} else if (arguments.length === 2) {
			let [x, y] = arguments;
			output.x = this.x + x;
			output.y = this.y + y;
		}
		return output;
	};
	
	this.sub = function sub() {
		let output = new Vector();
		if (arguments.length === 1) {
			let [other] = arguments;
			output.x = this.x - other.x;
			output.y = this.y - other.y;
		} else if (arguments.length === 2) {
			let [x, y] = arguments;
			output.x = this.x - x;
			output.y = this.y - y;
		}
		return output;
	};
	
	this.mul = function multiplyScalar(scalar) {
		let output = new Vector();
		output.x = this.x * scalar;
		output.y = this.y * scalar;
		return output;
	};
	
	this.div = function divideScalar(scalar) {
		let output = new Vector();
		output.x = this.x / scalar;
		output.y = this.y / scalar;
		return output;
	};
};

/* ancestor of Dude, used to store a static counter of dudes, used to create a unique ID */
const StaticDude = (function buildStaticDude() {
	let _dudeCount = 0;
	return {
		nextId : function nextId () { _dudeCount++; return _dudeCount; },
		size : 10,
		mass : 5,
		drag : 1,
		forceIntensity : 1000,
		sugarSensitivity : 15,
		baseTurnFrequency : 0.5,
		turnAtRandom : 4
	};
})();

const newDude = function buildDude(position, speed)
{
	// inherit StaticDude and get unique ID
	const dude = Object.create(StaticDude);
	const _id = dude.nextId();
	Object.defineProperty(dude, "id", { get: function(){ return _id; }, enumerable: true});
	
	/* physics */
	dude.position = position || new Vector();
	dude.speed = speed || new Vector(0, 0);

	dude.force = (speed.getUnitVector()).mul(dude.forceIntensity);
	
	Object.defineProperty(dude, "direction",{
		get: function(){
			return this.force.getUnitVector();
		},
		enumerable: true
	});
	
	/* behaviour */
	dude.sugarReserve = 100;
	
	dude.timeSinceLastChange = 0;
	dude.changePeriod = 2;
	
	dude.update = function updateDude(dt) {
		this.timeSinceLastChange += dt;
		let newSugar = Physics.eatSugar(this.position);
		if (newSugar > 0) {
			// update direction change period, because you ate sugar
			this.sugarReserve += newSugar;
			this.changePeriod = 10 / (this.sugarSensitivity * newSugar + this.baseTurnFrequency + this.turnAtRandom * Math.random());
		};
		
		this.sugarReserve -= dt * this.forceIntensity / 100;
		if(this.timeSinceLastChange >= this.changePeriod) {
			this.force = this.force.getUnitVector().mul(this.forceIntensity).rotate(90);
			this.timeSinceLastChange = 0;
			if (newSugar == 0) {
				// update direction change period, because you didn't eat sugar since last time
				this.changePeriod = 10 / (this.baseTurnFrequency + this.turnAtRandom * Math.random());
			}
		};
	};
	
	return dude;
};

const EdgeFunctions = {
	bounceEdge : function bounceEdge(subject) {
		let leftOverlap = 0 - (subject.position.x - subject.size/2.0);
		if (leftOverlap >= 0) {
			subject.position.x += leftOverlap;
			subject.speed.x = -subject.speed.x;
		};
		let topOverlap = 0 - (subject.position.y - subject.size/2.0);
		if (topOverlap >= 0) {
			subject.position.y += topOverlap;
			subject.speed.y = -subject.speed.y;
		};
		let rightOverlap = (subject.position.x + subject.size/2.0) - View.width;
		if (rightOverlap >= 0) {
			subject.position.x -= rightOverlap;
			subject.speed.x = -subject.speed.x;
		};
		let bottomOverlap = (subject.position.y + subject.size/2.0) - View.height;
		if (bottomOverlap >= 0) {
			subject.position.y -= bottomOverlap;
			subject.speed.y = -subject.speed.y;
		};
	},
	torusEdge : function torusEdge(subject) {
		let leftOverlap = 0 - subject.position.x;
		if (leftOverlap >= 0) {
			subject.position.x = View.width - leftOverlap;
		};
		let topOverlap = 0 - subject.position.y;
		if (topOverlap >= 0) {
			subject.position.y = View.height - topOverlap;
		};
		let rightOverlap = subject.position.x - View.width;
		if (rightOverlap >= 0) {
			subject.position.x = rightOverlap;
		};
		let bottomOverlap = subject.position.y - View.height;
		if (bottomOverlap >= 0) {
			subject.position.y = bottomOverlap;
		};
	}
};

const Physics = {
	drag : 10,
	sugarMax: 10,
	apply : function applyPhysics(dt, subject) {
		let dragForce = subject.speed.mul(this.drag * subject.drag);
		let totalForce = subject.force.sub(dragForce);
		// a = (F - drag*V) / m
		let acceleration = totalForce.div(subject.mass);
		subject.speed = subject.speed.add(acceleration.mul(dt));
		subject.position = subject.position.add(subject.speed.mul(dt));
		this.applyEdge(subject);
	},
	applyEdge : EdgeFunctions.torusEdge,
	eatSugar : function eatSugar(vector) {
		let [red, green, blue, alpha] = View.getSugarPixel(vector);
		let newRed = red;
		let newGreen = green;
		let newBlue = blue;
		let newAlpha = Math.max(0, alpha - 50);
		View.updateSugarPixel(vector, [newRed, newGreen, newBlue, newAlpha]);
		return this.sugarMax * (red / 255.0 + green / 255.0 + red / 255.0) / 3.0 * alpha / 255.0;
	}
};

const Model = {
	dudes : [],
	spawnDude : function spawnDude(position, speed) {
		const dude = newDude(position, speed);
		this.dudes.push(dude);
		return dude;
	},
	update : function update(dt) {
		let force = new Vector(0, 0);
		for (let dude of this.dudes) {
			dude.update(dt);
			Physics.apply(dt, dude);
			View.updateDude(dude);
		};
	}
};

const Controller = {
	state : "uninitialized",
	animationRequestId : null,
	t : null,
	init : function init() {
		this.t = this.getTime();
		View.init();
		this.state = "initialized";
	},
	start : function start() {
		this.state = "running";
		this.t = this.getTime();
		this.animationRequestId = requestAnimationFrame(this.animateFrame.bind(this));
	},
	animateFrame : function animateFrame(timeNow) {
		if (this.state === "running") {
			let newT = this.getTime();
			let dt = (newT - this.t) / 1000.0;
			Model.update(dt);
			this.t = newT;
			this.animationRequestId = requestAnimationFrame(this.animateFrame.bind(this));
		};
	},
	playPause : function playPause() {
		if(this.state === "running") {
			this.state = "paused";
			cancelAnimationFrame(this.animationRequestId);
		} else {
			this.start();
		};
	},
	getTime : function getTime() {
		return performance.now();
	}
};

(function run(){
	Controller.init();
	let pixelData = View.sugarCanvas.getContext('2d').getImageData(100, 100, 1, 1);
	Controller.start();
	const controlsEl = document.getElementById("objectControls");
	controlsEl.appendChild(autoui.getUiForObject(Physics, "Physics"));
	controlsEl.appendChild(autoui.getUiForObject(StaticDude, "Dudes"));
})();
