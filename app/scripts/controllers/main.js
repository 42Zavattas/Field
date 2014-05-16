'use strict';

angular.module('fieldApp')
	.controller('MainCtrl', function ($scope, $http) {

		$http.get('/api/fields').then(function (res) {
			$scope.processes = res.data;
		});

	});
