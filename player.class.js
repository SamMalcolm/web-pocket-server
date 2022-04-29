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
		maxScore = posRemaining + score;
	}

	updateScoreLine(posRemaining, opponentsScore, minFoul, opponentMaxScore) {
		winningScoreline = (0xFFC3A164);
		maxScore = score + posRemaining;
		max = (maxScore >= opponentMaxScore) ? maxScore : opponentMaxScore;
		maxScoreFraction = (maxScore / max);
		scoreFractionOfMax = (score / max);
		if (scoreFractionOfMax < 0) {
			scoreFractionOfMax = 0;
		}
		if (maxScore < opponentsScore) {
			sr = (opponentsScore - maxScore) / minFoul;
			snookersRequired = sr.ceil();
			snookersReqdFractionOfMax = 0;
		} else {
			snookersRequired = 0;

			scoringPos = 0;
			snookersReqdFractionOfMax = 0;
			diff = (opponentsScore > score)
				? (opponentsScore - score)
				: (score - opponentsScore);

			if (diff <= 7 && posRemaining == 7) {
				snookersReqdFractionOfMax = 1.0;
				snookersReqdScoreline = maxScore;
				winningScoreline = "#0B0B0B";
			} else {
				while (scoringPos <= posRemaining) {
					pottentialScore = score;
					pottentialPosRemaining = posRemaining;
					pottentialScore += scoringPos;
					pottentialPosRemaining -= scoringPos;
					if (opponentsScore + pottentialPosRemaining < pottentialScore) {
						snookersReqdScoreline = pottentialScore;
						break;
					}
					if (pottentialPosRemaining <= 27) {
						if (pottentialPosRemaining == 27) {
							scoringPos += 2;
							winningScoreline = "#CEB636";
						} else if (pottentialPosRemaining == 25) {
							scoringPos += 3;
							winningScoreline = "#397140";
						} else if (pottentialPosRemaining == 22) {
							scoringPos += 4;
							winningScoreline = "#694A20";
						} else if (pottentialPosRemaining == 18) {
							scoringPos += 5;
							winningScoreline = "#2F4EB4";
						} else if (pottentialPosRemaining == 13) {
							scoringPos += 6;
							winningScoreline = "#9B3D9B";
						} else if (pottentialPosRemaining == 7) {
							scoringPos += 7;
							winningScoreline = "#0B0B0B";
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
			snookersReqdFractionOfMax = snookersReqdScoreline / max;

			if (snookersReqdScoreline > maxScore ||
				opponentsScore + posRemaining < score) {
				snookersReqdFractionOfMax = 0;
			}
		}
	}

	constructor(name, handicap) {
		this.name = name;
		this.handicap = handicap
		this.score = 0;
		this.framesWon = 0;
		this.score += handicap;
		return this;
	}
}

module.exports = Player;
