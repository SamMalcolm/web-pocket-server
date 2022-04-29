import io from 'socket.io-client';
var socket = io('/game');
var room = /games\/.+\//igm.exec(window.location.href)[0];
room = room.slice(6, -1);

socket.on('connect', () => {
	console.log("connected");
	socket.emit('join', { room: room })

	// when button#update is clicked emit updateGame socket event
	if (document.querySelector("button#update")) {
		document.querySelector("button#update").addEventListener("click", () => {
			console.log("CLICKED")
			socket.emit("updateGame", { action: "R", room: room });
		}
		);
	}

	socket.on("updateUI", data => {
		console.log("UPDATING UI");
		console.log(data);
		// loop through data object keys and update any html elements with the same id
		// for (var key in data) {
		// 	if (document.querySelector("data-game-info=['" + key + "']")) {
		// 		document.querySelector("data-game-info=['" + key + "']").innerHTML = data[key];
		// 	}
		// }

		// update scoreboard
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

		// if (document.querySelector("data-player-1-framesWon")) {
		// 	document.querySelector("data-player-1-framesWon").innerHTML = data.s[0].framesWon;
		// }
		// if (document.querySelector("data-player-2-framesWon")) {
		// 	document.querySelector("data-player-2-framesWon").innerHTML = data.s[1].framesWon;
		// }

	});
});





// deleteGame function which sends a DELETE request to the server using XMLHttpRequest
