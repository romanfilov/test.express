;let Main = (function () {
// DOM ELEMENTS
let selectors = {
    toggle: document.querySelector('.toggle'),
    sideMenu: document.querySelector('.side-menu'),
    modes: document.querySelectorAll('.model__mode-btn'),
    models: document.querySelector('.models'),
    selectModel: document.querySelectorAll('.select-model'),
    progress: document.querySelector('.progress'),
    progressContainer: document.querySelector('.progress-container'),
    dropField: document.querySelector('.drop-field'),
    model: document.querySelectorAll('.model'),
    closeModel: document.querySelectorAll('.close-model'),
    axis: document.querySelectorAll('.axis'),
    applyTransform: document.querySelectorAll('.apply-transform'),
    setModelView: document.querySelectorAll('.model__view-btn')
};
/// END DOM ELEMENTS

/// Support variables
let open = false;
let modelsCount = 0;
let order = 0;
let modelHash = null
let translateAxes = null;
let rotateAxes = null;
let scaleAxes = null;
// end support variables


/// Create Custom Events
let loadModelEvent = new CustomEvent('loadModel');
let selectModelEvent = new CustomEvent('selectModel');
let closeModelEvent = new CustomEvent('closeModel');
let applyTransformsEvent = new CustomEvent('applyTransforms');
let setModelViewEvent = new CustomEvent('setModelView');
let setModeEvent = new CustomEvent('setMode');
/// end create custom events

/// handlers DOM elements

function toggleMenu() {
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


function setMode() {
    [].forEach.call(selectors.modes, function(el) {
        el.classList.remove('active-mode');
    });
    this.classList.add('active-mode');
    setModeEvent.mode = this.getAttribute('data-mode');
    document.dispatchEvent(setModeEvent);
}


function selectModel(ev) {
    let hashCode = this.getAttribute('data-hash');
    let modes = this.closest('.model').querySelectorAll('.model__mode-btn');
    let axis = this.closest('.model').querySelectorAll('.axis');
    selectModelEvent.hashCode = hashCode;
    document.dispatchEvent(selectModelEvent);
    resetSelectors();
    for (let i = 0; i < modes.length; i++) {
        modes[i].removeAttribute('disabled');
    }
    for (let i = 0; i < axis.length; i++) {
        axis[i].removeAttribute('disabled');
    }
    this.classList.add('select-model--active');
    this.closest('.model').querySelector('.model__mode-btn[data-mode="'+ selectModelEvent.modelMode +'"]').classList.add('active-mode');
    this.closest('.model').querySelector('.apply-transform').removeAttribute('disabled');
    translateAxes = ev.target.closest('.model').querySelector('.transform__translate').querySelectorAll('.axis');  
    rotateAxes = ev.target.closest('.model').querySelector('.transform__rotate').querySelectorAll('.axis');  
    scaleAxes = ev.target.closest('.model').querySelector('.transform__scale').querySelectorAll('.axis');
}


function closeModel() {
    order = +this.getAttribute('data-order');
    let hashCode = this.getAttribute('data-hash');
    this.closest('.model').style.display = 'none';
    modelsCount--;
    selectors.dropField.style.display = 'flex';
    selectors.dropField.style.order = order;
    closeModelEvent.hashCode = hashCode;
    document.dispatchEvent(closeModelEvent);
}


function applyTransform() {
    let axles = this.closest('.model').querySelectorAll('.axis');
    for (let i = 0; i < axles.length; i++) {
        if(!/^[+-]?\d+(\.\d+)?$/.test(axles[i].value)) return console.error('Wrong input pattern of numbers');
        if(axles[i].closest('.transform__scale') && +axles[i].value === 0) {
            return console.error('Scale values ​​can not have a value of 0'); 
        }
        let tempValue = +axles[i].value;   
        axles[i].value = tempValue.toFixed(2);
        axles[i].blur();
    }
    applyTransformsEvent.data = {
        translateAxes: translateAxes,
        rotateAxes: rotateAxes,
        scaleAxes: scaleAxes
    }
    document.dispatchEvent(applyTransformsEvent);
}


function setModelView() {
    let isWireframe = (this.getAttribute('data-wireframe') === 'true');
    let index = +this.closest('.model').getAttribute('data-index');
    setModelViewEvent.data = {
        isWireframe: isWireframe,
        modelIndex: index
    }
    document.dispatchEvent(setModelViewEvent);
}

function inputAxis() {
    this.value = this.value.replace(/[^-.0-9]/, '');
}


function ApplyAxleOnEnter(ev) {
    if(ev.keyCode === 13) { 
        this.closest('.model').querySelector('.apply-transform').click();
    }
}

function onFocusAxis() {
    ThreeJS.orbitControls.enableKeys = false;
    this.select();
}

function onFocusOut() {
    ThreeJS.orbitControls.enableKeys = true;
}

function resetSelectors() {
    [].forEach.call(selectors.modes, function(el) {
        el.classList.remove('active-mode');
        el.setAttribute('disabled', true);
    });
    [].forEach.call(selectors.selectModel, function(el) {
        el.classList.remove('select-model--active');
    });
    [].forEach.call(selectors.axis, function(el) {
        el.setAttribute('disabled', true);
    });
    [].forEach.call(selectors.applyTransform, function(el) {
        el.setAttribute('disabled', true);
    });
}
//// end handlers DOM elements



/// Custom event handlers
function addModel(data) {
    modelHash = Math.random().toString(36).substring(2, 9);
    loadModelEvent.data = {
        file: data,
        modelHash: modelHash
    }
    selectors.closeModel[order].setAttribute('data-hash', modelHash);
    selectors.selectModel[order].setAttribute('data-hash', modelHash);
    document.dispatchEvent(loadModelEvent);
    resetSelectors();
}

function onUploadStart() {
    if(modelsCount === 0) order = 0;
    modelsCount++;
    if(modelsCount >= 2) {
        selectors.dropField.style.display = 'none';
    }
    selectors.progress.style.display = 'flex';
}

function onUploadProgress(ev) {
    selectors.progressContainer.style.display = 'flex';
    selectors.progress.firstElementChild.style.width = ev.data.percentage + '%';
    selectors.progress.firstElementChild.innerHTML = ev.data.percentage.toFixed(0) + '%';
    if(ev.data.percentage === 100) {
        addModel({path: ev.data.file.pathName, name: ev.data.file.name});
    }
}

function loadModelEnd(ev) {
    selectors.models.children[order].style.display = 'flex';
    let modelName = ev.modelName.replace(/(.obj|.stl)/, '');
    modelName = modelName.charAt(0).toUpperCase() + modelName.substr(1);
    selectors.models.children[order].querySelector('.model__name').innerHTML = modelName;
    selectors.progressContainer.style.display = 'none';
    selectors.progress.firstElementChild.style.width = 0 + '%';
    selectors.progress.firstElementChild.innerHTML = 0 + '%';
    order++;
}

function onTranformChange(ev) {
    translateAxes[0].value = ev.position.x.toFixed(2);
    translateAxes[1].value = ev.position.y.toFixed(2);
    translateAxes[2].value = ev.position.z.toFixed(2);
    rotateAxes[0].value = ev.rotation.x.toFixed(2);
    rotateAxes[1].value = ev.rotation.y.toFixed(2);
    rotateAxes[2].value = ev.rotation.z.toFixed(2);
    scaleAxes[0].value = ev.scale.x.toFixed(2);
    scaleAxes[1].value = ev.scale.y.toFixed(2);
    scaleAxes[2].value = ev.scale.z.toFixed(2);
}

function onModelClick(ev) {
    for (let i = 0; i < selectors.selectModel.length; i++) {
        let selectHash = selectors.selectModel[i].getAttribute('data-hash');
        if(selectHash === ev.modelHash) {
            selectors.selectModel[i].click();
            break;
        }
    }
}
//// end custom event handlers


//// Custom Events
document.addEventListener('addModel', addModel);
document.addEventListener('uploadStart', onUploadStart);
document.addEventListener('uploadProgress', onUploadProgress);
document.addEventListener('loadModelEnd', loadModelEnd);
document.addEventListener('transformChange', onTranformChange);
document.addEventListener('modelClick', onModelClick);
/// end Custom Events





/// file drop event handlers

function fileDrop(ev) {
    upload.files = ev.dataTransfer.files;
    ev.preventDefault();    
}   

function dragOver(ev) {
    ev.preventDefault();
}

/// end file drop event handlers

//// DOM elements events
selectors.dropField.addEventListener('drop', fileDrop);
selectors.dropField.addEventListener('dragover', dragOver);
selectors.toggle.addEventListener('click', toggleMenu.bind(selectors.toggle));
for(let i = 0; i < selectors.selectModel.length; i++) {
    selectors.selectModel[i].addEventListener('click', selectModel.bind(selectors.selectModel[i]));
};
for(let i = 0; i < selectors.modes.length; i++) {
    selectors.modes[i].addEventListener('click', setMode.bind(selectors.modes[i]));
};
for(let i = 0; i < selectors.closeModel.length; i++) {
    selectors.closeModel[i].addEventListener('click', closeModel.bind(selectors.closeModel[i]));
};
for(let i = 0; i < selectors.applyTransform.length; i++) {
    selectors.applyTransform[i].addEventListener('click', applyTransform.bind(selectors.applyTransform[i]));
};
for(let i = 0; i < selectors.setModelView.length; i++) {
    selectors.setModelView[i].addEventListener('click', setModelView.bind(selectors.setModelView[i]));
};
for (let i = 0; i < selectors.axis.length; i++) {
    selectors.axis[i].addEventListener('input', inputAxis.bind(selectors.axis[i]));
    selectors.axis[i].addEventListener('keypress', ApplyAxleOnEnter.bind(selectors.axis[i]));
    selectors.axis[i].addEventListener('focus', onFocusAxis.bind(selectors.axis[i]));
    selectors.axis[i].addEventListener('focusout', onFocusOut);
}
}());