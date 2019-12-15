// import InstrumentMappings from './InstrumentMappings.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';

export default {
    // activeInstrColor: '#9F532A', //ltred
    // activeInstrColor: '#800000', //dkred
    // activeInstrColor: '#8F0000', //medred
    // activeInstrColor: '#0018F9', //music wheel I blue
    // activeInstrColor: '#7ec850', //grass green (lt)
    // activeInstrColor: '#567d46', //grass green (md)
    // activeInstrColor: '#edc9af', //desert sand
    // activeInstrColor: '#e9be9f', // sand (md)
    // activeInstrColor: '#e5b38f', //PREV - sand (md2)
    // activeInstrColor: '#d8d8d8',
    // activeInstrColor: '#00A29C', // teal: https://www.color-hex.com/color-palette/4666
    // activeInstrColor: '#66b2b2', // lt teal
    // activeInstrColor: '#003366', // spinner midnight blue
    // activeInstrColor: '#001f3e',
    // activeInstrColor: '#1f1f1f',
    activeInstrColor: '#343434',
    autoScroll: true, // true - v0.1, v0.2
    autoStart: false,
    autoStartTime: 4500,
    // bpm: 120, // v0.4
    bpm: 160,
    camera: new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000),
    cameraCircularAnimation: false, // true - drum spinner (v0.3)
    cameraPositionBehind: false,
    cameraLookUp: false,
    clock: new THREE.Clock(),
    configColorAnimate: true,
    controls: '',
    // controls: new FlyControls(camera),
    // currentNoteLength: 0, // not needed
    damping: 0.01, // effects bounciness, lag
    dropCoordCircle: [],
    dropCoordCircleInterval: [],
    dropOffset: 0,
    // dropPosX: 5.5, //prev
    dropPosX: 0,
    dropPosY: 0,
    //  dropPosZ: 0, // should z be swapped with y?
    drumsOnly: false,
    fixedTimeStep: 1.0 / 60.0,
    flameArr: [],
    flameCounter: 0,
    inputMidi: false,
    instr: {},
    instrumentCounter: 0,
    keysOnly: true,
    lastColor: '#000000',
    loader: new THREE.TextureLoader(),
    machineTrigger: false,
    meshes: [],
    bodies: [],
    multiplierPosX: -2.5,
    musicActive: false,
    patternInfinite: false,
    posBehindX: -30,
    posBehindY: 2,
    posBehindZ: 3.8,
    groundMeshIncrementer: 0,
    renderer: new THREE.WebGLRenderer(),
    scene: new THREE.Scene(),
    spinnerBody: {},
    staffLineInitZ: 8,
    staffLineSecondZ: -8,
    // showStaticRows: false, // old static animation
    tempPos: 0,
    ticks: 0,
    triggerAnimationTime: '4:0:0',
    triggerOn: 'contact', 
    // triggerOn: 'spinner', 
    // Transport: Tone.Transport, //TODO: add Transport here for logging ticks and position
    uiHidden: false,
    ui: {
        machine: {
            currentSequence: []
        }
    },
    world: new CANNON.World(),
};

/*** COLOR OPTIONS ***/
// '#7cfc00'; //lawn green
// '#F8041E'; //fire temple red med
// '#9F532A'; //fire temple red dk
// '#191CAC'; //deepblue
// '#0018F9'; //music wheel I blue
// '#C6018B'; //music wheel VI pink
// '#4B0AA1'; //music wheel V - dkblue
// '#006CFA'; //music wheel IV - medblue