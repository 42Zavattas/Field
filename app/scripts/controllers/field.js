'use strict';

angular.module('fieldApp')
	.controller('FieldCtrl', function ($scope, data, $http, $location, $timeout, $resource) {

		var original = angular.copy(data);

		$scope.logins = $resource('/api/logins').query();
		//var Sync = $resource('/api/users/me');

		$scope.user = null;

		$scope.field = data;
		$scope.addingLogin = false;
		$scope.newLogin = '';
		$scope.selectedCorr = null;

		$http.get('/api/users/me').then(function (res) {
			$scope.user = res.data;
		}, function (err) {
			console.log(err);
		});

		$scope.checkLogin = function(login) {
			if (login && $scope.logins.map(function (e) { return e.login; }).indexOf(login) !== -1
				&& $scope.field.corrections.map(function (e) { return e.targetName; }).indexOf(login) == -1) {
				return (true);
			}
			return (false);
		};

		$scope.sendAll = function () {
			$http.post('/api/fields/' + $scope.field._id, { target: 'all' }).then(function (res) {
				console.log(res);
			}, function (err) {
				console.log(err);
			});
		};

		$scope.loadSync = function() {
			angular.forEach($scope.user.sync.logins, function(target) {
				if ($scope.checkLogin(target)) {
					$scope.field.corrections.push({ targetName : target });
				}
			});
		};

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
			if ($scope.newLogin && $scope.checkLogin($scope.newLogin)) {
				$scope.field.corrections.push({ targetName: $scope.newLogin });
				$scope.newLogin = '';
			}
		};

		$scope.selectCorr = function (corr) {
			if ($scope.selectedCorr === corr) {
				$scope.selectedCorr = null;
				return;
			}
			$scope.selectedCorr = corr;
		};

	});
