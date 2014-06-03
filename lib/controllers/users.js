'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	passport = require('passport');

/**
 * Create user
 */
exports.create = function (req, res, next) {
	var newUser = new User(req.body);
	newUser.provider = 'local';
	newUser.save(function (err) {
		if (err) return res.json(400, err);

		req.logIn(newUser, function (err) {
			if (err) return next(err);

			return res.json(req.user.userInfo);
		});
	});
};

/**
 *  Get profile of specified user
 */
exports.show = function (req, res, next) {
	var userId = req.params.id;

	User.findById(userId, function (err, user) {
		if (err) return next(err);
		if (!user) return res.send(404);

		res.send({ profile: user.profile });
	});
};

/**
 * Get current user
 */
exports.me = function (req, res) {
	res.json(req.user || null);
};

exports.updateMe = function (req, res) {
	User.findOne({ _id: req.user._id }, function (err, user) {
		if (err) {
			return res.send(500, err);
		}
		if (req.body.noDemo) {
			user.demo = false;
		}
		else if (req.body.memo) {
			if (req.body.memo !== -1 && req.body.memo !== 15 && req.body.memo !== 30 && req.body.memo !== 60) {
				return res.send(500, 'Life is not like it is in Watch Dogs.');
			}
			user.memo = req.body.memo;
		}
		user.save(function(err) {
			if (err) {
				return res.send(500, err);
			}
			res.json(200, 'success');
		});
	});
}
