'use strict';

angular.module('fieldApp')
	.controller('MainCtrl', function ($scope, $resource, $location, $http) {

		var Field = $resource('/api/fields/:id', { id: '@id' });

		$scope.fields = Field.query();
		$scope.activeCorrectors = true;

		$scope.createAndLaunch = function () {
			var field = new Field();
			field.$save().then(function (field){
				$location.path('/field/' + field._id);
			});
		};

		$http.get('/api/fields', {params:{next: true}}).then(function(res){
			console.log(res.data);
			$scope.bookings = res.data;
		});

		$scope.toggleMenu = function () {
			$scope.activeCorrectors = !$scope.activeCorrectors;
		};

	});
