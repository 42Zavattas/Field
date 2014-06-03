'use strict';

angular.module('fieldApp')
	.controller('FieldCtrl', function ($scope, data, $http, $location, $timeout, $resource) {

		var original = angular.copy(data);

		$scope.logins = $resource('/api/logins').query();

		$scope.user = null;

		$scope.field = data;
		$scope.saveField = $scope.field;
		$scope.addingLogin = false;
		$scope.addingTimeSlot = false;
		$scope.newLogin = '';
		$scope.selectedCorr = null;
		$scope.errorMessage = null;
		$scope.validateLogin = null;
		$scope.validateScore = 0;

		$scope.newTimeSlot = { date: null };

		/*
		 ** Adds / Updates
		 */
		$scope.addLogin = function (login, reset) {
			if (login && $scope.checkLogin(login)) {
				var newLogin = {
					target    : null,
					targetName: login,
					mailed    : false,
					mailedOn  : null
				};
				$http.put('/api/fields/' + $scope.field._id, { addLogin: newLogin }).then(function (res) {
					$scope.field.corrections.push(newLogin);
					if (reset) {
						$scope.newLogin = '';
					}
				}, function (err) {
					console.log(err);
				});
			}
		};

		$scope.loadSync = function () {
			angular.forEach($scope.user.sync.logins, function (target) {
				if (target && $scope.checkLogin(target)) {
					$scope.addLogin(target, false);
				}
			});
			$scope.updateField();
		};

		$scope.addTimeSlot = function () {
			if ($scope.checkNewTimeSlot()) {
				var newSlot = {
					date   : new Date($scope.newTimeSlot.date),
					taken  : false,
					takenBy: null,
					done   : false
				};
				$http.put('/api/fields/' + $scope.field._id, { addSlot: newSlot }).then(function (res) {
					$scope.field.slots.push(newSlot);
				}, function (err) {
					console.log(err);
				});
			}
		};

		$scope.updateName = function () {
			if ($scope.field.name && $scope.field.name.length > 0) {
				$http.put('/api/fields/' + $scope.field._id, { name: $scope.field.name }).then(function () {
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

		$scope.removeSlot = function ($event, slot) {
			$event.stopPropagation();
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
			if (!$scope.checkEnoughtTimes()) {
				$scope.errorMessage = 'Not enought free time slots.';
				return;
			}
			$http.post('/api/fields/' + $scope.field._id, { target: 'all' }).then(function (res) {
				$scope.field.corrections.map(function(e) {
					e.mailed = true;
					e.mailedOn = new Date();
				});
			}, function (err) {
				console.log(err);
			});
		};

		$scope.sendSpecific = function (corr) {
			if (!$scope.checkEnoughtTimes()) {
				$scope.errorMessage = 'Not enought free time slots.';
				return;
			}
			$http.post('/api/fields/' + $scope.field._id, { target: corr.targetName }).then(function (res) {
				corr.mailed = true;
				corr.mailedOn = new Date();
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

		$scope.checkEnoughtTimes = function () {
			if ($scope.field.slots.length === 0) {
				return (false);
			}
			angular.forEach($scope.field.slots, function(slot) {
				if (!slot.taken) {
					return (true);
				}
			});
			return (true);
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

		/*
		** Score
		*/
		$scope.validate = function (login) {
			if ($scope.validateLogin === login) {
				return $scope.validateLogin = null;
			}
			$scope.validateLogin = login;
		};

		$scope.updateScore = function (rate) {
			$scope.validateScore = rate;
		};

		$scope.saveScore = function (corr) {
			var newNote = {
				user: corr.targetName,
				note: $scope.validateScore
			};
			$http.put('/api/fields/' + $scope.field._id, { validate: newNote }).then(function(res) {
				$scope.validateScore = 0;
				$scope.validateLogin = null;
				corr.done = true;
				$scope.field.slots[$scope.field.slots.map(function(e){
					return e.takenBy;
				}).indexOf(corr.targetName)].done = true;
			}, function(err) {
				console.log(err);
			});
		};

		/*
		 ** Demo
		 */
		$http.get('/api/users/me').then(function (res) {
			$scope.user = res.data;
			if ($scope.user.demo) {
				$scope.field = {
					'slots'      : [
						{
							'date': '2014-06-02T19:00:00.000Z', 'taken': true, 'takenBy': 'bgronon', 'done': false
						},
						{
							'date': '2014-06-02T19:15:00.000Z', 'taken': false, 'takenBy': null, 'done': false
						}
					],
					'corrections': [
						{
							'target'    : null,
							'targetName': 'bgronon',
							'mailed'    : true,
							'mailedOn'  : '2014-06-02T18:00:00.000Z',
							'dueDate'   : '2014-06-02T19:00:00.000Z'
						},
						{
							'target'    : null,
							'targetName': 'mpillet',
							'mailed'    : false,
							'mailedOn'  : null,
							'dueDate'   : null
						}
					]
				}
				$scope.selectedCorr = 'bgronon';
				$timeout(function () {
					$scope.showIntro();
				});
				$http.put('/api/users/me', { noDemo: true });
			}
		}, function (err) {
			console.log(err);
		});

		$scope.introOptions = {
			steps          : [
				{
					element : '.demo1',
					intro   : 'Change your project name',
					position: 'bottom'
				},
				{
					element : '.demo2',
					intro   : 'Add some time slots,',
					position: 'right'
				},
				{
					element : '.slots',
					intro   : 'That will appear here with some indicators',
					position: 'top'
				},
				{
					element : '.demo3',
					intro   : 'Some logins of your correctors manually',
					position: 'right'
				},
				{
					element : '.demo4',
					intro   : 'Or automatically if you have TrackMyPeers',
					position: 'left'
				},
				{
					element : '.demo5',
					intro   : 'Send emails to all the users that was still not mailed',
					position: 'top'
				},
				{
					element : '.demo6',
					intro   : 'This guy just accepted a booking !',
					position: 'left'
				},
				{
					element : '.demo7',
					intro   : 'Here some info about him',
					position: 'top'
				},
				{
					element : '.demo8',
					intro   : 'And you can see the highlight book time of the selected corrector here',
					position: 'bottom'
				},
				{
					element : '.help-small',
					intro   : 'You\'re all done ! Please submit an issue on the GitHub or send us a message if there is any problem :)',
					position: 'top'
				}
			],
			showStepNumbers: false,
			showBullets    : false,
			skipLabel      : 'Exit',
			nextLabel      : '<i class="icon-next"><i>',
			prevLabel      : '<i class="icon-previous">'
		};

		$scope.introChange = function (data) {
			console.log(data);
		};

		$scope.removeIntro = function () {
			$timeout(function () {
				$scope.field = $scope.saveField;
				$scope.selectedCorr = null;
			});
		}

	})
;
