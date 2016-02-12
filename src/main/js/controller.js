angular.module('angularThree').controller('rendererController', function($scope, $three) {
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
});