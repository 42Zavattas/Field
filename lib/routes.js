'use strict';

var    api = require('./controllers/api'),
	 index = require('./controllers'),
     users = require('./controllers/users'),
    fields = require('./controllers/fields'),
    logins = require('./controllers/logins'),
   session = require('./controllers/session'),
      sync = require('./controllers/sync'),
  fprocess = require('./controllers/process'),
middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function (app) {

	// Server API Routes

	app.route('/api/users')
		.post(users.create);

	app.route('/api/users/me')
		.get(users.me)
		.put(users.updateMe);

	app.route('/api/users/:id')
		.get(users.show);

	app.route('/api/session')
		.post(session.login)
		.delete(session.logout);

	app.route('/api/fields')
		.get(fields.getAll)
		.post(fields.create);

	app.route('/api/fields/:id')
		.get(fields.getOne)
		.put(fields.updateOne)
		.post(fields.sendMessages)
		.delete(fields.deleteOne);

	app.route('/api/logins')
		.get(logins.getAll);

	app.route('/api/sync')
		.post(sync.update);

	app.route('/api/process/:data')
		.get(fprocess.validate);

	// All undefined api routes should return a 404
	app.route('/api/*')
		.get(function (req, res) {
			res.send(404);
		});

	// All other routes to use Angular routing in app/scripts/app.js
	app.route('/partials/*')
		.get(index.partials);
	app.route('/*')
		.get(middleware.setUserCookie, index.index);
};
