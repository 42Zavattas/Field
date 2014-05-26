'use strict';

var mongoose = require('mongoose'),
	   Field = mongoose.model('Field'),
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

		console.log(field);
		console.log('----');
		console.log(currentSlot);
		console.log('----');
		console.log(currentUser);
		res.json(200, field);
	});
};
