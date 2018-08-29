// DOM ELEMENTS

// var upload = document.createElement('input');
// upload.setAttribute('type', 'file');
// upload.setAttribute('id', 'upload');
// document.body.appendChild(upload);
// var update = document.createElement('button');
// update.setAttribute('id', 'update');
// document.body.appendChild(update);

// var mode = document.createElement('button');
// mode.flag = false;
// mode.value = 'scaling';
// mode.innerHTML = mode.value;
// mode.setAttribute('id', 'mode');
// document.body.appendChild(mode);

// mode.onclick = function(e) {
//     mode.flag ? mode.value = 'scaling' : mode.value = 'editing';
//     mode.innerHTML = mode.value;
//     mode.flag = !mode.flag;
// }

/// END DOM ELEMENTS

// SOCKET
let socket = io();

/////// ADD AFTER CONFIG SAVING NEW MODEL

// var uploader = new SocketIOFileUpload(socket);
// uploader.listenOnInput(document.getElementById("upload"));
// socket.on('onsaved', function(file) {
//     loadModel(file.pathName);
// });

////////////// END SOCKET


////////////////
/// SOLVING CAMERA ROTATION ISSUE WITH TRANSFORM CONTROLS
let stopPropagationMock = null;
const emptyFunction = function() {};

function mockEvents(ev) {
    stopPropagationMock = ev.stopPropagation;
    ev.stopPropagation = emptyFunction;
}

/////////////

/////////// DELETE AFTER CONFIG

let path = 'public/models/cube.obj';



/// THREE JS
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.up.set(0, 0, 1);
const planeGeometry = new THREE.PlaneBufferGeometry(6, 6, 10, 10);
const planeMaterial = new THREE.MeshLambertMaterial({color: 0x4553c1, transparent: true, opacity:.1, side: THREE.DoubleSide});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
const renderer = new THREE.WebGLRenderer();
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
const axes = new THREE.AxesHelper( 5 );
let light = new THREE.AmbientLight( 0xffffff );
const loader = new THREE.OBJLoader();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


scene.add(plane);
scene.add(axes);
scene.add( light );


renderer.domElement.addEventListener('mousemove', mockEvents);





// Load model //


loadModel(path);
var models = [];
var point = null;
var curModel;
var obj;

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
                   models.push(model);
                   model.geometry = geometry;
               }
               scene.add(object);
           });
        });
}

// End load model //


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var points = [];

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
    if(modelIntersects.length > 0) {

        model = modelIntersects[0].object;
        transformControl.attach(model);

        scene.add(transformControl);
    } else {
        transformControl.detach();
    }

    
////////////// END TRANSFORM CONTROLS /////////////////


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

// Transformation //

var transformControl = new THREE.TransformControls(camera, renderer.domElement);



// handlers //
function transformMouseDown() {
    orbitControls.enabled = false;
}

function transformMouseUp() {
    orbitControls.enabled = true;
}

// Transformation end //

///////////////////////////
/////////////////////////////////////

/////////
////// EDITING MODE CREATE POINT
/////////////// 
function getPoint(modelIntersects) {
    
    var face = modelIntersects[0].face.clone();
    geometry = modelIntersects[0].object.geometry;
    var pointCoords = modelIntersects[0].point;
    var faceVertices = [];
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

//////////////////////////////////////// END EDITING MODE

function render() {
    requestAnimationFrame(render);
    orbitControls.update();
    renderer.render(scene, camera);
}

function retoreEvents(ev) {
    ev.stopPropagation = stopPropagationMock;
}

// events //
transformControl.addEventListener('mouseUp', transformMouseUp);
transformControl.addEventListener('mouseDown', transformMouseDown);

renderer.domElement.addEventListener('mousemove', retoreEvents);

render();
