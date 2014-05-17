'use strict';

angular.module('fieldApp')
	.controller('FieldCtrl', function ($scope, data, $http, $location, $timeout, $resource) {

		var original = angular.copy(data);

		$scope.logins = $resource('/api/logins').query();

		$http.get('/api/users/me').then(function (res) {
			console.log(res.data);
		}, function (err) {
			console.log(err);
		});
		$scope.field = data;
		$scope.addingLogin = false;
		$scope.newLogin = '';
		$scope.selectedCorr = null;

		$scope.updateField = function () {
			if ($scope.equal()) {
				return;
			}
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
			$scope.newLogin = '';
		};

		$scope.addLogin = function () {
			if ($scope.newLogin) {
				$scope.field.corrections.push({ targetName: $scope.newLogin });
			}
			$scope.newLogin = '';
		};

		$scope.selectCorr = function (corr) {
			if ($scope.selectedCorr == corr) {
				return $scope.selectedCorr = null;
			}
			$scope.selectedCorr = corr;
		};

	});
