module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000');
	var faceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00,  side: THREE.DoubleSide });
	var greenMaterial = new THREE.MeshBasicMaterial({ color: green });
	var mouse = new THREE.Vector2();
	var stats = new Stats();
	var blue = 0x0000ff;
	
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
			self.displayGeometries();
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
			};
			
			animate(); 
		},
		
		displayGeometries: function() {
			
			let self = this;
			
			var geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(5,  self.settings.zBuffer, 10),
				new THREE.Vector3(-10, self.settings.zBuffer, 5),
				new THREE.Vector3(10, self.settings.zBuffer, 0)
			);
			geometry.faces.push(new THREE.Face3( 0, 1, 2 ));
			
			var geometry = new THREE.Geometry();
			var A = new THREE.Vector3(5,  self.settings.zBuffer, 10);
			var B = new THREE.Vector3(-10, self.settings.zBuffer, 5);
			var C = new THREE.Vector3(10, self.settings.zBuffer, 0);
			var Va = new THREE.Vector3(6, 0, 10);
			var Vb = new THREE.Vector3(-3, 0, -20);
			var Vc = new THREE.Vector3(5, 0, 6);

			var triangle = new THREE.Triangle(A, B, C);
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
			
			var center = gfx.getCentroid(geometry);
			
			var P = gfx.movePoint(A, new THREE.Vector3(0, 0, 0));
			gfx.showPoint(gfx.movePoint(P, new THREE.Vector3(0, .01, 0)));
			let bary = new THREE.Vector3(0, 0, 0);
			bary = triangle.getBarycoord(P, bary);
			let baryLabel = 'Bary(' + bary.x.toFixed(1).toString() + ', ' + bary.y.toFixed(1).toString() + ', ' + bary.z.toFixed(1).toString() + ')';
			//gfx.labelPoint(gfx.movePoint(P, new THREE.Vector3(1, .5, 0)), baryLabel, 0x0000ff);
			
			gfx.labelPoint(gfx.movePoint(triangle.a, new THREE.Vector3(1, 0, 0)), 'A(' + triangle.a.x.toString() + ', ' + triangle.a.y.toString() + ', ' + triangle.a.z.toString() + ')');
			gfx.labelPoint(gfx.movePoint(triangle.b, new THREE.Vector3(-8, 0, 0)), 'B(' + triangle.b.x.toString() + ', ' + triangle.b.y.toString() + ', ' + triangle.b.z.toString() + ')');
			gfx.labelPoint(gfx.movePoint(triangle.c, new THREE.Vector3(.5, 0, 0)), 'C(' + triangle.c.x.toString() + ', ' + triangle.c.y.toString() + ', ' + triangle.c.z.toString() + ')');
			gfx.labelPoint(gfx.movePoint(P, new THREE.Vector3(0, 1, -.75)), 'P');
			
			gfx.labelPoint(gfx.movePoint(triangle.a, Va).multiplyScalar(1.05), 'Va');
			gfx.labelPoint(gfx.movePoint(triangle.b, Vb).multiplyScalar(1.1), 'Vb');
			gfx.labelPoint(gfx.movePoint(triangle.c, Vc).multiplyScalar(1.05), 'Vc');
			
			let Vp = gfx.addVectors(Va.clone().multiplyScalar(bary.x), Vb.clone().multiplyScalar(bary.x), Vc.clone().multiplyScalar(bary.x));
			//gfx.showVector(Vp, P, blue);
			
			gfx.showVector(Vp, P, blue);
			
			console.log(Va);
			console.log(bary);
			//self.pointCloud();
		},
		
		pointCloud: function() {
			
			let self = this;
			let y = self.settings.zBuffer;
			
			let range = [-10, 10];
			let density = 2;
			
			for (let x = range[0]; x <= range[1]; x += density) {
				
				for (let y = 0; y <= range[1] * 2; y += density) {

					for (let z = range[0]; z <= range[1]; z += density) {
						
						let vectorOrigin = new THREE.Vector3(x, y, z);
						let origin = new THREE.Vector3(0, 0, 0);
						gfx.showPoint(origin, 0x00ff00);
						gfx.labelPoint(gfx.movePoint(origin, new THREE.Vector3(.25, 0, -.25)), 'O', 0x00ff00);
						//gfx.showPoint(vectorOrigin, 0x0000ff);
						
						gfx.showVector(self.vectorInField(vectorOrigin), vectorOrigin);
					}
				}
				
			}
		},
		
		vectorInField: function(pt) {
			
			//field F = (−y, xy, z);
			//let result = new THREE.Vector3(-pt.y, pt.x * pt.y, pt.z);
			
			// field F = xi
			//let result = new THREE.Vector3(pt.x, 0, 0);
			
			// field F = xi + zk
			//let result =  new THREE.Vector3(pt.x + pt.z, 0, pt.x + pt.z);
			
			// field F = -zi + xk
			let result =  new THREE.Vector3(-pt.z, 0, pt.x);
			return result;
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