import Tone from 'Tone';
import Store from './Store.js';
import InstrumentMappings from './InstrumentMappings.js';
import { getInstrumentMappingTemplate, generateInstrMetadata, getInstrByInputNote } from './InstrumentMappings.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import Light from './Light.js';
import Flame from './Flame.js';
import Physics from './Physics.js';
import Helpers from './Helpers.js';
import Pool from './Pool.js';
import Trigger from './Trigger.js';
import * as Tonal from "tonal";

import Stats from 'stats.js';

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// console.clear();

// TODO: import all files using modules
// https://threejs.org/docs/#manual/en/introduction/Import-via-modules

/***
 *** SCENE SETUP ***
 * Tone.js: v13.8.4 *
 * Three.js: v97 *
 * TODO: update to most recent of both libs
 ***/

// const helpers = new Helpers();
// const pool = new Pool();

if (Store.view.showStats === true) {
    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
}

//-----INITIAL GLOBAL VARIABLES------//
// const globalClock = new THREE.Clock();

const instrument = new InstrumentMappings();

Store.instr = getInstrumentMappingTemplate();

//TODO: no globals, setup Webpack or Gulp
const globalBallTextureWidth = 512;
const globalCollisionThreshold = 4; //prev: 3.4

// TODO: remove all globalLetterNumArr calls
const globalLetterNumArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG']; //TODO: remove globalLetterNumArr array, only instrumentMapping obj needed

/*** 
 *** 3D ENVIRONMENT ***
 ***/

//set up the scene
//TODO: use modules - https://threejs.org/docs/#manual/en/introduction/Import-via-modules
// const scene = new THREE.Scene();
Store.scene.background = new THREE.Color(0, 0, 0); //prev: 'white'

// Store.camera.position.set(0, 12, 40); // ORIG camera looking down on staff

// Store.camera.position.set(0, 30, 0); // directly above
// Store.camera.position.set(0, 6, 20); // 2nd param (y) = height
// Store.camera.position.set(0, 8, 22);
// Store.camera.position.set(0, 8, 26); // // v0.3, v0.4
Store.camera.position.set(0, 16, 26); 

// Store.camera.lookAt(new THREE.Vector3(0, 1, 0)); // v0.3, v0.4

Store.camera.lookAt(new THREE.Vector3(0, -2.5, 0)); // v0.5

if (Store.view.cameraPositionBehind === true) {
    Store.camera.position.set(Store.view.posBehindX, Store.view.posBehindY, Store.view.posBehindZ);
    // Store.camera.lookAt(new THREE.Vector3(Store.dropPosX - 5, 1, Store.view.posBehindZ));
    Store.camera.lookAt(new THREE.Vector3(Store.dropPosX, 1, Store.view.posBehindZ));
}

if (Store.cameraLookUp === true) {
    Store.camera.lookAt(new THREE.Vector3(Store.dropPosX - 5, 100, Store.view.posBehindZ));
}

if (Store.view.showStaff.treble === true && Store.view.showStaff.bass === true) {
    // Store.camera.position.z -= 6; // middle of treble staff
    // Store.view.posBehindX -= 10;
    Store.camera.position.z = 0;
    Store.view.posBehindX -= 10;
}

if (Store.drumsOnly === true) {
    // Store.camera.position.z -= 10; // only see top half of spinner
    Store.camera.position.z += 8;
    Store.view.posBehindX -= 10;
}

Store.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(Store.renderer.domElement);
Store.renderer.domElement.id = 'canvas-scene-primary';

// update viewport on resize
window.addEventListener('resize', function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    Store.renderer.setSize(width, height);
    Store.camera.aspect = width / height; //aspect ratio
    Store.camera.updateProjectionMatrix();
});

//CONTROLS
// controls = new THREE.OrbitControls(camera, Store.renderer.domElement);

// https://threejs.org/examples/#misc_controls_fly
Store.controls = new FlyControls(Store.camera);
Store.controls.movementSpeed = 1; //prev: 10
Store.controls.domElement = Store.renderer.domElement;
// Store.controls.rollSpeed = Math.PI / 24;
Store.controls.rollSpeed = Math.PI / 40; /*** IMPORTANT - movement, rotation speed ***/
Store.controls.autoForward = false;
Store.controls.dragToLook = true;

//*** LOADER ***
Store.loader = new THREE.TextureLoader();
// Store.loader.load('assets/textures/grass.png', onTextureLoaded);

function onTextureLoaded(texture) {
    console.log('onTextureLoaded() run......');
    // loadSkyBox();
    // setupStage(); // high end VR devices stage parameters into account
}

// TODO: add light rays
//       https://github.com/mrdoob/three.js/issues/767#issuecomment-471615486
//       https://jsfiddle.net/q0Lfm165/

const light = new Light();
light.addLights(Store.renderer);

const physics = new Physics();
physics.initPhysics();

//-----GEOMETRY VARIABLES------//
let box = new THREE.BoxGeometry(1, 1, 1);
let sphere = new THREE.SphereGeometry(0.5, 32, 32);
let torus = new THREE.TorusGeometry(0.5, 0.25, 32, 32, 2 * Math.PI);

