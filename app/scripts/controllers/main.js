'use strict';

angular.module('fieldApp')
	.controller('MainCtrl', function ($scope, $resource, $location) {

		var Field = $resource('/api/fields/:id', { id: '@id' });

		$scope.fields = Field.query();

		$scope.createAndLaunch = function () {
			var field = new Field();
			field.$save().then(function (field){
				$location.path('/field/' + field._id);
			});
		};

	});
