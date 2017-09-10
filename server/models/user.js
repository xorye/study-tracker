const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
	email: {
		required: true,
		trim: true,
		type: String,
		unique: true,
		validate: {
			isAsync: false,
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email!'
		}
	},

	password: {
		type: String,
		require: true,
		minLength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}],
});

UserSchema.methods.toJSON = function() {
	var userObject = this.toObject();
	return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function() {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
	user.tokens.push({access, token});

	return user.save().then(() => {
		return token;
	});
};

UserSchema.statics.findByCredentials = function(email, password) {
	var User = this;

	console.log("before find one");

	return User.findOne({email}).then((user) => {
		if (!user) {
			return Promise.reject();
		}

		return bcrypt.compare(password, user.password).then((res) => {
			if (res) return user;
			return Promise.reject();
		});
	});
};

UserSchema.statics.findByToken = function(token) {
	var user = this;
	var decoded;

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch(e) {
		return Promise.reject();
	}

	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

UserSchema.pre('save', function(next) {
	var user = this;
	if (user.isModified('password')) {
		bcrypt.genSalt(7, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	} else next();
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};