THREE.DragControls = require('three-dragcontrols');

module.exports = function() {
	
	let message = document.querySelector('.message');
	
	var settings = {
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
		zBuffer: .1,
		dragHandleSize: 3
	};
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000');
	var faceMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00,  side: THREE.DoubleSide, wireframe: true });
	var invisibleMaterial = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 });
	var greenMaterial = new THREE.MeshBasicMaterial({ color: green });
	var mouse = new THREE.Vector2();
	var stats = new Stats();
	var blue = 0x0000ff;
	var draggable = [], dragHandleGeometry = new THREE.BoxGeometry(settings.dragHandleSize, settings.dragHandleSize, settings.dragHandleSize);
	var triangle, geometry;
	var triangles = [];
	
	return {
		
		init: function() {

			let self = this;
			self.loadFont();
		},
		
		begin: function() {
			
			let self = this;
			
			scene = gfx.setUpScene();
			renderer = gfx.setUpRenderer(renderer);
			camera = gfx.setUpCamera(camera);
			floor = gfx.addFloor(settings.floorSize, settings.colors.worldColor, settings.colors.gridColor);
			controls = gfx.enableControls(controls, renderer, camera);
			gfx.resizeRendererOnWindowResize(renderer, camera);
			gfx.setUpLights();
			gfx.setCameraLocation(camera, settings.defaultCameraLocation);
			self.setUpButtons();
			
			self.initTriangle();
			self.dragging();
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
			};
			
			animate(); 
		},
		
		initTriangle: function() {
			
			let self = this;
			
			var A = new THREE.Vector3(5,  settings.zBuffer, 10), B = new THREE.Vector3(-10, settings.zBuffer, 5), C = new THREE.Vector3(10, settings.zBuffer, 1);
			var Va = new THREE.Vector3(2, 0, 5), Vb = new THREE.Vector3(-3, 0, -5), Vc = new THREE.Vector3(5, 0, 6);
			triangles.push(new THREE.Triangle(A, B, C));
		
			A = new THREE.Vector3(10,  settings.zBuffer, -20), B = new THREE.Vector3(-10, settings.zBuffer, 5), C = new THREE.Vector3(10, settings.zBuffer, 1);
			triangles.push(new THREE.Triangle(A, B, C));
			
			A = new THREE.Vector3(10,  settings.zBuffer, -20), B = new THREE.Vector3(30, settings.zBuffer, -5), C = new THREE.Vector3(10, settings.zBuffer, 1);
			triangles.push(new THREE.Triangle(A, B, C));
			
			for (let tri = 0; tri < triangles.length; tri += 1) {
				
				triangles[tri].constraints = {};
				triangles[tri].constraints.vectors = [];
				triangles[tri].constraints.dragHandles = [];
				triangles[tri].constraints.vectors.push(Va);
				triangles[tri].constraints.vectors.push(Vb);
				triangles[tri].constraints.vectors.push(Vc);
				triangles[tri].field = [];
				triangles[tri].fieldDensity = 1;

				geometry = new THREE.Geometry();
				geometry.vertices.push(triangles[tri].a);
				geometry.vertices.push(triangles[tri].b);
				geometry.vertices.push(triangles[tri].c);
				geometry.faces.push(new THREE.Face3( 0, 1, 2, triangles[tri].getNormal(new THREE.Vector3(0, 0, 0))));
				
				let mesh = new THREE.Mesh(geometry, faceMaterial);
				scene.add(mesh);
				
				triangles[tri].arrows = [];
				let label = ['A', 'B', 'C'];
				let vertices = [triangles[tri].a, triangles[tri].b, triangles[tri].c];
				for (let i = 0; i < triangles[tri].constraints.vectors.length; i++) {
					
					if (!triangles[tri].arrows[i]) triangles[tri].arrows[i] = gfx.showVector(triangles[tri].constraints.vectors[i], vertices[i], blue);
					// gfx.labelPoint(gfx.movePoint(vertices[i], triangles[tri].constraints.vectors[i]).multiplyScalar(1.05), 'V' + label[i].toLowerCase(), blue);
					// gfx.labelPoint(gfx.movePoint(vertices[i], new THREE.Vector3(-.25, .5, 1)), label[i], 0x00ff00);
					triangles[tri].constraints.dragHandles[i] = new THREE.Mesh(dragHandleGeometry, invisibleMaterial);
					let newPos = gfx.movePoint(vertices[i], triangles[tri].constraints.vectors[i].setLength(triangles[tri].constraints.vectors[i].length() - 1));
					triangles[tri].constraints.dragHandles[i].position.set(newPos.x, newPos.y, newPos.z);
	
					scene.add(triangles[tri].constraints.dragHandles[i]);
					draggable.push(triangles[tri].constraints.dragHandles[i]);
				}
				self.trianglePointCloud(triangles[tri]);
				self.pointCloud();
			}
		},
		
		updateObjects: function(draggedObject) {
			
			let self = this;
			let updateTriangle = null;
			triangles.forEach(function(triangle) { // identify the triangle that is associated with the handle being dragging and update that triangle
				
				triangle.constraints.dragHandles.forEach(function(handle) {
					
					if (draggedObject === handle) updateTriangle = triangle;
				});
			});
			
			if (updateTriangle) {
				
				let vertices = [updateTriangle.a, updateTriangle.b, updateTriangle.c];
				for (let i = 0; i < updateTriangle.constraints.vectors.length; i++) {
					
					if (updateTriangle.constraints.dragHandles[i] === draggedObject) { // update stuff when dragging handles
						let originalLength = updateTriangle.constraints.vectors[i].length();
						updateTriangle.constraints.vectors[i] = new THREE.Vector3(draggedObject.position.x - vertices[i].x, 0, draggedObject.position.z - vertices[i].z)
						let newDirection = new THREE.Vector3(draggedObject.position.x, 0, draggedObject.position.z);
						let newOrigin = new THREE.Vector3(vertices[i].x, 0, vertices[i].z);
						gfx.updateArrow(updateTriangle.arrows[i], newOrigin, newDirection);
						let scale = newDirection.length() * .1;
						updateTriangle.constraints.dragHandles[i].scale.x = scale, updateTriangle.constraints.dragHandles[i].scale.y = scale, updateTriangle.constraints.dragHandles[i].scale.z = scale;
					}
				}
				self.updateField(updateTriangle);
			}
		},
		
		barycentricVectorInField: function(pt, triangle) {
			let bary = new THREE.Vector3(0, 0, 0);
			bary = triangle.getBarycoord(pt, bary);
			return gfx.addVectors(triangle.constraints.vectors[0].clone().multiplyScalar(bary.x), triangle.constraints.vectors[1].clone().multiplyScalar(bary.y), triangle.constraints.vectors[2].clone().multiplyScalar(bary.z));
		},
		
		dragging: function() {
			
			let self = this;
			const dragControls = new THREE.DragControls(draggable, camera, renderer.domElement);
			dragControls.addEventListener('dragstart', function(event) { 
				controls.enabled = false;
			});
			
			dragControls.addEventListener('drag', function(event) {
				self.updateObjects(event.object);
			});
			
			dragControls.addEventListener('dragend', function(event) {
				controls.enabled = true;
			});
		},
		
		trianglePointCloud: function(triangle) {
			
			let self = this;
			let y = triangle.b.y; // need to fix for 3D
			let density = triangle.fieldDensity;
			
			let vertices = [triangle.a, triangle.b, triangle.c];
			let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
			for (let i = 0; i < vertices.length; i++) {
				if (vertices[i].x < minX) minX = vertices[i].x;
				if (vertices[i].x > maxX) maxX = vertices[i].x;
				if (vertices[i].z < minZ) minZ = vertices[i].z;
				if (vertices[i].z > maxZ) maxZ = vertices[i].z;
			}
			let rangeX = [minX, maxX];
			let rangeZ = [minZ, maxZ];
						
			for (let x = rangeX[0]; x <= rangeX[1]; x += density) {

				for (let z = rangeZ[0]; z <= rangeZ[1]; z += density) {
					
					let vectorOrigin = new THREE.Vector3(x, y, z);
					if (gfx.pointInFace(vectorOrigin, triangle)) {
						triangle.field.push({ 'arrow': gfx.showVector(self.barycentricVectorInField(vectorOrigin, triangle), vectorOrigin), 'origin': vectorOrigin});
					}
				}
			}
		},
		
		updateField: function(triangle) {
			
			let self = this;
			let vertices = [triangle.a, triangle.b, triangle.c];
			
			for (let i = 0; i < triangle.field.length; i++) {
				
				let origin = triangle.field[i].origin;
				let newDirection = gfx.movePoint(origin, self.barycentricVectorInField(origin, triangle));
				gfx.updateArrow(triangle.field[i].arrow, origin, newDirection);
			}
		},
		
		pointCloud: function(id) {
			
			let self = this;
			let y = settings.zBuffer;
			
			let range = [-10, 10];
			let density = 3;
			
			for (let x = range[0]; x <= range[1]; x += density) {
				
				for (let y = 0; y <= range[1] * 2; y += density) {

					for (let z = range[0]; z <= range[1]; z += density) {
						
						let vectorOrigin = new THREE.Vector3(x, y, z);
						if (id === 1) gfx.showVector(self.vectorInField1(vectorOrigin), vectorOrigin);
						if (id === 2) gfx.showVector(self.vectorInField2(vectorOrigin), vectorOrigin);
						if (id === 3) gfx.showVector(self.vectorInField3(vectorOrigin), vectorOrigin);
						if (id === 4) gfx.showVector(self.vectorInField4(vectorOrigin), vectorOrigin);
					}
				}
			}
		},
		
		vectorInField1: function(pt) {
			
			message.innerHTML = 'F = xi&#770 + zk&#770';
			
			// field F = (x, 0, z);
			let result = new THREE.Vector3(pt.x, 0, pt.z);
			return result;
		},
		
		vectorInField2: function(pt) {
			
			message.innerHTML = 'F = xi&#770';

			// field F = xi
			let result = new THREE.Vector3(pt.x, 0, 0);
			return result;
		},
		
		vectorInField3: function(pt) {
			
			message.innerHTML = 'F = xi&#770 + zk&#770';
			
			// field F = xi + zk
			let result =  new THREE.Vector3(pt.x + pt.z, 0, pt.x + pt.z);
			return result;
		},
		
		vectorInField4: function(pt) {
			
			message.innerHTML = 'F = -zi&#770 + xk&#770';
			
			// field F = -zi + xk
			let result =  new THREE.Vector3(-pt.z, 0, pt.x);
			return result;
		},
		
		reset: function() {
			
			message.textContent = '';
			
			for (let i = scene.children.length - 1; i >= 0; i--) {
				let obj = scene.children[i];
				
				if (!draggable.includes(obj)) scene.remove(obj);
			}
			
			floor = gfx.addFloor(settings.floorSize, settings.colors.worldColor, settings.colors.gridColor);
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
			
			let onMouseMove = function(event) {

				mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
				mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
			};
			window.addEventListener('mousemove', onMouseMove, false);
			
			document.querySelector('canvas').addEventListener('click', function(event) {

			});
			
			document.addEventListener('keyup', function(event) {
				
				let one = 49;
				let two = 50;
				let three = 51;
				let four = 52;
				let r = 82;
				
				if (event.keyCode === one) {
					self.reset();
					self.pointCloud(1);
				}
				if (event.keyCode === two) {
					self.reset();
					self.pointCloud(2);
				}
				if (event.keyCode === three) {
					self.reset();
					self.pointCloud(3);
				}
				if (event.keyCode === four) {
					self.reset();
					self.pointCloud(4);
				}
				if (event.keyCode === r) {
					self.reset();
					//self.initTriangle();
				}
			});
		}
	}
}