(function() {
	var app = angular.module('angularThreeService', []);
	
	app.factory('$scene', function() {
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
					if (data.objects && data.active) {
						for (var i = 0; i < data.objects.length; ++i) {
							scene.threeScene.add(data.objects[i].mesh);
						}
					}
					scene.dataSet[data.name] = data;
				}
			},
			addGlobalUpdate: function(update) {
				scene.globalUpdates.push(update);
			},
			dispose: function() {
				for (var name in scene.dataSet) {
					var objects = scene.dataSet[name].objects;
					for (var i = 0; i < objects.length; ++i) {
						var object = objects[i];
						if (object.active && object.mesh) {
							var mesh = object.mesh;
							console.debug('Removing object from scene.');
							scene.threeScene.remove(object.mesh);
							if (mesh.geometry) {
								console.debug('Disposing Geometry object.');
								mesh.geometry.dispose();
							}
							if (mesh.material) {
								if (mesh.material.map) {
									console.debug('Disposing Material Map object.');
									mesh.material.map.dispose();
								}
								console.debug('Disposing Material object.');
								mesh.material.dispose();
							}
						}
					}
				}
			},
			update: function() {
				for (var i = 0; i < scene.globalUpdates.length; ++i) {
					scene.globalUpdates[i]();
				}
				for (var name in scene.dataSet) {
					var updates = scene.dataSet[name].updates;
					if (updates) {
						for (var i = 0; i < updates.length; ++i) {
							if (updates[i].active) {
								updates[i].callback(scene.dataSet[name].objects);
							}
						}
					}
				}
			}
		};
	});

	app.factory('$three', function($timeout, $scene) {
		var renderer, canvas, camera, id;
		return {
			getId: function() {
				return id;
			},
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
							id = requestAnimationFrame(render);
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
				console.debug('Disposing Scene');
				$scene.dispose();
				console.log('Stopping AnimationFrame with ID:' + id);
				cancelAnimationFrame(id);
			},
			pushUpdate: function(callback) {
				updateCallbacks.push(callback);
			}
		};
	});
	
	app.factory('$texture', function() {
		var loader = new THREE.TextureLoader();
		var serviceObj = {
			load: function(url, material, update) {
				loader.load(url, function(data) {
					//data.needsUpdate = true;
					material.map = data;
					material.needsUpdate = update != undefined ? update : true;
				});
			},
		};
		return serviceObj;
	});
})();