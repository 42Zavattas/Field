'use strict';

angular.module('fieldApp')
  .controller('ProcessCtrl', function ($scope, $http) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });
	$http.post('/api/fields', {
		corrections : [],
		fields: [],
		created : new Date(),
		modified : new Date()
	}).then(function (res) {
		console.log(res);
	}, function (err) {
		console.log(err);
	});
  });
