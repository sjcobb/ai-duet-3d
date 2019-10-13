import globals from './globals.js';
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
    console.log('Tone.Transport STOPPED... bounceSynth disconnected...');
    Tone.Transport.stop();
    // bounceSynth.disconnect();
    // //bounceSynth.dispose();
});

let bounce = document.getElementById('bounce');
// bounce.innerHTML = 'BOUNCE!';
bounce.onclick = () => {
    Tone.Transport.start();
    // Tone.Transport.start("+0.1", 0);

    // if (bounceControl === false) {
    //     bounceControl = true;
    //     bounce.innerHTML = 'STOP';
    // }
    // else {
    //     bounceControl = false;
    //     bounce.innerHTML = 'BOUNCE!';
    // }
};

document.getElementById('shape-form').onchange = (evt) => {
    switch (evt.target.value) {
        case 'box':
            currentShape = box;
            break;
        case 'sphere':
            currentShape = sphere;
            break;
        case 'torus':
            currentShape = torus;
            break;
        default:
            currentShape = box;
            break;
    }
    obj.geometry = currentShape;
    obj.geometry.buffersNeedUpdate = true;
};

document.getElementById('mesh-form').onchange = (evt) => {
    switch (evt.target.value) {
        case 'phong':
            currentMesh = phong;
            break;
        case 'basic':
            currentMesh = basic;
            break;
        case 'lambert':
            currentMesh = lambert;
            break;
        default:
            currentMesh = box;
            break;
    }
    obj.material = currentMesh;
    obj.material.needsUpdate = true;
};

let controlsId = document.getElementById('controls-container');
let settingsId = document.getElementById('settings-container');
let toggleId = document.getElementById('settings-toggle-btn');


toggleId.onclick = (el) => {
    // console.log('RUN toggleId');
    toggleId.classList.toggle('hidden-active');
    settingsId.classList.toggle('hidden');
};

let addShapeId = document.getElementById('call-add-shape');
addShapeId.onclick = (el) => {
    addBody();
};

if (globals.autoStart === true || globals.hideUI === true) {
    controlsId.classList.toggle('hidden');
}

if (globals.autoStart === true) {
    setTimeout(function() {
        Tone.Transport.start();
    }, globals.autoStartTime);
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
//     globals.cameraPositionBehind = false;
//     // globals.camera.position.set(0, 20, 40);
//     // globals.camera.position.set(0, 5, 35);
//     globals.camera.position.set(0, 12, 30);
//     globals.camera.lookAt(new THREE.Vector3(0, 1, 10));
//     // globals.camera.lookAt(new THREE.Vector3(-1, 1, 10));
// // }, globals.autoStartTime + 32000); //globals.autoStartTime = 9000
// }, globals.autoStartTime + 46000); 
// // }, 33000);
// // }, 1000);

// globals.cameraPositionBehind = false;
// // camera.position.set(0, 5, 35);
// camera.position.set(0, 5, 35);
// camera.lookAt(new THREE.Vector3(-1, 1, 10));
// // camera.lookAt(new THREE.Vector3(-1, 1, 10));
// setTimeout(function() {
//     scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0028 );
//     globals.cameraPositionBehind = true;
//     camera.position.set(globals.posBehindX, 6, globalPosBehindZ);
//     camera.lookAt(new THREE.Vector3(globalDropPosX - 5, 1, globalPosBehindZ));
// }, 58000);
// // }, 2000);

// setTimeout(function() {
//     flameFirst.addFire();
// }, 1000);