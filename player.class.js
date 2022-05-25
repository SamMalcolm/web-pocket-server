class Player {
	// NAME
	name = '';

	// SCORING METRICS
	handicap = 0;
	score = 0;
	framesWon = 0;
	snookersRequired = 0;

	// FOUL
	foulPosGiven = 0;
	foulPosRecieved = 0;

	// AT TABLE
	active = false;

	// BREAK
	currBreak = 0;
	highestBreak = 0;

	// SCORELINE DATA
	maxScore = 147;
	scoreFractionOfMax = 0;
	snookersReqdScoreline = 74;
	snookersReqdFractionOfMax = 74 / 147;
	maxScoreFraction = 1;

	winningScoreline = "#C3A164";

	updateMaxScore(posRemaining) {
		this.maxScore = posRemaining + this.score;
	}

	updateScoreLine(posRemaining, opponentsScore, minFoul, opponentMaxScore) {
		this.winningScoreline = "#C3A164";
		this.maxScore = this.score + posRemaining;
		let max = (this.maxScore >= opponentMaxScore) ? this.maxScore : opponentMaxScore;
		this.maxScoreFraction = (this.maxScore / max);
		this.scoreFractionOfMax = (this.score / max);
		if (this.scoreFractionOfMax < 0) {
			this.scoreFractionOfMax = 0;
		}
		if (this.maxScore < opponentsScore) {
			let sr = (opponentsScore - maxScore) / minFoul;
			this.snookersRequired = Math.ceil(sr);
			this.snookersReqdFractionOfMax = 0;
		} else {
			this.snookersRequired = 0;
			let scoringPos = 0;
			this.snookersReqdFractionOfMax = 0;
			let diff = (opponentsScore > this.score)
				? (opponentsScore - this.score)
				: (this.score - opponentsScore);

			if (diff <= 7 && posRemaining == 7) {
				this.snookersReqdFractionOfMax = 1.0;
				this.snookersReqdScoreline = this.maxScore;
				this.winningScoreline = "#0B0B0B";
			} else {
				while (scoringPos <= posRemaining) {
					let pottentialScore = this.score;
					let pottentialPosRemaining = posRemaining;
					pottentialScore += scoringPos;
					pottentialPosRemaining -= scoringPos;
					if (opponentsScore + pottentialPosRemaining < pottentialScore) {
						this.snookersReqdScoreline = pottentialScore;
						break;
					}
					if (pottentialPosRemaining <= 27) {
						if (pottentialPosRemaining == 27) {
							scoringPos += 2;
							this.winningScoreline = "#CEB636";
						} else if (pottentialPosRemaining == 25) {
							scoringPos += 3;
							this.winningScoreline = "#397140";
						} else if (pottentialPosRemaining == 22) {
							scoringPos += 4;
							this.winningScoreline = "#694A20";
						} else if (pottentialPosRemaining == 18) {
							scoringPos += 5;
							this.winningScoreline = "#2F4EB4";
						} else if (pottentialPosRemaining == 13) {
							scoringPos += 6;
							this.winningScoreline = "#9B3D9B";
						} else if (pottentialPosRemaining == 7) {
							scoringPos += 7;
							this.winningScoreline = "#0B0B0B";
						} else {
							break;
						}
					} else {
						scoringPos++;
					}

					if (pottentialPosRemaining < 0) {
						break;
					}
				}
			}
			this.snookersReqdFractionOfMax = this.snookersReqdScoreline / max;

			if (this.snookersReqdScoreline > this.maxScore ||
				opponentsScore + posRemaining < this.score) {
				this.snookersReqdFractionOfMax = 0;
			}
		}
	}

	constructor(name, handicap) {
		this.name = name;
		this.handicap = handicap
		this.score = 0;
		this.framesWon = 0;
		if (handicap) {
			this.score += handicap;
		}
		return this;
	}
}

module.exports = Player;
