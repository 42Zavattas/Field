'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Field Schema
 */
var FieldSchema = new Schema({
	name       : { type : String, default : 'Project Name' },
	user       : Schema.Types.ObjectId,
	corrections: [{
		target    : Schema.Types.ObjectId,
		targetName: String,
		mailed    : Boolean,
		requests  : [Date],
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
