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
    Store.camera.lookAt(new THREE.Vector3(Store.dropPosX - 5, 1, Store.view.posBehindZ));
}

if (Store.cameraLookUp === true) {
    Store.camera.lookAt(new THREE.Vector3(Store.dropPosX - 5, 100, Store.view.posBehindZ));
}

if (Store.keysOnly === true) {
    Store.camera.position.z -= 6; // PREV, middle of first keyboard staff
    Store.view.posBehindX -= 10;
}

if (Store.drumsOnly === true) {
    // Store.camera.position.z -= 10; // only see top half of spinner
    Store.camera.position.z += 8;
    Store.view.posBehindX -= 10;
}

Store.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(Store.renderer.domElement);
Store.renderer.domElement.id = 'bounce-renderer';

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
if (Store.keysOnly !== true) {
    // addStaffLines(0x000000, Store.staffLineInitZ, -1000, staffLineLengthEnd, 0.08, 0, 2);
} else if (Store.keysOnly === true) {

    const lineYHeight = -0.95;
    addStaffLines(0xffffff, Store.staffLineSecondZ, -1000, staffLineLengthEnd, lineYHeight, 0, 2);

    // two dashed lines above treble clef
    addStaffLines(0xffffff, Store.staffLineSecondZ - 10, -1000, staffLineLengthEnd, lineYHeight, 0, 2, true, true);
} else {}


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
// var spriteTexture = Store.loader.load("assets/ai_robot_1.jpeg"); // http://localhost:8082/assets/ai_robot_1.jpeg
// // var spriteTexture = Store.loader.load('/assets/ai_robot_1.jpg', onTextureLoaded);
// var spriteMaterial = new THREE.SpriteMaterial({
//     map: spriteTexture,
//     color: 0xffffff
// });
// var robotSprite = new THREE.Sprite(spriteMaterial);
// robotSprite.position.set(-10, 8, 0);
// // robotSprite.scale.set(5, 10, 5);
// robotSprite.scale.set(2, 2, 2);
// Store.scene.add(robotSprite);

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

let machineStateId = document.getElementById('machine-state');
let machineDataId = document.getElementById('machine-data');

//-----ANIMATION------//
let animate = () => {
    requestAnimationFrame(animate);

    var delta = Store.clock.getDelta();
    // console.log('delta: ', delta); //hundreths
    // TODO: fix logs - why not updating correctly?
    // console.log('ticks: ', Tone.Transport.ticks); //ex. 10 
    // console.log('position: ', Tone.Transport.position); //ex: 0:0:0.124
    // console.log('seconds: ', Tone.Transport.seconds);
    // console.log(Store.ticks);
    // console.log(Store.clock.elapsedTime);

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
            Store.camera.position.x = Store.view.posBehindX + (Store.ticks);
            // console.log(Store.camera);
        } else {
            // Store.camera.position.x = (Store.ticks) - 30; // 0.3, 0.2
            Store.camera.position.x = (Store.ticks) - 30;
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
        } else {

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
                    // console.log({keyMapped});
                    physics.addBody(true, Store.dropPosX, keyMapped);
                    // Store.dropPosX -= 1.3; //TODO: how to manipulate Y drop position?
                    console.log('keydown -> keyMapped, event: ', keyMapped, event);
                } else {
                    console.log('keyMapped UNDEF -> else: ', event);
                }
            }
        }
    }, false);

    animate();

    // addBody(sphere = true, xPosition = 5.5, options = 'Z', timeout = 0);
    // physics.addBody();

};

function activeSwitcher(obj) {
    return (obj.userData.opts.moveControl ? false : true);
}

//setInterval(function () {document.getElementById("myButtonId").click();}, 1000);

// TODO: ECharts heatmap or 3d bar floor
// https://communities.sas.com/t5/SAS-Communities-Library/Combining-the-Power-of-D3-with-Three-js-to-Create-a-3D/ta-p/569501
// https://github.com/sassoftware/sas-visualanalytics-thirdpartyvisualizations/blob/master/samples/D3Thursday/16_Basic_3D_Choropleth.html
// https://github.com/sassoftware/sas-visualanalytics-thirdpartyvisualizations/blob/master/samples/D3Thursday/19_3D_Residual_Plot.html

// based on prepared DOM, initialize echarts instance
var myChart = echarts.init(document.getElementById('chart'));

// specify chart configuration item and data
var option = {
    title: {
        // text: 'Song Stats'
    },
    tooltip: {},
    legend: {
        data:['Note']
    },
    xAxis: {
        data: ["shirt","cardign","chiffon shirt","pants","heels","socks"]
    },
    yAxis: {},
    series: [{
        name: 'Note',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};

// use configuration item and data specified to show chart
myChart.setOption(option);