<<<<<<< HEAD
﻿// DOM ELEMENTS
// var upload = document.createElement('input');
// upload.setAttribute('type', 'file');
// upload.setAttribute('id', 'upload');
// document.body.appendChild(upload);
// var update = document.createElement('button');
// update.setAttribute('id', 'update');
// document.body.appendChild(update);

var mode = document.createElement('button');
mode.flag = false;
mode.value = 'scaling';
mode.innerHTML = mode.value;
mode.setAttribute('id', 'mode');
document.body.appendChild(mode);

mode.onclick = function(e) {
    mode.flag ? mode.value = 'scaling' : mode.value = 'editing';
    mode.innerHTML = mode.value;
    mode.flag = !mode.flag;
}

// SOCKET
var socket = io();




/////// ADD AFTER CONFIG SAVING NEW MODEL

// var uploader = new SocketIOFileUpload(socket);
// uploader.listenOnInput(document.getElementById("upload"));
// socket.on('onsaved', function(file) {
//     loadModel(file.pathName);
// });

//////////////

/////////// DELETE AFTER CONFIG

var path = 'public/models/cube.obj';


////////////////


/// THREE JS
=======
﻿var socket = io();


var form = document.createElement('form');
form.setAttribute('action', '/');
form.setAttribute('method', 'POST');
form.setAttribute('encType', 'multipart/form-data');
var upload = document.createElement('input');
upload.setAttribute('type', 'file');
upload.setAttribute('id', 'file');
var submit = document.createElement('input');
submit.setAttribute('type', 'submit');

form.className = 'form';
document.body.appendChild(form);
form.appendChild(upload);
form.appendChild(submit);

var uploader = new SocketIOFileUpload(socket);
uploader.listenOnInput(document.getElementById("file"));


form.onsubmit = function(e) {
    // e.preventDefault();
    // var xhr = new XMLHttpRequest();
    // var data = new FormData();
    // data.append('file', upload.files[0]);
    // xhr.open('POST', '/');
    // xhr.send(data);
}

>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb
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
<<<<<<< HEAD
loadModel(path);
=======
>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb
var models = [];
var point = null;
var curModel;
var obj;
<<<<<<< HEAD

function loadModel(path) {
    loader.load(
        path,   
        function (object) {
           object.traverse( function( model ) {
               if( model instanceof THREE.Mesh ) {
       
                   model.material.side = THREE.DoubleSide;
                   model.material.color = new THREE.Color(0xcccccc);
                   model.material.wireframe = false;
                   var geometry = new THREE.Geometry ();
                   geometry.fromBufferGeometry (model.geometry);
                   geometry.mergeVertices();
                   //geometry.computeVertexNormals ();
                   models.push(model);
                   model.geometry = geometry;
               }
               scene.add(object);
           });
        });
}
=======
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
>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb




var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var points = [];
<<<<<<< HEAD

///////// MODELS OBJECT GEOMETRY -> CREATE POINT
var geometry;
var index;

/// MODELS FOR TRANFORM CONTROLS
var model;

function onMouseClick(e) {

    
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    //////////////////
    ////////////// ROTATION MODE
    ////////////////////
    raycaster.setFromCamera(mouse, camera);
    var modelIntersects = raycaster.intersectObjects(models);
    console.log(modelIntersects);
    if(modelIntersects.length > 0) {

        model = modelIntersects[0].object;

        

        transformControl.attach(model);

        scene.add(transformControl);
    }

    
    ///////////////////////////////


    /////////////////
    ////////// EDITING MODE
    //////////////////////

    // var point = null;
    // raycaster.setFromCamera(mouse, camera);
    // if(geometry) {
    //     geometry.boundingBox = null;
    //     geometry.boundingSphere = null;
    // }
    // var modelIntersects = raycaster.intersectObjects(models);
    // var pointIntersects = raycaster.intersectObjects(points);
    // if(pointIntersects.length > 0) {
    //     dragControls.addEventListener('drag', function() {
    //         point = pointIntersects[0].object;
    //         geometry.vertices[point.index].copy(point.position);
    //         geometry.verticesNeedUpdate = true;
    //     })
    // } else if (points.length > 0 && pointIntersects.length === 0) {
    //     scene.remove(scene.getObjectByName('point'));
    //     points.pop();
    // }  
    
    // if (points.length == 0 && modelIntersects.length > 0) {
    //     point = getPoint(modelIntersects);
    //     if(point) {
    //         dragControls = new THREE.DragControls(points, camera, renderer.domElement);
    //         dragControls.addEventListener('dragstart', function () {
    //             controls.enabled = false;
    //         });
    //         dragControls.addEventListener('dragend', function () {
    //             controls.enabled = true;
    //         });
    //         points.push(point);
    //         scene.add(point);
    //     }
    // }

    ///////////////////////////////////////////////////


}


///////////////
///////////// TRANSFORM CONTROLS AND HANDLERS

var transformControl = new THREE.TransformControls(camera, renderer.domElement);
        
transformControl.addEventListener('change', render);
transformControl.addEventListener('mouseUp', transformMouseUp);
transformControl.addEventListener('mouseDown', transformMouseDown);
//transformControl.addEventListener('objectChange', transformObjectChanged);

// function transformObjectChanged() {
//     console.log('change');
// }

function transformMouseDown() {
    
}

function transformMouseUp() {
    controls.reset();
}
///////////////////////////
/////////////////////////////////////

/////////
////// EDITING MODE CREATE POINT
/////////////// 
function getPoint(modelIntersects) {
    
=======
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
>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb
    var face = modelIntersects[0].face.clone();
    geometry = modelIntersects[0].object.geometry;
    var pointCoords = modelIntersects[0].point;
    var faceVertices = [];
<<<<<<< HEAD
=======
    var distance;
>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb
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
<<<<<<< HEAD

}

//////////////////////////////////////// END EDITING MODE

=======
}

>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb
function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

<<<<<<< HEAD
renderer.domElement.addEventListener('mousedown', onMouseClick);
=======
window.addEventListener('mousedown', onMouseClick, false);
>>>>>>> f777013e1ff2f950ac336e881c54f9a8a9cdc7bb

render();