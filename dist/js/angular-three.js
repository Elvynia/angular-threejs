angular.module('angularThree', []);

angular.module('angularThree').value('hasWebGL', function() {
	try {
		var canvas = document.createElement( 'canvas' );
		return !!( window.WebGLRenderingContext && (
			canvas.getContext( 'webgl' ) ||
			canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
});
;angular.module('angularThree').factory('$scene', function() {
	var scene = {
		threeScene: null,
		objects: [],
		updates: [],
	};
	return {
		get: function() {
			return scene.threeScene;
		},
		set: function(newScene) {
			scene.threeScene = newScene;
		},
		addObject: function(object) {
			// TODO.
			scene.threeScene.add(object);
		},
		addUpdate: function(update) {
			scene.updates.push(update);
		},
		update: function() {
			for (var i = 0; i < scene.updates.length; ++i) {
				scene.updates[i]();
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
;angular.module('angularThree').controller('rendererController', function($scope, $three, hasWebGL) {
	$scope.bindRenderer = function(type) {
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
			// renderer.setSize(1024, 768);
			$three.renderer(renderer);
			return renderer;
		}
	};
	$scope.bindScene = function() {
		var scene = new THREE.Scene();
		$three.scene(scene);
		return scene;
	};
	$scope.bindSize = function(object, size) {
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

angular.module('angularThree').controller('sceneController', function($scope, $three) {
	$scope.bindCamera = function(type, params) {
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
	$scope.bindPosition = function(object, position) {
		if (object && position) {
			object.position.x = position.x || 0;
			object.position.y = position.y || 0;
			object.position.z = position.z || 0;
		} else {
			console.error('Wrong arguments ['+object+', '+position+']');
		}
	};
	$scope.bindLight = function(type, params) {
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
});;angular.module('angularThree').directive('threeCanvas', function($three) {
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

angular.module('angularThree').directive('threeRenderer', function($three) {
	var directiveObj = {
		restrict: 'E',
		controller: 'rendererController',
		compile: function(element, attrs, transclude) {
			var prepostObj = {
				pre: function(scope, element, attrs, controller) {
					scope.bindRenderer(attrs.type);
				}
			};
			return prepostObj;
		},
	};
	return directiveObj;
});

angular.module('angularThree').directive('canvas', function($three) {
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

angular.module('angularThree').directive('threeScene', function($window, $three) {
	var directiveObj = {
		restrict: 'E',
		require: '^^threeRenderer',
		controller: 'sceneController',
		compile: function(element, attrs, transclude) {
			var prepostObj = {
				pre: function(scope, element, attrs, controller) {
					scope.bindScene();
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

angular.module('angularThree').directive('threeCamera', function($three) {
	var directiveObj = {
		restrict: 'E',
		require: '^^threeScene',
		compile: function(element, attrs, transclude) {
			var prepostObj = {
				pre: function(scope, element, attrs, controller) {
					var params = attrs.parameters ? angular.fromJson(attrs.parameters) : [];
					var camera = scope.bindCamera(attrs.type, params);
					element.attr('id', camera.id);
				}
			};
			return prepostObj;
		},
	};
	return directiveObj;
});

angular.module('angularThree').directive('threeLight', function($three) {
	var directiveObj = {
		restrict: 'E',
		require: '^^threeScene',
		link: function(scope, element, attrs, controller) {
			var parameters = attrs.parameters ? angular.fromJson(attrs.parameters) : [];
			var light = scope.bindLight(attrs.type, parameters);
			element.attr('id', light.id);
		},
	};
	return directiveObj;
});

angular.module('angularThree').directive('tdPosition', function($three) {
	var directiveObj = {
		restrict: 'A',
		require: '^^threeScene',
		link: function(scope, element, attrs, controller) {
			attrs.$observe('tdPosition', function(newVal) {
				var id = parseInt(element.attr('id'), 10);
				var obj = $three.scene().getObjectById(id);
				var position = newVal ? angular.fromJson(newVal) : {};
				scope.bindPosition(obj, position);
			});
		},
	};
	return directiveObj;
});

angular.module('angularThree').directive('tdSize', function($three) {
	var directiveObj = {
		restrict: 'A',
		require: 'threeRenderer',
		link: function(scope, element, attrs, controller) {
			attrs.$observe('tdSize', function(newVal) {
				var size = newVal ? angular.fromJson(newVal) : {};
				scope.bindSize($three.renderer(), size);
			});
		},
	};
	return directiveObj;
});