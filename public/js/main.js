// DOM ELEMENTS
let selectors = {
    toggle: document.querySelector('.toggle'),
    sideMenu: document.querySelector('.side-menu'),
    modes: document.querySelectorAll('.model__mode'),
    modeButtons: document.querySelectorAll('.model__mode-btn'),
    models: document.querySelector('.models'),
    upload: document.getElementById('upload'),
    dropField: document.querySelector('.drop-field'),
    selectModel: document.querySelectorAll('.select-model'),
    model: document.querySelectorAll('.model')
};
/// END DOM ELEMENTS

/// Support variables

let open = false;
let modelOrder = 0;
// end support variables


/// handlers DOM elements

selectors.toggle.onclick = function() {
    open = !open;
    let bars = this.children[0];
    if(open) {
        bars.style.color = '#ffffff';
        selectors.sideMenu.style.left = 0;
    } else {
        bars.style.color = '#000000';
        selectors.sideMenu.style.left = -400 + 'px';
    }
}

/// Add Mode Panel

function addModel(ev) {
    loadModel(ev.detail);
    selectors.models.children[modelOrder].style.display = 'flex';
    selectors.modes[0].children[0].classList.add('active-mode');
    modelOrder++;
    if(modelOrder === 2) {
        selectors.dropField.style.display = 'none';
    }
}

//// end

function selectMode(ev) {
    if(ev.target === this) return;
    [].forEach.call(selectors.modeButtons, function(el) {
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

function selectModel(ev) {
    let index = +ev.target.getAttribute('data-id');
    [].forEach.call(selectors.modeButtons, function(el) {
        el.classList.remove('active-mode');
        el.setAttribute('disabled', true);
    });
    for (let i = 0; i < selectors.modes[index].children.length; i++) {
        selectors.modes[index].children[i].removeAttribute('disabled');
    }
    currentModel = models[index];
    transformControl.attach(models[index]);
}

function fileDrop(ev) {
    upload.files = ev.dataTransfer.files;
    ev.preventDefault();    
}   

function dragOver(ev) {
    ev.preventDefault();
}

selectors.dropField.addEventListener('drop', fileDrop);
selectors.dropField.addEventListener('dragover', dragOver);
for(let i = 0; i < selectors.modes.length; i++) {
    selectors.modes[i].addEventListener('click', selectMode);
};
for(let i = 0; i < selectors.selectModel.length; i++) {
    selectors.selectModel[i].addEventListener('click', selectModel.bind(selectors.model[i]));
};

//// end handlers DOM elements





// SOCKET
let socket = io();

/////// ADD AFTER CONFIG SAVING NEW MODEL

let uploader = new SocketIOFileUpload(socket);
uploader.listenOnInput(selectors.upload);
uploader.addEventListener('choose', function(ev){
    let isRightExt = /\.obj$|\.stl$/.test(ev.files[0].name);
    if(!isRightExt) {
        console.error('Wrong file extension');
        return false;
    }
});

uploader.addEventListener('complete', function(ev) {
    addModel(ev);
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
const objLoader = new THREE.OBJLoader();
const stlLoader = new THREE.STLLoader();
/////// End settings


// Transformation //
const transformControl = new THREE.TransformControls(camera, renderer.domElement);
transformControl.visible = false;
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
let currentModel;
let moving;
let clickToArrow;
let modelIntersects;
let pointIntersects;
let geometry;
let vertices;
let dragControls = new THREE.DragControls(points, camera, renderer.domElement);

//// end variables

// Load model //
function loadModel(detail) {
    if(/\.obj$/.test(detail.name)) {
        objLoader.load(
            detail.path,   
            function (object) {
                object.traverse( function( model ) {
                    if( model instanceof THREE.Mesh ) {
                        let material = new THREE.MeshLambertMaterial({color: 'blue'})
                        model.material = material;
                        model.material.side = THREE.DoubleSide;
                        model.material.wireframe = false;
                        let geometry = new THREE.Geometry();
                        geometry.fromBufferGeometry(model.geometry);
                        geometry.center();
                        geometry.mergeVertices();
                        models.push(model);
                        model.geometry = geometry;
                        currentModel = model;
                        transformControl.attach(model);
                    }
                    scene.add(object);
                });
            }
        );
    } else {
        stlLoader.load(
            detail.path,
            function (geometry) {
                let tempGeometry = new THREE.Geometry();
                tempGeometry.fromBufferGeometry(geometry);
                tempGeometry.mergeVertices();
                tempGeometry.center();
                let model = new THREE.Mesh(tempGeometry, new THREE.MeshLambertMaterial({color: 'blue'}));
                models.push(model);
                currentModel = model;
                transformControl.attach(model);
                scene.add(model);
            }
        );
    } 
}

function setMode(mode) {
    switch(mode) {
        case 'edit':
            setEditMode(true);
            break;
        default:
            setEditMode(false);
            transformControl.setMode(mode);
            break;
    }
}

var editModeActive = false;
function setEditMode(activate) {
    editModeActive = activate;
    if (activate) {
        transformControl.detach();
    } else {
        transformControl.attach(currentModel);
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
                geometry.vertices[point.index].copy(currentModel.worldToLocal(point.position.clone()));
                geometry.verticesNeedUpdate = true;
                geometry.elementsNeedUpdate = true;
            })
        } else if (points.length > 0 && pointIntersects.length === 0) {
            scene.remove(scene.getObjectByName('point'));
            points.pop();
        }  
        if (points.length == 0 && modelIntersects.length > 0) {
            currentModel = modelIntersects[0].object;
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
        currentModel = modelIntersects[0].object;
        transformControl.attach(currentModel);
    }

    ///////////// end editing mode
}



/////////
////// EDITING MODE CREATE POINT
/////////////// 
function getPoint(modelIntersects) {
    let face = modelIntersects[0].face.clone();
    geometry = modelIntersects[0].object.geometry;
    let pointCoords = currentModel.worldToLocal(modelIntersects[0].point);
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
    point.position.copy(currentModel.localToWorld(faceVertices[0]));
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
