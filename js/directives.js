/**
 * Created by max on 31.01.2017.
 */
angular
	.module('myGenerator')
	.directive('ngDraggable', ['$document', function ($document) {
		return {
			link: function (scope, element, attr) {
				var startX = 0, startY = 0, x = 0, y = 0;

				element.css({
					position: 'relative',
					bottom: 0,
					right: 0,
					cursor: 'pointer'
				});

				element.on('mousedown', function (event) {
					// Prevent default dragging of selected content
					event.preventDefault();
					startX = event.pageX - x;
					startY = event.pageY - y;
					$document.on('mousemove', mousemove);
					$document.on('mouseup', mouseup);
				});

				function mousemove(event) {
					y = event.pageY - startY;
					x = event.pageX - startX;
					element.css({
						top: y + 'px',
						left: x + 'px'
					});
				}

				function mouseup() {
					$document.off('mousemove', mousemove);
					$document.off('mouseup', mouseup);
				}
			}
		};
	}])
	.directive('resizer', ['$document', '$parse', function ($document, $parse) {
		var doc = document;

		return function ($scope, $element, $attrs) {
			var fn = $parse($attrs['resizeEnd']);

			$element.on('mousedown', function (event) {
				event.preventDefault();

				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});

			function mousemove(event) {
				var resizerLeft = doc.querySelector($attrs.resizerLeft);
				var resizerRight = doc.querySelector($attrs.resizerRight);
				var resizerBottom = doc.querySelector($attrs.resizerBottom);
				var resizerTop = doc.querySelector($attrs.resizerTop);

				if ($attrs.resizer === 'vertical') {
					// Handle vertical resizer
					var x = event.pageX - resizerLeft.offsetLeft;

					if ($attrs.resizerMax && x > $attrs.resizerMax) {
						x = parseInt($attrs.resizerMax);
					}

					$element.css({
						left: x + 'px'
					});

					resizerLeft && (resizerLeft.style.width = x + 'px');
					resizerRight && (resizerRight.style.left = (x + parseInt($attrs.resizerWidth)) + 'px');

				} else {
					// Handle horizontal resizer
					var y = window.innerHeight - event.pageY;

					$element.css({
						bottom: y + 'px'
					});

					resizerTop && (resizerTop.style.bottom = (y + parseInt($attrs.resizerHeight)) + 'px');
					resizerBottom && (resizerBottom.style.height = y + 'px');

				}

				var id = $attrs.resizerLeft;
				event.width = doc.querySelector(id).offsetWidth;
				event.height = doc.querySelector(id).offsetHeight;
				var callback = function () {
					fn($scope, {$event: event});
				};
				event.stopPropagation();
				event.preventDefault();
				$scope.$apply(callback);
			}

			function mouseup() {
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
			}
		};
	}])
	.directive('ngDropzone', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			compile: function ($element, attr) {
				var fn = $parse(attr['ngDropzone']);
				return function (scope, element) {
					element.on('dragover', function (e) {
						e.stopPropagation();
						e.preventDefault();
						e.dataTransfer.dropEffect = 'copy';
					});
					element.on('drop', function (e) {
						var callback = function () {
							fn(scope, {$event: e});
						};
						e.stopPropagation();
						e.preventDefault();
						scope.$apply(callback);
					});
				}
			}
		}
	}]);