//-----MATERIAL VARIABLES------//
let phong = new THREE.MeshPhongMaterial({
    color: 'pink',
    emissive: 0,
    specular: 0x070707,
    shininess: 100
});
let basic = new THREE.MeshBasicMaterial({
    color: 'pink'
});
let lambert = new THREE.MeshPhongMaterial({
    color: 'pink',
    reflectivity: 0.5,
    refractionRatio: 1
});

//-----OBJ FUNCTIONALITY------//
//make the objects and add them to the scene
let currentShape, currentMesh;
currentShape = box;
currentMesh = phong;
const objCenter = new THREE.Mesh(currentShape, currentMesh);
objCenter.position.set(0, 0, Store.view.posBehindZ);
// Store.scene.add(objCenter); //for absolute center reference

//-----SKYBOX (LOAD TEXTURES)------//
// https://github.com/hghazni/Three.js-Skybox/blob/master/js/script.js#L35
// assets: http://www.custommapmakers.org/skyboxes.php

const globalSkyboxTheme = 'nightsky';
// const globalSkyboxTheme = 'hills'; //blurry
// const globalSkyboxTheme = 'island'; //only unsupported .tga currently
// const globalSkyboxTheme = 'bluefreeze';
// const globalSkyboxTheme = 'mercury';

var skyboxGeometry = new THREE.CubeGeometry(1800, 1800, 1800);

var cubeMaterials = [
    // new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/flame/FireOrig.png`), side: THREE.DoubleSide }), //front side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/skybox/${globalSkyboxTheme}/ft.png`), side: THREE.DoubleSide }), //front side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/skybox/${globalSkyboxTheme}/bk.png`), side: THREE.DoubleSide }), //back side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/skybox/${globalSkyboxTheme}/up.png`), side: THREE.DoubleSide }), //up side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/skybox/${globalSkyboxTheme}/dn.png`), side: THREE.DoubleSide }), //down side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/skybox/${globalSkyboxTheme}/rt.png`), side: THREE.DoubleSide }), //right side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(`assets/skybox/${globalSkyboxTheme}/lf.png`), side: THREE.DoubleSide }) //left side
];

var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
var skyboxCubeMesh = new THREE.Mesh(skyboxGeometry, cubeMaterial); //nightsky skybox

if (Store.view.skybox === true) {
    Store.scene.add(skyboxCubeMesh); //add nightsky skybox
}

// physics.addSpinner();

//-----MUSIC STAFF------//
function addStaffLines(color = 0x000000, offset, posXstart, posXend, posY, posZ, innerLinePadding, dashedLines = false, middleC = false) {
    // https://threejs.org/docs/#api/en/materials/LineBasicMaterial
    // BUG for linewidth greater than 1 - see: https://mattdesl.svbtle.com/drawing-lines-is-hard
    // use: https://threejs.org/examples/#webgl_lines_fat

    const origOffset = offset;
    let staffLineMaterial;
    for (let i = 0; i < 5; i++) {

        offset = origOffset;
        if (i === 0 && middleC === true) {
            offset += 20;
        }

        const staffLineGeo = new THREE.Geometry();
        const zCoord = (posZ + (innerLinePadding * i) + offset);
        staffLineGeo.vertices.push(
            new THREE.Vector3(posXstart, posY, zCoord),
            new THREE.Vector3(posXend, posY, zCoord)
        );
        if (i % 2) {
            staffLineMaterial = new THREE.LineBasicMaterial({
                color: color,
                // color: 0x0000ff, //blue (every other)
                linewidth: 2000, //no effect
            });
        } else {
            staffLineMaterial = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 2000,
                // opacity: 0.1, //no effect
            });
        }
        let staffLine = new THREE.Line(staffLineGeo, staffLineMaterial);
        if (dashedLines === true) {
            // if (i <= 1) {
            if (i === 0 && middleC === true) {
                staffLine = new THREE.Line(staffLineGeo, new THREE.LineDashedMaterial( { color: 0xffffff, dashSize: 1, gapSize: 5 } )); // blue: 0x0000ff
                staffLine.computeLineDistances();
            } else if (i === 3 || i === 4) {
                staffLine = new THREE.Line(staffLineGeo, new THREE.LineDashedMaterial( { color: 0xffffff, dashSize: 1, gapSize: 5 } )); // blue: 0x0000ff
                staffLine.computeLineDistances();
            } else {
                staffLine = new THREE.Line(); // empty line
            }
        }
        Store.scene.add(staffLine);
    }
}

const staffLineLengthEnd = 8000;
const lineYHeight = -0.95;
// if (Store.keysOnly !== true) {
//     // addStaffLines(0x000000, Store.staffLineInitZ, -1000, staffLineLengthEnd, 0.08, 0, 2);
// } 

if (Store.view.showStaff.treble === true) {
    addStaffLines(0xffffff, -10, -1000, staffLineLengthEnd, lineYHeight, 0, 2);
    addStaffLines(0xffffff, -20, -1000, staffLineLengthEnd, lineYHeight, 0, 2, true, true); // two dashed lines above treble clef
}

if (Store.view.showStaff.bass === true) {
    addStaffLines(0xffffff, 2, -1000, staffLineLengthEnd, lineYHeight, 0, 2);
}

