'use strict';

angular.module('fieldApp')
	.controller('FieldCtrl', function ($scope, data, $http, $location, $timeout, $resource) {

		var original = angular.copy(data);

		$scope.logins = $resource('/api/logins').query();

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
			var tmp = angular.copy($scope.field);
			angular.forEach($scope.field.slots, function (slot) {
				slot.takenBy = (slot.takenBy) ? slot.takenBy._id : null;
			});
			$http.put('/api/fields/' + $scope.field._id, $scope.field).then(function () {
				$scope.field = tmp;
				original = angular.copy(tmp);
			}, function (err) {
				console.log(err);
			});
		};

		/*
		** Adds
		*/
		$scope.addLogin = function () {
			if ($scope.newLogin && $scope.checkLogin($scope.newLogin)) {
				var newLogin = {
					target: null,
					targetName: $scope.newLogin,
					mailed: false,
					mailedOn: null
				};
				$http.put('/api/fields/' + $scope.field._id, { addLogin: newLogin }).then(function (res) {
					$scope.field.corrections.push(newLogin);
					$scope.newLogin = '';
				}, function (err) {
					console.log(err);
				});
			}
		};

		$scope.addTimeSlot = function () {
			if ($scope.checkNewTimeSlot()) {
				var newSlot = {
					date: new Date($scope.newTimeSlot.date),
					taken: false,
					takenBy: null,
					done: false
				};
				$http.put('/api/fields/' + $scope.field._id, { addSlot: newSlot }).then(function (res) {
					$scope.field.slots.push(newSlot);
				}, function (err) {
					console.log(err);
				});
			}
		};

		/*
		** Deletes
		*/
		$scope.deleteCorr = function (corr) {
			if (corr.dueDate) {
				return;
			}
			$http.put('/api/fields/' + $scope.field._id, { removeLogin: corr.targetName }).then(function (res) {
				$scope.field.corrections.splice($scope.field.corrections.indexOf(corr), 1);
			}, function (err) {
				console.log(err);
			});
		};

		$scope.removeSlot = function (slot) {
			if (slot.taken) {
				return;
			}
			$http.put('/api/fields/' + $scope.field._id, { removeSlot: slot.date }).then(function (res) {
				$scope.field.slots.splice($scope.field.slots.indexOf(slot), 1);
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

		/*
		** Mails
		*/
		$scope.sendAll = function () {
			$scope.updateField();
			if ($scope.field.slots.length === 0) {
				return;
			}
			$http.post('/api/fields/' + $scope.field._id, { target: 'all' }).then(function (res) {
				if (res.data) {
					$scope.field = res.data;
					original = angular.copy(res.data);
				}
			}, function (err) {
				console.log(err);
			});
		};

		$scope.sendSpecific = function (corr) {
			$scope.updateField();
			if ($scope.field.slots.length === 0) {
				return;
			}
			$http.post('/api/fields/' + $scope.field._id, { target : corr.targetName }).then(function (res) {
				if (res.data) {
					$scope.field = res.data;
					original = angular.copy(res.data);
				}
			}, function (err) {
				console.log(err);
			});
		};

		/*
		** Checks
		*/
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

		$scope.checkLogin = function (login) {
			if (login && login !== $scope.user.login && $scope.logins.map(function (e) {
				return e.login;
			}).indexOf(login) !== -1 && $scope.field.corrections.map(function (e) {
				return e.targetName;
			}).indexOf(login) === -1) {
				return (true);
			}
			return (false);
		};

		/*
		** Toggles menus
		*/
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

		$scope.selectCorr = function (login) {
			if (!login || $scope.selectedCorr === login) {
				$scope.selectedCorr = null;
				return;
			}
			$scope.selectedCorr = login;
		};

		/*
		** Utils
		*/
		$scope.preventDefault = function ($event) {
			$event.stopPropagation();
		};

		$scope.equal = function () {
			return angular.equals($scope.field, original);
		};

	});
