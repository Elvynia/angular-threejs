angular.module('angularThree').factory('$three', function($timeout) {
	var renderer, canvas, scene, camera;
	var updateCallbacks = [];
	return {
		renderer: function(value) {
			if (!value) {
				return renderer;
			} else {
				renderer = value;
			}
		},
		canvas: function(value) {
			if (!value) {
				return canvas;
			} else {
				canvas = value;
			}
		},
		scene: function(value) {
			if (!value) {
				return scene;
			} else {
				scene = value;
			}
		},
		camera: function(value) {
			if (!value) {
				return camera;
			} else {
				camera = value;
			}
		},
		webgl: function(value) {
			if (!value) {
				return webgl;
			} else {
				webgl = value;
			}
		},
		initialize: function(initCallback) {
			$timeout(function() {
				if (initCallback) {
					initCallback();
				}
				if (canvas) {
					canvas.append(renderer.domElement);
					var render = function() {
						requestAnimationFrame(render);
						renderer.render(scene, camera);
						for (var i = 0; i < updateCallbacks.length; ++i) {
							updateCallbacks[i]();
						}
					};
					render();
				} else {
					console.error('No HTML container to render into. Please provide container id through three-canvas directive.');
				}
			});
		},
		dispose: function(disposeCallback) {
			if (disposeCallback) {
				disposeCallback();
			}
			// Dispose scene objects, materials and textures.
			console.log('Disposing Scene');
		},
		pushUpdate: function(callback) {
			updateCallbacks.push(callback);
		}
	};
});