function addThickStaffLines() {
    // TODO: fix and UNCOMMENT vendor/Three/lines files in index.html
    // Position and Color Data
    var line, line1;
    var matLine, matLineBasic, matLineDashed;
    var positions = [];
    var colors = [];
    var points = hilbert3D(new THREE.Vector3(0, 0, 0), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7);
    var spline = new THREE.CatmullRomCurve3(points);
    var divisions = Math.round(12 * points.length);
    var color = new THREE.Color();
    for (var i = 0, l = divisions; i < l; i++) {
        var point = spline.getPoint(i / l);
        positions.push(point.x, point.y, point.z);
        // positions.push( i, 1, 0 );
        color.setHSL(i / l, 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
    }

    // for ( var i = 0; i < 5; i ++ ) {
    //     positions.push( i, 1, 0 );
    //     // color.setHSL( i / l, 1.0, 0.5 );
    //     // colors.push( color.r, color.g, color.b );
    // }
    // colors = [1, 0, 0, 1, 0.007812499999999556, 0]

    // THREE.Line2 ( LineGeometry, LineMaterial )
    var geometry = new THREE.LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);
    matLine = new THREE.LineMaterial({
        color: 0xffffff,
        linewidth: 1, // in pixels
        vertexColors: THREE.VertexColors,
        //resolution:  // to be set by renderer, eventually
        dashed: false
    });
    lineThick = new THREE.Line2(geometry, matLine);
    lineThick.computeLineDistances();
    // lineThick.scale.set( 1, 1, 1 );
    lineThick.scale.set(0.02, 0.02, 0.02);
    Store.scene.add(lineThick);

    // var geo = new THREE.BufferGeometry();
    // geo.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
    // geo.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    // matLineBasic = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
    // matLineDashed = new THREE.LineDashedMaterial( { vertexColors: THREE.VertexColors, scale: 2, dashSize: 1, gapSize: 1 } );
    // line1 = new THREE.Line( geo, matLineBasic );
    // line1.computeLineDistances();
    // line1.visible = false;
    // line1.position.set( 1, 1, 1 );
    // line1.scale.set( 1, 1, 1 );
    // Store.scene.add(line1);
}
// addThickStaffLines();

//-----Static Fire Example------//
Store.loader.crossOrigin = '';

let flameActive = false;
// // let flameFirst = new Flame(Store.triggerAnimationTime);
// let flameFirst = new Flame();
// // flameFirst.create();


//-----Lil A.I. Logo Image------//
if (Store.view.showLogoSprite === true) {
    var spriteTexture = Store.loader.load("assets/ai_robot_1.jpeg"); // http://localhost:8082/assets/ai_robot_1.jpeg
    // var spriteTexture = Store.loader.load('/assets/ai_robot_1.jpg', onTextureLoaded);
    var spriteMaterial = new THREE.SpriteMaterial({
        map: spriteTexture,
        color: 0xffffff
    });
    var robotSprite = new THREE.Sprite(spriteMaterial);
    robotSprite.position.set(0, 0, 0);
    // obotSprite.position.set(-10, 8, 0);
    // robotSprite.scale.set(5, 10, 5);
    // robotSprite.scale.set(2, 2, 2);
    Store.scene.add(robotSprite);
}

//-----PREV (Static Animation Methods)------//
function getObjectState(object, objPositionUp, threshold) {
    // TODO: remove
    if (object.position.y > threshold) {
        objPositionUp = false;
    } else if (object.position.y < -threshold) {
        objPositionUp = true;
    }
    return objPositionUp;
}
function moveObject(object, motionActive, positionUp, threshold) {
    // TODO: remove
    if (motionActive) {
        // object.rotation.x = 0;
        // object.rotation.y = 0;
        if (positionUp) {
            object.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), 0.1);
            if (object.position.y > threshold) {
                triggerNote(object);
            }
        } else if (!positionUp) {
            object.translateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -0.1);
            if (object.position.y < -threshold) {
                triggerNote(object);
            }
        } else {
            object.position.set(0, 0, 0);
        }
    }
}

// TODO: remove or learn to use Tone.Clock time instead of getDelta()
// var toneClock = new Tone.Clock(function(time) {
//     console.log(time);
// }, 1);
// var clock = new THREE.Clock();

let dropAngle = 0;
function rotateCalc(a) {
    // https://stackoverflow.com/a/35672783
    let x = 0
    let y = 0;  // lower = closer to center of spinner
    // let y = 8; 

    let r = 10.25;   // radius

    // let a = 0;   // angle (from 0 to Math.PI * 2)

    // x += Store.dropOffset;
    // y += Store.dropOffset;

    var px = x + r * Math.cos(a);
    var py = y + r * Math.sin(a);
    return {
        'px': px,
        'py': py
    }
}

if (Store.view.drumCircle === true) {
    for (var i=0; i<720; i++) {
        dropAngle = (dropAngle + Math.PI / 360) % (Math.PI * 2);
        let dropCoord = rotateCalc(dropAngle);
        Store.dropCoordCircle.push(dropCoord);
    }
    const dropInterval = Store.dropCoordCircle.length / 4;
    Store.dropCoordCircleInterval = [Store.dropCoordCircle[0], Store.dropCoordCircle[dropInterval], Store.dropCoordCircle[dropInterval * 2], Store.dropCoordCircle[dropInterval * 3]]    
}

//-----STAR ANIMATION------//
// https://codepen.io/sjcobb/pen/PKzOdQ?editors=1010

