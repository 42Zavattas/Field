'use strict';

angular.module('fieldApp')
	.controller('ProcessCtrl', function ($scope, $http, $routeParams) {

		$scope.pending = true;
		$scope.error = null;
		$scope.res = null;

		$http.get('/api/process/' + $routeParams.data).success(function (res) {
			$scope.pending = false;
			res.date = moment(new Date(res.date)).format('dddd DD MMMM HH:mm');
			$scope.res = res;
		}).error(function(err) {
			$scope.pending = false;
			if (err === 'alreadyTaken') {
				$scope.error = 'Sorry, this field is already taken by someone, you should try another one';
			}
			else if (err === 'alreadyHaveABooking') {
				$scope.error = 'You already have accepted another booking for this person';
			}
			else {
				$scope.error = 'An error occured, please ';
				$scope.link = true;
			}
		});

	});
