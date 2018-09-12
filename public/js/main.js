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
    model: document.querySelectorAll('.model'),
    progress: document.querySelector('.progress'),
    progressContainer: document.querySelector('.progress-container'),
    closeModel: document.querySelectorAll('.close-model'),
    axis: document.querySelectorAll('.axis'),
    applyTransform: document.querySelectorAll('.apply-transform')
};
/// END DOM ELEMENTS


/// Support variables

let open = false;
let modelsCount = 0;
let order = 0;
let modelHash;
let translateAxis;
let rotateAxis;
let scaleAxis;
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

function addModel(data) {
    loadModel(data.file);
    modelHash = Math.random().toString(36).substring(2, 9);
    selectors.closeModel[order].setAttribute('data-hash', modelHash);
    selectors.selectModel[order].setAttribute('data-hash', modelHash);
    selectors.models.children[order].style.display = 'flex';
    order++;
    selectors.progressContainer.style.display = 'none';
    selectors.progress.firstElementChild.style.width = 0 + '%';
    selectors.progress.firstElementChild.innerHTML = 0 + '%';
}

function selectModel(ev) {
    let hashCode = ev.target.getAttribute('data-hash');
    let foundModel = getModelByHash(hashCode);
    if(currentModel.hashCode === foundModel.hashCode) return;
    foundModel.mode = currentModel.mode;
    currentModel = foundModel;
    if(!editModeActive) transformControl.attach(foundModel);
    let index = +ev.target.getAttribute('data-index');
    [].forEach.call(selectors.modeButtons, function(el) {
        el.classList.remove('active-mode');
        el.setAttribute('disabled', true);
    });
    [].forEach.call(selectors.axis, function(el) {
        el.setAttribute('disabled', true);
    });
    [].forEach.call(selectors.applyTransform, function(el) {
        el.setAttribute('disabled', true);
    });
    for (let i = 0; i < selectors.modes[index].children.length; i++) {
        selectors.modes[index].children[i].removeAttribute('disabled');
    }
    let axis = this.closest('.model').querySelectorAll('.axis');
    for (let i = 0; i < axis.length; i++) {
        axis[i].removeAttribute('disabled');
    }
    this.closest('.model').querySelector('.model__mode-btn[data-mode="'+ currentModel.mode +'"]').classList.add('active-mode');
    this.closest('.model').querySelector('.apply-transform').removeAttribute('disabled');
    translateAxis = ev.target.closest('.model').querySelector('.transform__translate').querySelectorAll('.axis');  
    rotateAxis = ev.target.closest('.model').querySelector('.transform__rotate').querySelectorAll('.axis');  
    scaleAxis = ev.target.closest('.model').querySelector('.transform__scale').querySelectorAll('.axis');
}

function applyTransform() {
   currentModel.position.set(+translateAxis[0].value, +translateAxis[1].value, +translateAxis[2].value);
   currentModel.rotation.set(+rotateAxis[0].value, +rotateAxis[1].value, +rotateAxis[2].value);
   currentModel.scale.set(+scaleAxis[0].value, +scaleAxis[1].value, +scaleAxis[2].value);
}

function closeModel(ev) {
    order = +ev.target.getAttribute('data-order');
    let hashCode = ev.target.getAttribute('data-hash');
    let foundModel = getModelByHash(hashCode);
    scene.remove(foundModel);
    models.splice(models.indexOf(foundModel), 1);
    ev.target.closest('.model').style.display = 'none';
    modelsCount--;
    selectors.dropField.style.display = 'flex';
    selectors.dropField.style.order = order;
    transformControl.detach();
}


function getModelByHash(hashCode) {
    for (let i = 0; i < models.length; i++) {
        if(models[i].hashCode === hashCode) {
            return models[i];
        }
    }
}
//// end

function selectMode(ev) {
    [].forEach.call(selectors.modeButtons, function(el) {
        el.classList.remove('active-mode');
    });
    ev.target.closest('.model__mode-btn').classList.add('active-mode');
    switch(ev.target.closest('.model__mode-btn').getAttribute('data-mode')) {
        case 'edit':
            setMode('edit');
            currentModel.mode = 'edit';
            break;
        case 'translate':
            setMode('translate');
            currentModel.mode = 'translate';
            break;
        case 'rotate':
            setMode('rotate');
            currentModel.mode = 'rotate';
            break;
        case 'scale':
            setMode('scale');
            currentModel.mode = 'scale';
            break;
    }
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
    selectors.selectModel[i].addEventListener('click', selectModel.bind(selectors.selectModel[i]));
};
for(let i = 0; i < selectors.closeModel.length; i++) {
    selectors.closeModel[i].addEventListener('click', closeModel);
};
for(let i = 0; i < selectors.applyTransform.length; i++) {
    selectors.applyTransform[i].addEventListener('click', applyTransform);
};
//// end handlers DOM elements





// SOCKET
let socket = io();

socket.on('upload.progress', function(data) {
    selectors.progressContainer.style.display = 'flex';
    selectors.progress.firstElementChild.style.width = data.percentage + '%';
    selectors.progress.firstElementChild.innerHTML = data.percentage + '%';
    if(data.percentage === 100) {
        setTimeout(addModel, 1000, data);
    }
});

