'use strict';

var User = require('./user.js');

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Field Schema
 */
var FieldSchema = new Schema({
	name       : { type : String, default : null },
	user       : { type : Schema.Types.ObjectId, ref: 'User' },
	corrections: [{
		target    : { type: Schema.Types.ObjectId, ref: 'User' },
		targetName: String,
		mailed    : Boolean,
		mailedOn  : Date,
		requests  : [Date],
		dueDate   : { type : Date, default : null }
	}],
	slots      : [{
		date   : Date,
		taken  : Boolean,
		takenBy: String,
		done   : Boolean,
		note   : { type: Number, default: 0 }
	}],
	created    : Date,
	modified   : Date
});

module.exports = mongoose.model('Field', FieldSchema);
