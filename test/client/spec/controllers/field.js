'use strict';

describe('Controller: FieldCtrl', function () {

	// load the controller's module
	beforeEach(module('fieldApp'));

	var FieldCtrl,
		scope,
		$httpBackend,
		data;

	// Initialize the controller and a mock scope
	beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
		$httpBackend = _$httpBackend_;
		/*$httpBackend.expectGET('/api/fields/*')
			.respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);*/
		scope = $rootScope.$new();
		data = {
			name : 'project name'
		};
		FieldCtrl = $controller('FieldCtrl', {
			$scope: scope,
			data: data
		});
	}));

	it('should load a field', function () {
		expect(data.name).toBe('project name');
	});
});
