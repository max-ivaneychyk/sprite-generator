/**
 * Created by max on 31.01.2017.
 */
angular
	.module('myGenerator')
	.filter('skip', function () {
		return function (collection, criterion) {
			var tmp = [];
			collection.forEach(function (el, index) {
				if ((index % criterion.num) === 0) {
					tmp.push(el);
				}
			});
			return tmp;
		};
	})