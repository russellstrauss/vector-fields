module.exports = function() {
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000');
	var faceMaterial = new THREE.MeshBasicMaterial({ color: red, transparent: true, opacity: .2, side: THREE.DoubleSide });
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
				gridColor: new THREE.Color('#ED0000'),
				arrowColor: red
			},
			floorSize: 100,
			zBuffer: .1
		},
		
		init: function() {

			let self = this;
			//self.loadFont();
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
			//self.vectorField();
			
			var animate = function() {

				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
			};
			
			animate(); 
		},
		
		vectorField: function() {
			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;
			var particleMaterial; //an example particle material to use
			var t = 0; //increases each call of render
			var pause = false;

			init();
			animate();

			function computePoints(x,y){//outputs vector based on vectorformula
				return [eval(vectorFormula[0]), eval(vectorFormula[1])];
			}

			function init(){
				
				var gui = new dat.GUI({
					height : 5 * 32 - 1
				});
				
				var Params = function() {
					this.x = 'Math.sin(t*10)+y';
					this.y = 'Math.cos(t*10)-x';
					this.width = 3;
					this.height = 1;
					this.offsetX = 2;
					this.offsetY = -1;
					this.wcs = 10;
					this.hcs = 10;
					this.speed = 4;
					this.pause = function(){
						pause = !pause;
					};
					this.restart = function(){
						createStuff()
					}
				};
				
				params = new Params();
				
				gui.add(params,"x").name("X Equation").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"y").name("Y Equation").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"width").name("Width").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"height").name("Height").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"wcs").name("Width Cross Sections").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"hcs").name("Height Cross Sections").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"offsetX").name("Shape's X Offset").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"offsetY").name("Shape's Y Offset").onFinishChange(function(){
					createStuff();
				});
				gui.add(params,"speed").name("Slowness");
				gui.add(params,"pause").name("Pause")
				gui.add(params,"restart").name("Restart");
				
				renderer = new THREE.WebGLRenderer({ antialias: true });
				renderer.setSize( window.innerWidth, window.innerHeight );
				
				
				camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
				camera.position.z = 10;//sets up camera

				scene = new THREE.Scene();//scene setup

				t = 0;
				var PI2 = Math.PI * 2;
	
				var light = new THREE.AmbientLight( 0x404040 );
				scene.add( light );
				
	   			map = THREE.ImageUtils.loadTexture( "arrowup.svg" );
	            smaterial = new THREE.SpriteMaterial( { map: map, color:0xffffff} );
	            sprite = new THREE.Sprite( smaterial );
	            sprite.scale.divideScalar(2);
	            spriteGroup = new THREE.Object3D();
	            scene.add(spriteGroup);
	            renderer.setClearColor(0xededed);
	            

	            
	            createStuff();
	            setInterval(function(){
	            	cube.material.color.offsetHSL(0.001,0,0);
	            },10);
			}
			
			function updateArrows(){
				for(var i = 0; i < spriteGroup.children.length; i++){
					var sp = spriteGroup.children[i];
					sp.rotation = -Math.atan2(xc,yc)
					var x = sp.position.x;
					var y = sp.position.y;
		            		sp.material.rotation = -Math.atan2(eval(vectorFormula[0]),eval(vectorFormula[1]));

				}
			}
			
			function addArrows(){
				spriteGroup.children = [];
				for(var x = -10; x <= 10; x+=0.5)
		            		for(var y = -10; y <= 10; y+=0.5){
			            		var addSprite = sprite.clone();
			            		addSprite.position.x = x;
			            		addSprite.position.y = y;
			            		addSprite.material = smaterial.clone();
			            		xc = eval(vectorFormula[0]);
			            		yc = eval(vectorFormula[1]);
			            		addSprite.material.rotation = -Math.atan2(xc,yc);
			            		spriteGroup.add(addSprite);
		            		}
			}
			
			function createStuff(){
				t = 0;
				vectorFormula[0] = params.x;
				vectorFormula[1] = params.y;
				
				scene.children = [];
				scene.add(spriteGroup)
				addArrows();				

	            var w = params.width;
	            var h = params.height;
	            geometry = new THREE.BoxGeometry( w, h, 0, params.wcs, params.hcs, 0);//10 width and height segments, which means more shit in our geometry which means a better flow

				material = new THREE.MeshBasicMaterial( {color: 0x03A678} );
				cube = new THREE.Mesh( geometry, material );
				cube.position.x += params.offsetX;
				cube.position.y += params.offsetY;
				scene.add( cube );
			}

			function animate(){
				requestAnimationFrame(animate);
				render();
			}

			function render(){
				camera.lookAt(scene.position);
				
				
				if(!pause){
					updateGeometryVertices()
					t+=0.01;
					updateArrows();
				}
				
				renderer.render(scene, camera);
			}
			
			function updateGeometryVertices(){
				for(var vindex in cube.geometry.vertices){
					var vertex = cube.geometry.vertices[vindex];
					var offset = scene.localToWorld(vertex.clone()).add(cube.position);//this gets the vertex's position relative to the scene's origin, which is what we want
					
					var movement = computePoints(offset.x, offset.y);
					var movementVector = new THREE.Vector3(movement[0],movement[1], 0);
					movementVector.divideScalar(params.speed);//we don't want it moving too quickly
					vertex.add(movementVector);//moving the actual thing
				}
				cube.geometry.verticesNeedUpdate = true;

			}
			
			function boxGeo(width,height, hsections, wsections){

					var a = {
						x:-width/2,
						y:-height/2
					}
					
					var b = {
						x:width/2,
						y:height/2
					}
					
					var geometry = new THREE.Geometry();
					
					geometry.vertices.push( new THREE.Vector3( a.x, a.y, 0));
					geometry.vertices.push( new THREE.Vector3( b.x, a.y, 0));
					geometry.vertices.push( new THREE.Vector3( b.x, b.y, 0));
					geometry.vertices.push( new THREE.Vector3( a.x, b.y, 0));

					geometry.faces.push( new THREE.Face3( 0, 1, 2 )); // counter-clockwise winding order
					geometry.faces.push( new THREE.Face3( 0, 2, 3 ));
					
					
					for (var x = -width; x <= width; x+= width / wsections)//now we'll add the little segments
						for (var y = -height; y <= height; y+= height / hsections)
							if ((Math.abs(y) == height || Math.abs(x) == width) && geometry.vertices.indexOf(new THREE.Vector3(x,y,0)) == -1)//if we're on a border position
								geometry.vertices.push(new THREE.Vector3(x,y,0));
					
					geometry.computeFaceNormals();
					geometry.computeVertexNormals();

					return geometry
			}
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
			
			document.addEventListener('keydown', function(event) {
				
				if (event.keyCode === A) {
					adding = true;
					controls.enabled = false;
				}
			});
			
			document.addEventListener('keyup', function(event) {

				if (event.keyCode === A) {
					adding = false;
					controls.enabled = true;
				}
			});
			
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