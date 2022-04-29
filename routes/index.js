var express = require('express');
var router = express.Router();
var Game = require('../game.class.js');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});


router.get('/games', function (req, res, next) {
	res.render('games', { title: 'Games', games: global.activeGames });
});
router.get('/games/new', function (req, res, next) {
	res.render('gamesForm', { title: 'Games', game: {} });
});

router.post('/games/new', function (req, res, next) {
	let hc = false;
	if (req.body.hc) {
		hc = [req.body.hc1, req.body.hc2];
	}
	let g = new Game([req.body.name1, req.body.name2], hc)
	activeGames.push(g);

	res.redirect('/games');
});

router.get('/games/:id', function (req, res, next) {
	currGame = global.activeGames.filter(g => (g.id == req.params.id))[0];
	console.log(currGame);
	res.render('gameDetail', { title: 'Express', g: currGame });
});

router.get('/games/:id/remote', function (req, res, next) {
	res.render('remote', { title: 'Express' });
});

router.get('/games/:id/overlay', function (req, res, next) {
	currGame = global.activeGames.filter(g => (g.id == req.params.id))[0];
	res.render('overlay', { game: currGame });
});

router.get('/games/:id/scoreboard', function (req, res, next) {
	currGame = global.activeGames.filter(g => (g.id == req.params.id))[0];
	res.render('scoreboard', { game: currGame });
});

router.post('/games/:id/update', function (req, res, next) {
	currGame = global.activeGames.filter(g => (g.id == req.params.id))[0];

	// options 
	currGame.foul()
	currGame.pot()
	currGame.undo()
	currGame.passTurn()

	//update global.activeGames with new instance of currGame
	let index = global.activeGames.indexOf(currGame);
	global.activeGames[index] = currGame;

	res.send(currGame);
});

// DELETE Game route
router.delete('/games/:id', function (req, res, next) {
	let g = global.activeGames.filter(g => (g.id == req.params.id))[0];
	global.activeGames.splice(global.activeGames.indexOf(g), 1);
	res.redirect('/games');
});

module.exports = router;
