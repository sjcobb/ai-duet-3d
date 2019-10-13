import Tone from 'Tone';
import globals from './globals.js';
import InstrumentMappings from './InstrumentMappings.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import Light from './Light.js';
import Flame from './Flame.js';
import Physics from './Physics.js';
import Helpers from './Helpers.js';
import Pool from './Pool.js';
import Trigger from './Trigger.js';

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

globals.instr = instrument.getInstrumentMappingTemplate();

//TODO: no globals, setup Webpack or Gulp
const globalBallTextureWidth = 512;
const globalCollisionThreshold = 4; //prev: 3.4

let globalDropPosX = 5.5;

// TODO: remove all globalLetterNumArr calls
const globalLetterNumArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG']; //TODO: remove globalLetterNumArr array, only instrumentMapping obj needed

/*** 
 *** 3D ENVIRONMENT ***
 ***/

//set up the scene
//TODO: use modules - https://threejs.org/docs/#manual/en/introduction/Import-via-modules
// const scene = new THREE.Scene();
globals.scene.background = new THREE.Color(0, 0, 0); //prev: 'white'

// globals.camera.position.set(0, 12, 40); // ORIG camera looking down on staff

// globals.camera.position.set(0, 30, 0); // directly above
// globals.camera.position.set(0, 6, 20); // 2nd param (y) = height
// globals.camera.position.set(0, 8, 22);
globals.camera.position.set(0, 8, 26);
globals.camera.lookAt(new THREE.Vector3(0, 1, 0));

if (globals.cameraPositionBehind === true) {
    globals.camera.position.set(globals.posBehindX, globals.posBehindY, globals.posBehindZ);
    globals.camera.lookAt(new THREE.Vector3(globals.dropPosX - 5, 1, globals.posBehindZ));
}

if (globals.cameraLookUp === true) {
    globals.camera.lookAt(new THREE.Vector3(globals.dropPosX - 5, 100, globals.posBehindZ));
}

if (globals.keysOnly === true) {
    globals.camera.position.z -= 6; // middle of first keyboard staff
    // globals.camera.position.z -= 8; // middle of first keyboard staff
    // globals.camera.position.z -= 14; // between each keyboard staff (dashed line C)

    // globals.camera.position.x -= 30; // remove, no difference
    globals.posBehindX -= 10;
}

globals.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(globals.renderer.domElement);
globals.renderer.domElement.id = 'bounce-renderer';

// update viewport on resize
window.addEventListener('resize', function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    globals.renderer.setSize(width, height);
    globals.camera.aspect = width / height; //aspect ratio
    globals.camera.updateProjectionMatrix();
});

//CONTROLS
// controls = new THREE.OrbitControls(camera, globals.renderer.domElement);

// https://threejs.org/examples/#misc_controls_fly
globals.controls = new FlyControls(globals.camera);
globals.controls.movementSpeed = 1; //prev: 10
globals.controls.domElement = globals.renderer.domElement;
// globals.controls.rollSpeed = Math.PI / 24;
globals.controls.rollSpeed = Math.PI / 40; /*** IMPORTANT - movement, rotation speed ***/
globals.controls.autoForward = false;
globals.controls.dragToLook = true;

//-----SKYBOX (LOAD TEXTURES)------//
// https://github.com/hghazni/Three.js-Skybox/blob/master/js/script.js#L35
// assets: http://www.custommapmakers.org/skyboxes.php

const globalSkyboxTheme = 'nightsky';
// const globalSkyboxTheme = 'hills'; //blurry
// const globalSkyboxTheme = 'island'; //only unsupported .tga currently
// const globalSkyboxTheme = 'bluefreeze';
// const globalSkyboxTheme = 'mercury';

// var geometry = new THREE.CubeGeometry(1200, 1200, 1200); //prev
var geometry = new THREE.CubeGeometry(1800, 1800, 1800);

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
var skyboxCubeMesh = new THREE.Mesh(geometry, cubeMaterial); //nightsky skybox

//*** LOADER ***
globals.loader = new THREE.TextureLoader();
// globals.loader.load('assets/textures/grass.png', onTextureLoaded);

function onTextureLoaded(texture) {
    // console.log('onTextureLoaded() run......');
    // loadSkyBox();
    // setupStage(); // high end VR devices stage parameters into account
}

// TODO: add light rays
//       https://github.com/mrdoob/three.js/issues/767#issuecomment-471615486
//       https://jsfiddle.net/q0Lfm165/

const light = new Light();
light.addLights(globals.renderer);

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

//-----FUNCTIONALITY------//
//make the objects and add them to the scene
let obj, currentShape, currentMesh;

currentShape = box;
currentMesh = phong;

obj = new THREE.Mesh(currentShape, currentMesh);
obj.position.set(-1.5, 0, 0);

const objCenter = new THREE.Mesh(currentShape, currentMesh);
objCenter.position.set(0, 0, globals.posBehindZ);

// globals.scene.add(obj);
// globals.scene.add(objCenter); //for absolute center reference

globals.scene.add(skyboxCubeMesh); //add nightsky skybox

