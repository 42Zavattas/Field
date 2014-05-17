'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	ObjectId = mongoose.Types,
	Field = mongoose.model('Field');

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
		field.save(function (err, field) {
			if (err) {
				return res.send(500, err);
			}
			res.json(200, field);
		});
	});
};
