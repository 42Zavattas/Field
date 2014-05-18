'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	ObjectId = mongoose.Types,
	Field = mongoose.model('Field'),
	nodemailer = require("nodemailer");

exports.getOne = function (req, res, next) {
	Field.findOne({ _id : req.params.id }, function (err, fields) {
		if (err) {
			console.log(err);
			return res.send(500, err);
		}
		res.json(200, fields);
	});
};

exports.getAll = function (req, res, next) {
	Field.find({ user : req.user._id }, function (err, fields) {
		if (err) {
			return res.send(500, err);
		}
		res.json(200, fields);
	});
};

exports.create = function (req, res, next) {
	req.body.user = req.user._id;
	Field.create(req.body, function (err, field) {
		if (err) {
			return res.send(500, err);
		}
		res.send(200, field);
	});
};

exports.updateOne = function (req, res, next) {
	Field.findOne({ _id : req.params.id }, function (err, field) {
		if (err) {
			return res.send(500, err);
		}
		field.name = req.body.name;
		field.corrections = req.body.corrections;
		field.save(function (err, field) {
			if (err) {
				return res.send(500, err);
			}
			res.json(200, field);
		});
	});
};

exports.sendMessages = function (req, res, next) {

	var smtpTransport = nodemailer.createTransport('SMTP', {
		host: 'mail.gandi.net',
		secureConnection: true,
		port: 465,
		auth: {
			user: 'dev@apercu.io',
			pass: ''
		}
	});

	var mailOptions = {
		from: 'Field App ♡ <dev@apercu.io>',
		to: '',
		subject: '[Correction] ' + req.user.login
	};

	Field.findOne({ _id: req.params.id }, function (err, field) {
		if (err) {
			return res.send(500, err);
		}
		else if (!field) {
			return res.send(500, 'No such Field');
		}
		if (req.body.target === 'all') {
			field.corrections.forEach(function (corrector) {
				if (corrector.targetName === 'bgronon') {
					mailOptions.to = 'bgronon@student.42.fr';
					mailOptions.html = '<div style="width: 500px;margin: 0 auto;"><img src="http://imgur.com/RBWnngz"><h2>Hello ' + corrector.targetName + '</h2> ' + req.user.login + ' has send you an email from the Field App.<br><br>You could book a time by following <a href="http://google.fr" target="blank">this link</a>.</div>';
					smtpTransport.sendMail(mailOptions, function (error, response) {
						if (error) {
							console.log(error);
						}
						else {
							console.log("Message sent: " + response.message);
						}
					});
				}
			});
			//			smtpTransport.close();
		}
		else {

		}
	});
};

exports.deleteOne = function (req, res, next) {
	Field.findOne({ _id : req.params.id }, function (err, field) {
		if (err) {
			return res.send(500, err);
		}
		field.remove(function (err) {
			if (err) {
				return res.send(500, err);
			}
			res.json(200);
		});
	});
};
