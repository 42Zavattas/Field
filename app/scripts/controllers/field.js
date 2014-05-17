'use strict';

angular.module('fieldApp')
	.controller('FieldCtrl', function ($scope, data, $http, $location) {

		var original = angular.copy(data);

		$scope.field = data;

		$scope.updateField = function () {
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

	});
