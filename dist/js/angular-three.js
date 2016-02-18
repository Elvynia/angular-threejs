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
})();;(function() {
	var app = angular.module('angularThreeController', ['angularThreeService']);
	
	app.controller('RendererController', function($three, hasWebGL) {
		var vm = this;
		vm.bindRenderer = function(type) {
			var webglAvailable = hasWebGL();
			var autoDetect = !type || type === 'autodetect';
			if (type === 'webgl' || (autoDetect && webglAvailable)) {
				var renderer = new THREE.WebGLRenderer();
				$three.webgl = true;
			} else if (type === 'canvas' || autoDetect) {
				var renderer = new THREE.CanvasRenderer();
				$three.webgl = false;
			} else {
				console.error('Unknown renderer type "' + type + '".');
			}
			if (renderer) {
				$three.renderer(renderer);
				return renderer;
			}
		};
		vm.bindScene = function() {
			var scene = new THREE.Scene();
			$three.scene(scene);
			return scene;
		};
		vm.bindSize = function(object, size) {
			if (object && object.setSize) {
				if (angular.isArray(size)) {
					object.setSize(size[0], size[1]);
				} else {
					object.setSize(size.width, size.height);
				}
			} else {
				console.error('This object is null or doesn\'t support setSize method.');
			}
		};
	});

	app.controller('SceneController', function($three) {
		var vm = this;
		vm.bindCamera = function(type, params) {
			if (type === 'perspective') {
				if (params.length === 4) {
					var camera = new THREE.PerspectiveCamera(
						params[0],
						params[1],
						params[2],
						params[3]
					);
				} else {
					console.error('Missing parameters for constructor (Angle, Ratio, Near, Far).');
				}
			} else if (type === 'orthographic') {
				if (params.length === 6) {
					var camera = new THREE.OrthographicCamera(
						params[0],
						params[1],
						params[2],
						params[3],
						params[4],
						params[5]
					);
				} else {
					console.error('Missing parameters for constructor (left, right, top, bottom, Near, Far).');
				}
			} else {
				console.error('Unknown camera type "' + type + '".');
			}
			if (camera) {
				$three.camera(camera);
				$three.scene().add(camera);
				return camera;
			}
		};
		vm.bindPosition = function(object, position) {
			if (object && position) {
				object.position.x = position.x || 0;
				object.position.y = position.y || 0;
				object.position.z = position.z || 0;
			} else {
				console.error('Wrong arguments ['+object+', '+position+']');
			}
		};
		vm.bindLight = function(type, params) {
			if (type === 'point') {
				if (params.length === 1) {
					var light = new THREE.PointLight(params);
				} else {
					console.error('Missing parameters for constructor (Color).');
				}
			} else {
				console.error('Unknown light type "' + type + '".');
			}
			if (light) {
				$three.scene().add(light);
				return light;
			}
		};
	});
	
	app.controller('ObjectController', function($three) {
		var vm = this;
		vm.buildThree = function(name, params) {
			if (name) {
				if (params && params.length > 0) {
					console.debug('Building THREE.' + name + ' with params=' + params);
					var obj = Object.create(THREE[name].prototype);
					THREE[name].apply(obj, params);
					return obj;
				} else {
					console.debug('Building THREE.' + name + ' with params:' + JSON.stringify(params));
					return new THREE[name](params);
				}
			} else {
				console.error('Cannot instanciate THREE object with undefined name.');
			}
		};
	});
})();;(function() {
	var app = angular.module('angularThreeDirective', ['angularThreeController', 'angularThreeService']);
	
	app.directive('threeCanvas', function($three) {
		var directiveObj = {
			restrict: 'E',
			compile: function(element, attrs, transclude) {
				var prepostObj = {
					pre: function(scope, element, attrs, controller) {
						element.css('display', 'block');
						$three.canvas(element);
					}
				};
				return prepostObj;
			},
		};
		return directiveObj;
	});

	app.directive('threeRenderer', function($three) {
		var directiveObj = {
			restrict: 'E',
			controller: 'RendererController',
			compile: function(element, attrs, transclude) {
				var prepostObj = {
					pre: function(scope, element, attrs, controller) {
						controller.bindRenderer(attrs.type);
					}
				};
				return prepostObj;
			},
		};
		return directiveObj;
	});

	app.directive('canvas', function($three) {
		var directiveObj = {
			restrict: 'A',
			require: 'threeRenderer',
			compile: function(element, attrs, transclude) {
				var prepostObj = {
					pre: function(scope, element, attrs, controller) {
						var canvas = angular.element('#' + attrs.canvas);
						if (canvas) {
							$three.canvas(canvas);
						} else {
							console.error('Element with id ' + attrs.canvas + ' not found.');
						}
					}
				};
				return prepostObj;
			},
		};
		return directiveObj;
	});

	app.directive('threeScene', function($window, $three) {
		var directiveObj = {
			restrict: 'E',
			require: '^^threeRenderer',
			controller: 'SceneController',
			compile: function(element, attrs, transclude) {
				var prepostObj = {
					pre: function(scope, element, attrs, controller) {
						controller.bindScene();
					},
					post: function(scope, element, attrs, controller) {
						$window.addEventListener('beforeunload', function() {
							// Add dispose callback attribute with scope '&'.
							$three.dispose();
						});
					}
				};
				return prepostObj;
			},
		};
		return directiveObj;
	});

	app.directive('threeCamera', function($three) {
		var directiveObj = {
			restrict: 'E',
			require: '^^threeScene',
			compile: function(element, attrs, transclude) {
				var prepostObj = {
					pre: function(scope, element, attrs, controller) {
						var params = attrs.parameters ? angular.fromJson(attrs.parameters) : [];
						var camera = controller.bindCamera(attrs.type, params);
						element.attr('id', camera.id);
					}
				};
				return prepostObj;
			},
		};
		return directiveObj;
	});

	app.directive('threeLight', function($three) {
		var directiveObj = {
			restrict: 'E',
			require: '^^threeScene',
			link: function(scope, element, attrs, controller) {
				var parameters = attrs.parameters ? angular.fromJson(attrs.parameters) : [];
				var light = controller.bindLight(attrs.type, parameters);
				element.attr('id', light.id);
			},
		};
		return directiveObj;
	});
	
	app.directive('threeMesh', function($scene) {
		var directiveObj = {
			priority: 100,
			restrict: 'E',
			controller: 'ObjectController as ctrl',
			bindToController: {
				mesh: '=tdMesh',
			},
			link: function(scope, element, attrs, controller) {
				if (attrs.name && attrs.name.length > 0) {
					scope.name = attrs.name;
				} else {
					console.warn('Building data with name as mesh.id');
					scope.name = mesh.id;
				}
				if (controller.mesh) {
					scope.mesh = controller.mesh;
					$scene.addObject(scope.mesh);
				} else if (scope.geometry && scope.material) {
					scope.mesh = controller.buildThree('Mesh', [scope.geometry, scope.material]);
					var data = {
						active: true,
						name: scope.name,
						objects: [{
							mesh: scope.mesh,
							geometry: scope.geometry,
							material: scope.material,
						}],
					};
					$scene.addData(data);
				} else {
					console.error('Cannot create mesh without tdMesh attribute or sub directives.');
				}
			},
		};
		return directiveObj;
	});
	
	app.directive('meshPosition', function() {
		var directiveObj = {
			priority: 101,
			restrict: 'A',
			require: 'threeMesh',
			scope: {
				position: '=meshPosition',
			},
			link: function(scope, element, attrs, controller) {
				if (scope.$parent.mesh) {
					var mesh = scope.$parent.mesh;
					mesh.position.x = scope.position.x;
					mesh.position.y = scope.position.y;
					mesh.position.z = scope.position.z;
				} else {
					console.error('Cannot add position to undefined mesh.');
				}
			},
		};
		return directiveObj;
	});
	
	app.directive('threeGeometry', function() {
		var directiveObj = {
			restrict: 'E',
			require: '^^threeMesh',
			scope: {
				parameters: '=',
			},
			link: function(scope, element, attrs, controller) {
				scope.$parent.geometry = controller.buildThree(attrs.type, scope.parameters);
			},
		};
		return directiveObj;
	});
	
	app.directive('threeMaterial', function() {
		var directiveObj = {
			restrict: 'E',
			require: '^^threeMesh',
			scope: {
				parameters: '=',
			},
			compile: function(element, attrs, transclude) {
				var prepostObj = {
					pre: function(scope, element, attrs, controller) {
						scope.$parent.material = controller.buildThree(attrs.type, scope.parameters);
					},
					post: angular.noop
				};
				return prepostObj;
			},
		};
		return directiveObj;
	});
	
	app.directive('threeTexture', function($texture) {
		var directiveObj = {
			restrict: 'E',
			compile: function(element, attrs, transclude) {
				var prepostObj = {
					pre: function(scope, element, attrs, controller) {
						// scope.material.color.setHex(0xFFFFFF);
						$texture.load(attrs.src, scope.material);
					},
					post: angular.noop
				};
				return prepostObj;
			},
		};
		return directiveObj;
	});

	app.directive('tdPosition', function($three) {
		var directiveObj = {
			restrict: 'A',
			require: '^^threeScene',
			link: function(scope, element, attrs, controller) {
				attrs.$observe('tdPosition', function(newVal) {
					var id = parseInt(element.attr('id'), 10);
					var obj = $three.scene().getObjectById(id);
					var position = newVal ? angular.fromJson(newVal) : {};
					controller.bindPosition(obj, position);
				});
			},
		};
		return directiveObj;
	});

	app.directive('tdSize', function($three) {
		var directiveObj = {
			restrict: 'A',
			require: 'threeRenderer',
			link: function(scope, element, attrs, controller) {
				attrs.$observe('tdSize', function(newVal) {
					var size = newVal ? angular.fromJson(newVal) : {};
					controller.bindSize($three.renderer(), size);
				});
			},
		};
		return directiveObj;
	});
})();;(function() {
	angular.module('angularThree', ['angularThreeService', 'angularThreeController', 'angularThreeDirective']);

	angular.module('angularThree').value('hasWebGL', function() {
		try {
			var canvas = document.createElement( 'canvas' );
			return !!( window.WebGLRenderingContext && (
				canvas.getContext( 'webgl' ) ||
				canvas.getContext( 'experimental-webgl' ) )
			);
		} catch (e) {
			return false;
		}
	});
})();