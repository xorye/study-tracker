const mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema(({
	// name is the name of the task
	name: {
		require: true,
		trim: true,
		type: String,
		minLength: 1,
		unique: true
	},
	// time is the number of milliseconds a task was performed for
	time: {
		type: Number,
		default: 0
	},
	// created is the date where the task was created
	created: {
		type: Date,
		default: new Date()
	},
	// lastPerformed is the date where the task has been last done
	lastPerformed: {
		type: Date
	},
	// _createdBy is the ID that created this task
	_createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	// sessions is an array containing study sessions
	sessions: [{
		timeStarted: {
			type: Number,
			required: true
		},
		timeEnded: {
			type: Number,
			required: true
		},
		breaks: {
			type: Number,
			default: 0
		}
	}]
}));

var Task = mongoose.model('Task', TaskSchema);

module.exports = {Task}