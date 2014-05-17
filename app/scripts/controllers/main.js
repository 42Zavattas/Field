'use strict';

angular.module('fieldApp')
	.controller('MainCtrl', function ($scope, $resource, $location, localStorageService) {

		var Field = $resource('/api/fields/:id', { id: '@id' });

		$scope.correctors = localStorageService.get('field');

		console.log($scope.correctors);

		$scope.fields = Field.query();

		$scope.createAndLaunch = function () {
			var field = new Field();
			field.$save().then(function (field){
				$location.path('/field/' + field._id);
			});
		};

	});
