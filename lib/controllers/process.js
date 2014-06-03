'use strict';

var mongoose = require('mongoose'),
	Field = mongoose.model('Field'),
	User = mongoose.model('User'),
	moment = require('moment'),
	mandrill = require('mandrill-api/mandrill'),
	crypto = require('crypto');

exports.validate = function (req, res) {
	if (!req.params.data) {
		return res.send(500, 'No data.');
	}

	var tab = req.params.data.split('!');
	if (!tab || tab.length !== 3) {
		return res.send(404, 'Nothing in here.');
	}

	Field.findOne({ _id: tab[0] })
		.populate('user')
		.exec(function (err, field) {
			if (err) {
				return res.send(500, err);
			}
			else if (!field) {
				return res.send(404, 'Nothing in here.');
			}

			var currentSlot = null;
			field.slots.forEach(function (slot) {
				if (slot._id.equals(tab[1])) {
					currentSlot = slot;
				}
			});
			if (!currentSlot) {
				return res.send(404, 'Nothing in here.');
			}

			var currentUser = null;
			var secret = 'No doubt about it, you\'re a zavatta !';
			field.corrections.forEach(function (corrector) {
				var hash = crypto.createHash('sha256').update(corrector._id + secret).digest('hex');
				if (tab[2] === hash) {
					currentUser = corrector;
				}
			});
			if (!currentUser) {
				return res.send(404, 'Are you trying to hack something ?');
			}

			if (currentSlot.taken) {
				return res.send(500, 'alreadyTaken');
			}
			else if (currentUser.dueDate) {
				return res.send(500, 'alreadyHaveABooking');
			}
			currentUser.dueDate = currentSlot.date;
			currentSlot.taken = true;
			currentSlot.takenBy = currentUser.targetName;

			if (field.user.memo !== -1) {

				var mandrill_client = new mandrill.Mandrill('');

				var mailOptions = {
					'subject'   : '[Memo] ' + currentSlot.takenBy,
					'to'        : [{
							'email': field.user.login + '@student.42.fr'
					}],
					'from_email': 'dev@apercu.io',
					'from_name' : 'Field App ♡'
				};

				mailOptions.html =
					'<div style="width:500px;margin:0 auto;background: #34495e;padding: 20px;border: 1px solid black;color: white;box-sizing:border-box;"> ' +
					'<img src="http://apercu.io/header.png"><hr><h2 style="color:white;">Hello ' + field.user.login + ' !</h2>' +
					'<br><div style="display:flex;"><img src="http://cdn.42.fr/userprofil/profilview/' + currentUser.targetName + '.jpg" height="60px" style="margin-right: 20px;">' +
					'<div><p style="color:white;margin-top: 0;">Just a memo to remind you that you have a meeting with ' + currentUser.targetName + ' in ' + field.user.memo + ' minutes.</p></div>' +
					'<div style="padding-top: 40px; color: white; font-size: 13px;"><hr>Have a good day,<br>The Field Team.</div></div>';

				console.log('EMAIL WILL BE SEND AT');
				var sendTime = moment(currentSlot.date).zone('+0200').subtract('minutes', field.user.memo).format('YYYY-MM-DD HH:mm:SS');
				console.log(sendTime);
				console.log('---');
				mandrill_client.messages.send({'message': mailOptions, 'async': false, 'ip_pool': 'Mail pool', 'send_at': sendTime}, function (result) {
					console.log(result);
				}, function (e) {
					console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
				});
				console.log('---');
			}

			field.save(function (err, field) {
				if (err) {
					return res.send(500, err);
				}
				res.json(200, {
					target   : field.user.login,
					corrector: currentUser.targetName,
					date     : currentSlot.date
				});
			});
		});
};
