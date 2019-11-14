module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000');
	var faceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00,  side: THREE.DoubleSide });
	var greenMaterial = new THREE.MeshBasicMaterial({ color: green });
	var mouse = new THREE.Vector2();
	var stats = new Stats();
	
	return {
		
		settings: {
			defaultCameraLocation: {
				x: 0,
				y: 75,
				z: 0
			},
			messageDuration: 2000,
			arrowHeadSize: 1.5,
			colors: {
				worldColor: black,
				gridColor: new THREE.Color('#111'),
				arrowColor: red
			},
			floorSize: 100,
			zBuffer: .1
		},
		
		init: function() {

			let self = this;
			self.loadFont();
		},
		
		begin: function() {
			
			let self = this;
			
			scene = gfx.setUpScene();
			renderer = gfx.setUpRenderer(renderer);
			camera = gfx.setUpCamera(camera);
			floor = gfx.addFloor(this.settings.floorSize, this.settings.colors.worldColor, this.settings.colors.gridColor);
			controls = gfx.enableControls(controls, renderer, camera);
			gfx.resizeRendererOnWindowResize(renderer, camera);
			gfx.setUpLights();
			gfx.setCameraLocation(camera, self.settings.defaultCameraLocation);
			self.setUpButtons();
			self.vectorField();
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
			};
			
			animate(); 
		},
		
		vectorField: function() {
			
			//gfx.drawLine(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 0), 0x00ff00);
			let self = this;
			
			var geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(5,  self.settings.zBuffer, 10),
				new THREE.Vector3(-10, self.settings.zBuffer, 5),
				new THREE.Vector3(10, self.settings.zBuffer, 0)
			);
			geometry.faces.push(new THREE.Face3( 0, 1, 2 ));
			
			
			var geometry = new THREE.Geometry();
			var v1 = new THREE.Vector3(5,  self.settings.zBuffer, 10);
			var v2 = new THREE.Vector3(-10, self.settings.zBuffer, 5);
			var v3 = new THREE.Vector3(10, self.settings.zBuffer, 0);
			var Va = new THREE.Vector3(6, 0, 10);
			var Vb = new THREE.Vector3(-3, 0, 4);
			var Vc = new THREE.Vector3(5, 0, 6);

			var triangle = new THREE.Triangle(v1, v2, v3);
			triangle.Va = Va;
			triangle.Vb = Vb;
			triangle.Vc = Vc;
			var normal = new THREE.Vector3(0, 0, 0);
			normal =  triangle.getNormal(normal);
			geometry.vertices.push(triangle.a);
			geometry.vertices.push(triangle.b);
			geometry.vertices.push(triangle.c);
			geometry.faces.push( new THREE.Face3( 0, 1, 2, normal ) );
			
			gfx.showVector(triangle.Va, triangle.a);
			gfx.showVector(triangle.Vb, triangle.b);
			gfx.showVector(triangle.Vc, triangle.c);
			
			let mesh = new THREE.Mesh(geometry, faceMaterial);
			scene.add(mesh);
			
			let A = new THREE.Vector3();
			gfx.showVector(triangle.getBarycoord(gfx.getCentroid(geometry), A), gfx.getCentroid(geometry));
			
		},
		
		loadFont: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				gfx.appSettings.font.fontStyle.font = font;
				self.begin();
				if (gfx.appSettings.axesHelper.activateAxesHelper) gfx.labelAxes();
			},
			function(event) {}, // in progress event
			function(event) { // error event
				gfx.appSettings.font.enable = false;
				self.begin();
			});
		},
		
		setUpButtons: function() {
			
			let self = this;
			let message = document.getElementById('message');
			
			let esc = 27;
			let A = 65;
			
			let onMouseMove = function(event) {

				mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
				mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
			};
			window.addEventListener('mousemove', onMouseMove, false);
			
			document.querySelector('canvas').addEventListener('click', function(event) {
				
			});
		}
	}
}