let stars = [];
function addSphere() {
	for (var z = -1000; z < 1000; z += 20) {
	// for (var z = 0; z < 1500; z += 20) {
		// var geometry = new THREE.SphereGeometry(0.5, 32, 32);
		var geometry = new THREE.SphereGeometry(0.25, 32, 32);
		var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		var sphere = new THREE.Mesh(geometry, material);
		// sphere.position.x = Math.random() * 1000 - 500;
		// sphere.position.y = Math.random() * 1000 - 500;
        // sphere.position.z = z;
        
        sphere.position.x = z;
		sphere.position.y = Math.random() * 1000 - 500;
        sphere.position.z = Math.random() * 1000 - 500;
        
		// sphere.scale.x = sphere.scale.y = 2;
        sphere.scale.z = sphere.scale.y = 2;
        
		Store.scene.add(sphere);
		stars.push(sphere);
	}
}
function animateStars() {
	for (var i = 0; i < stars.length; i++) {
		const star = stars[i];
		// star.position.z += i / 10;
        // if (star.position.z > 1000) star.position.z -= 2000;
        
        star.position.x += i / 10;
        // console.log(star.position.x);
		if (star.position.x > 1000) star.position.x -= 2000;
	}
}
// addSphere();

//-----AI UI------//

let machineStateId = document.getElementById('machine-state');
let machineDataId = document.getElementById('machine-data');

//-----ANIMATION------//
let animate = () => {

    // requestAnimationFrame(animate);
    if (Store.view.showStats === true) {
        stats.begin();
    }

    var delta = Store.clock.getDelta();
    // console.log('delta: ', delta); //hundreths
    // TODO: fix logs - why not updating correctly?
    // console.log('ticks: ', Tone.Transport.ticks); //ex. 10 
    // console.log('position: ', Tone.Transport.position); //ex: 0:0:0.124
    // console.log('seconds: ', Tone.Transport.seconds);
    // console.log(Store.ticks);
    // console.log(Store.clock.elapsedTime);

    // animateStars();

    /*
    //circular rotation
    globalRotation += 0.002;
    Store.camera.position.x = Math.sin(globalRotation) * 15; //prev: 500
    Store.camera.position.z = Math.cos(globalRotation) * 15;
    Store.camera.lookAt(Store.scene.position); // the origin
    */

    //ENABLE HORIZONTAL SCROLL
    if (Store.autoScroll === true) {
        // const ticksMultiplier = 9; // v0.2, v0.3, v0.4
        const ticksMultiplier = 12;

        Store.ticks += (delta * ticksMultiplier); // Too fast, balls dropped too far left
        
        if (Store.view.cameraPositionBehind === true) {

            if (Store.view.cameraAutoStart === true) {
                Store.camera.position.x = Store.view.posBehindX + (Store.ticks);
            }

        } else {
            // Store.camera.position.x = (Store.ticks) - 30; // 0.3, 0.2
            Store.camera.position.x = (Store.ticks) - 35;
        }
    }

    // if (Store.view.drumCircle === true) {
    //     // 3D z axis rotation: https://jsfiddle.net/prisoner849/opau47vk/
    //     // camera Three.js ex: https://stackoverflow.com/a/10342429
    //     // USE - simple trig ex: https://stackoverflow.com/a/35672783
    //     dropAngle = (dropAngle + Math.PI / 360) % (Math.PI * 2);
    //     let dropCoord = rotateCalc(dropAngle);
    //     Store.dropPosX = dropCoord.px;
    //     Store.dropPosY = dropCoord.py;
    // }

    // to reinit flame animation, see: https://github.com/sjcobb/music360js/blob/v4-fire/src/js/app.js
    // if (flameActive === false) {}

    physics.updateBodies(Store.world);
    Store.world.step(Store.fixedTimeStep);

    Store.controls.update(delta);

    Store.renderer.render(Store.scene, Store.camera);

    // if (Store.ui) {
    if (Store.ai.enabled === true) {
        if (Store.ui.machine.currentSequence.length > 0) {

            let mappedNotes = Store.ui.machine.currentSequence.map(note => Tonal.Note.fromMidi(note));

            if (Store.machineTrigger === true) {
                machineDataId.innerHTML = mappedNotes.join(', ');
            } else {
                machineDataId.innerHTML = '';
            }
        }

        if (Store.machineTrigger === true) {
            machineStateId.innerHTML = '- ON';
        } else {
            machineStateId.innerHTML = '- OFF';
        }
    }

    if (Store.view.showStats === true) {
        stats.end();
    }

    requestAnimationFrame(animate);

};

