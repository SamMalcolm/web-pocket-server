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

			socket.emit('toggleBreakBar', { room: room })

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

	if (document.querySelector(".overlay_preview")) {
		document.querySelector(".overlay_preview iframe").setAttribute('src', '/games/' + room + '/overlay');
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
	if (document.querySelector('.break_bar')) {
		console.log("HIDING BREAK BAR")
		document.querySelector(".break_bar").classList.remove('show');
	}

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



		if (player.showBreakBarInUI && document.querySelector('.break_bar')) {
			let bb = document.querySelector('.break_bar');
			console.log("SHOWING BREAK BAR FOR", player.name);
			bb.classList.remove('left_player');
			bb.classList.remove('right_player');

			if (player == data.s[0]) {
				bb.classList.add('right_player');
			} else {
				bb.classList.add('left_player');
			}

			bb.classList.add('show');
			console.log(bb.classList);

			console.log(bb)

			let max_points_available = player.maxScore;
			let snooker_line = player.snookersReqdScoreline;
			let current_break = player.score;
			let current_break_portion = player.scoreFractionOfMax * 100;

			let snooker_reqd_portion = player.snookersReqdFractionOfMax * 100;


			bb.querySelector('.break').style.height = 'calc(' + current_break_portion + "% - 10px)";
			bb.querySelector('.break').childNodes[0].textContent = current_break;
			bb.querySelector('.snooker_line').style.height = 'calc(' + snooker_reqd_portion + "% - 10px)";
			bb.querySelector('.snooker_line').childNodes[0].textContent = snooker_line;

			bb.querySelector('.max_available').childNodes[0].textContent = max_points_available;

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
