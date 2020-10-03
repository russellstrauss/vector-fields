import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
	//var stats = new Stats();
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
			self.addStars();
			self.setUpButtons();
			self.dragging();
			
			self.loadModel();
			
			var animate = function() {
				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
			};
			animate(); 
		},
		
		addStars: function() {
			var geometry = new THREE.BufferGeometry();
			var vertices = [];
			for ( var i = 0; i < 10000; i ++ ) {
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z
			}
			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
			var particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
			scene.add( particles );
		},
		
		colorTest: function() {
			var geometry = new THREE.BufferGeometry();
			// create a simple square shape. We duplicate the top left and bottom right
			// vertices because each vertex needs to appear once per triangle.
			var vertices = new Float32Array( [
				-1.0, -1.0,  1.0,  // bottom left
				1.0, -1.0,  1.0,  // bottom right
				1.0,  1.0,  1.0,  // top right

				1.0,  1.0,  1.0,  // top right?
				-1.0,  1.0,  1.0,  // top left?
				-1.0, -1.0,  1.0   // bottom left?
			] );

			geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) ); // itemSize = 3 because there are 3 values (components) per vertex


			// Each "row" represents the vertex color for a single vertex
			// "color" is determined by the intensity of the 3 color channels (red, green, blue)
			// Makes sense to store as 8 bit unsigned integers (0-255)
			var colors = new Uint8Array( [
				255,  0,  0,  
				0,  255,  0,  
				0,  0,  255,  

				0,  0,  255,  
				0,  255,  0,
				255,  0,  0
			] );

			// Don't forget to normalize the array! (third param = true)
			geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true) );

			// it is also possible to use the vertices array here, the result is kinda cool
			// I wonder how negative RGB values are interpreted? or values that exceed 1?
			//geometry.addAttribute( 'color', new THREE.BufferAttribute( vertices, 3) );

			// Even though color is specified in the geometry, a material is still required
			var material = new THREE.MeshBasicMaterial( {vertexColors: THREE.VertexColors, side: THREE.DoubleSide} );
			var plane = new THREE.Mesh( geometry, material );
			scene.add(plane);
		},
		
		loadModel: function(model) {
			
			let self = this;
			
			var loader = new THREE.OBJLoader();
			loader.load('./assets/obj/bunny.obj',
				function (obj) { // loaded
					camera.position.set(-115, 65, 80);
					
					let objGeometry = obj.children[0].geometry;
					
					// var colors = [];
					// var color = new THREE.Color();
					// color.setRGB( 1, 0, 1 );
					// colors.push( color.r, color.g, color.b );
					// objGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
					// console.log(objGeometry);
					
					// let vertexCount = objGeometry.attributes.position.count;
					// var lut = new THREE.Lut( 'rainbow', vertexCount );
					// for (let i = 0; i < vertexCount; i++) {
					// 	let interpolator = i/(vertexCount - 1);
					// 	color = lut.getColor(interpolator);
					// 	// console.log(color);
					// }
					
					// self.colorTest();
					
					let material = new THREE.PointsMaterial({ color: 0x0000ff, size: 0.25 });
					let mesh = new THREE.Points(objGeometry, material);
					
					// bunny
					mesh.scale.set(500, 500, 500);
					mesh.position.y -= 16.5;
					
					
					scene.add(mesh)
				},
				function (xhr) { // in progress
				},
				function (error) { // on failure
					console.log('Error loadModel(): ', error);
				}
			);
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
		
		pointCloud: function(id) {
			
			let self = this;
			let y = settings.zBuffer;
			
			let range = [-10, 10];
			let density = 3;
			
			for (let x = range[0]; x <= range[1]; x += density) {
				
				for (let y = 0; y <= range[1] * 2; y += density) {

					for (let z = range[0]; z <= range[1]; z += density) {
						
						let point = new THREE.Vector3(x, y, z);
					}
				}
			}
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
				let space = 32;
				
				if (event.keyCode === one) {
					self.reset();
				}
				if (event.keyCode === two) {
					self.reset();
				}
				if (event.keyCode === three) {
					self.reset();
				}
				if (event.keyCode === four) {
					self.reset();
				}
				if (event.keyCode === r) {
					self.reset();
				}
				if (event.keyCode === space) {
					console.log(camera.position);
				}
			});
		}
	}
}