window.onload = () => {
    //-----KEYBOARD MAPPING------//
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    document.addEventListener('keydown', (event) => {
        const keyName = event.key;

        if (keyName === 'Control') {
            // do not log when only Control key is pressed.
            return;
        }

        if (event.ctrlKey) {
            //console.log(`Combination of ctrlKey + ${keyName}`);
        } else if (Store.currentNote.keydownPressed === false) {

            // console.log('key... ', instrument);
            let keyMapped = instrument.getKeyboardMapping(keyName);
            // console.log({keyMapped});

            // console.log({keyName});
            switch (keyName) { 
                case ('z'):
                    // physics.addBody(true, Store.dropPosX, keyMapped);
                    // Store.dropPosX -= 1.3;
                    break;
                case(' '):
                    console.error('... SPACEBAR RESET -> polySynth.triggerRelease() ...');
                    if (Store.polySynth) {
                        console.log(Store.polySynth);
                        Store.polySynth.releaseAll();
                        // Store.polySynth.triggerRelease();
                        // Store.polySynth.dispose();
                        // Store.polySynth.disconnect();
                        // Store.polySynth.connect();
                    } 
                    // console.log(Tone.Transport);
                    // Tone.disconnect();
                    // Tone.Transport.destroy();
                    // Tone.Transport.stop();
                    // bounceSynth.disconnect();
                    // bounceSynth.dispose();
                default:
                    // console.log('keydown -> DEFAULT...', event);
            }

            if (keyMapped !== undefined) {
                // *** OLD showStaticRows, placeStaticPoolBalls() animation mapping
                // let instrumentInput = poolBalls[keyMapped.objName];
                // if (instrumentInput !== undefined && keyMapped.movement === 'static') {
                //     instrumentInput.userData.opts.moveControl = activeSwitcher(instrumentInput); //static ball array movement (no physics)
                // } 
                
                if (keyName === keyMapped.keyInput) { //*** IMPORTANT ***
                    // console.log('keydown -> keyMapped: ', keyMapped);
                    // console.log('keydown -> event: ', event);
                    // console.log('keydown -> event.timeStamp: ', event.timeStamp);

                    Store.currentNote.keydownPressed = true;
                    // console.log('keydown -> event.timeStamp: ', event.timeStamp);

                    // physics.addBody(true, Store.dropPosX, keyMapped);
                    
                    console.log('Store.clockNote: ', Store.clockNote);
                    Store.clockNote.start();

                    Store.currentNote.keydownTimeStamp = event.timeStamp;

                    // const maxNoteDuration = 500;
                    const maxNoteDuration = 1500;
                    keyMapped.duration = maxNoteDuration / 1000;

                    setTimeout(function () {
                        // console.log(Store.clockNote.getDelta());

                        const timeStampDifference = Store.currentNote.keyupTimeStamp - Store.currentNote.keydownTimeStamp;
                        console.log({timeStampDifference});
                        console.log('pre keyMapped.duration: ', keyMapped.duration);

                        if (timeStampDifference < maxNoteDuration) {
                            keyMapped.duration = timeStampDifference / 1000;
                        }
                        console.log('post keyMapped.duration: ', keyMapped.duration);


                        physics.addBody(true, Store.dropPosX, keyMapped);
                    }, maxNoteDuration);


                } else {
                    console.log('keyMapped UNDEF -> else: ', event);
                }
            }
        }
    }, false);

    document.addEventListener('keyup', (event) => {
        console.log('keyup -> event: ', event);
        console.log('keyup -> event.timeStamp: ', event.timeStamp);

        Store.currentNote.keydownPressed = false;

        Store.currentNote.keyupTimeStamp = event.timeStamp;
    }, false);

    animate();

    // addBody(sphere = true, xPosition = 5.5, options = 'Z', timeout = 0);
    // physics.addBody();

    
    setTimeout(() => {
        createCharts(false);
        // addDashboard3D();
    }, 3000);

};

function activeSwitcher(obj) {
    return (obj.userData.opts.moveControl ? false : true);
}

//setInterval(function () {document.getElementById("myButtonId").click();}, 1000);

/* 
 * MUSIC VISUALIZATION DASHBOARD
 */

function initDashboardData() {
    for (var key in Store.instr) {
        if (Store.instr.hasOwnProperty(key)) {
            const currentInstr = Store.instr[key];
            // console.log({currentInstr});
            if (currentInstr.note && currentInstr.octave) {
                Store.dashboard.instrData.push(currentInstr.note + currentInstr.octave);
            }
        }
    }
} 

function countNotes(arr) {
    let labelsArr = [];
    let countArr = [];
    let tempArr = [];
    let prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            // labelsArr.push(arr[i].toString());
            labelsArr.push(arr[i]);
            countArr.push(1);
            // tempArr.push('1:0:0');
            // tempArr.push(i);
        } else {
            countArr[countArr.length-1]++;
        }
        prev = arr[i];
    }

    // const result = [labelsArr, countArr];
    // console.log({result}); 

    // Store.dashboard.noteCountsDataset.source.note = labelsArr;
    // Store.dashboard.noteCountsDataset.source.noteCount = countArr;

    // Store.dashboard.noteCountsDataset.source.time = tempArr;
    // Store.dashboard.noteCountsDataset.source.time = [Store.ticks];
    // Store.dashboard.noteCountsDataset.source.midi = Store.ticks;
    // Store.dashboard.noteCountsDataset.source.test = countArr;
    // console.log(Store.dashboard.noteCountsDataset.source);

    const result = {
        label: labelsArr,
        count: countArr,
    };
    // console.log({result});
    return result;
}

