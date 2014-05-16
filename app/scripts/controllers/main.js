'use strict';

angular.module('fieldApp')
	.controller('MainCtrl', function ($scope, $resource) {

		var Field = $resource('/api/fields/:id', { id: '@id' });

		$scope.fields = Field.query();

	});
