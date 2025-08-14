import io from 'socket.io-client';
var socket = io('/game');
var room = /games\/.+\//igm.exec(window.location.href)[0];
room = room.slice(6, -1);

import './overlay.scss';
import './scoreboard.scss';
import './remote.scss';

socket.on('connect', () => {
	console.log("connected");
	socket.emit('join', { room: room })
	console.log('joining', room);

	let foulButtons = document.querySelectorAll("button.foul");
	let potButtons = document.querySelectorAll("button.pot");

	if (foulButtons.length) {
		foulButtons.forEach(b => b.addEventListener('click', e => {
			socket.emit('updateGame', { room: room, action: "F" + e.target.getAttribute('data-score-penalty') });
		}));
	}

	if (potButtons.length) {
		potButtons.forEach(b => b.addEventListener('click', e => {
			socket.emit('updateGame', { room: room, action: e.target.getAttribute('data-pot-code') });
		}));
	}

	if (document.querySelector("button.undo")) {
		document.querySelector("button.undo").addEventListener('click', e => {
			socket.emit('updateGame', { room: room, action: "undo" });
		});
	}

	if (document.querySelector("button.changePlayer")) {
		document.querySelector("button.changePlayer").addEventListener('click', e => {
			socket.emit('updateGame', { room: room, action: "passTurn" });
		});
	}

	if (document.querySelector(".showBreakForActivePlayer")) {
		document.querySelector(".showBreakForActivePlayer").addEventListener('click', e => {
			console.log("TOGGLING BREAK VIEW IN UI")
			socket.emit('showBreakForActivePlayer', { room: room })
		})
	}

	if (document.querySelector(".show_break_bar")) {
		document.querySelector(".show_break_bar").addEventListener('click', e => {
			console.log("TOGGLING BREAK BAR IN UI")
			socket.emit('showBreakBar', { room: room })
		})
	}

	if (document.querySelector(".end_game")) {
		document.querySelector(".end_game").addEventListener('click', e => {
			console.log("ENDING GAME IN UI")
			socket.emit('endGame', { room: room })
		})
	}

	if (document.querySelector(".game_overlay_link")) {
		let game_id = room;
		document.querySelector(".game_overlay_link").setAttribute('href', '/games/' + game_id + '/overlay')
	}

	if (document.querySelector(".incReds")) {
		document.querySelector(".incReds").addEventListener('click', e => {
			socket.emit('adjustReds', { room: room, red_adjustment: 'increment' });
		});
	}

	if (document.querySelector(".decReds")) {
		document.querySelector(".decReds").addEventListener('click', e => {
			socket.emit('adjustReds', { room: room, red_adjustment: 'decrement' });
		});
	}


	socket.on("updateUI", data => {
		console.log("UPDATING UI");
		console.log(data);
		updateUI(data);


	});
});

// update ui based on data
const updateUI = data => {

	console.log("updating ui based on", data);

	for (let i = 0; i < data.s.length; i++) {
		let player = data.s[i];
		let playerElement = document.querySelector(`*[data-player-${i + 1}-name]`);
		if (playerElement && player.active) {
			playerElement.classList.add("active");
		} else {
			if (playerElement) {
				playerElement.classList.remove("active");
			}
		}
		let breakElement = document.querySelector(`.player-${i + 1}-break`);

		if (player.showBreakInUI) {
			if (breakElement) {
				breakElement.classList.add("show");
				breakElement.innerHTML = "Break: " + player.currBreak;
			}
		} else {
			if (breakElement) {
				breakElement.classList.remove("show");
				breakElement.innerHTML = "Break: 0";
			}
		}

	}



	if (document.querySelector("*[data-player-1-score]")) {
		document.querySelector("*[data-player-1-score]").innerHTML = data.s[0].score;
	}
	if (document.querySelector("*[data-player-2-score]")) {
		document.querySelector("*[data-player-2-score]").innerHTML = data.s[1].score;
	}
	if (document.querySelector("*[data-player-1-name]")) {
		document.querySelector("*[data-player-1-name]").innerHTML = data.s[0].name;
		if (data.s[0].active) {
			document.querySelector("*[data-player-1-name]").innerHTML = "▶ " + data.s[0].name;
		}
	}
	if (document.querySelector("*[data-player-2-name]")) {
		document.querySelector("*[data-player-2-name]").innerHTML = data.s[1].name;
		if (data.s[1].active) {
			document.querySelector("*[data-player-2-name]").innerHTML = "▶ " + data.s[1].name;
		}
	}

	if (document.querySelector("*[data-player-1-framesWon]")) {
		document.querySelector("*[data-player-1-framesWon]").innerHTML = data.s[0].framesWon;
	}
	if (document.querySelector("*[data-player-2-framesWon]")) {
		document.querySelector("*[data-player-2-framesWon]").innerHTML = data.s[1].framesWon;
	}
	if (document.querySelector("*[data-frames-to-play]")) {
		document.querySelector("*[data-frames-to-play]").innerHTML = data.framesToPlay;
	}
	if (document.querySelector("*[data-reds-remaining]")) {
		document.querySelector("*[data-reds-remaining]").innerHTML = data.redsRemaining;
	}
	if (document.querySelector("*[data-pts-remaining]")) {
		document.querySelector("*[data-pts-remaining]").innerHTML = data.posRemaining;
	}

	if (document.querySelector("*[data-player-1-foul-pts-conceded]")) {
		document.querySelector("*[data-player-1-foul-pts-conceded]").innerHTML = data.s[0].foulPosGiven;
	}
	if (document.querySelector("*[data-player-2-foul-pts-conceded]")) {
		document.querySelector("*[data-player-2-foul-pts-conceded]").innerHTML = data.s[1].foulPosGiven;
	}



	if (document.querySelector("*[data-player-1-snookers-reqd]")) {
		document.querySelector("*[data-player-1-snookers-reqd]").innerHTML = data.s[0].snookersRequired;
	}
	if (document.querySelector("*[data-player-2-snookers-reqd]")) {
		document.querySelector("*[data-player-2-snookers-reqd]").innerHTML = data.s[1].snookersRequired;
	}


	if (document.querySelector("*[data-player-1-current-break]")) {
		document.querySelector("*[data-player-1-current-break]").innerHTML = data.s[0].currBreak;
	}
	if (document.querySelector("*[data-player-2-current-break]")) {
		document.querySelector("*[data-player-2-current-break]").innerHTML = data.s[1].currBreak;
	}

	if (document.querySelector("*[data-player-1-max-break]")) {
		document.querySelector("*[data-player-1-max-break]").innerHTML = data.s[0].highestBreak;
	}
	if (document.querySelector("*[data-player-2-max-break]")) {
		document.querySelector("*[data-player-2-max-break]").innerHTML = data.s[1].highestBreak;
	}


}

if (window.gameDataInit) {
	updateUI(window.gameDataInit);
}
// deleteGame function which sends a DELETE request to the server using XMLHttpRequest
