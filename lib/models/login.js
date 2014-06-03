'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Login Schema
 */
var LoginSchema = new Schema({
	login: String,
	reputation: {
		total : { type : Number, default : 0 },
		count : { type : Number, default : 0 }
	},
});

module.exports = mongoose.model('Login', LoginSchema);
