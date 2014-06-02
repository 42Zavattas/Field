'use strict';

angular.module('fieldApp', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute',
	'ngAnimate',
	'ui.keypress',
	'ngDatetime',
	'angular-intro',
	'ui.bootstrap'
])
	.config(function ($routeProvider, $locationProvider, $httpProvider) {
		$routeProvider
			.when('/', {
				templateUrl : 'partials/main',
				controller  : 'MainCtrl',
				authenticate: true
			})
			.when('/login', {
				templateUrl: 'partials/login',
				controller : 'LoginCtrl'
			})
			.when('/signup', {
				templateUrl: 'partials/signup',
				controller : 'SignupCtrl'
			})
			.when('/settings', {
				templateUrl : 'partials/settings',
				controller  : 'SettingsCtrl',
				authenticate: true
			})
			.when('/process/:data', {
				templateUrl : 'partials/process',
				controller  : 'ProcessCtrl',
				authenticate: false
			})
			.when('/field/:id', {
				templateUrl: 'partials/field',
				controller : 'FieldCtrl',
				resolve    : {
					data: function ($resource, $route) {
						var Field = $resource('/api/fields/:id', { id: '@id' });
						return Field.get({ id: $route.current.params.id }).$promise;
					}
				},
				authenticate: true
			})
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.html5Mode(true);

		// Intercept 401s and redirect you to login
		$httpProvider.interceptors.push(['$q', '$location', function ($q, $location) {
			return {
				'responseError': function (response) {
					if (response.status === 401) {
						$location.path('/login');
						return $q.reject(response);
					}
					else {
						return $q.reject(response);
					}
				}
			};
		}]);

	})
	.run(function ($rootScope, $location, Auth) {

		// Redirect to login if route requires auth and you're not logged in
		$rootScope.$on('$routeChangeStart', function (event, next) {

			if (next.authenticate && !Auth.isLoggedIn()) {
				$location.path('/login');
			}
		});

		$rootScope.logout = function () {
			Auth.logout()
			.then(function () {
				$location.path('/login');
			});
		};

	});
