var socket = io();


var form = document.createElement('form');
form.setAttribute('action', '/');
form.setAttribute('method', 'POST');
form.setAttribute('encType', 'multipart/form-data');
var upload = document.createElement('input');
upload.setAttribute('type', 'file');
upload.setAttribute('name', 'file');
var submit = document.createElement('input');
submit.setAttribute('type', 'submit');

form.className = 'form';
document.body.appendChild(form);
form.appendChild(upload);
form.appendChild(submit);


form.onsubmit = function(e) {
    e.preventDefault();
    var xhr = new XMLHttpRequest();
    var data = new FormData();
    data.append('file', upload.files[0]);
    xhr.open('POST', '/');
    xhr.send(data);
}

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.up.set(0, 0, 1);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls( camera );


var horPlaneGeometry = new THREE.PlaneBufferGeometry(6, 6, 10, 10);
var horPlaneMaterial = new THREE.MeshLambertMaterial({color: 0x4553c1, transparent:true, opacity:.1, side: THREE.DoubleSide});
var horPlane = new THREE.Mesh(horPlaneGeometry, horPlaneMaterial);

scene.add(horPlane);

// var verPlaneGeometry = new THREE.PlaneGeometry(6000, 6000, 10, 10);
// var verPlaneMaterial = new THREE.MeshLambertMaterial({color: 0x454545, transparent: true, side: THREE.DoubleSide});
// var verPlane = new THREE.Mesh(verPlaneGeometry, verPlaneMaterial);
// verPlane.rotation.y = Math.PI / 2;

//scene.add(verPlane);

//var planes = [horPlane, verPlane];

var axes = new THREE.AxesHelper( 5 );
scene.add( axes  );






var light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );
var loader = new THREE.OBJLoader();
var models = [];
var point = null;
var curModel;
var obj;
// loader.load(

//  'models/cube.obj',

//  function (object) {
//     object.traverse( function( model ) {
//         if( model instanceof THREE.Mesh ) {

//             model.material.side = THREE.DoubleSide;
//             model.material.color = new THREE.Color(0xcccccc);
//             model.material.wireframe = true;
//             var geometry = new THREE.Geometry ();
//             geometry.fromBufferGeometry (model.geometry);
//             geometry.mergeVertices();
//             //geometry.computeVertexNormals ();
//             models.push(model);
//             model.geometry = geometry;
//         }
//         scene.add(object);
//     });
    
    
//  });




var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var points = [];
var geometry;
var index;

function onMouseClick(e) {
    var point = null;
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    var modelIntersects = raycaster.intersectObjects(models);
    var pointIntersects = raycaster.intersectObjects(points);
    if(pointIntersects.length > 0) {
        var dragControls = new THREE.DragControls(points, camera, renderer.domElement);
        dragControls.addEventListener('dragstart', function () {
            controls.enabled = false;
        });
        dragControls.addEventListener('drag', function() {
            point = pointIntersects[0].object;
            geometry.vertices[point.index].copy(point.position);
            geometry.verticesNeedUpdate = true;
        })
        dragControls.addEventListener('dragend', function () {
            controls.enabled = true;
        });
    } else if (modelIntersects.length > 0) {
        point = getPoint(modelIntersects);
        points.push(point);
        scene.add(point);
    }
}

function getPoint(modelIntersects) {
    var face = modelIntersects[0].face.clone();
    geometry = modelIntersects[0].object.geometry;
    var pointCoords = modelIntersects[0].point;
    var faceVertices = [];
    var distance;
    geometry.vertices.forEach(function(item, i) {
        if(i == face.a || i == face.b || i == face.c) {
            var selItem = item.clone();
            selItem.index = i;
            faceVertices.push(selItem); 
        }
    })
    faceVertices.forEach(function(item) {
        item.distance = pointCoords.distanceTo(item);
    })
    faceVertices.sort(function(a, b) {
        return a.distance - b.distance;
    })
    point = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x404040}));
    point.name = 'point';
    point.position.copy(faceVertices[0]);
    point.index = faceVertices[0].index;
    return point;
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('mousedown', onMouseClick, false);

render();