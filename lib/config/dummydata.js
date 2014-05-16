'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Field = mongoose.model('Field'),
	Thing = mongoose.model('Thing');

/**
 * Populate database with sample application data
 */

//Clear old things, then add things in
Thing.find({}).remove(function () {
	Thing.create({
			name       : 'HTML5 Boilerplate',
			info       : 'HTML5 Boilerplate is a professional front-end template for building fast, robust, and adaptable web apps or sites.',
			awesomeness: 10
		}, {
			name       : 'AngularJS',
			info       : 'AngularJS is a toolset for building the framework most suited to your application development.',
			awesomeness: 10
		}, {
			name       : 'Karma',
			info       : 'Spectacular Test Runner for JavaScript.',
			awesomeness: 10
		}, {
			name       : 'Express',
			info       : 'Flexible and minimalist web application framework for node.js.',
			awesomeness: 10
		}, {
			name       : 'MongoDB + Mongoose',
			info       : 'An excellent document database. Combined with Mongoose to simplify adding validation and business logic.',
			awesomeness: 10
		}, function () {
			console.log('finished populating things');
		}
	);
});

// Clear old users, then add a default user
/*Field.find({}).remove(function () {
	Field.create({
		user        : mongoose.Types.ObjectId('53756fa459fadd1b339f2966'),
		corrections : [{
		}],
		fields      : [{
		
		}],
		created     : new Date(),
		modified    : new Date()
		}, {
		user        : mongoose.Types.ObjectId('5375723fea695d2a39882c31'),
		corrections : [{
		}],
		fields      : [{
		
		}],
		created     : new Date(),
		modified    : new Date()
		}, function () {
		}
	);
});*/

// Clear old users, then add a default user
User.find({}).remove(function () {
	User.create({
		_id : mongoose.Types.ObjectId('53756fa459fadd1b339f2966'),
		login : 'bgronon',
		reputation : 0
	}, {
		_id : mongoose.Types.ObjectId('5375723fea695d2a39882c31'),
		login : 'mpillet',
		reputation : 0
	}, function(err){
		if (err) {
			console.log(err);
		}
	});
});
