'use strict';

var mongoose = require('mongoose'),
        User = mongoose.model('User'),
       Login = mongoose.model('Login'),
    ObjectId = mongoose.Types,
       Field = mongoose.model('Field'),
      crypto = require('crypto'),
  nodemailer = require("nodemailer"),
      moment = require('moment'),
	   async = require('async');

exports.getOne = function (req, res, next) {
	Field.findOne({ _id : req.params.id })
	.populate('corrections.target')
	.exec(function (err, field) {
		if (err) {
			return res.send(500, err);
		}
		var calls = [];

		field.corrections.forEach(function(corr) {
			calls.push(function(callback) {
				Login.findOne({ 'login' : corr.targetName }, function (err, login) {
					corr.reputation = login.reputation.total / login.reputation.count;
					callback(null, 'ok');
				});
			});
		});
		async.parallel(calls, function(err, result) {
			if (err) {
				return res.send(500, err);
			}
			res.json(200, field);
		});
	});
};

exports.getAll = function (req, res, next) {
	function callback(err, things) {
		if (err) {
			return res.send(500, err);
		}
		res.json(200, things);
	}
	if (req.query.next) {
		var corrected = [];
		var corrector = [];
		Field.find({ 'corrections.targetName': req.user.login, 'corrections.dueDate': { $ne: null, $gte: new Date() } }, 'user slots -_id')
			.populate('user', '-sync -_id')
			.lean()
			.exec(function (err, fields) {

				if (err) {
					return res.send(500, err);
				}
				fields.forEach(function(field) {
					field.slots.forEach(function (slot) {
						if (!slot.done && slot.takenBy === req.user.login && slot.date.getTime() > new Date().getTime()) {
							field.date = slot.date;
							delete field.slots;
						}
					});
				});
				corrector = fields;
				Field.find({ 'user': req.user._id })
					.exec(function(err, fields) {
						if (err) {
							return res.send(500, err);
						}
						fields.forEach(function(field) {
							field.slots.forEach(function (slot) {
								if (!slot.done && slot.taken && slot.date.getTime() > new Date().getTime()) {
									corrected.push({ name: slot.takenBy, date: slot.date });
								}
							});
						});
						res.json(200, { 'corrected': corrected, 'corrector': corrector });
					});
			});
	}
	else {
		return Field.find({ user : req.user._id }).populate('corrections.target').exec(callback);
	}
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
		if (req.body.addSlot) {
			field.slots.push(req.body.addSlot);
			// TODO
			// Check if there is another slot booked at this time
		}
		else if (req.body.removeSlot) {
			var index = field.slots.map(function (e) {
				return e.date.getTime();
			}).indexOf(new Date(req.body.removeSlot).getTime());

			if (field.slots[index].taken) {
				return res.send(500, { msg: 'This field is taken.'});
			}
			field.slots.splice(index, 1);
		}
		else if (req.body.addLogin) {
			var index = field.corrections.map(function(e) {
				return e.targetName;
			}).indexOf(req.body.addLogin.targetName);

			if (req.body.addLogin.targetName === req.user.login) {
				return res.send(500, { msg : 'Can\'t add yourself.' });
			}
			else if (index !== -1) {
				return res.send(500, { msg: 'Already added.' });
			}
			// TODO
			// Check if login is in login tables
			field.corrections.push(req.body.addLogin);
		}
		else if (req.body.removeLogin) {
			var index = field.corrections.map(function(e) {
				return e.targetName;
			}).indexOf(req.body.removeLogin);

			if (index === -1) {
				return res.send(500, { msg: 'Invalid login.' });
			}
			else if (field.corrections[index].dueDate) {
				return res.send(500, { msg: 'Have a confirmed booking.' });
			}
			field.corrections.splice(index, 1);
		}
		else if (req.body.name) {
			if (!req.body.name || req.body.name.length === 0) {
				return res.send(500, 'Project name can\'t be null.');
			}
			field.name = req.body.name;
		}
		else if (req.body.validate) {
			if (req.body.validate.note > 5 || req.body.validate.note < 0) {
				return res.send(500, 'You hacker will burn.');
			}

			var index = field.corrections.map(function(e) {
				return e.targetName;
			}).indexOf(req.body.validate.user);

			var slotIndex = field.slots.map(function(e) {
				return e.takenBy;
			}).indexOf(req.body.validate.user);

			if (index === -1 || slotIndex === -1) {
				return res.send(500, 'Error.');
			}
			else if (field.corrections[index].done || field.slots[slotIndex].done) {
				return res.send(500, 'Already validate.');
			}
			else if (!field.corrections[index].dueDate) {
				return res.send(500, 'Slow down boy, your booking must be confirmed');
			}
			field.corrections[index].done = true;
			field.corrections[index].note = req.body.validate.note;
			field.slots[slotIndex].done = true;
			Login.findOne({ login: req.body.validate.user }, function (err, login) {
				if (!err) {
					login.reputation.count++;
					login.reputation.total += req.body.validate.note;
					login.save();
				}
			});
		}
		field.save(function (err, field) {
			if (err) {
				return res.send(500, err);
			}
			res.json(200, 'success');
		});
	});
};

