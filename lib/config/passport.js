'use strict';

var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	ldap = require('ldapjs');

/**
 * Passport configuration
 */
passport.serializeUser(function (user, done) {
	User.findOne({
		login : user.username
	}, function (err, mongoUser) {
		if (err) {
			return done({ msg : "MONGO ERR" });
		}
		if (mongoUser) {
			done(null, mongoUser._id);
		} else {
			var newUser = new User();
			newUser.login = user.username;
			newUser.save(function (err, res) {
				if (err) {
					return done({ msg : "Cant save you into mongo" });
				}
				done(null, newUser._id);
			});
		}
	});
});

passport.deserializeUser(function (id, done) {
	User.findOne({
		_id: id
	}, function (err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function (login, password, done) {
		var client = ldap.createClient({
			url: 'ldaps://ldap.42.fr:636'
		});

		var opts = {
			filter: '(uid=' + login + ')',
			scope : 'sub'
		};

		var ldapres = null;

		client.search('ou=people,dc=42,dc=fr', opts, function (err, result) {
			result.on('searchEntry', function (entry) {
				ldapres = entry.raw;
			});
			result.on('error', function (err) {
				return done(err);
			});
			result.on('end', function (result) {
				if (ldapres) {
					client.bind(ldapres.dn, password, function (err) {
						if (err) {
							return done(err);
						}
						else {
							return done(null, { username : login });
						}
					});
				}
				else {
					return done(null, false, { message: 'Incorrect username.' });
				}
			});
		});
	}
));

module.exports = passport;
