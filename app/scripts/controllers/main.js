'use strict';

angular.module('fieldApp')
	.controller('MainCtrl', function ($scope, $resource, $location, $http) {

		var Field = $resource('/api/fields/:id', { id: '@id' });

		$scope.fields = Field.query();
		$scope.correctorMode = true;
		$scope.nexts = {};

		$scope.createAndLaunch = function () {
			var field = new Field();
			field.$save().then(function (field){
				$location.path('/field/' + field._id);
			});
		};

		$http.get('/api/fields', {params:{next: true}}).then(function(res){
			$scope.nexts.corrector = res.data.corrector;
			$scope.nexts.corrected = res.data.corrected;
			console.log(res.data);
		});

		$scope.toggleMenu = function () {
			$scope.correctorMode = !$scope.correctorMode;
		};

	});
