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

		$scope.newTimeSlot = { date: null };

		$http.get('/api/users/me').then(function (res) {
			$scope.user = res.data;
		}, function (err) {
			console.log(err);
		});

		$scope.checkNewTimeSlot = function () {
			if ($scope.newTimeSlot.date) {
				if ($scope.field.slots.map(function (e) {
					return (new Date(e.date).getTime());
				}).indexOf($scope.newTimeSlot.date._d.getTime()) !== -1) {
					return (false);
				}
				return (true);
			}
			return (false);
		};

		$scope.addTimeSlot = function () {
			if ($scope.checkNewTimeSlot()) {
				$scope.field.slots.push({
					date: new Date($scope.newTimeSlot.date),
					taken: false,
					takenBy: null
				});
			}
		};

		$scope.removeSlot = function (slot) {
			$scope.field.slots.splice($scope.field.slots.indexOf(slot), 1);
		};

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
			//unpopulate user slots
			angular.forEach($scope.field.slots, function (slot) {
				slot.takenBy = (slot.takenBy) ? slot.takenBy._id : null;
			});
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

		$scope.selectCorr = function (login) {
			if (!login || $scope.selectedCorr === login) {
				$scope.selectedCorr = null;
				return;
			}
			$scope.selectedCorr = login;
		};

		$scope.deleteCorr = function (corr) {
			$scope.field.corrections.splice($scope.field.corrections.indexOf(corr), 1);
		};

		$scope.preventDefault = function ($event) {
			$event.stopPropagation();
		};

	});
