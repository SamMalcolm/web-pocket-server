import io from 'socket.io-client';
var socket = io('/game');
var room = /games\/.+\//igm.exec(window.location.href)[0];
room = room.slice(6, -1);

import './overlay.scss';
import './scoreboard.scss';

socket.on('connect', () => {
	console.log("connected");
	socket.emit('join', { room: room })

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

	// if (document.querySelector("button#update")) {
	// 	document.querySelector("button#update").addEventListener("click", () => {
	// 		console.log("CLICKED")
	// 		socket.emit("updateGame", { action: "R", room: room });
	// 	}
	// 	);
	// }

	socket.on("updateUI", data => {
		console.log("UPDATING UI");
		console.log(data);
		updateUI(data);


	});
});

// update ui based on data
const updateUI = data => {
	if (document.querySelector("*[data-player-1-score]")) {
		document.querySelector("*[data-player-1-score]").innerHTML = data.s[0].score;
	}
	if (document.querySelector("*[data-player-2-score]")) {
		document.querySelector("*[data-player-2-score]").innerHTML = data.s[1].score;
	}
	if (document.querySelector("*[data-player-1-name]")) {
		document.querySelector("*[data-player-1-name]").innerHTML = data.s[0].name;
	}
	if (document.querySelector("*[data-player-2-name]")) {
		document.querySelector("*[data-player-2-name]").innerHTML = data.s[1].name;
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
}


if (window.gameDataInit) {
	updateUI(window.gameDataInit);
}


// deleteGame function which sends a DELETE request to the server using XMLHttpRequest
