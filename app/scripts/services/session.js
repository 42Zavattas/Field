'use strict';

angular.module('fieldApp')
	.factory('Session', function ($resource) {
		return $resource('/api/session/');
	});
