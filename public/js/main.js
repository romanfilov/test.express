// DOM ELEMENTS

var upload = document.createElement('input');
upload.setAttribute('type', 'file');
upload.setAttribute('id', 'upload');
document.body.appendChild(upload);
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

let uploader = new SocketIOFileUpload(socket);
uploader.listenOnInput(document.getElementById("upload"));
uploader.addEventListener('choose', function(ev){
    var isNeedExt = /\.obj$|\.stl$/.test(ev.files[0].name);
    if(!isNeedExt) {
        console.error('Wrong file extension');
        return false;
    }
});

uploader.addEventListener('complete', function(ev) {
    console.log(ev);
});
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

//// Settings 
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

/// camera settings
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.up.set(0, 0, 1);
///// end camera settings

const size = 100;
const divisions = 10;
const gridHelper = new THREE.GridHelper( size, divisions, 0x292929, 0xf0f0f0 );
gridHelper.rotation.x = Math.PI / 2;


///// renderer settings
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
renderer.domElement.addEventListener('mousemove', mockEvents);
/// end renderer settings

const orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
const axes = new THREE.AxesHelper( 5 );
const pointLight = new THREE.PointLight(0xffffff, 0.5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
pointLight.position.set(1000, 500, 0);
const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
pointLight2.position.set(-1000, -500, 0);
const loader = new THREE.OBJLoader();
/////// End settings


// Transformation //
const transformControl = new THREE.TransformControls(camera, renderer.domElement);

// Transformation end //


/// Scene adding
scene.add( gridHelper );
scene.add(axes);
scene.add( pointLight );
scene.add( pointLight2 );
scene.add(ambientLight)
scene.add(transformControl);




///// Variables

let models = [];
let point = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let points = [];
let index;
let model;
let moving;
let clickToArrow;
let modelIntersects;
//// end variables

// Load model //
//loadModel(path);

function loadModel(path) {
    loader.load(
        path,   
        function (object) {
            object.traverse( function( model ) {
                if( model instanceof THREE.Mesh ) {
                    let material = new THREE.MeshLambertMaterial({color: 'blue'})
                    model.material = material;
                    model.material.side = THREE.DoubleSide;
                    model.material.wireframe = false;
                    let geometry = new THREE.Geometry ();
                    geometry.fromBufferGeometry(model.geometry);
                    geometry.center();
                    geometry.mergeVertices();
                    models.push(model);
                    model.geometry = geometry;
                }
                scene.add(object);
            });
        }
    );
}
// End load model //




function onMouseClick(e) {
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    clickToArrow = false;
    moving = false;
    //////////////////
    ////////////// transform mode
    ////////////////////
    raycaster.setFromCamera(mouse, camera);
    modelIntersects = raycaster.intersectObjects(models);
    if(modelIntersects.length > 0) {
        model = modelIntersects[0].object;
        transformControl.attach(model);
    }

    ////// end transform

    /////////////////
    ////////// editing mode
    //////////////////////

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

    ///////////// end editing mode
}



/////////
////// EDITING MODE CREATE POINT
/////////////// 
function getPoint(modelIntersects) {
    
    let face = modelIntersects[0].face.clone();
    model.geometry = modelIntersects[0].object.geometry;
    let pointCoords = modelIntersects[0].point;
    let faceVertices = [];
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

// handlers //
function transformMouseDown() {
    orbitControls.enabled = false;
}
function transformMouseUp() {
    clickToArrow = true;
    orbitControls.enabled = true;
}

function onMouseMoving() {
    moving = true;
}

function detachTransform() {
    if(modelIntersects.length === 0 && !clickToArrow && !moving) {
        transformControl.detach();
    }
}

function retoreEvents(ev) {
    ev.stopPropagation = stopPropagationMock;
}

function onResizeWindow() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

// events //
transformControl.addEventListener('mouseDown', transformMouseDown);
transformControl.addEventListener('mouseUp', transformMouseUp);
renderer.domElement.addEventListener('mousedown', onMouseClick);
renderer.domElement.addEventListener('mousemove', retoreEvents);
renderer.domElement.addEventListener('mousemove', onMouseMoving);
renderer.domElement.addEventListener('mouseup', detachTransform);
window.addEventListener('resize', onResizeWindow);
render();
