'use strict';

angular.module('fieldApp')
	.controller('ProcessCtrl', function ($scope, $http, $routeParams) {

		$http.get('/api/process/' + $routeParams.data).success(function (res) {
			console.log(res);
		}).error(function(err) {
			console.log(err);
		});

	});
