var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket_io = require("socket.io");
const session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const MemoryStore = require('memorystore')(session);
var app = express();
app.use(session({
	store: new MemoryStore({
		checkPeriod: 86400000
	}),
	secret: 'Tj4W;h4KqU4AAGYieKPLH}Jh',
	cookie: {
		maxAge: 86400000
	},
	resave: false,
	saveUninitialized: false
}));

var io = socket_io();
app.io = io;
const game = io.of('/game');
app.locals.io_game = game;

game.on("connection", socket => {
	console.log("socket connected");
	socket.on('join', data => {
		socket.join(data.room)
		console.log("joining " + data.room)
	});

	socket.on('updateGame', data => {

		let currGame = global.activeGames.filter(g => (g.id == data.room))[0];
		console.log("==========")
		console.log("gameUpdate " + data.room)
		console.log(data.action);
		console.log("==========")
		if (currGame) {
			if (["R", "G", "Y", "br", "bl", "P", "B"].indexOf(data.action) != -1) {
				console.log("running method")
				currGame.pot(data.action, false);
			} else if (["F4", "F5", "F6", "F7"].indexOf(data.action) != -1) {
				currGame.foul(data.action.slice(1));
			} else if (data.action == "passTurn") {
				currGame.passTurn();
			} else if (data.action == "undo") {
				currGame.undo();
			}

			let index = global.activeGames.indexOf(currGame);
			global.activeGames[index] = currGame;

			game.to(data.room).emit('updateUI', currGame);
		}
	});

	socket.on('showBreakForActivePlayer', data => {
		console.log("TOGGLING BREAK VIEW IN UI")
		let currGame = global.activeGames.filter(g => (g.id == data.room))[0];
		if (currGame) {
			let ap = currGame.getActive();
			ap.showBreakInUI = !ap.showBreakInUI;
			game.to(data.room).emit('updateUI', currGame);
		}
	})

	socket.on('endGame', data => {
		let currGame = global.activeGames.filter(g => (g.id == data.room))[0];
		if (currGame) {
			currGame.endGame();
			game.to(data.room).emit('updateUI', currGame);
		}
	})
	socket.on('toggleBreakBar', data => {
		let currGame = global.activeGames.filter(g => (g.id == data.room))[0];
		let show_for_active_player = false;
		if (currGame) {

			let players_with_bb_showing_set_to_true = currGame.s.filter(p => p.showBreakBarInUI);
			if (players_with_bb_showing_set_to_true.length == 0) {
				show_for_active_player = true;
			}
			if (!show_for_active_player) {
				currGame.s.forEach(p => {
					if (p.showBreakBarInUI) {
						p.showBreakBarInUI = false;
					}
				});
			} else {
				let ap = currGame.getActive();
				ap.showBreakBarInUI = true;
			}

			game.to(data.room).emit('updateUI', currGame);
		}
	});

	socket.on('adjustReds', data => {
		let currGame = global.activeGames.filter(g => (g.id == data.room))[0];
		if (currGame) {
			if (data.red_adjustment = 'increment') {
				currGame.incrementReds();
			} else {
				currGame.decrementReds();
			}
			game.to(data.room).emit('updateUI', currGame);
		}
	})

	socket.on('disconnect', data => {
		console.log("SOCKET LEFT");
		console.log(data);
	})
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

global.activeGames = [];

// Socket.io


module.exports = app;
