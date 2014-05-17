'use strict';

angular.module('fieldApp')
	.controller('FieldCtrl', function ($scope, data, $http, $location, $timeout, $resource) {

		var original = angular.copy(data);

		$scope.logins = $resource('/api/logins').query();

		$scope.field = data;
		$scope.addingLogin = false;

		$scope.updateField = function () {
			$http.put('/api/fields/' + $scope.field._id, $scope.field).then(function () {
				$location.path('/');
			}, function (err) {
				console.log(err);
			});
		};

		$scope.deleteField = function () {
			$http.delete('/api/fields/' + $scope.field._id).then(function () {
				$location.path('/');
			}, function (err) {
				console.log(err);
			});
		};

		$scope.equal = function () {
			return angular.equals($scope.field, original);
		};

		$scope.toggleAddLogin = function () {
			$scope.addingLogin = !$scope.addingLogin;
		};

		$scope.addLogin = function (login) {
			if (login) {
				$scope.field.corrections.push({ targetName: login });
			}
			$scope.newLogin = '';
			$scope.addingLogin = false;
		};

	});
