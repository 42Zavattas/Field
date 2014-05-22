'use strict';

var should = require('should'),
	app = require('../../../server'),
	request = require('supertest');

describe('GET /api/users/me', function () {

	it('should respond with JSON of current user', function (done) {
		request(app)
			.get('/api/users/me')
			.expect(200)
			.expect('Content-Type', /json/);
	});
});

describe('GET /api/fields', function () {

	it('should respond with JSON of all fields', function (done) {
		request(app)
			.get('/api/fields')
			.expect(200)
			.expect('Content-Type', /json/);
	});
});
