(function() {
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