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
    ai: {
        enabled: false,
    },
    autoScroll: true,
    autoStartTime: 4500,
    bpm: 120, // v0.4
    // bpm: 160,
    camera: new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000),
    // cameraCircularAnimation: false, // true - drum spinner (v0.3), NOW view.drumCircle
    cameraLookUp: false,
    clock: new THREE.Clock(),
    clockNote: new THREE.Clock(),
    configColorAnimate: true,
    controls: '',
    // controls: new FlyControls(camera),
    // currentNoteLength: 0, // not needed
    currentNote: {
        keydownTimeStamp: 0,
        keydownPressed: false,
        keyupTimeStamp: 0,
    },
    damping: 0.01, // effects bounciness, lag
    dashboard: {
        chart: {},
        // lastNote: 'C4',
        lastNote: '',
        lastNoteLength: 0,
        // playedNotes: ['C4', 'D4', 'C5'],
        allPlayedNotes: [],
        allPlayedOctaves: [],
        recentPlayedNotes: [],
        noteCountsObj: {
            // TODO: final data structure chosen for bar3D, clean up others
        },
        noteCountsArr: [
            // {note: 'A', octave: 3, count: 0},
            // {note: 'B', octave: 3, count: 0},
            // {note: 'C', octave: 4, count: 0},
            // {note: 'D', octave: 4, count: 0},
            // {note: 'E', octave: 4, count: 0},
            // {note: 'F', octave: 4, count: 0},
            // {note: 'G', octave: 4, count: 0},
        ],
        noteCountsDataset: {
            source: {
                'note': [],
                'noteCount': [],
                'octave': [],
                'octaveCount': [],
                // 'test': [1],
                'time': [],
            }
        },
        // noteCountsDatasetRow: {
        //     source: [
        //         {note: 'C', octave: 4, count: 10},
        //         {note: 'C', octave: 3, count: 4},
        //         {note: 'D', octave: 2, count: 1},
        //         {note: 'D', octave: 3, count: 2},
        //         {note: 'D', octave: 4, count: 3},
        //         {note: 'D', octave: 5, count: 4},
        //         {note: 'E', octave: 2, count: 1},
        //     ]
        // },
        instrData: [],
        // https://echarts.apache.org/en/option.html#dataset.source
        dataset: {
            source: [
                ['Note', '0:0:0', '1:0:0', '2:0:0', '3:0:0'],
                ['C4', 1, 0, 0, 1],
                ['D4', 0, 1, 1, 1],
            ]
        },
        midiConvertData: {
            source: [
                {
                    "duration": 0.6,
                    "durationTicks": 960,
                    "midi": 60,
                    "name": "C4",
                    "ticks": 0,
                    "time": 0,
                    "velocity": 0.5433070866141733
                },
                {
                    "duration": 1.2,
                    "durationTicks": 1920,
                    "midi": 48,
                    "name": "C3",
                    "ticks": 0,
                    "time": 0,
                    "velocity": 0.5118110236220472
                },
                {
                    "duration": 0.6,
                    "durationTicks": 960,
                    "midi": 60,
                    "name": "C4",
                    "ticks": 960,
                    "time": 0.6,
                    "velocity": 0.5984251968503937
                },
            ]
        }
    },
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
    // keysOnly: true,
    lastColor: '#000000',
    loader: new THREE.TextureLoader(),
    machineTrigger: false,
    meshes: [],
    bodies: [],
    multiplierPosX: -2.5,
    musicActive: false,
    patternInfinite: false,
    polySynth: {},
    groundMeshIncrementer: 0,
    renderer: new THREE.WebGLRenderer(),
    scene: new THREE.Scene(),
    spinnerBody: {},
    // staffLineInitZ: 8,    // remove
    // staffLineSecondZ: -8, // remove
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
    view: {
        drumCircle: true,
        skybox: false,
        cameraPositionBehind: true,
        cameraAutoStart: true,
        // posBehindX: -30,
        // posBehindY: 2,
        // posBehindZ: 3.8,
        // posBehindX: -55,
        posBehindX: -70,
        posBehindY: 8,
        // posBehindZ: 0,
        posBehindZ: 1,
        songAutoStart: true,
        showLogoSprite: false,
        showStats: false,
        showStaff: {
            bass: true,
            treble: true,
        },
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