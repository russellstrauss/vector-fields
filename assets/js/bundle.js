(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function () {
  var message = document.querySelector('.message');
  var settings = {
    defaultCameraLocation: {
      x: 0,
      y: 75,
      z: 0
    },
    messageDuration: 2000,
    arrowHeadSize: 1.5,
    colors: {
      // worldColor: new THREE.Color('#fff'),
      worldColor: new THREE.Color('#000'),
      gridColor: new THREE.Color('#111'),
      arrowColor: red
    },
    floorSize: 100,
    dragHandleSize: 3
  };
  var renderer, scene, camera, controls, floor;
  var raycaster = new THREE.Raycaster();
  var black = new THREE.Color('black'),
      white = new THREE.Color('white'),
      green = new THREE.Color(0x00ff00),
      red = new THREE.Color('#ED0000');
  var faceMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide,
    wireframe: true
  });
  var invisibleMaterial = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0
  });
  var greenMaterial = new THREE.MeshBasicMaterial({
    color: green
  });
  var mouse = new THREE.Vector2(); // var stats = new Stats();

  var blue = 0x0000ff;
  var draggable = [],
      dragHandleGeometry = new THREE.BoxGeometry(settings.dragHandleSize, settings.dragHandleSize, settings.dragHandleSize);
  var triangle, geometry;
  var triangles = [];
  return {
    init: function init() {
      var self = this;
      self.loadFont();
    },
    begin: function begin() {
      var self = this;
      scene = gfx.setUpScene();
      renderer = gfx.setUpRenderer(renderer);
      camera = gfx.setUpCamera(camera);
      floor = gfx.addGrid(settings.floorSize, settings.colors.worldColor, settings.colors.gridColor);
      controls = gfx.enableControls(controls, renderer, camera);
      gfx.resizeRendererOnWindowResize(renderer, camera);
      gfx.setUpLights();
      gfx.setCameraLocation(camera, settings.defaultCameraLocation);
      self.addStars();
      self.setUpButtons();
      self.addVertexColors();
      self.loadModel();

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
      };

      animate();
    },
    addStars: function addStars() {
      var geometry = new THREE.BufferGeometry();
      var vertices = [];

      for (var i = 0; i < 10000; i++) {
        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x

        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y

        vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      var particles = new THREE.Points(geometry, new THREE.PointsMaterial({
        color: 0x888888
      }));
      scene.add(particles);
    },
    colorTest: function colorTest() {
      var geometry = new THREE.BufferGeometry(); // create a simple square shape. We duplicate the top left and bottom right
      // vertices because each vertex needs to appear once per triangle.

      var vertices = new Float32Array([-1.0, -1.0, 1.0, // bottom left
      1.0, -1.0, 1.0, // bottom right
      1.0, 1.0, 1.0, // top right
      1.0, 1.0, 1.0, // top right?
      -1.0, 1.0, 1.0, // top left?
      -1.0, -1.0, 1.0 // bottom left?
      ]);
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); // itemSize = 3 because there are 3 values (components) per vertex
      // Each "row" represents the vertex color for a single vertex
      // "color" is determined by the intensity of the 3 color channels (red, green, blue)
      // Makes sense to store as 8 bit unsigned integers (0-255)

      var colors = new Uint8Array([255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 255, 0, 255, 0, 255, 0, 0]); // Don't forget to normalize the array! (third param = true)

      geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3, true)); // it is also possible to use the vertices array here, the result is kinda cool
      // I wonder how negative RGB values are interpreted? or values that exceed 1?
      //geometry.addAttribute( 'color', new THREE.BufferAttribute( vertices, 3) );
      // Even though color is specified in the geometry, a material is still required

      var material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.VertexColors,
        side: THREE.DoubleSide
      });
      var plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
    },
    loadModel: function loadModel(model) {
      var self = this;
    },
    pointCloud: function pointCloud(id) {
      var self = this;
      var y = gfx.appSettings.zBuffer;
      var range = [-10, 10];
      var density = 3;

      for (var x = range[0]; x <= range[1]; x += density) {
        for (var _y = 0; _y <= range[1] * 2; _y += density) {
          for (var z = range[0]; z <= range[1]; z += density) {
            var point = new THREE.Vector3(x, _y, z);
          }
        }
      }
    },
    reset: function reset() {
      message.textContent = '';

      for (var i = scene.children.length - 1; i >= 0; i--) {
        var obj = scene.children[i];
        if (!draggable.includes(obj)) scene.remove(obj);
      }

      floor = gfx.addFloor(settings.floorSize, settings.colors.worldColor, settings.colors.gridColor);
    },
    loadFont: function loadFont() {
      var self = this;
      var loader = new THREE.FontLoader();
      var fontPath = '';
      fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';
      loader.load(fontPath, function (font) {
        // success event
        gfx.appSettings.font.fontStyle.font = font;
        self.begin();
        if (gfx.appSettings.axesHelper.activateAxesHelper) gfx.labelAxes();
      }, function (event) {}, // in progress event
      function (event) {
        // error event
        gfx.appSettings.font.enable = false;
        self.begin();
      });
    },
    setUpButtons: function setUpButtons() {
      var self = this;
      var message = document.getElementById('message');

      var onMouseMove = function onMouseMove(event) {
        mouse.x = event.clientX / window.innerWidth * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', onMouseMove, false);
      document.querySelector('canvas').addEventListener('click', function (event) {});
      document.addEventListener('keyup', function (event) {
        var one = 49;
        var two = 50;
        var three = 51;
        var four = 52;
        var r = 82;
        var space = 32;

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
    },
    addVertexColors: function addVertexColors() {
      var self = this;
      var loader = new THREE.OBJLoader();
      loader.load('./assets/obj/bunny.obj', function (obj) {
        // loaded
        var geometry = obj.children[0].geometry;
        var color1 = new THREE.Color(1, 0, 0);
        var color2 = new THREE.Color(0, 1, 0);
        var colors = [];
        var vertexCount = geometry.attributes.position.count;

        for (var _i = 0; _i < vertexCount; _i++) {
          var interpolator = _i / (vertexCount - 1); // colors[i] = color1.clone().lerp(color2, interpolator);
          // colors[i] = self.rgbStringToColor(d3.interpolateViridis(interpolator));

          colors[_i] = self.rgbStringToColor(d3.interpolateYlGnBu(interpolator));
        }

        var reverseColors = true;
        if (reverseColors) colors.reverse();
        var arrayBuffer = new ArrayBuffer(vertexCount * 16); // create a generic buffer of binary data (a single particle has 16 bytes of data)

        var interleavedFloat32Buffer = new Float32Array(arrayBuffer); // the typed arrays share the same buffer

        var interleavedUint8Buffer = new Uint8Array(arrayBuffer);
        var color = new THREE.Color();

        for (var i = 0; i < interleavedFloat32Buffer.length; i += 4) {
          var vertex = i / 4;
          color = colors[vertex];
          var j = (i + 3) * 4;
          interleavedUint8Buffer[j + 0] = color.r * 255;
          interleavedUint8Buffer[j + 1] = color.g * 255;
          interleavedUint8Buffer[j + 2] = color.b * 255;
        }

        var interleavedBuffer32 = new THREE.InterleavedBuffer(interleavedFloat32Buffer, 4),
            interleavedBuffer8 = new THREE.InterleavedBuffer(interleavedUint8Buffer, 16);
        geometry.setAttribute('color', new THREE.InterleavedBufferAttribute(interleavedBuffer8, 3, 12, true));
        camera.position.set(-115, 65, 80);
        var material = new THREE.PointsMaterial({
          size: 1 / 3,
          vertexColors: THREE.VertexColors
        });
        var mesh = new THREE.Points(geometry, material); // bunny

        mesh.scale.set(500, 500, 500);
        mesh.position.y -= 16.5;
        scene.add(mesh);
      }, function (xhr) {// in progress
      }, function (error) {
        // on failure
        console.log('Error loadModel(): ', error);
      });
    },
    rgbStringToColor: function rgbStringToColor(rgbString) {
      rgbString = rgbString.replace('rgb(', '').replace(')', '').replace(' ', '').split(',');
      return new THREE.Color(rgbString[0] / 255, rgbString[1] / 255, rgbString[2] / 255);
    },
    hexStringToColor: function hexStringToColor(hexString) {
      return new THREE.Color().set(hexString);
    }
  };
};

},{}],2:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;
  var scene;

  window.gfx = function () {
    return {
      appSettings: {
        activateLightHelpers: false,
        axesHelper: {
          activateAxesHelper: false,
          axisLength: 50
        },
        font: {
          enable: true,
          fontStyle: {
            font: null,
            size: 5,
            height: 0,
            curveSegments: 1
          }
        },
        zBuffer: .1,
        errorLogging: false
      },
      activateAxesHelper: function activateAxesHelper() {
        var self = this;
        var axesHelper = new THREE.AxesHelper(gfx.appSettings.axesHelper.axisLength);
        scene.add(axesHelper);
      },
      activateLightHelpers: function activateLightHelpers(lights) {
        for (var i = 0; i < lights.length; i++) {
          var helper = new THREE.DirectionalLightHelper(lights[i], 5, 0x00000);
          scene.add(helper);
        }
      },
      addGrid: function addGrid(size, worldColor, gridColor) {
        var planeGeometry = new THREE.PlaneBufferGeometry(size, size);
        planeGeometry.rotateX(-Math.PI / 2);
        var planeMaterial = new THREE.ShadowMaterial();
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.y = -1;
        plane.receiveShadow = true;
        scene.add(plane);
        var helper = new THREE.GridHelper(size, 20, gridColor, gridColor);
        helper.material.opacity = .75;
        helper.material.transparent = true;
        scene.add(helper);
        var wall = new THREE.GridHelper(size, 20, gridColor, gridColor);
        wall.material.opacity = .75;
        wall.material.transparent = true;
        var left = wall.clone();
        left.rotation.x = Math.PI / 2;
        left.position.set(0, 50, -50);
        scene.add(left);
        var right = helper.clone();
        right.rotation.set(Math.PI / 2, 0, Math.PI / 2);
        right.position.set(50, 50, 0);
        scene.add(right);
        var zBuff = gfx.appSettings.zBuffer;
        var white = 0xffffff;
        gfx.drawLine(new THREE.Vector3(-50, 0, -50 + zBuff), new THREE.Vector3(-50, 75, -50 + zBuff), white, .5);
        gfx.drawLine(new THREE.Vector3(50, 0, -50 + zBuff), new THREE.Vector3(50, 75, -50 + zBuff), white, .5);
        gfx.drawLine(new THREE.Vector3(50, 0, 50 + zBuff), new THREE.Vector3(50, 75, 50 + zBuff), white, .5);
        scene.background = worldColor; //scene.fog = new THREE.FogExp2(new THREE.Color('black'), 0.002);

        return plane;
      },
      createVector: function createVector(pt1, pt2) {
        return new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z);
      },
      addVectors: function addVectors(vector1, vector2, vector3) {
        vector3 = vector3 || new THREE.Vector3(0, 0, 0);
        return new THREE.Vector3(vector1.x + vector2.x + vector3.x, vector1.y + vector2.y + vector3.y, vector1.z + vector2.z + vector3.z);
      },
      sortVerticesClockwise: function sortVerticesClockwise(geometry) {
        var self = this;
        var midpoint = new THREE.Vector3(0, 0, 0);
        geometry.vertices.forEach(function (vertex) {
          midpoint.x += vertex.x - .001; // very slight offset for the case where polygon is a quadrilateral so that not all angles are equal

          midpoint.y += vertex.y;
          midpoint.z += vertex.z - .001;
        });
        midpoint.x /= geometry.vertices.length;
        midpoint.y /= geometry.vertices.length;
        midpoint.z /= geometry.vertices.length;
        var sorted = geometry.clone();
        sorted.vertices.forEach(function (vertex) {
          var vec = gfx.createVector(midpoint, vertex);
          var vecNext = gfx.createVector(midpoint, utils.next(sorted.vertices, vertex));
          var angle = gfx.getAngleBetweenVectors(vec, vecNext);
          vertex.angle = angle;
        });
        sorted.vertices.sort(function (a, b) {
          return a.angle - b.angle;
        });
        return sorted;
      },
      createLine: function createLine(pt1, pt2) {
        var geometry = new THREE.Geometry();
        geometry.vertices.push(pt1);
        geometry.vertices.push(pt2);
        return geometry;
      },
      intersection: function intersection(line1, line2) {
        var pt1 = line1.vertices[0];
        var pt2 = line1.vertices[1];
        var pt3 = line2.vertices[0];
        var pt4 = line2.vertices[1];
        var lerpLine1 = ((pt4.x - pt3.x) * (pt1.z - pt3.z) - (pt4.z - pt3.z) * (pt1.x - pt3.x)) / ((pt4.z - pt3.z) * (pt2.x - pt1.x) - (pt4.x - pt3.x) * (pt2.z - pt1.z));
        var lerpLine2 = ((pt2.x - pt1.x) * (pt1.z - pt3.z) - (pt2.z - pt1.z) * (pt1.x - pt3.x)) / ((pt4.z - pt3.z) * (pt2.x - pt1.x) - (pt4.x - pt3.x) * (pt2.z - pt1.z));
        var x = pt1.x + lerpLine1 * (pt2.x - pt1.x);
        var z = pt1.z + lerpLine1 * (pt2.z - pt1.z);
        return new THREE.Vector3(x, 0, z);
      },
      getMagnitude: function getMagnitude(vector) {
        var magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2) + Math.pow(vector.z, 2));
        return magnitude;
      },
      getMidpoint: function getMidpoint(pt1, pt2) {
        var midpoint = new THREE.Vector3();
        midpoint.x = (pt1.x + pt2.x) / 2;
        midpoint.y = (pt1.y + pt2.y) / 2;
        midpoint.z = (pt1.z + pt2.z) / 2;
        return midpoint;
      },
      isRightTurn: function isRightTurn(startingPoint, turningPoint, endingPoint) {
        // This might only work if vectors are flat on the ground since I am using y-component to determine sign
        var segment1 = gfx.createVector(startingPoint, turningPoint);
        var segment2 = gfx.createVector(turningPoint, endingPoint);
        var result = new THREE.Vector3();
        result.crossVectors(segment1, segment2);
        return result.y > 0;
      },
      setUpScene: function setUpScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        if (gfx.appSettings.axesHelper.activateAxesHelper) {
          gfx.activateAxesHelper();
        }

        return scene;
      },
      setUpRenderer: function setUpRenderer(renderer) {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        return renderer;
      },
      setUpCamera: function setUpCamera(camera) {
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        return camera;
      },
      showPoints: function showPoints(geometry, color, opacity) {
        for (var i = 0; i < geometry.vertices.length; i++) {
          gfx.showPoint(geometry.vertices[i], color, opacity);
        }
      },
      showPoint: function showPoint(pt, color, opacity) {
        color = color || 0xff0000;
        opacity = opacity || 1;
        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3(pt.x, pt.y, pt.z));
        var dotMaterial = new THREE.PointsMaterial({
          size: 10,
          sizeAttenuation: false,
          color: color,
          opacity: opacity,
          transparent: true
        });
        var dot = new THREE.Points(dotGeometry, dotMaterial);
        scene.add(dot);
        return dot;
      },
      showVector: function showVector(vector, origin, color) {
        var arrowHelper;

        if (vector.length() > 0) {
          color = color || 0xff0000;
          arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
          scene.add(arrowHelper);
        } else {
          gfx.showPoint(origin, color);
        }

        return arrowHelper;
      },
      updateArrow: function updateArrow(arrow, origin, newDirection) {
        var direction = gfx.createVector(origin, newDirection);
        arrow.setDirection(direction);
        arrow.setLength(direction.length()); // Why?

        return arrow;
      },

      /* 	Inputs: pt - point in space to label, in the form of object with x, y, and z properties; label - text content for label; color - optional */
      labelPoint: function labelPoint(pt, label, color) {
        var self = this;

        if (gfx.appSettings.font.enable) {
          color = color || 0xff0000;
          var textGeometry = new THREE.TextGeometry(label, self.appSettings.font.fontStyle);
          var textMaterial = new THREE.MeshBasicMaterial({
            color: color
          });
          var mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.rotateX(-Math.PI / 2);
          textGeometry.translate(pt.x, pt.y, pt.z);
          scene.add(mesh);
        }
      },
      drawLine: function drawLine(pt1, pt2, color, alpha) {
        color = color || 0x0000ff;
        alpha = alpha || 1;
        var material = new THREE.LineBasicMaterial({
          color: color,
          opacity: alpha,
          transparent: true
        });
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
        geometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
        var line = new THREE.Line(geometry, material);
        scene.add(line);
      },
      getDistance: function getDistance(pt1, pt2) {
        // create point class?
        var squirt = Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2) + Math.pow(pt2.z - pt1.z, 2);
        return Math.sqrt(squirt);
      },
      labelAxes: function labelAxes() {
        var self = this;

        if (gfx.appSettings.font.enable) {
          var textGeometry = new THREE.TextGeometry('Y', gfx.appSettings.font.fontStyle);
          var textMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00
          });
          var mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(0, gfx.appSettings.axesHelper.axisLength, 0);
          scene.add(mesh);
          textGeometry = new THREE.TextGeometry('X', gfx.appSettings.font.fontStyle);
          textMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
          });
          mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(gfx.appSettings.axesHelper.axisLength, 0, 0);
          scene.add(mesh);
          textGeometry = new THREE.TextGeometry('Z', gfx.appSettings.font.fontStyle);
          textMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff
          });
          mesh = new THREE.Mesh(textGeometry, textMaterial);
          textGeometry.translate(0, 0, gfx.appSettings.axesHelper.axisLength);
          scene.add(mesh);
        }
      },
      setCameraLocation: function setCameraLocation(camera, pt) {
        camera.position.x = pt.x;
        camera.position.y = pt.y;
        camera.position.z = pt.z;
      },
      resizeRendererOnWindowResize: function resizeRendererOnWindowResize(renderer, camera) {
        window.addEventListener('resize', utils.debounce(function () {
          if (renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
          }
        }, 250));
      },
      resetScene: function resetScene(scope) {
        scope.settings.stepCount = 0;

        for (var i = scene.children.length - 1; i >= 0; i--) {
          var obj = scene.children[i];
          scene.remove(obj);
        }

        gfx.addFloor();
        scope.addTetrahedron();
        gfx.setUpLights();
        gfx.setCameraLocation(camera, self.settings.defaultCameraLocation);
      },
      enableControls: function enableControls(controls, renderer, camera) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled

        controls.dampingFactor = 0.05;
        controls.zoomSpeed = 2;
        controls.enablePan = !utils.mobile();
        controls.panSpeed = 1.5;
        controls.minDistance = 10;
        controls.maxDistance = 800;
        controls.maxPolarAngle = Math.PI / 2;
        return controls;
      },
      enableStats: function enableStats(stats) {
        document.body.appendChild(stats.dom);
      },
      setUpLights: function setUpLights() {
        var self = this;
        var lights = [];
        var color = 0xFFFFFF;
        var intensity = 1;
        var light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        lights.push(light);
        var light2 = new THREE.DirectionalLight(color, intensity);
        light2.position.set(0, 2, -8);
        scene.add(light2);
        lights.push(light2);

        if (gfx.appSettings.activateLightHelpers) {
          gfx.activateLightHelpers(lights);
        }
      },
      movePoint: function movePoint(pt, vec) {
        return new THREE.Vector3(pt.x + vec.x, pt.y + vec.y, pt.z + vec.z);
      },
      createTriangle: function createTriangle(pt1, pt2, pt3) {
        // return geometry
        var triangleGeometry = new THREE.Geometry();
        triangleGeometry.vertices.push(new THREE.Vector3(pt1.x, pt1.y, pt1.z));
        triangleGeometry.vertices.push(new THREE.Vector3(pt2.x, pt2.y, pt2.z));
        triangleGeometry.vertices.push(new THREE.Vector3(pt3.x, pt3.y, pt3.z));
        triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));
        triangleGeometry.computeFaceNormals();
        return triangleGeometry;
      },
      getCentroid: function getCentroid(geometry) {
        var result = new THREE.Vector3();
        var x = 0,
            y = 0,
            z = 0;

        for (var i = 0; i < geometry.vertices.length; i++) {
          x += geometry.vertices[i].x;
          y += geometry.vertices[i].y;
          z += geometry.vertices[i].z;
        }

        result.x = x / 3;
        result.y = y / 3;
        result.z = z / 3;
        return result;
      },
      pointInFace: function pointInFace(pt, face) {
        var geometry = new THREE.Geometry();
        var vertices = [face.a, face.b, face.c];
        var angleSum = 0;
        vertices.forEach(function (vertex) {
          geometry.vertices.push(vertex);
        });

        for (var i = 0; i < vertices.length; i++) {
          angleSum += gfx.calculateAngle(geometry.vertices[i], pt, gfx.nextVertex(geometry.vertices[i], geometry));
        }

        return angleSum === Math.PI * 2;
      },
      nextVertex: function nextVertex(currentVertex, geometry) {
        var vertexIndex = geometry.vertices.findIndex(function (element) {
          return element === currentVertex;
        });
        return geometry.vertices[(vertexIndex + 1) % geometry.vertices.length];
      },
      getAngleBetweenVectors: function getAngleBetweenVectors(vector1, vector2) {
        var dot = vector1.dot(vector2);
        var length1 = vector1.length();
        var length2 = vector2.length();
        return Math.acos(dot / (length1 * length2));
      },
      calculateAngle: function calculateAngle(endpoint1, vertex, endpoint2) {
        var vector1 = new THREE.Vector3(endpoint1.x - vertex.x, endpoint1.y - vertex.y, endpoint1.z - vertex.z);
        var vector2 = new THREE.Vector3(endpoint2.x - vertex.x, endpoint2.y - vertex.y, endpoint2.z - vertex.z);
        return vector1.angleTo(vector2);
      }
    };
  }();

  module.exports = window.gfx;
})();

},{}],3:[function(require,module,exports){
"use strict";

var PointCloud = require('./components/point-cloud.js');

var Utilities = require('./utils.js');

var Graphics = require('./graphics.js');

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    PointCloud().init();
  });
})();

},{"./components/point-cloud.js":1,"./graphics.js":2,"./utils.js":4}],4:[function(require,module,exports){
"use strict";

(function () {
  var appSettings;

  window.utils = function () {
    return {
      appSettings: {
        breakpoints: {
          mobileMax: 767,
          tabletMin: 768,
          tabletMax: 991,
          desktopMin: 992,
          desktopLargeMin: 1200
        }
      },
      mobile: function mobile() {
        return window.innerWidth < this.appSettings.breakpoints.tabletMin;
      },
      tablet: function tablet() {
        return window.innerWidth > this.appSettings.breakpoints.mobileMax && window.innerWidth < this.appSettings.breakpoints.desktopMin;
      },
      desktop: function desktop() {
        return window.innerWidth > this.appSettings.breakpoints.desktopMin;
      },
      getBreakpoint: function getBreakpoint() {
        if (window.innerWidth < this.appSettings.breakpoints.tabletMin) return 'mobile';else if (window.innerWidth < this.appSettings.breakpoints.desktopMin) return 'tablet';else return 'desktop';
      },
      debounce: function debounce(func, wait, immediate) {
        var timeout;
        return function () {
          var context = this,
              args = arguments;

          var later = function later() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };

          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      },

      /* Purpose: Detect if any of the element is currently within the viewport */
      anyOnScreen: function anyOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom);
      },

      /* Purpose: Detect if an element is vertically on screen; if the top and bottom of the element are both within the viewport. */
      allOnScreen: function allOnScreen(element) {
        var win = $(window);
        var viewport = {
          top: win.scrollTop(),
          left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();
        var bounds = element.offset();
        bounds.right = bounds.left + element.outerWidth();
        bounds.bottom = bounds.top + element.outerHeight();
        return !(viewport.bottom < bounds.top && viewport.top > bounds.bottom);
      },
      secondsToMilliseconds: function secondsToMilliseconds(seconds) {
        return seconds * 1000;
      },

      /*
      * Purpose: This method allows you to temporarily disable an an element's transition so you can modify its proprties without having it animate those changing properties.
      * Params:
      * 	-element: The element you would like to modify.
      * 	-cssTransformation: The css transformation you would like to make, i.e. {'width': 0, 'height': 0} or 'border', '1px solid black'
      */
      getTransitionDuration: function getTransitionDuration(element) {
        var $element = $(element);
        return utils.secondsToMilliseconds(parseFloat(getComputedStyle($element[0])['transitionDuration']));
      },
      isInteger: function isInteger(number) {
        return number % 1 === 0;
      },
      rotate: function rotate(array) {
        array.push(array.shift());
        return array;
      },
      randomInt: function randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },
      roundHundreths: function roundHundreths(num) {
        return Math.round(num * 100) / 100;
      },
      next: function next(array, currentItem) {
        // function tp prevent index out of bounds. If next is called on last item, the first will be returned
        var itemIndex = array.findIndex(function (element) {
          return element === currentItem;
        });
        return array[(itemIndex + 1) % array.length];
      }
    };
  }();

  module.exports = window.utils;
})();

},{}]},{},[3]);
