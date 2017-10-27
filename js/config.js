angular
	.module('myGenerator')
	.config(['$compileProvider',
		function ($compileProvider) {
			$compileProvider.aHrefSanitizationWhitelist(/base64/);
			// Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
		}
	])
	.config(['$routeProvider',
		function ($routeProvider) {
			$routeProvider
				.when('/css', {
					templateUrl: 'views/css.html'
				})
				.when('/svg', {
					templateUrl: 'views/svg.html'
				})
				.when('/apng', {
					templateUrl: 'views/apng.html'
				})
				.when('/webp', {
					templateUrl: 'views/webp.html'
				})
				.otherwise({
					redirectTo: '/css'
				});
		}]);