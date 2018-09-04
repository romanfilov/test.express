// DOM ELEMENTS
let openMenu = document.querySelector('.open-side-menu');
let sideMenu = document.querySelector('.side-menu');
let closeMenu = document.querySelector('.close-side-menu');
let mode = document.querySelector('.model__mode');
let modeButtons = document.querySelectorAll('.model__mode-btn');
let upload = document.getElementById('.upload');
/// END DOM ELEMENTS


/// handlers DOM elements
openMenu.onclick = function() {
    sideMenu.style.left = 0;
    sideMenu.style.opacity = 1;
}
closeMenu.onclick = function () {
    sideMenu.style.left = -400 + 'px';
    sideMenu.style.opacity = 0;
}
mode.onclick = function(ev) {
    if(ev.target === this) return;
    [].forEach.call(modeButtons, function(el) {
        el.classList.remove('active-mode');
    });
    ev.target.closest('.model__mode-btn').classList.add('active-mode');
    switch(ev.target.closest('.model__mode-btn').getAttribute('data-mode')) {
        case 'edit':
            setMode('edit');
            break;
        case 'translate':
            setMode('translate');
            break;
        case 'rotate':
            setMode('rotate');
            break;
        case 'scale':
            setMode('scale');
            break;
    }
}

//// end handlers DOM elements

// SOCKET
let socket = io();

/////// ADD AFTER CONFIG SAVING NEW MODEL

let uploader = new SocketIOFileUpload(socket);
uploader.listenOnInput(document.getElementById("upload"));
uploader.addEventListener('choose', function(ev){
    var isRightExt = /\.obj$|\.stl$/.test(ev.files[0].name);
    if(!isRightExt) {
        console.error('Wrong file extension');
        return false;
    }
});

uploader.addEventListener('complete', function(ev) {
    loadModel(ev.detail.path);
});

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
// end scene adding



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
let pointIntersects;
let geometry;
let vertices;
let dragControls = new THREE.DragControls(points, camera, renderer.domElement);
//// end variables

// Load model //
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

function setMode(mode) {
    switch(mode) {
        case 'edit':
            setEditMode(true);
            break;
        default:
            setEditMode(false);
            transformControl.setMode(mode);
    }
}

var editModeActive = false;
function setEditMode(activate) {
    editModeActive = activate;
    if (activate) {
        transformControl.detach();
    } else {
        transformControl.attach(model);
    }
}

function onMouseClick(e) {
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    clickToArrow = false;
    moving = false;
    
    raycaster.setFromCamera(mouse, camera);
    modelIntersects = raycaster.intersectObjects(models);
    ///////////////
    //////// editing mode
    ////////////////////

    if (editModeActive) {
        if (geometry) {
            geometry.boundingBox = null;
            geometry.boundingSphere = null;
        }
        pointIntersects = raycaster.intersectObjects(points);
        if (pointIntersects.length > 0) {
            dragControls.addEventListener('drag', function(ev) {;
                geometry.vertices[point.index].copy(model.worldToLocal(point.position.clone()));
                geometry.verticesNeedUpdate = true;
                geometry.elementsNeedUpdate = true;
            })
        } else if (points.length > 0 && pointIntersects.length === 0) {
            scene.remove(scene.getObjectByName('point'));
            points.pop();
        }  
        if (points.length == 0 && modelIntersects.length > 0) {
            model = modelIntersects[0].object;
            point = getPoint(modelIntersects);
            if(point) {
                dragControls.addEventListener('dragstart', function () {
                    orbitControls.enabled = false;
                    point.material.color.setHex(0xc10416);
                });
                dragControls.addEventListener('dragend', function () {
                    orbitControls.enabled = true;
                });
                points.push(point);
                scene.add(point);
            }
        }
    } else if (modelIntersects.length > 0) {
        model = modelIntersects[0].object;
        transformControl.attach(model);
    }

    ///////////// end editing mode
}



/////////
////// EDITING MODE CREATE POINT
/////////////// 
function getPoint(modelIntersects) {
    let face = modelIntersects[0].face.clone();
    geometry = modelIntersects[0].object.geometry;
    let pointCoords = model.worldToLocal(modelIntersects[0].point);
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
    point.position.copy(model.localToWorld(faceVertices[0]));
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
    model.remove(point);
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

// end handlers //

// events //
transformControl.addEventListener('mouseDown', transformMouseDown);
transformControl.addEventListener('mouseUp', transformMouseUp);
renderer.domElement.addEventListener('mousedown', onMouseClick);
renderer.domElement.addEventListener('mousemove', retoreEvents);
renderer.domElement.addEventListener('mousemove', onMouseMoving);
renderer.domElement.addEventListener('mouseup', detachTransform);
window.addEventListener('resize', onResizeWindow);
render();
