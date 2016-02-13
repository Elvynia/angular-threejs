angular.module('angularThree').factory('$scene', function() {
	var scene = {
		threeScene: null,
		dataSet: {},
		globalUpdates: [],
	};
	return {
		get: function() {
			return scene.threeScene;
		},
		set: function(newScene) {
			scene.threeScene = newScene;
		},
		addObject: function(object) {
			scene.threeScene.add(object);
		},
		addData: function(data) {
			if (!data.name) {
				console.error('Cannot add Data to the scene withtout a name.')
			} else {
				if (data.objects) {
					for (var i = 0; i < data.objects.length; ++i) {
						if (data.objects[i].active) {
							scene.threeScene.add(data.objects[i].mesh);
						}
					}
				}
				scene.dataSet[data.name] = data;
			}
		},
		addGlobalUpdate: function(update) {
			scene.globalUpdates.push(update);
		},
		update: function() {
			for (var i = 0; i < scene.globalUpdates.length; ++i) {
				scene.globalUpdates[i]();
			}
			for (var name in scene.dataSet) {
				var update = scene.dataSet[name].updates;
				for (var i = 0; i < update.length; ++i) {
					if (update[i].active) {
						update[i].callback(scene.dataSet[name].objects);
					}
				}
			}
		}
	};
});

angular.module('angularThree').factory('$three', function($timeout, $scene) {
	var renderer, canvas, camera;
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
				return $scene.get();
			} else {
				$scene.set(value);
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
						renderer.render($scene.get(), camera);
						$scene.update();
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