function updateDashboardData() {
    // console.log('(updateDashboardData CALLED) -> Store: ', Store);

    // console.log('(updateDashboardData CALLED) -> Store.dashboard: ', Store.dashboard);

    // const countedNotes = countNotes(Store.dashboard.allPlayedNotes);
    // const countedOctaves = countNotes(Store.dashboard.allPlayedOctaves);

    // // console.log({countedNotes});
    // // console.log({countedOctaves});
    // Store.dashboard.noteCountsDataset.source.note = countedNotes.label;
    // Store.dashboard.noteCountsDataset.source.noteCount = countedNotes.count;

    // // Store.dashboard.noteCountsDataset.source.octave = countedOctaves.label.toString();
    // Store.dashboard.noteCountsDataset.source.octave = countedOctaves.label;
    // Store.dashboard.noteCountsDataset.source.octaveCount = countedOctaves.count;

    // Store.dashboard.noteCountsDatasetRow.source = Store.dashboard.noteCountsDatasetRow.source.sort((a, b) => (a.octave > b.octave) ? 1 : -1)
    // console.log(Store.dashboard.noteCountsDatasetRow.source);

    // countNotes(Store.dashboard.allPlayedOctaves, Store.dashboard.noteCountsDataset.source.octave);

    // Store.dashboard.recentPlayedNotes = [];

    // var uniqueNotes = Store.dashboard.recentPlayedNotes.filter((v, i, a) => a.indexOf(v) === i);
    // var uniqueNotes = Store.dashboard.allPlayedNotes.filter((v, i, a) => a.indexOf(v) === i);
    // console.log({uniqueNotes});

    // const newNotes = [];
    // const newNote = '';
    // // for (let i=0; i < Store.dashboard.noteCounts.length; i++) {
    // for (let i=0; i < uniqueNotes.length; i++) {
        

    //     for (let j=0; j < Store.dashboard.noteCounts.length; j++) {
    //         if (Store.dashboard.noteCounts[j].note === uniqueNotes[i]) {
    //             newNote
    //         }
    //     }

    //     console.log({newNotes});

    // }

    // for (let i=0; i < newNotes.length; i++) {
    //     Store.dashboard.noteCounts.push(
    //         {
    //             note: newNotes[i],
    //             count: 1,
    //         }
    //     );
    // }

    // for (let i=0; i < Store.dashboard.recentPlayedNotes.length; i++) {
    // for (let i=0; i < uniqueNotes.length; i++) {

    //     // TODO: why not reaching this line after forEach conversion?
    //     console.log({i});
    //     const playedNote = Store.dashboard.recentPlayedNotes[i];
    //     console.log({playedNote});


    //     // if (Store.dashboard.allPlayedNotes.includes(playedNote)) {

    //     // } else {
    //     //     console.log('new -> playedNote: ', playedNote);
    //     //     Store.dashboard.noteCounts.push(
    //     //         {
    //     //             note: playedNote,
    //     //             count: 1,
    //     //         }
    //     //     );
    //     //     console.log('new -> Store.dashboard.noteCounts: ', Store.dashboard.noteCounts);
    //     // }

    //     //Store.dashboard.noteCounts.forEach((noteCount, noteCountIndex) => {
    //     for (let j=0; j < Store.dashboard.noteCounts.length; j++) {
    //         const noteCount = Store.dashboard.noteCounts[j];
    //         console.log({noteCount});
    //         if (playedNote === noteCount.note) {
    //             // Store.dashboard.noteCounts[noteCountIndex].count++;
    //             Store.dashboard.noteCounts[j].count++;
    //             console.log('increment noteCounts -> count: ', Store.dashboard.noteCounts[j].count);
    //             break;
    //         } else if (playedNote !== noteCount.note) {
    //             // console.log('new playedNote: ', playedNote);
    //             // Store.dashboard.noteCounts.push(
    //             //     {
    //             //         note: playedNote,
    //             //         count: 1,
    //             //     }
    //             // );

    //             // break;
    //             // // return;
    //         } else {
    //             // return;
    //         }

    //         Store.dashboard.recentPlayedNotes = [];
    //     }
    //     //});
    //
    //    console.log('UPDATED -> Store.dashboard.noteCounts: ', Store.dashboard.noteCounts);
    //  }
    // });


    createCharts(true);

}

