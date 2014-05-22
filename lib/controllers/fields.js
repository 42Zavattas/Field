'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	ObjectId = mongoose.Types,
	Field = mongoose.model('Field'),
	nodemailer = require("nodemailer");

exports.getOne = function (req, res, next) {
	Field.findOne({ _id : req.params.id })
	.populate('slots.takenBy')
	.populate('corrections.target')
	.exec(function (err, fields) {
		if (err) {
			console.log(err);
			return res.send(500, err);
		}
		res.json(200, fields);
	});
};

exports.getAll = function (req, res, next) {
	Field.find({ user : req.user._id })
	.populate('slots.takenBy')
	.populate('corrections.target')
	.exec(function (err, fields) {
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
		if (field.corrections.target) {
			field.corrections.target = field.corrections.target._id;
		}
		if (field.slots.takenBy) {
			field.slots.takenBy = field.slots.takenBy._id;
		}
		field.slots = req.body.slots;
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
		forceEmbeddedImages: true,
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
		//	if (!corrector.mailed && (req.body.target === 'all' || corrector.targetName === req.body.target)) {
			if (corrector.targetName === 'bgronon') {

				mailOptions.to = 'bgronon@student.42.fr';

				var listyle = 'style="margin: 0;text-align: center;padding: 15px;margin-bottom: 5px;border: 1px solid rgba(0, 0, 0, 0.2);"';
				var availablesHtml = '<ul style="list-style-type:none;margin:20px 0 0 0;padding:0;"> \
					<li ' + listyle + '>Mardi 15 septembre à 12h</li> \
					<li ' + listyle + '>Mercredi 24 octobre à 24h</li> \
					</ul>';
				mailOptions.html = '<div style="width:500px;margin:0 auto;background: #34495e;padding: 20px;border: 1px solid black;color: white;box-sizing:border-box;"><img src="http://apercu.io/header.png"><hr><h2>Hello ' + corrector.targetName + ' !</h2><br><div style="display:flex;"><img src="http://cdn.42.fr/userprofil/profilview/' + req.user.login + '.jpg" height="60px" style="margin-right: 20px;"><div><p style="color:white;margin-top: 0;">' + req.user.login + ' has send you an email from the Field App.</p><p style="color:white">You could book a time by following <a href="http://google.fr" style="color:#7eacff" target="_blank">this link</a>.</p></div></div><div style="margin-top:20px;">Or simply pick one of these : ' + availablesHtml + ' </div><div style="padding-top: 40px; color: white; font-size: 13px;"><hr>Have a good day,<br>The Field Team.</div></div>';
				smtpTransport.sendMail(mailOptions, function (error, response) {
					if (error) {
						console.log(error);
					}
					else {
						console.log("Message sent: " + response.message);
					}
				});
				corrector.mailed = true;
				corrector.mailedOn = new Date();
			}
		});
		field.save(function(err, field) {
			if (err) {
				return res.send(500, err);
			}
			res.send(200, field);
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