let uploader = new SocketIOFileUpload(socket);
uploader.listenOnInput(selectors.upload);
uploader.addEventListener('choose', function(ev){
    let isRightExt = /\.obj$|\.stl$/.test(ev.files[0].name);
    if(!isRightExt) {
        console.error('Wrong file extension');
        return false;
    }
});
uploader.addEventListener('start', function() {
    modelsCount++;
    selectors.progress.style.display = 'flex';
    selectors.progress.style.order = order;
    if(modelsCount >= 2) {
        selectors.dropField.style.display = 'none';
    }
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
let group = new THREE.Group();
let points = [];
let currentModel;
let moving;
let clickToArrow;
let modelIntersects;
let pointIntersects;
let geometry;
let vertices;
let dragControls;
let faceVertices;
let distances;
//// end variables

/// delete after change editting mode
loadModel({name: 'cube.obj', pathName: 'public/models/cube.obj'});
/////
// Load model //
function loadModel(file) {
    if(/\.obj$/.test(file.name)) {
        objLoader.load(
            file.pathName,   
            function (object) {
                object.traverse( function( model ) {
                    if( model instanceof THREE.Mesh ) {
                        let material = new THREE.MeshLambertMaterial({color: 'blue', vertexColors: THREE.FaceColors,  overdraw: true})
                        model.material = material;
                        let geometry = new THREE.Geometry();
                        geometry.fromBufferGeometry(model.geometry);
                        geometry.center();
                        geometry.mergeVertices();
                        model.hashCode = modelHash;
                        model.geometry = geometry;
                        currentModel = model;
                        currentModel.mode = transformControl.getMode();
                        models.push(model);
                        scene.add(model);
                    }
                });
            }
        );
    } else {
        stlLoader.load(
            file.pathName,
            function (geometry) {
                let tempGeometry = new THREE.Geometry();
                tempGeometry.fromBufferGeometry(geometry);
                tempGeometry.mergeVertices();
                tempGeometry.center();
                let model = new THREE.Mesh(tempGeometry, new THREE.MeshLambertMaterial({color: 'blue'}));
                model.hashCode = modelHash;
                models.push(model);
                currentModel = model;
                currentModel.mode = transformControl.getMode();
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

/// delete




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
            dragControls.addEventListener('drag', function(ev) {
                let position = point.position.clone();
                group.position.copy(position);
                for (let i = 0; i < faceVertices.length; i++) {
                    geometry.vertices[faceVertices[i].index].copy(currentModel.localToWorld(group.position));
                }
                geometry.verticesNeedUpdate = true;
                geometry.elementsNeedUpdate = true;
            })
        } else if (points.length > 0 && pointIntersects.length === 0) {
            
            points = [];
        }  
        if (points.length == 0 && modelIntersects.length > 0) {
            point = getPoint(modelIntersects);
            dragControls = new THREE.DragControls(points, camera, renderer.domElement);
            if(point) {
                dragControls.addEventListener('dragstart', function () {
                    orbitControls.enabled = false;
                    point.material.color.setHex(0xc10416);
                });
                dragControls.addEventListener('dragend', function () {
                    orbitControls.enabled = true;
                });
                points.push(point);
                scene.add(group);
            }
        }
    } 
    if (modelIntersects.length > 0) {

        ///// Add after change editting mode

        // for (let i = 0; i < selectors.selectModel.length; i++) {
        //     let selectHash = selectors.selectModel[i].getAttribute('data-hash');
        //     if(selectHash === modelIntersects[0].object.hashCode) {
        //         selectors.selectModel[i].click();
        //         break;
        //     }
        // }

        /////////
        //// delete after editting mode
        currentModel = modelIntersects[0].object;
        /////
    }

    ///////////// end editing mode
}



/////////
////// EDITING MODE CREATE POINT
/////////////// 
function getPoint(modelIntersects) {
    geometry = modelIntersects[0].object.geometry;
    let face = modelIntersects[0].face.clone();
    face.centroid = new THREE.Vector3();
    face.centroid.add(geometry.vertices[face.a]);
    face.centroid.add(geometry.vertices[face.b]);
    face.centroid.add(geometry.vertices[face.c]);
    face.centroid.divideScalar(3);
    faceVertices = [];
    faceVertices.push(geometry.vertices[face.a].clone());
    faceVertices.push(geometry.vertices[face.b].clone());
    faceVertices.push(geometry.vertices[face.c].clone());
    faceVertices.forEach(function(vertex) {
        vertex.centerDistance = face.centroid.distanceTo(vertex);
    });
    faceVertices[0].index = face.a;
    faceVertices[1].index = face.b;
    faceVertices[2].index = face.c;
    for (let i = 0; i < faceVertices.length; i++) {
        point = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x404040}));
        point.name = 'point';
        point.position.copy(modelIntersects[0].object.localToWorld(faceVertices[i]));
        point.index = faceVertices[i].index;
        group.add(point);
    }
    point = new THREE.Mesh( new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({color: 0x404040}));
    point.position.copy(modelIntersects[0].object.localToWorld(face.centroid));
    scene.add(point);
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

///// Add after change editting mode
// function transformChange() {
//     translateAxis[0].value = currentModel.position.x.toFixed(2);
//     translateAxis[1].value = currentModel.position.y.toFixed(2);
//     translateAxis[2].value = currentModel.position.z.toFixed(2);
//     rotateAxis[0].value = currentModel.rotation.x.toFixed(2);
//     rotateAxis[1].value = currentModel.rotation.y.toFixed(2);
//     rotateAxis[2].value = currentModel.rotation.z.toFixed(2);
//     scaleAxis[0].value = currentModel.scale.x.toFixed(2);
//     scaleAxis[1].value = currentModel.scale.y.toFixed(2);
//     scaleAxis[2].value = currentModel.scale.z.toFixed(2);
// }
//////
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
//transformControl.addEventListener('objectChange', transformChange);
renderer.domElement.addEventListener('mousedown', onMouseClick);
renderer.domElement.addEventListener('mousemove', retoreEvents);
renderer.domElement.addEventListener('mousemove', onMouseMoving);
renderer.domElement.addEventListener('mouseup', detachTransform);
window.addEventListener('resize', onResizeWindow);
render();