function createCharts(showGrid = false) {
    // TODO: ECharts heatmap or 3d bar floor
    // https://communities.sas.com/t5/SAS-Communities-Library/Combining-the-Power-of-D3-with-Three-js-to-Create-a-3D/ta-p/569501
    // https://github.com/sassoftware/sas-visualanalytics-thirdpartyvisualizations/blob/master/samples/D3Thursday/16_Basic_3D_Choropleth.html
    // https://github.com/sassoftware/sas-visualanalytics-thirdpartyvisualizations/blob/master/samples/D3Thursday/19_3D_Residual_Plot.html
    // https://echarts.apache.org/examples/en/editor.html?c=bar3d-music-visualization&gl=1
    // https://echarts.apache.org/examples/en/editor.html?c=image-surface-sushuang&gl=1
    // https://echarts.apache.org/examples/en/editor.html?c=custom-hexbin
    // Circle of Fifths heatmap: https://echarts.apache.org/examples/en/editor.html?c=custom-polar-heatmap


    // https://echarts.apache.org/examples/en/editor.html?c=dataset-link
    // const dataset = {
    //     source: [
    //         ['product', '2012', '2013', '2014', '2015', '2016', '2017'],
    //         ['Matcha Latte', 41.1, 30.4, 65.1, 53.3, 83.8, 98.7],
    //         ['Milk Tea', 86.5, 92.1, 85.7, 83.1, 73.4, 55.1],
    //         ['Cheese Cocoa', 24.1, 67.2, 79.5, 86.4, 65.2, 82.5],
    //         ['Walnut Brownie', 55.2, 67.1, 69.2, 72.4, 53.9, 39.1]
    //     ]
    // };

    const dataset = Store.dashboard.dataset;

    // // // //
    // for (var key in Store.instr) {
    //     if (Store.instr.hasOwnProperty(key)) {
    //         const currentInstr = Store.instr[key];
    //         // console.log({currentInstr});
    //         if (currentInstr.note && currentInstr.octave) {
    //             Store.dashboard.instrData.push(currentInstr.note + currentInstr.octave);
    //         }
    //     }
    // }

    // [Store.instr].forEach((instr, index) => {
    //     console.log({instr});
    // });

    // console.log('Store.dashboard.noteCountsDataset.source: ', Store.dashboard.noteCountsDataset.source);
    
    // https://www.echartsjs.com/en/download-theme.html
    // Store.dashboard.chart = echarts.init(document.getElementById('chart'));
    Store.dashboard.chart = echarts.init(document.getElementById('chart'), 'shine');
    // Store.dashboard.chart = echarts.init(document.getElementById('chart'), 'dark');
    // Store.dashboard.chart = echarts.init(document.getElementById('chart'), 'vintage');
    // Store.dashboard.chart = echarts.init(document.getElementById('chart'), 'macarons');

    const option = {
        title: {
            // text: 'Song Stats'
        },
        // color: ['#fff000'],
        color: [
            '#EE82EE',    // violet
            // '#FFFF00', // yellow
            // '#64b5f6', // human blue
            '#c12e34','#e6b600','#0098d9','#2b821d',
            '#005eaa','#339ca8','#cda819','#32a487'
        ],
        tooltip: {},
        legend: {
            // data:['Note']
        },
        // https://www.echartsjs.com/en/option-gl.html#grid3D
        // https://echarts.apache.org/examples/en/editor.html?c=bar3d-punch-card&gl=1
        grid3D: {
            // show: showGrid,
            show: true,
            top: 0,
            // right: 150,
            // bottom: 150,
            // left: 150,
            // boxWidth: 90,
            // boxHidth: 90,
            // boxDepth: 90,
            // boxWidth: 80,
            // boxDepth: 80,
            // width: '90%',
            // height: '90%',
            splitLine: {
                show: false,
            },
            // https://www.echartsjs.com/en/option-gl.html#grid3D.viewControl
            viewControl: {
                // projection: 'perspective', // default
                // projection: 'orthographic',
                // https://www.echartsjs.com/en/option-gl.html#grid3D.viewControl.autoRotate
                autoRotate: true, // false = default
                // autoRotateSpeed: 5,
                autoRotateSpeed: 12, // 10 = default
                autoRotateDirection: 'cw', // default is 'cw' means clockwise from top to bottom, can also use 'ccw' means counterclockwise from top to bottom
                // autoRotateAfterStill: 3,
                // damping: 0.8,
                // rotateSensitivity: 1,
                // zoomSensitivity: 1,
                // orthographicSize: 200,
                // maxOrthographicSize: 200,
                // maxDistance: 400,
                // alpha: 90, // view from top
                alpha: 15,
                // beta: 20,
                distance: 250,
                // distance: 800,
            },
            light: {
                main: {
                    // shadow: true,
                    // intensity: 1.5,
                    // quality: 'ultra',
                },
                // https://www.echartsjs.com/en/option-gl.html#grid3D.light.ambient
                ambient: {
                    // intensity: 0.8, // 0.2 = default
                }
            },
            // https://www.echartsjs.com/en/option-gl.html#grid3D.environment
            // environment: 'asset/starfield.jpg'
            //https://www.echartsjs.com/en/option-gl.html#grid3D.postEffect.colorCorrection
            // postEffect: {
            //     enable: true,
            //     colorCorrection {}
            // }
        },
        // visualMap: {
        //     max: 20,
        //     inRange: {
        //         color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        //     }
        // },
        // https://www.echartsjs.com/en/option-gl.html#yAxis3D
        yAxis3D: {
            show: true,
            type: 'category',
            name: 'Note',
            nameGap: 25,
            nameTextStyle: {
                color: '#fff',
                fontFamily: 'Verdana',
            },
            axisLabel: {
                interval: 0,
                // margin = 8
                fontFamily: 'Verdana',
                textStyle: {
                    color: '#fff',
                },
            },
            // data: Store.dashboard.instrData,
            // data: Store.dashboard.noteCountsDataset.source.note,
        },
        xAxis3D: {
            show: true,
            type: 'category',
            // name: 'Player',
            // name: 'TBD',
            name: 'Octave',
            nameGap: 25,
            nameTextStyle: {
                color: '#fff',
                fontFamily: 'Verdana',
            },
            axisLabel: {
                interval: 0,
                fontFamily: 'Verdana',
                textStyle: {
                    color: '#fff',
                },
            },
            // data: Store.dashboard.noteCountsDataset.source.noteCount,
        },
        zAxis3D: {
            show: false,
            type: 'value',
            name: '',
            nameGap: 20,
            nameTextStyle: {
                color: '#fff',
                fontFamily: 'Verdana',
            },
            axisLine: {
                // show: false,
                lineStyle: {
                    opacity: 0,
                }
            },
            axisTick: {
                show: false,
            },
            axisLabel: {
                show: false,
                fontFamily: 'Verdana',
                textStyle: {
                    color: '#fff',
                },
            },
        },
        series: [
            {
                // type: 'bar',
                type: 'bar3D',
                // shading: 'lambert',
                encode: {
                    // x: 0,
                    // y: 1,
                    // z: 1,
                    label: 'note',
                    y: 'note',
                    x: 'octave',
                    // y: 'time',
                    // z: 'noteCount',
                    // z: 'octaveCount',
                    z: 'count',
                    // tooltip: [0, 1, 2, 3, 4]
                },
                itemStyle: {
                    // color: '#900',
                    // opacity: 0.90,
                    opacity: 0.87,
                }
                // data: Store.dashboard.allPlayedNotes,
                // dimensions: Store.dashboard.instrData,
            },
            // { type: 'bar' },
            // {
            //     type: 'line', 
            //     smooth: true, 
            //     seriesLayoutBy: 'row',
            //     //seriesLayoutBy: 'column',
            // },
            // {
            //     type: 'line', 
            //     smooth: true, 
            //     seriesLayoutBy: 'row',
            //     //seriesLayoutBy: 'column',
            // },
            // {
            //     name: 'Note',
            //     type: 'bar',
            //     // data: [5, 20, 36, 10, 10, 20],
            //     seriesLayoutBy: 'row',
            //     // seriesLayoutBy: 'column',
            // },
            // {
            //     type: 'pie',
            //     radius: '30%',
            //     center: ['50%', '25%'],
            //     label: {
            //         formatter: '{b}: {@2012} ({d}%)'
            //     },
            //     encode: {
            //         itemName: 'product',
            //         value: '2012',
            //         // tooltip: '2012'
            //     }
            // }
        ],
        // dataset: dataset,
        dataset: {
            // source: Store.dashboard.noteCountsDataset.source,
            // source: Store.dashboard.noteCountsDatasetRow.source,
            source: Store.dashboard.noteCountsArr,
            dimensions: ['note', 'octave', 'count'],
            // imensions: ['note', 'noteCount', 'octave', 'octaveCount', 'time'],
            // source: Store.dashboard.noteCounts,
        },
    };

    // Store.dashboard.chart.resize(); // no effect

    // console.log({option});
    Store.dashboard.chart.setOption(option);
}

