'use strict';

angular.module('fieldApp')
	.controller('FieldCtrl', function ($scope, data, $http, $location, $timeout, $resource) {

		var original = angular.copy(data);

		$scope.logins = $resource('/api/logins').query();
		//var Sync = $resource('/api/users/me');

		$scope.user = null;

		$scope.field = data;
		$scope.addingLogin = false;
		$scope.addingTimeSlot = false;
		$scope.newLogin = '';
		$scope.selectedCorr = null;
		$scope.newTimeSlot = {};

		$http.get('/api/users/me').then(function (res) {
			$scope.user = res.data;
		}, function (err) {
			console.log(err);
		});

		$scope.checkLogin = function (login) {
			if (login && $scope.logins.map(function (e) {
				return e.login;
			}).indexOf(login) !== -1 && $scope.field.corrections.map(function (e) {
				return e.targetName;
			}).indexOf(login) === -1) {
				return (true);
			}
			return (false);
		};

		$scope.sendAll = function () {
			$http.post('/api/fields/' + $scope.field._id, { target: 'all' }).then(function (res) {
				if (res.data) {
					$scope.field = res.data;
					original = angular.copy(res.data);
				}
			}, function (err) {
				console.log(err);
			});
		};

		$scope.sendSpecific = function ($event, corr) {
			$http.post('/api/fields/' + $scope.field._id, { target : corr.targetName }).then(function (res) {
				if (res.data) {
					$scope.field = res.data;
					original = angular.copy(res.data);
				}
			}, function (err) {
				console.log(err);
			});
			$event.stopPropagation();
		};

		$scope.loadSync = function () {
			angular.forEach($scope.user.sync.logins, function (target) {
				if ($scope.checkLogin(target)) {
					$scope.field.corrections.push({ targetName: target });
				}
			});
			$scope.updateField();
		};

		$scope.updateField = function () {
			if ($scope.equal()) {
				return;
			}
			$http.put('/api/fields/' + $scope.field._id, $scope.field).then(function (res) {
				$scope.field = res.data;
				original = angular.copy(res.data);
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
			if ($scope.addingLogin) {
				$scope.addingTimeSlot = false;
			}
			$scope.newLogin = '';
		};

		$scope.toggleAddTimeSlot = function () {
			$scope.addingTimeSlot = !$scope.addingTimeSlot;
			if ($scope.addingTimeSlot) {
				$scope.addingLogin = false;
			}
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

		$scope.deleteCorr = function (corr) {
			$scope.field.corrections.splice($scope.field.corrections.indexOf(corr), 1);
		};

		$scope.preventDefault = function ($event) {
			$event.stopPropagation();
		};

	});
