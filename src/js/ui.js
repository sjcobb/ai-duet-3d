import Store from './Store.js';
import Tone from 'Tone';

/*
 *** USER INTERFACE ***
 */

//-----SETTINGS CONTAINER------//

/* Chrome autoplay on gesture bug */
// https://github.com/Tonejs/Tone.js/issues/341
document.documentElement.addEventListener(
    "mousedown",
    function() {
        const mouse_IsDown = true;
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
    }
);

/* stop all sounds */
var button = document.querySelector(".play");
button.addEventListener("click", function() {
    console.log('... ... ... Tone.Transport STOPPED ... ... ...');
    Tone.Transport.stop();
    // bounceSynth.disconnect();
    // bounceSynth.dispose();
});

let drumId = document.getElementById('btn-drums-1');
drumId.onclick = () => {
    console.log('#btn-drums-1 clicked... Tone.Transport started...')
    Tone.Transport.start();
    // Tone.Transport.start("+0.1", 0);
};

// document.getElementById('shape-form').onchange = (evt) => {
//     switch (evt.target.value) {
//         case 'box':
//             currentShape = box;
//             break;
//         case 'sphere':
//             currentShape = sphere;
//             break;
//         case 'torus':
//             currentShape = torus;
//             break;
//         default:
//             currentShape = box;
//             break;
//     }
//     obj.geometry = currentShape;
//     obj.geometry.buffersNeedUpdate = true;
// };

// document.getElementById('mesh-form').onchange = (evt) => {
//     switch (evt.target.value) {
//         case 'phong':
//             currentMesh = phong;
//             break;
//         case 'basic':
//             currentMesh = basic;
//             break;
//         case 'lambert':
//             currentMesh = lambert;
//             break;
//         default:
//             currentMesh = box;
//             break;
//     }
//     obj.material = currentMesh;
//     obj.material.needsUpdate = true;
// };

let controlsId = document.getElementById('controls-container');
let settingsId = document.getElementById('settings-container');
let toggleId = document.getElementById('settings-toggle-btn');
let dashboardId = document.getElementById('dashboard-container');
let imgId = document.getElementById('img-container');

toggleId.onclick = (el) => {
    console.log('toggleId clicked -> el: ', el);
    toggleId.classList.toggle('hidden-active');
    settingsId.classList.toggle('hidden');
};

// let addShapeId = document.getElementById('call-add-shape');
// addShapeId.onclick = (el) => {
//     addBody();
// };

// if (Store.view.songAutoStart === true || Store.uiHidden === true) {
if (Store.uiHidden === true) {
    controlsId.classList.toggle('hidden');
}

if (Store.view.songAutoStart === true) {
    setTimeout(function() {
        Tone.Transport.start();
    }, Store.autoStartTime);
    // }, 9000);
} else {
    controlsId.classList.toggle('show');
}

document.addEventListener("visibilitychange", function() {
    if (document.hidden){
        console.log("visibilitychange -> Browser tab is hidden");
        Tone.Transport.stop();
        console.log("Tone.Transport stopped......");
    } else {
        console.log("visibilitychange -> Browser tab is visible");
    }
});

// setTimeout(function() {
//     Store.view.cameraPositionBehind = false;
//     // Store.camera.position.set(0, 20, 40);
//     // Store.camera.position.set(0, 5, 35);
//     Store.camera.position.set(0, 12, 30);
//     Store.camera.lookAt(new THREE.Vector3(0, 1, 10));
//     // Store.camera.lookAt(new THREE.Vector3(-1, 1, 10));
// // }, Store.autoStartTime + 32000); //Store.autoStartTime = 9000
// }, Store.autoStartTime + 46000); 
// // }, 33000);
// // }, 1000);

// Store.view.cameraPositionBehind = false;
// // camera.position.set(0, 5, 35);
// camera.position.set(0, 5, 35);
// camera.lookAt(new THREE.Vector3(-1, 1, 10));
// // camera.lookAt(new THREE.Vector3(-1, 1, 10));
// setTimeout(function() {
//     scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0028 );
//     Store.view.cameraPositionBehind = true;
//     camera.position.set(Store.view.posBehindX, 6, globalPosBehindZ);
//     camera.lookAt(new THREE.Vector3(globalDropPosX - 5, 1, globalPosBehindZ));
// }, 58000);
// // }, 2000);

// setTimeout(function() {
//     flameFirst.addFire();
// }, 1000);

if (Store.view.songAutoStart == true) {
    setTimeout(function() {
        console.log('(UI - ALTERNATE VIEW) -> Store: ', Store);
    
        Store.dashboard.noteCountsObj = {};
        dashboardId.classList.toggle('alternate');
        imgId.classList.toggle('alternate');
    
        Store.view.cameraPositionBehind = false;
        // Store.camera.position.set(0, 20, 30);
        Store.camera.position.set(0, 22, 36);
        Store.camera.lookAt(new THREE.Vector3(0, 10, 10));
        
        Tone.Transport.stop();
        Tone.Transport.start();
    // }, 2000);  
    }, 35000);
}
