'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Login Schema
 */
var LoginSchema = new Schema({
	login: String
});

module.exports = mongoose.model('Login', LoginSchema);
