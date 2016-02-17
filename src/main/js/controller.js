(function() {
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
})();