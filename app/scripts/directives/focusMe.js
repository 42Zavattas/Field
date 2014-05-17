'use strict';

angular.module('fieldApp')
	.directive('focusMe', function($timeout, $parse) {
		return {
			link: function(scope, element, attrs) {
				var model = $parse(attrs.focusMe);
				scope.$watch(model, function(value) {
					console.log('value=',value);
					if(value === true) {
						$timeout(function() {
							element[0].focus();
						});
					}
				});
				element.bind('blur', function() {
					console.log('blur');
					scope.$apply(model.assign(scope, false));
				});
			}
		};
	});