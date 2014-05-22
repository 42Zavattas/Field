'use strict';

var User = require('./user.js');

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Field Schema
 */
var FieldSchema = new Schema({
	name       : { type : String, default : 'Project Name' },
	user       : Schema.Types.ObjectId,
	corrections: [{
		target    : { type: Schema.Types.ObjectId, ref: 'User' },
		targetName: String,
		mailed    : Boolean,
		mailedOn  : Date,
		requests  : [Date],
		dueDate   : { type : Date, default : new Date(0) }
	}],
	slots      : [{
		date   : Date,
		taken  : Boolean,
		done   : Boolean,
		takenBy: { type: Schema.Types.ObjectId, ref: 'User' },
	}],
	created    : Date,
	modified   : Date
});

module.exports = mongoose.model('Field', FieldSchema);
