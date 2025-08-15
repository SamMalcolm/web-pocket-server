const Player = require('./player.class.js');

function generateUUID() { // Public Domain/MIT
	var d = new Date().getTime();//Timestamp
	var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16;//random number between 0 and 16
		if (d > 0) {//Use timestamp until depleted
			r = (d + r) % 16 | 0;
			d = Math.floor(d / 16);
		} else {//Use microseconds since page-load if supported
			r = (d2 + r) % 16 | 0;
			d2 = Math.floor(d2 / 16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

class Game {
	s = [];
	framesToPlay = 0;
	frames = [];
	currFrame = [];
	framesPlayed = 0;
	posRemaining = 147;

	// BALLS
	redsRemaining = 15;
	yellowsRemaining = 1;
	greensRemaining = 1;
	brownsRemaining = 1;
	bluesRemaining = 1;
	pinksRemaining = 1;
	blacksRemaining = 1;
	freeBall = false;
	minFoul = 4;

	balls = [
		{
			"name": "Red",
			"code": "R",
			"value": 1,
			"quantity": 15,
			"dark_colour": "#9D2C2C",
			"light_colour": "#C72D2D",
		},
		{
			"name": "Yellow",
			"code": "Y",
			"value": 2,
			"quantity": 1,
			"dark_colour": "#CEB636",
			"light_colour": "#E0C534",
		},
		{
			"name": "Green",
			"code": "G",
			"value": 3,
			"quantity": 1,
			"dark_colour": "#397140",
			"light_colour": "#4CA256",
		},
		{
			"name": "Brown",
			"code": "br",
			"value": 4,
			"quantity": 1,
			"dark_colour": "#694A20",
			"light_colour": "#B48247",
		},
		{
			"name": "Blue",
			"code": "bl",
			"value": 5,
			"quantity": 1,
			"dark_colour": "#2F4EB4",
			"light_colour": "#5271D6",
		},
		{
			"name": "Pink",
			"code": "P",
			"value": 6,
			"quantity": 1,
			"dark_colour": "#9B3D9B",
			"light_colour": "#E066BA",
		},
		{
			"name": "Black",
			"code": "B",
			"value": 7,
			"quantity": 1,
			"dark_colour": "#0B0B0B",
			"light_colour": "#393939",
		},
	];

	calculatePosRemaining() {
		console.log("Calculating points left");
		this.posRemaining = (8 * this.redsRemaining) +
			(2 * this.yellowsRemaining) +
			(3 * this.greensRemaining) +
			(4 * this.brownsRemaining) +
			(5 * this.bluesRemaining) +
			(6 * this.pinksRemaining) +
			(7 * this.blacksRemaining);
		if (this.currFrame.length > 0) {
			if (this.currFrame[this.currFrame.length - 1] == "R") {
				this.posRemaining += 7;
			}
		}
		let inactivePosRemaining = this.posRemaining;
		if (this.currFrame.length != 0) {
			if (this.currFrame[this.currFrame.length - 1].indexOf("R") != -1) {
				inactivePosRemaining -= 7;
			}
		}

		let p = this.getInactive();
		let a = this.getActive();

		a.updateMaxScore(this.posRemaining);
		p.updateMaxScore(inactivePosRemaining);
		a.updateScoreLine(this.posRemaining, p.score, this.minFoul, p.maxScore);
		p.updateScoreLine(inactivePosRemaining, a.score, this.minFoul, a.maxScore);
	}

	lastActionRed() {
		if (this.currFrame.length == 0) {
			return false;
		} else {
			if (this.currFrame.last == "R") {
				return true;
			} else {
				for (let i = this.currFrame.length - 1; i >= 0; i--) {
					if (this.currFrame[i] == "ir" || this.currFrame[i] == "dr") {
						continue;
					} else {
						if (this.currFrame[i] == "R") {
							return true;
						} else {
							return false;
						}
					}
				}
			}
		}
	}

	incrementReds() {
		this.redsRemaining++;
		this.currFrame.push('ir');
		this.calculatePosRemaining();
	}

	decrementReds() {
		if (this.redsRemaining > 0) {
			this.redsRemaining--;
			this.currFrame.push('dr');
			this.calculatePosRemaining();
		}
	}

	validateFinalColours(c) {
		if (this.posRemaining > 27) {
			return true;
		} else {
			if (this.posRemaining == 27 && c == "Y") {
				return true;
			} else if (this.posRemaining == 25 && c == "G") {
				return true;
			} else if (this.posRemaining == 22 && c == "br") {
				return true;
			} else if (this.posRemaining == 18 && c == "bl") {
				return true;
			} else if (this.posRemaining == 13 && c == "P") {
				return true;
			} else if (this.posRemaining == 7 && c == "B") {
				return true;
			} else {
				return false;
			}
		}
	}

	foul(value) {
		this.currFrame.push('F' + value);

		let p = this.getInactive();
		p.score += parseInt(value);
		p.foulPosRecieved += parseInt(value);

		let a = this.getActive();
		a.foulPosGiven += parseInt(value);

		this.calculatePosRemaining();
	}

	getActive() {
		let pl = this.s.filter((p) => (p.active))[0];
		return pl;
	}

	getInactive() {
		let pl = this.s.filter((p) => (!p.active))[0];
		return pl;
	}

	passTurn() {
		for (let i = 0; i < this.s.length; i++) {
			this.s[i].currBreak = 0;
			if (this.s[i].active) {
				this.s[i].active = false;
			} else {
				this.s[i].active = true;
			}
			this.s[i].showBreakInUI = false;
			this.s[i].showBreakBarInUI = false;
		}
		this.currFrame.push('PT');
		this.calculatePosRemaining();
	}

	endGame() {
		this.framesPlayed++;
		this.currFrame.push("END");
		this.frames.push(this.currFrame);
		this.currFrame = [];

		if (this.s[0].score > this.s[1].score) {
			this.s[0].framesWon++;
		} else {
			this.s[1].framesWon++;
		}

		for (let i = 0; i < this.s.length; i++) {
			if (this.s[i].handicap) {
				this.s[i].score = this.s[i].handicap;
			} else {
				this.s[i].score = 0;
			}
			this.s[i].currBreak = 0;
			this.s[i].snookersRequired = 0;
			this.s[i].maxScore = 147;
			this.s[i].snookersReqdScoreline = 74;
			this.s[i].showBreakInUI = false;
			this.s[i].showBreakBarInUI = false;
		}

		this.redsRemaining = 15;
		this.yellowsRemaining = 1;
		this.greensRemaining = 1;
		this.brownsRemaining = 1;
		this.bluesRemaining = 1;
		this.pinksRemaining = 1;
		this.blacksRemaining = 1;
		this.minFoul = 4;
		this.calculatePosRemaining();
	}

	pot(colour, fb) {
		console.log("in method: " + colour)
		console.log("in method: " + fb)
		let ap = this.getActive();
		switch (colour) {
			case "R":
				ap.score++;
				ap.currBreak++;
				if (!fb) {
					this.redsRemaining--;
				}
				break;
			case "Y":
				ap.score += 2;
				ap.currBreak += 2;
				if (this.redsRemaining == 0 &&
					!fb &&
					(this.currFrame[this.currFrame.length - 1] != "R" &&
						this.currFrame[this.currFrame.length - 1] != "R*")) {
					this.yellowsRemaining--;
				}
				break;
			case "G":
				ap.score += 3;
				ap.currBreak += 3;
				if (this.redsRemaining == 0 &&
					!fb &&
					(this.currFrame[this.currFrame.length - 1] != "R" &&
						this.currFrame[this.currFrame.length - 1] != "R*")) {
					this.greensRemaining--;
				}
				break;
			case "br":
				ap.score += 4;
				ap.currBreak += 4;
				if (this.redsRemaining == 0 &&
					!fb &&
					(this.currFrame[this.currFrame.length - 1] != "R" &&
						this.currFrame[this.currFrame.length - 1] != "R*")) {
					this.brownsRemaining--;
				}
				break;
			case "bl":
				ap.score += 5;
				ap.currBreak += 5;
				if (this.redsRemaining == 0 &&
					!fb &&
					(this.currFrame[this.currFrame.length - 1] != "R" &&
						this.currFrame[this.currFrame.length - 1] != "R*")) {
					this.bluesRemaining--;
				}
				break;
			case "P":
				ap.score += 6;
				ap.currBreak += 6;
				if (this.redsRemaining == 0 &&
					!fb &&
					(this.currFrame[this.currFrame.length - 1] != "R" &&
						this.currFrame[this.currFrame.length - 1] != "R*")) {
					this.pinksRemaining--;
				}
				break;
			case "B":
				ap.score += 7;
				ap.currBreak += 7;
				if (this.redsRemaining == 0 &&
					!fb &&
					(this.currFrame[this.currFrame.length - 1] != "R" &&
						this.currFrame[this.currFrame.length - 1] != "R*")) {
					this.blacksRemaining--;
				}
				break;
		}
		if (!fb) {
			this.currFrame.push(colour);
		} else {
			this.currFrame.push('$' + colour + '*');
		}

		if (this.brownsRemaining == 0) {
			this.minFoul = 5;
		}
		if (this.bluesRemaining == 0) {
			this.minFoul = 6;
		}
		if (this.pinksRemaining == 0) {
			this.minFoul = 7;
		}

		if (ap.currBreak > ap.highestBreak) {
			ap.highestBreak = ap.currBreak;
		}

		this.calculatePosRemaining();

		if (this.blacksRemaining == 0) {
			if (this.s[1].score != this.s[0].score) {
				this.endGame();
			} else {
				this.blacksRemaining++;
			}
		}
	}

	undo() {

		console.log("Undoing last action");
		console.log("Current Frame: " + this.currFrame);

		let ip = this.getInactive();
		let ap = this.getActive();

		if (this.currFrame.length > 0) {
			let lastAction = this.currFrame.pop();
			console.log("Last Action: " + lastAction);
			if (lastAction == "dr" || lastAction == "ir") {
				if (lastAction == "dr") {
					this.redsRemaining++;
				} else {
					this.redsRemaining--;
				}
			}

			for (let i = 0; i < this.balls.length; i++) {
				if (lastAction.indexOf(this.balls[i]['code']) != -1 &&
					lastAction.indexOf("T") == -1) {
					ap.score -= this.balls[i]['value'];
					if (ap.currBreak == ap.highestBreak) {
						ap.highestBreak -= this.balls[i]['value'];
					}
					if (ap.currBreak > 0) {
						ap.currBreak -= this.balls[i]['value'];
					}
					if (!lastAction == '*') {
						if (this.balls[i]['code'] == "R") {
							this.redsRemaining++;
						} else if (this.redsRemaining == 0) {
							if (this.balls[i]['code'] == "Y") {
								this.yellowsRemaining = 1;
							}
							if (this.balls[i]['code'] == "G") {
								this.greensRemaining = 1;
							}
							if (this.balls[i]['code'] == "br") {
								this.brownsRemaining = 1;
							}
							if (this.balls[i]['code'] == "bl") {
								this.bluesRemaining = 1;
							}
							if (this.balls[i]['code'] == "P") {
								this.pinksRemaining = 1;
							}
							if (this.balls[i]['code'] == "B") {
								this.blacksRemaining = 1;
							}
						}
					}
					this.calculatePosRemaining();
					return;
				}
			}


			switch (lastAction) {
				case "PT":
					this.passTurn();
					this.currFrame.pop();
					break;
				case "F4":
					ip.score -= 4;
					ip.foulPosRecieved -= 4;
					ap.foulPosGiven -= 4;
					break;
				case "F5":
					ip.score -= 5;
					ip.foulPosRecieved -= 5;
					ap.foulPosGiven -= 5;
					break;
				case "F6":
					ip.score -= 6;
					ip.foulPosRecieved -= 6;
					ap.foulPosGiven -= 6;
					break;
				case "F7":
					ip.score -= 7;
					ip.foulPosRecieved -= 7;
					ap.foulPosGiven -= 7;
					break;
			}
			this.calculatePosRemaining();
		}
	}

	constructor(names, handicaps, framesToPlay = 3) {
		this.id = generateUUID();
		this.s.push(new Player(names[0], handicaps[0]));
		this.s.push(new Player(names[1], handicaps[1]));
		this.redsRemaining = 15;
		this.s[0].active = true;
		this.framesToPlay = framesToPlay;
		return this;
	}
}

module.exports = Game;