//-----FLOOR------//
// var floorTexture = globals.loader.load('assets/textures/grass.png');
// floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
// floorTexture.repeat.set(3, 3);
// var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
// var floorGeometry = new THREE.PlaneGeometry(60, 100, 6, 6); //width, height, widthSegments, heightSegments
// var floor = new THREE.Mesh(floorGeometry, floorMaterial);
// floor.position.y = -6; //lower = floor lowers
// floor.rotation.x = Math.PI / 2; // 1.57
// globals.scene.add(floor);

//-----MUSIC STAFF------//
// var staffPlaneGeometry = new THREE.PlaneGeometry(10, 0.5, 0.5);
// var staffPlaneMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
// var staffPlaneMesh = new THREE.Mesh( staffPlaneGeometry, staffPlaneMaterial );
// globals.scene.add(staffPlaneMesh);

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
                staffLine = new THREE.Line(staffLineGeo, new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 1, gapSize: 5 } )); // blue: 0x0000ff
                staffLine.computeLineDistances();
            } else if (i === 3 || i === 4) {
                staffLine = new THREE.Line(staffLineGeo, new THREE.LineDashedMaterial( { color: 0x000000, dashSize: 1, gapSize: 5 } )); // blue: 0x0000ff
                staffLine.computeLineDistances();
            } else {
                staffLine = new THREE.Line(); // empty line
            }
        }
        globals.scene.add(staffLine);
    }
}

if (globals.keysOnly !== true) {
    addStaffLines(0x000000, globals.staffLineInitZ, -1000, 1000, 0.08, 0, 2);
} else if (globals.keysOnly === true) {
    addStaffLines(0x000000, globals.staffLineSecondZ, -1000, 1000, 0.08, 0, 2);

    // two dashed lines above treble clef
    addStaffLines(0x0000ff, globals.staffLineSecondZ - 10, -1000, 1000, 0.08, 0, 2, true, true);
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
    globals.scene.add(lineThick);

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
    // globals.scene.add(line1);
}
// addThickStaffLines();


//-----Static Fire Example------//
globals.loader.crossOrigin = '';

let flameActive = false;
// // let flameFirst = new Flame(globals.triggerAnimationTime);
// let flameFirst = new Flame();
// // flameFirst.create();

function getObjectState(object, objPositionUp, threshold) {
    if (object.position.y > threshold) {
        objPositionUp = false;
    } else if (object.position.y < -threshold) {
        objPositionUp = true;
    }
    return objPositionUp;
}

function moveObject(object, motionActive, positionUp, threshold) {
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

//-----ANIMATION------//
let animate = () => {
    requestAnimationFrame(animate);

    var delta = globals.clock.getDelta();
    // console.log('delta: ', delta); //hundreths
    // TODO: fix logs - why not updating correctly?
    // console.log('ticks: ', Tone.Transport.ticks); //ex. 10 
    // console.log('position: ', Tone.Transport.position); //ex: 0:0:0.124
    // console.log('seconds: ', Tone.Transport.seconds);
    // console.log(globals.ticks);
    // console.log(globals.clock.elapsedTime);

    /*
    //circular rotation
    globalRotation += 0.002;
    globals.camera.position.x = Math.sin(globalRotation) * 15; //prev: 500
    globals.camera.position.z = Math.cos(globalRotation) * 15;
    globals.camera.lookAt(globals.scene.position); // the origin
    */

    //ENABLE HORIZONTAL SCROLL
    if (globals.autoScroll === true) {
        const ticksMultiplier = 9;
        // // globals.ticks = Tone.Transport.ticks * 0.014; //old

        // globals.ticks += (delta * 5); //PREV
        // globals.ticks += (delta * 6); // higher multiplier = higher dist between drops

        globals.ticks += (delta * ticksMultiplier); // Too fast, balls dropped too far left
        
        if (globals.cameraPositionBehind === true) {
            globals.camera.position.x = globals.posBehindX + (globals.ticks);
            // console.log(globals.camera);
        } else {
            // globals.camera.position.x = (globals.ticks) - 12; // prev, works the (delta * 5)
            globals.camera.position.x = (globals.ticks) - 30;
        }
    }

    // if (triggerAnimationTime === Tone.Transport.position & flameActive === false) {
    // if (Tone.Transport.position === "5:8:0" & flameActive === false) {
    // if (Tone.Transport.position === "6:5:0" & flameActive === false) {
    // if (Tone.Transport.seconds > 23 & flameActive === false) {
    if (flameActive === false) {
        // console.log('addFire active -> position: ', Tone.Transport.position);
        // flameFirst.addFire(globals.ticks);
        // flameActive = true;
    }

    if (Tone.Transport.seconds > 41 && Tone.Transport.seconds < 42) {
        flameActive = false;
    }

    // TODO: readd after webpack setup
    var flameRate = globals.clock.getElapsedTime() * 2.0;
    // volumetricFire.update(flameRate);
    if (globals.flameArr.length > 0) {
        globals.flameArr[0].update(flameRate);
    }
    
    physics.updateBodies(globals.world);
    globals.world.step(globals.fixedTimeStep);

    globals.controls.update(delta);

    globals.renderer.render(globals.scene, globals.camera);
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

            switch (keyName) {
                case ('z'):
                    // physics.addBody(true, globalDropPosX, keyMapped);
                    // globalDropPosX -= 1.3;
                    break;
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
                    physics.addBody(true, globalDropPosX, keyMapped);
                    globalDropPosX -= 1.3; //TODO: how to manipulate Y drop position?
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