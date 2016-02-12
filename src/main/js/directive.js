angular.module('angularThree').directive('threeCanvas', function($three) {
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