THREE.DragControls = require('three-dragcontrols');

module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000');
	var faceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00,  side: THREE.DoubleSide, wireframe: true });
	var invisibleMaterial = new THREE.MeshNormalMaterial();
	var greenMaterial = new THREE.MeshBasicMaterial({ color: green });
	var mouse = new THREE.Vector2();
	var stats = new Stats();
	var blue = 0x0000ff;
	var draggable = [], dragDelta = [], dragHandleGeometry = new THREE.BoxGeometry(2, 2, 2);
	var triangle;
	
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
			
			var A = new THREE.Vector3(5,  self.settings.zBuffer, 10), B = new THREE.Vector3(-10, self.settings.zBuffer, 5), C = new THREE.Vector3(10, self.settings.zBuffer, 0);
			var Va = new THREE.Vector3(2, 0, 5), Vb = new THREE.Vector3(-3, 0, -5), Vc = new THREE.Vector3(5, 0, 6);

			triangle = new THREE.Triangle(A, B, C);
			triangle.constraints = {};
			triangle.constraints.vectors = [];
			triangle.constraints.dragHandles = [];
			triangle.constraints.vectors.push(Va);
			triangle.constraints.vectors.push(Vb);
			triangle.constraints.vectors.push(Vc);
			
			self.displayGeometries();
			self.dragging();
			
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
			geometry.vertices.push(triangle.a);
			geometry.vertices.push(triangle.b);
			geometry.vertices.push(triangle.c);
			geometry.faces.push(new THREE.Face3( 0, 1, 2, triangle.getNormal(new THREE.Vector3(0, 0, 0))));
			
			triangle.arrows = [];
			let label = ['A', 'B', 'C'];
			let vertices = [triangle.a, triangle.b, triangle.c];
			for (let i = 0; i < triangle.constraints.vectors.length; i++) {
				triangle.arrows[i] = gfx.showVector(triangle.constraints.vectors[i], vertices[i], blue);
				
				gfx.labelPoint(gfx.movePoint(vertices[i], triangle.constraints.vectors[i]).multiplyScalar(1.05), 'V' + label[i].toLowerCase(), blue);
				gfx.labelPoint(gfx.movePoint(vertices[i], new THREE.Vector3(-.25, .5, 1)), label[i], 0x00ff00);
				
				triangle.constraints.dragHandles[i] = new THREE.Mesh(dragHandleGeometry, invisibleMaterial).clone();
				let newPos = gfx.movePoint(vertices[i], triangle.constraints.vectors[i].setLength(triangle.constraints.vectors[i].length() - 1));
				triangle.constraints.dragHandles[i].position.set(newPos.x, newPos.y, newPos.z);
				scene.add(triangle.constraints.dragHandles[i]);
				if (draggable.length !== triangle.constraints.vectors.length) {draggable.push(triangle.constraints.dragHandles[i]); console.log(draggable.length)}
			}
			
			let mesh = new THREE.Mesh(geometry, faceMaterial);
			scene.add(mesh);
			
			
			
			
			
			
			
			
			
			
			
			
			self.trianglePointCloud(triangle);
		},
		
		updateObjects: function(draggedObject) {
			
			let vertices = [triangle.a, triangle.b, triangle.c];
			
			for (let i = 0; i < triangle.constraints.vectors.length; i++) {
				
				// Only update if draggedObject is the same as the corresponding drag handle. Something is delete and making new drag handles.
				console.log(i, triangle.constraints.dragHandles[i] === draggedObject, triangle.constraints.dragHandles[i], draggedObject);
				if (triangle.constraints.dragHandles[i] === draggedObject) {
					console.log('match');
					scene.remove(triangle.arrows[i]);
					triangle.constraints.vectors[i] = new THREE.Vector3(dragDelta[1].x - vertices[i].x, dragDelta[1].y - vertices[i].y, dragDelta[1].z - vertices[i].z)
					triangle.arrows[i] = gfx.showVector(triangle.constraints.vectors[i], vertices[i]);
				}
				
			}
		},
		
		barycentricVectorInField: function(pt, triangle) {
			let bary = new THREE.Vector3(0, 0, 0);
			bary = triangle.getBarycoord(pt, bary);
			return gfx.addVectors(triangle.constraints.vectors[0].clone().multiplyScalar(bary.x), triangle.constraints.vectors[1].clone().multiplyScalar(bary.y), triangle.constraints.vectors[2].clone().multiplyScalar(bary.z));
		},
		
		dragging: function() {
			
			let self = this;
			let count = 0;
			const dragControls = new THREE.DragControls(draggable, camera, renderer.domElement);
			dragControls.addEventListener('dragstart', function(event) { 
				count = 0
				controls.enabled = false;
				if (event.object) dragDelta[0] = event.object.position;
			});
			
			dragControls.addEventListener('drag', function(event) {
				if (event.object) dragDelta[1] = event.object.position;
				self.updateObjects(event.object);
				
				//if (count % 4 === 0) {
				//	self.reset();
				//	self.displayGeometries();
				//}
				count++;
			});
			
			dragControls.addEventListener('dragend', function(event) {
				controls.enabled = true;
			});
		},
		
		trianglePointCloud: function(triangle) {
			
			let self = this;
			let y = triangle.b.y; // need to fix for 3D
			
			let rangeX = [triangle.b.x, triangle.c.x];
			let rangeZ = [triangle.c.z, triangle.a.z];
			let density = 1;
			let origin = new THREE.Vector3(0, 0, 0);
			gfx.showPoint(origin, new THREE.Color('purple'));
			
			for (let x = rangeX[0]; x <= rangeX[1]; x += density) {

				for (let z = rangeZ[0]; z <= rangeZ[1]; z += density) {
					
					let vectorOrigin = new THREE.Vector3(x, y, z);
					if (gfx.pointInFace(vectorOrigin, triangle)) {
						
						gfx.labelPoint(origin, 'O', new THREE.Color('purple'));
						gfx.showVector(self.barycentricVectorInField(vectorOrigin, triangle), vectorOrigin);
					}
				}
			}
		},
		
		pointCloud: function() {
			
			let self = this;
			let y = self.settings.zBuffer;
			
			let range = [-self.settings.floorSize / 2, self.settings.floorSize / 2];
			let density = 10;
			
			for (let x = range[0]; x <= range[1]; x += density) {
				
				for (let y = 0; y <= range[1] * 2; y += density) {

					for (let z = range[0]; z <= range[1]; z += density) {
						
						let vectorOrigin = new THREE.Vector3(x, y, z);
						let origin = new THREE.Vector3(0, 0, 0);
						gfx.showPoint(origin, 0x00ff00);
						gfx.labelPoint(gfx.movePoint(origin, new THREE.Vector3(.25, 0, -.25)), 'O', new THREE.Color('white'));
						
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
		
		update: function() {
			
		},
		
		reset: function() {
			
			// for (let i = scene.children.length - 1; i >= 0; i--) {
			// 	let obj = scene.children[i];
				
			// 	if (!draggable.includes(obj)) scene.remove(obj);
			// }
			
			floor = gfx.addFloor(this.settings.floorSize, this.settings.colors.worldColor, this.settings.colors.gridColor);
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
				self.reset();
				//self.displayGeometries();
			});
		}
	}
}