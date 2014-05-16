'use strict';

angular.module('fieldApp')
	.controller('LoginCtrl', function ($scope, Auth, $location) {

		$scope.user = {};
		$scope.errors = {};
		$scope.loading = false;

		$scope.login = function (form) {

			$scope.submitted = true;
			$scope.invalid = false;
			$scope.loading = true;

			if (form.$valid) {

				Auth
					.login({
						login   : $scope.user.login,
						password: $scope.user.password
					}).then(function () {
						$location.path('/');
					}).catch(function (err) {
						$scope.invalid = true;
						$scope.loading = false;
						err = err.data;
						$scope.errors.other = err.message;
					});
			}
		};
	});