// const addDashboard3D = (params={}) => {
function addDashboard3D(params={}) {

    // const chartId = document.getElementById('chart');
    // const chartId = echarts.init(document.getElementById('chart');
    const chartSelector = Store.dashboard.chart;

    // https://threejs.org/docs/#api/en/geometries/BoxGeometry
    // const chartGeometry = new THREE.SphereGeometry(1, 250, 250);
    const chartGeometry = new THREE.BoxGeometry(1, 15, 15);

    // https://threejs.org/docs/#api/en/materials/MeshBasicMaterial
    const vizMesh = new THREE.Mesh(chartGeometry, new THREE.MeshBasicMaterial(
        { 
            map: getChartTexture(chartSelector),
            // map: getChartTexture(myChart),
            // color: 0x00ff00,
            // color: 0x00008b,
            // color: 0xefefef,
            color: 0xffffff,
        }
    ));

    // vizMesh.scale.set(2, 2, 2);
    vizMesh.position.set(0, 10, -25);
    Store.scene.add(vizMesh);
}

// const getChartTexture = (chart) => {
function getChartTexture(chart) {
    // https://stackoverflow.com/questions/37755406/load-textures-from-base64-in-three-js
    // http://bl.ocks.org/MAKIO135/eab7b74e85ed2be48eeb
    // https://dustinpfister.github.io/2018/04/17/threejs-canvas-texture/
    // https://threejsfundamentals.org/threejs/lessons/threejs-canvas-textures.html
    
    const canvasElement = document.querySelector('canvas');

    // https://echarts.apache.org/en/api.html#echartsInstance.getDataURL
    var img = new Image();
    img.src = chart.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#fff'
    });

    // https://threejs.org/docs/#api/en/textures/Texture
    // https://threejs.org/docs/#api/en/textures/CanvasTexture
    const canvasTexture = new THREE.CanvasTexture(canvasElement); // same as texture.needsUpdate = true;
    // canvasTexture.repeat.set(4, 4);
    // https://threejs.org/docs/#api/en/textures/Texture.rotation
    // https://threejs.org/docs/#api/en/textures/Texture.flipY
    // https://threejs.org/docs/#api/en/textures/Texture.clone
    // https://threejs.org/docs/#api/en/textures/Texture.dispose

    return canvasTexture;
}

initDashboardData();

// const lastNoteLength = Store.dashboard.recentPlayedNotes.length;
const lastNoteLength = Store.dashboard.allPlayedNotes.length;
setInterval(() => {

    // if (Store.dashboard.recentPlayedNotes.length !== Store.dashboard.lastNoteLength) {
    if (Store.dashboard.allPlayedNotes.length !== Store.dashboard.lastNoteLength) {
        updateDashboardData();
        Store.dashboard.lastNoteLength = Store.dashboard.recentPlayedNotes.length;
        // console.log('Store.dashboard.lastNoteLength: ', Store.dashboard.lastNoteLength);

        // addDashboard3D();
    }

}, 100);