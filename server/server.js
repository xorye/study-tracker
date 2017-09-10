require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

var {mongoose} = require('./db/mongoose');
var {Task} = require('./models/task');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT;
app.use(bodyParser.json());

// view all tasks
app.get('/tasks', authenticate, (req, res) => {
	Task.find({
		_createdBy: req.user.id}
	).then((docs) => {
		res.send(docs);
	}).catch((e) => {
		res.status(400).send(e);
	})
});

// add a task
app.post('/tasks', authenticate, (req, res) => {

	var taskName = _.pick(req.body, ['name']).name;
	var task = new Task({
		name: taskName,
		_createdBy: req.user._id
	});

	task.save().then((doc) => {
		res.send(doc);
	}).catch((e) => {
		res.status(400).send(e);
	});
});

// save session
app.post('/tasks/savesession', authenticate, (req, res) => {
	var body = _.pick(req.body, ['task', 'timeStarted', 'timeEnded', 'breaks']);
	Task.findOne({name: body.task}).then((task) => {
		if (!task) return Promise.reject();
		var session = {
			timeStarted: body.timeStarted,
			timeEnded: body.timeEnded,
			breaks: body.breaks
		};
		task.sessions.push(session);
		task.save().then(() => {
			res.send(task);
		});
		
	}).catch((e) => {
		res.status(400).send(e);
	});
});

// sign up
app.post('/users/signup', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		console.log(e);
		res.status(400).send(e);
	});
});

//login
app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		})
	}).catch((e) => {
		res.status(400).send();
	})
});



app.listen(port, () => {
	console.log(`Started on port ${port}`);
});