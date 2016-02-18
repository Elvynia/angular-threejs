(function() {
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
})();