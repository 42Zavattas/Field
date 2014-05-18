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
		subject: '[Correction] ' + req.user.login
	};

	Field.findOne({ _id: req.params.id }, function (err, field) {
		if (err) {
			return res.send(500, err);
		}
		else if (!field) {
			return res.send(500, 'No such Field');
		}
		field.corrections.forEach(function (corrector) {
			if (!corrector.mailed && (req.body.target === 'all' || corrector.targetName === req.body.target)) {
				mailOptions.to = 'bgronon@student.42.fr';
				mailOptions.html = '<div style="width:500px;margin:0 auto;background: #34495e;padding: 20px;border: 1px solid black;color: white;"><h1>Field</h1><hr><h2>Hello ' + corrector.targetName + ' !</h2><br><p style="color: white;"> ' + req.user.login + ' has send you an email from the Field App.</p><p style="color: white;">You could book a time by following <a href="http://google.fr" target="blank" style="color:#7EACFF">this link</a>.</p><div style="margin-top: 30px; color: white; font-size: 13px;">Have a good day,<br>The Field Team.</div></div>';
				smtpTransport.sendMail(mailOptions, function (error, response) {
					if (error) {
						console.log(error);
					}
					else {
						console.log("Message sent: " + response.message);
					}
				});
				corrector.mailed = true;
			}
		});
		field.save(function(err, field) {
			if (err) {
				return res.send(500, err);
			}
			console.log(field);
			res.send(200, 'ok');
		});
		//smtpTransport.close();
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
