(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function () {
  var renderer, scene, camera, controls, floor;
  var raycaster = new THREE.Raycaster();
  var black = new THREE.Color('black'),
      white = new THREE.Color('white'),
      green = new THREE.Color(0x00ff00),
      red = new THREE.Color('#ED0000');
  var faceMaterial = new THREE.MeshBasicMaterial({
    color: red,
    transparent: true,
    opacity: .2,
    side: THREE.DoubleSide
  });
  var greenMaterial = new THREE.MeshBasicMaterial({
    color: green
  });
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
    init: function init() {
      var self = this; //self.loadFont();
    },
    begin: function begin() {
      var self = this;
      scene = gfx.setUpScene();
      renderer = gfx.setUpRenderer(renderer);
      camera = gfx.setUpCamera(camera);
      floor = gfx.addFloor(this.settings.floorSize, this.settings.colors.worldColor, this.settings.colors.gridColor);
      controls = gfx.enableControls(controls, renderer, camera);
      gfx.resizeRendererOnWindowResize(renderer, camera);
      gfx.setUpLights();
      gfx.setCameraLocation(camera, self.settings.defaultCameraLocation);
      self.setUpButtons(); //self.vectorField();

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
      };

      animate();
    },
    vectorField: function vectorField() {
      var windowHalfX = window.innerWidth / 2;
      var windowHalfY = window.innerHeight / 2;
      var particleMaterial; //an example particle material to use

      var t = 0; //increases each call of render

      var pause = false;
      init();
      animate();

      function computePoints(x, y) {
        //outputs vector based on vectorformula
        return [eval(vectorFormula[0]), eval(vectorFormula[1])];
      }

      function init() {
        var gui = new dat.GUI({
          height: 5 * 32 - 1
        });

        var Params = function Params() {
          this.x = 'Math.sin(t*10)+y';
          this.y = 'Math.cos(t*10)-x';
          this.width = 3;
          this.height = 1;
          this.offsetX = 2;
          this.offsetY = -1;
          this.wcs = 10;
          this.hcs = 10;
          this.speed = 4;

          this.pause = function () {
            pause = !pause;
          };

          this.restart = function () {
            createStuff();
          };
        };

        params = new Params();
        gui.add(params, "x").name("X Equation").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "y").name("Y Equation").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "width").name("Width").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "height").name("Height").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "wcs").name("Width Cross Sections").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "hcs").name("Height Cross Sections").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "offsetX").name("Shape's X Offset").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "offsetY").name("Shape's Y Offset").onFinishChange(function () {
          createStuff();
        });
        gui.add(params, "speed").name("Slowness");
        gui.add(params, "pause").name("Pause");
        gui.add(params, "restart").name("Restart");
        renderer = new THREE.WebGLRenderer({
          antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
        camera.position.z = 10; //sets up camera

        scene = new THREE.Scene(); //scene setup

        t = 0;
        var PI2 = Math.PI * 2;
        var light = new THREE.AmbientLight(0x404040);
        scene.add(light);
        map = THREE.ImageUtils.loadTexture("arrowup.svg");
        smaterial = new THREE.SpriteMaterial({
          map: map,
          color: 0xffffff
        });
        sprite = new THREE.Sprite(smaterial);
        sprite.scale.divideScalar(2);
        spriteGroup = new THREE.Object3D();
        scene.add(spriteGroup);
        renderer.setClearColor(0xededed);
        createStuff();
        setInterval(function () {
          cube.material.color.offsetHSL(0.001, 0, 0);
        }, 10);
      }

      function updateArrows() {
        for (var i = 0; i < spriteGroup.children.length; i++) {
          var sp = spriteGroup.children[i];
          sp.rotation = -Math.atan2(xc, yc);
          var x = sp.position.x;
          var y = sp.position.y;
          sp.material.rotation = -Math.atan2(eval(vectorFormula[0]), eval(vectorFormula[1]));
        }
      }

      function addArrows() {
        spriteGroup.children = [];

        for (var x = -10; x <= 10; x += 0.5) {
          for (var y = -10; y <= 10; y += 0.5) {
            var addSprite = sprite.clone();
            addSprite.position.x = x;
            addSprite.position.y = y;
            addSprite.material = smaterial.clone();
            xc = eval(vectorFormula[0]);
            yc = eval(vectorFormula[1]);
            addSprite.material.rotation = -Math.atan2(xc, yc);
            spriteGroup.add(addSprite);
          }
        }
      }

      function createStuff() {
        t = 0;
        vectorFormula[0] = params.x;
        vectorFormula[1] = params.y;
        scene.children = [];
        scene.add(spriteGroup);
        addArrows();
        var w = params.width;
        var h = params.height;
        geometry = new THREE.BoxGeometry(w, h, 0, params.wcs, params.hcs, 0); //10 width and height segments, which means more shit in our geometry which means a better flow

        material = new THREE.MeshBasicMaterial({
          color: 0x03A678
        });
        cube = new THREE.Mesh(geometry, material);
        cube.position.x += params.offsetX;
        cube.position.y += params.offsetY;
        scene.add(cube);
      }

      function animate() {
        requestAnimationFrame(animate);
        render();
      }

      function render() {
        camera.lookAt(scene.position);

        if (!pause) {
          updateGeometryVertices();
          t += 0.01;
          updateArrows();
        }

        renderer.render(scene, camera);
      }

      function updateGeometryVertices() {
        for (var vindex in cube.geometry.vertices) {
          var vertex = cube.geometry.vertices[vindex];
          var offset = scene.localToWorld(vertex.clone()).add(cube.position); //this gets the vertex's position relative to the scene's origin, which is what we want

          var movement = computePoints(offset.x, offset.y);
          var movementVector = new THREE.Vector3(movement[0], movement[1], 0);
          movementVector.divideScalar(params.speed); //we don't want it moving too quickly

          vertex.add(movementVector); //moving the actual thing
        }

        cube.geometry.verticesNeedUpdate = true;
      }

      function boxGeo(width, height, hsections, wsections) {
        var a = {
          x: -width / 2,
          y: -height / 2
        };
        var b = {
          x: width / 2,
          y: height / 2
        };
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(a.x, a.y, 0));
        geometry.vertices.push(new THREE.Vector3(b.x, a.y, 0));
        geometry.vertices.push(new THREE.Vector3(b.x, b.y, 0));
        geometry.vertices.push(new THREE.Vector3(a.x, b.y, 0));
        geometry.faces.push(new THREE.Face3(0, 1, 2)); // counter-clockwise winding order

        geometry.faces.push(new THREE.Face3(0, 2, 3));

        for (var x = -width; x <= width; x += width / wsections) {
          //now we'll add the little segments
          for (var y = -height; y <= height; y += height / hsections) {
            if ((Math.abs(y) == height || Math.abs(x) == width) && geometry.vertices.indexOf(new THREE.Vector3(x, y, 0)) == -1) //if we're on a border position
              geometry.vertices.push(new THREE.Vector3(x, y, 0));
          }
        }

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        return geometry;
      }
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
      var esc = 27;
      var A = 65;
      document.addEventListener('keydown', function (event) {
        if (event.keyCode === A) {
          adding = true;
          controls.enabled = false;
        }
      });
      document.addEventListener('keyup', function (event) {
        if (event.keyCode === A) {
          adding = false;
          controls.enabled = true;
        }
      });

      var onMouseMove = function onMouseMove(event) {
        mouse.x = event.clientX / window.innerWidth * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', onMouseMove, false);
      document.querySelector('canvas').addEventListener('click', function (event) {});
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
          axisLength: 10
        },
        font: {
          enable: true,
          fontStyle: {
            font: null,
            size: 2,
            height: 0,
            curveSegments: 1
          }
        },
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
      addFloor: function addFloor(size, worldColor, gridColor) {
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
        scene.background = worldColor; //scene.fog = new THREE.FogExp2(new THREE.Color('black'), 0.002);

        return plane;
      },
      createVector: function createVector(pt1, pt2) {
        return new THREE.Vector3(pt2.x - pt1.x, pt2.y - pt1.y, pt2.z - pt1.z);
      },
      addVectors: function addVectors(vector1, vector2) {
        return new THREE.Vector3(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z);
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
        var self = this;

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
        color = color || 0xff0000;
        var arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
        scene.add(arrowHelper);
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
      drawLine: function drawLine(pt1, pt2, color) {
        color = color || 0x0000ff;
        var material = new THREE.LineBasicMaterial({
          color: color
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
      getCentroid3D: function getCentroid3D(geometry) {
        // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
        var result = new THREE.Vector3();
        var x = 0,
            y = 0,
            z = 0;

        for (var i = 0; i < geometry.vertices.length; i++) {
          x += geometry.vertices[i].x;
          y += geometry.vertices[i].y;
          z += geometry.vertices[i].z;
        }

        result.x = x / 4;
        result.y = y / 4;
        result.z = z / 4;
        return result;
      },
      getCentroid2D: function getCentroid2D(geometry) {
        // Calculating centroid of a tetrahedron: https://www.youtube.com/watch?v=Infxzuqd_F4
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
      getAngleBetweenVectors: function getAngleBetweenVectors(vector1, vector2) {
        var dot = vector1.dot(vector2);
        var length1 = vector1.length();
        var length2 = vector2.length();
        var angle = Math.acos(dot / (length1 * length2));
        return angle;
      },
      calculateAngle: function calculateAngle(endpoint1, endpoint2, vertex) {
        var vector1 = new THREE.Vector3(endpoint1.x - vertex.x, endpoint1.y - vertex.y, endpoint1.z - vertex.z);
        var vector2 = new THREE.Vector3(endpoint2.x - vertex.x, endpoint2.y - vertex.y, endpoint2.z - vertex.z);
        var angle = vector1.angleTo(vector2);
        return angle;
      }
    };
  }();

  module.exports = window.gfx;
})();

},{}],3:[function(require,module,exports){
"use strict";

var VectorField = require('./components/vector-field.js');

var Utilities = require('./utils.js');

var Graphics = require('./graphics.js');

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    VectorField().init();
  });
})();

},{"./components/vector-field.js":1,"./graphics.js":2,"./utils.js":4}],4:[function(require,module,exports){
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
