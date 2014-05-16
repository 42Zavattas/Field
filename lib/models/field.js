'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Field Schema
 */
var FieldSchema = new Schema({
	user       : Schema.Types.ObjectId,
	corrections: [{
		target    : Schema.Types.ObjectId,
		targetName: String,
		mailed    : Boolean,
		dueDate   : { type : Date, default : new Date(0) }
	}],
	fields     : [{
		date : Date,
		taken: Boolean
	}],
	created    : Date,
	modified   : Date
});

module.exports = mongoose.model('Field', FieldSchema);