/**
 * Created by max on 06.02.2017.
 */
angular
	.module('myGenerator')
	.factory('storage', function () {
		var storage = {
			data: {},
			reset: function () {
				// once
				if (!this.data.widthFrame) {
					this.data.widthFrame = 0;
					this.data.heightFrame = 0;
					this.data.time = '2s';
					this.data.infoSize = '';
				}

				this.data.images = [];
				this.data.filteredImages = [];
				this.data.countFrames = 0;
				this.data.countSkip = 1;
				this.data.dataURL = '';
				this.data.zoom = 0.8;

				return storage.data;
			}
		};

		storage.reset();

		return {
			init: function () {
				return storage.data;
			},
			reset: function () {
				return storage.reset();
			}
		};
	});