exports.sendMessages = function (req, res, next) {

	var smtpTransport = nodemailer.createTransport('SMTP', {
		host: 'smtp.mandrillapp.com',
		secureConnection: true,
		port: 465,
		auth: {
			user: 'app25679465@heroku.com',
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
		else if (field.slots.length === 0) {
			return res.send(500, 'No slots for now.');
		}
		var ok = false;
		field.slots.forEach(function(slot) {
			if (slot.taken === false) {
				ok = true;
			}
		});
		if (ok === false) {
			return res.send(500, 'No slots for now.');
		}
		field.corrections.forEach(function (corrector) {
			if (!corrector.mailed && (req.body.target === 'all' || corrector.targetName === req.body.target)) {

				//mailOptions.to = 'bgronon@student.42.fr';
				mailOptions.to = corrector.targetName + '@student.42.fr';
				var secret = 'No doubt about it, you\'re a zavatta !';
				var hashCorrector = crypto.createHash('sha256').update(corrector._id + secret).digest('hex');

				var listyle = 'style="margin: 0;text-align: center;padding: 15px;margin-bottom: 5px;border: 1px solid rgba(0, 0, 0, 0.2);"';

				var availablesHtml = '';
				moment.lang('fr');
				field.slots.forEach(function (slot) {
					if (!slot.taken) {
						availablesHtml += '<a href="http://ft-field.herokuapp.com/process/'+ field._id + '!' + slot._id + '!' + hashCorrector +'" style="text-decoration:none;color:white;"><li ' + listyle + '>' + moment(slot.date).zone('+0200').format('dddd DD MMMM HH:mm') + '</li></a>';
					}
				});

				mailOptions.html = '<div style="width:500px;margin:0 auto;background: #34495e;padding: 20px;border: 1px solid black;color: white;box-sizing:border-box;"><img src="http://apercu.io/header.png"><hr><h2 style="color:white;">Hello ' + corrector.targetName + ' !</h2><br><div style="display:flex;"><img src="http://cdn.42.fr/userprofil/profilview/' + req.user.login + '.jpg" height="60px" style="margin-right: 20px;"><div><p style="color:white;margin-top: 0;">' + req.user.login + ' has sent you an email from Field App.</p><p style="color:white">Book a time by following one of theses links.</p></div></div><div style="margin-top:20px;"><span style="color:white;">Warning ! Once clicked, your reservation is confirmed.</span><ul style="list-style-type:none;margin:20px 0 0 0;padding:0;">' + availablesHtml + '</ul></div><div style="padding-top: 40px; color: white; font-size: 13px;"><hr>Have a good day,<br>The Field Team.</div></div>';

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
			res.send(200, 'sucess');
		});
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
