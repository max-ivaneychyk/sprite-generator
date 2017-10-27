/**
 * Created by user on 15.02.2017.
 */
angular
	.module('myGenerator')
	.controller('FilterCtrl', ['$scope', '$filter', 'storage', '$q',
		function ($scope, $filter, $storage, $q) {
			var storage = this.storage = $storage.init();
			// doc url
			this.includeUrl = {
				doc: 'include/help.html',
				dropZone: 'include/drop.html',
				header: 'include/header.html',
				settings: 'include/settings.html',
				collection: 'include/collection.html',
				modelSprite: 'include/model-sprite.html'
			}

			function getImageData(file) {
				return new Promise(function (resolve, reject) {
					let reader = new FileReader();
					reader.onload = function () {
						resolve(reader.result);
					}
					reader.onerror = function (e) {
						reject(e)
					}
					reader.readAsDataURL(file);
				});
			};
			
			function createImage(src) {
				return new Promise(function (resolve, reject) {
					let image = new Image();
					image.onload = () => {
						resolve({
							src: src,
							node: image,
							hidden: false,
							style: {}
						})
					}
					image.onerror = function (e) {
						reject(e)
					}
					image.src = src;
				})
			};
			// Load all images
			this.addImage = function (e) {
				var files = Array.prototype.slice.call(e.dataTransfer.files);
				Promise.all( files.map(getImageData))
					.catch(function (e) {
						console.log(e);
					})
					.then(dataUrlArray => {
						Promise.all( dataUrlArray.map(createImage))
							.catch(function (e) {
								console.log(e);
							})
							.then(imagesArray => {
								let image = imagesArray[0].node;
								storage.images = storage.images.concat(imagesArray);
								storage.widthFrame = image.width;
								storage.heightFrame = image.height;
								this.skip(this.storage.images);
								$scope.$apply();
							});
					});
			};

			this.skip = function (images) {
				images = images || storage.images;
				storage.filteredImages = $filter('skip')(images, {num: storage.countSkip});
				storage.countFrames = storage.filteredImages.length;
			};

			// remove one image from Collection
			this.remove = function (imageD) {
				storage.images.forEach(function (imgData, i, arr) {
					if (imageD === imgData) {
						arr.splice(i, 1);
					}
				}, this);
				this.skip(storage.images);
			};

			this.reset = function () {
				storage = this.storage = $storage.reset();
			};

		}])
	.controller('CssSpriteCtrl', ['$scope', '$filter', 'storage',
		function ($scope, $filter, storage) {
			var MAX_HEIGHT_CANVAS = 3500;
			var MAX_WIDTH_CANVAS = MAX_HEIGHT_CANVAS;

			var storage = this.storage = storage.init();

			this.style = document.createElement('style');
			document.head.appendChild(this.style);

			this.exampleSpriteCss = {
				width: '0px',
				height: '0px',
				cursor: 'move'
			};

			function detectMatrixSprite() {
				var iconsCollection = document.getElementById('sprite-model').querySelectorAll('.icon');
				var offsetTopCONST = iconsCollection[0].offsetTop;
				var matrix = {
					x: 0,
					y: 0
				};

				for (var index = 0; index < iconsCollection.length; index++) {
					var elem = iconsCollection[index];
					if (elem.offsetTop === offsetTopCONST) {
						matrix.x++;
					} else {
						break;
					}
				}

				matrix.y = storage.countFrames / matrix.x;

				if (parseInt(matrix.y) * matrix.x < storage.countFrames) {
					matrix.y++;
				}
				;

				matrix.y = parseInt(matrix.y, 10);

				return matrix;
			}

			this.splitImages = function (images) {
				var canvas = document.createElement('canvas'),
					ctx = canvas.getContext('2d'),
					visibleImages = images, // save visible images
					options = {};

				if (!images[0]) {
					throw 'Коллекция картинок пустая!';
				}

				// conf
				options.width = this.storage.widthFrame;
				options.height = this.storage.heightFrame;
				this.storage.countFrames = visibleImages.length;

				// canvas conf
				var matrix = detectMatrixSprite();

				console.log('Matrix sprite', matrix);

				canvas.width = matrix.x * options.width;
				canvas.height = matrix.y * options.height;

				if (canvas.width > MAX_WIDTH_CANVAS || canvas.height > MAX_HEIGHT_CANVAS) {
					console.log('Превышено допустимую ширину или высоту холста !');
				}

				// генерация спрайта шкафа
				for (var row = 0; row < matrix.x; row++) {
					for (var cell = 0; cell < matrix.y; cell++) {
						var img = visibleImages[row * matrix.y + cell];
						// дублируем последний кадр если есть дырка в спрайте
						if (!img && storage.autoFill) {
							img = visibleImages[visibleImages.length - 1];
						} else if (!img) {
							break;
						}
						ctx.drawImage(
							img.node,
							options.width * row,
							options.height * cell,
							options.width,
							options.height
						);
					}
				}

				this.storage.dataURL = canvas.toDataURL();
				this.storage.infoSize = canvas.width + 'x' + canvas.height
				// css conf
				this.exampleSpriteCss.width = canvas.width + 'px';
				this.exampleSpriteCss.height = 'auto';
			};

		}])
	.controller('SvgCtrl', ['$scope', '$filter', 'storage',
		function ($scope, $filter, storage) {

			/*	this.storage = storage.init();

			 this.exampleSpriteSvg = {
			 width: '0px',
			 height: '0px',
			 overflow: 'hidden',
			 zIndex: 9999,
			 cursor: 'move'
			 };

			 var templates = {
			 svgHeader: function (width, height) {
			 return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:A="http://www.w3.org/1999/xlink"	width="' + width + '"	height="' + height + '">';
			 },
			 svgImage: function (id, imagesDataBase64) {
			 return '<image id="' + id + '" height="100%" A:href="' + imagesDataBase64 + '"/>'
			 },
			 svgTagSet: function (href, id, speed, begin) {
			 return '<set A:href="#' + href + '" id="A' + id + '" attributeName="width" to="100%" dur="' + speed + '" begin="' + begin + '"/>';
			 },
			 svgFooter: function () {
			 return '</svg>'
			 }
			 }


			 this.splitImages = function (images) {
			 var canvas = document.createElement('canvas'),
			 ctx = canvas.getContext('2d'),
			 skipNum = this.storage.countSkip,
			 visibleImages = [], // save visible images
			 options = {};

			 if (!images[0]) {
			 throw 'Коллекция картинок пустая!';
			 }

			 images = $filter("skip")(images, {num: skipNum});
			 images.forEach(function (img) {
			 if (img.hidden === false) {
			 visibleImages.push(img);
			 }
			 });
			 // conf
			 options.width = visibleImages[0].node.width;
			 options.height = visibleImages[0].node.height;
			 this.storage.countFrames = visibleImages.length;
			 // canvas
			 canvas.width = this.storage.countFrames * options.width;
			 canvas.height = options.height;
			 visibleImages.forEach(function (img, num) {
			 this.drawImage(img.node, options.width * num, 0);
			 }, ctx);

			 this.storage.dataURL = canvas.toDataURL();
			 // css conf
			 this.exampleSpriteCss.width = options.width + 'px';
			 this.exampleSpriteCss.height = options.height + 'px';

			 saveSpriteAudio(images);

			 };

			 function saveSpriteAudio(images) {
			 debugger
			 var
			 speed = (1000 / Number(frameRate.value)).toFixed(2),
			 setSvg = [],
			 imageSvg = [],
			 invertKey = 0
			 ;

			 // First image
			 imageSvg.push(templates.svgImage(0, imagesDataBase64[0]));
			 setSvg.push(templates.svgTagSet(0, 0, speed+'ms', onceFlag ? '' : ('A' + (imagesDataBase64.length - 1) * (invertFlag ? 2 : 1) + '.end; ') + '0s'));

			 for (var i = 1, l = images.length - 1; i < l; i++) {
			 imageSvg.push(templates.svgImage(i, images[i]));
			 setSvg.push(templates.svgTagSet(i, i, speed+'ms', 'A'+(i - 1)+'.end'));
			 }

			 imageSvg.push(templates.svgImage(i, imagesDataBase64[i]));
			 setSvg.push(templates.svgTagSet(i, i, `${speed}ms`, `A${i - 1}.end`));

			 /!*				if (invertFlag) {//если инверсия включена
			 for (invertKey = l - 1, i++; invertKey != 0; i++) {
			 setSvg.push(templates.svgTagSet(invertKey--, i, `${speed}ms`, `A${i - 1}.end`));
			 }
			 setSvg.push(templates.svgTagSet(invertKey, i, `${speed}ms`, `A${i - 1}.end`));
			 }*!/


			 var enter = '\n';//перенос строки

			 var result =
			 templates.svgHeader(widthField.value || options.width, heightField.value || options.height) +
			 enter +
			 imageSvg.join(enter) +
			 enter +
			 setSvg.join(enter) +
			 enter +
			 templates.svgFooter();

			 var blob = new Blob([result], {'type': "image/svg+xml"});
			 var uri = w.URL.createObjectURL(blob);
			 }*/
		}]);