var module = angular.module('angularThree', []);

var hasWebGL = function webglAvailable() {
	try {
		var canvas = document.createElement( 'canvas' );
		return !!( window.WebGLRenderingContext && (
			canvas.getContext( 'webgl' ) ||
			canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
};

module.factory('$three', function($document, $timeout) {
	var renderer, canvas, scene, camera, data;
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
				canvas = angular.element('#simple-scene');
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
		initialize: function() {
			$timeout(function() {
				THREE.TextureLoader.prototype.crossOrigin = 'anonymous';
				var earthImgUrl = "http://localhost:8080/ramm/earth.jpg";
				var texloader = new THREE.TextureLoader();
				console.log('loading texture');
				var texture = texloader.load(earthImgUrl, function() {
					console.log('Callback running');
					texture.needsUpdate = true;
					var sphere = new THREE.Mesh(
					   new THREE.SphereGeometry(50, 16, 16),
					   new THREE.MeshPhongMaterial({map: texture}));

					var pointLight = new THREE.PointLight( 0xFFFFFF );
					pointLight.position.x = 10;
					pointLight.position.y = 20;
					pointLight.position.z = 100;

					scene.add(sphere);
					scene.add(pointLight);
					scene.add(camera);
					
					canvas.append(renderer.domElement);
					var render = function() {
						requestAnimationFrame(render);
						renderer.render(scene, camera);
						sphere.rotation.y += 0.01;
					};
					render();
				});
			});
		}
	};
});

module.controller('threeController', function($scope, $three, $timeout) {
	$scope.bindRenderer = function(type, width, height) {
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
			// Set renderer size.
			if (width && height) {
				renderer.setSize(width, height);
			} else {
				//console.log($three.canvas().width());
				//renderer.setSize($three.canvas().width(), $three.canvas().height());
			}
			$three.renderer(renderer);
		}
	};
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
				console.error('Missing parameters for constructor (Needs 4 arguments).');
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
				console.error('Missing parameters for constructor (Needs 4 arguments).');
			}
		} else {
			console.error('Unknown camera type "' + type + '".');
		}
		if (camera) {
			camera.position.z = 300;
			$three.camera(camera);
		}
	};
});

module.directive('threeRenderer', function($document, $three) {
	var directiveObj = {
		restrict: 'E',
		controller: 'threeController',
		compile: function(element, attrs, transclude) {
			var prepostObj = {
				pre: function(scope, element, attrs, controller) {
					if (attrs.canvas) {
						$three.canvas($document.find('#' + attrs.canvas));
						scope.bindRenderer(attrs.type, attrs.width, attrs.height);
					} else {
						console.error('No HTML container to render into. Please provide container id through $scope or canvas attribute.');
					}
				}
			};
			return prepostObj;
		},
		//link: function(scope, element, attrs) {},
	};
	return directiveObj;
});

module.directive('threeScene', function($three) {
	var directiveObj = {
		restrict: 'E',
		require: '^threeRenderer',
		compile: function(element, attrs, transclude) {
			var prepostObj = {
				pre: function(scope, element, attrs, controller) {
					$three.scene(new THREE.Scene());
				}
			};
			return prepostObj;
		},
	};
	return directiveObj;
});

module.directive('threeCamera', function($three) {
	var directiveObj = {
		restrict: 'E',
		require: '^threeRenderer',
		compile: function(element, attrs, transclude) {
			var prepostObj = {
				pre: function(scope, element, attrs, controller) {
					var params = attrs.parameters ? angular.fromJson(attrs.parameters) : [];
					scope.bindCamera(attrs.type, params);
				}
			};
			return prepostObj;
		},
	};
	return directiveObj;
});