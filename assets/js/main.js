var VectorField = require('./components/vector-field.js');
var Utilities = require('./utils.js');
var Graphics = require('./graphics.js');

(function () {
	
	document.addEventListener('DOMContentLoaded',function(){

		VectorField().init();
	});
})();