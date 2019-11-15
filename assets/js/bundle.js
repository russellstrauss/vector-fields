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
    color: 0x00ff00,
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
        gridColor: new THREE.Color('#111'),
        arrowColor: red
      },
      floorSize: 100,
      zBuffer: .1
    },
    init: function init() {
      var self = this;
      self.loadFont();
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
      self.setUpButtons();
      self.displayGeometries();

      var animate = function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
      };

      animate();
    },
    displayGeometries: function displayGeometries() {
      var self = this;
      var geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(5, self.settings.zBuffer, 10), new THREE.Vector3(-10, self.settings.zBuffer, 5), new THREE.Vector3(10, self.settings.zBuffer, 0));
      geometry.faces.push(new THREE.Face3(0, 1, 2));
      var geometry = new THREE.Geometry();
      var a = new THREE.Vector3(5, self.settings.zBuffer, 10);
      var b = new THREE.Vector3(-10, self.settings.zBuffer, 5);
      var c = new THREE.Vector3(10, self.settings.zBuffer, 0);
      var Va = new THREE.Vector3(6, 0, 10);
      var Vb = new THREE.Vector3(-3, 0, 4);
      var Vc = new THREE.Vector3(5, 0, 6);
      var triangle = new THREE.Triangle(a, b, c);
      triangle.Va = Va;
      triangle.Vb = Vb;
      triangle.Vc = Vc;
      var normal = new THREE.Vector3(0, 0, 0);
      normal = triangle.getNormal(normal);
      geometry.vertices.push(triangle.a);
      geometry.vertices.push(triangle.b);
      geometry.vertices.push(triangle.c);
      geometry.faces.push(new THREE.Face3(0, 1, 2, normal)); // gfx.showVector(triangle.Va, triangle.a);
      // gfx.showVector(triangle.Vb, triangle.b);
      // gfx.showVector(triangle.Vc, triangle.c);
      // let mesh = new THREE.Mesh(geometry, faceMaterial);
      // scene.add(mesh);
      // var P = gfx.movePoint(triangle.a, new THREE.Vector3(-1, 0, -2));
      // gfx.showPoint(gfx.movePoint(P, new THREE.Vector3(0, .5, 0)));
      // let bary = new THREE.Vector3(0, 0, 0);
      // bary = triangle.getBarycoord(P, bary);
      // console.log(bary.x);
      // let baryLabel = 'Bary(' + bary.x.toFixed(1).toString() + ', ' + bary.y.toFixed(1).toString() + ', ' + bary.z.toFixed(1).toString() + ')';
      // gfx.labelPoint(gfx.movePoint(P, new THREE.Vector3(1, .5, 0)), baryLabel, 0x0000ff);
      // gfx.labelPoint(gfx.movePoint(triangle.a, new THREE.Vector3(1, 0, 0)), 'A(' + triangle.a.x.toString() + ', ' + triangle.a.y.toString() + ', ' + triangle.a.z.toString() + ')');
      // gfx.labelPoint(gfx.movePoint(triangle.b, new THREE.Vector3(-8, 0, 0)), 'B(' + triangle.b.x.toString() + ', ' + triangle.b.y.toString() + ', ' + triangle.b.z.toString() + ')');
      // gfx.labelPoint(gfx.movePoint(triangle.c, new THREE.Vector3(.5, 0, 0)), 'C(' + triangle.c.x.toString() + ', ' + triangle.c.y.toString() + ', ' + triangle.c.z.toString() + ')');
      // gfx.labelPoint(gfx.movePoint(P, new THREE.Vector3(0, 1, -.75)), 'P');
      // gfx.labelPoint(gfx.movePoint(triangle.a, Va).multiplyScalar(1.05), 'Va');
      // gfx.labelPoint(gfx.movePoint(triangle.b, Vb).multiplyScalar(1.2), 'Vb');
      //gfx.labelPoint(gfx.movePoint(triangle.c, Vc).multiplyScalar(1.05), 'Vc');

      self.pointCloud();
    },
    pointCloud: function pointCloud() {
      var self = this;
      var y = self.settings.zBuffer;
      var range = [-10, 10];
      var density = 2;

      for (var x = range[0]; x <= range[1]; x += density) {
        for (var _y = 0; _y <= range[1] * 2; _y += density) {
          for (var z = range[0]; z <= range[1]; z += density) {
            var vectorOrigin = new THREE.Vector3(x, _y, z);
            var origin = new THREE.Vector3(0, 0, 0);
            gfx.showPoint(origin, 0x00ff00);
            gfx.labelPoint(gfx.movePoint(origin, new THREE.Vector3(.25, 0, -.25)), 'O', 0x00ff00); //gfx.showPoint(vectorOrigin, 0x0000ff);

            gfx.showVector(self.vectorInField(vectorOrigin), vectorOrigin);
          }
        }
      }
    },
    vectorInField: function vectorInField(pt) {
      //field F = (−y, xy, z);
      //let result = new THREE.Vector3(-pt.y, pt.x * pt.y, pt.z);
      // field F = xi
      //let result = new THREE.Vector3(pt.x, 0, 0);
      // field F = xi + zk
      //let result =  new THREE.Vector3(pt.x + pt.z, 0, pt.x + pt.z);
      // field F = -zi + xk
      var result = new THREE.Vector3(-pt.z, 0, pt.x);
      return result;
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
            size: .75,
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
        if (vector.length() > 0) {
          color = color || 0xff0000;
          var arrowHelper = new THREE.ArrowHelper(vector, origin, vector.length(), color);
          scene.add(arrowHelper);
        } else {
          gfx.showPoint(origin, color);
        }
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
