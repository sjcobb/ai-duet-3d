import Tone from 'Tone';
import { Transport, Player, Players, Part, Time, Volume } from 'Tone';

// import Transport from 'Tone/core/Transport';
// import Volume from 'Tone/component/Volume';

import globals from './globals.js';
import InstrumentMappings from './InstrumentMappings.js';
import Physics from './Physics.js';
import Flame from './Flame.js';

//-----TONE------//
Tone.Transport.bpm.value = 200;
// Tone.Transport.bpm.rampTo(120, 10);
Tone.Transport.timeSignature = 12; // https://tonejs.github.io/docs/r13/Transport#timesignature
// Tone.Transport.setLoopPoints(0, "13m"); //starts over at beginning
// Tone.Transport.loop = true; //TODO: *** clear all addBody objects if Transport loop true

//-----SYNTH ASSETS------//
var polySynth = new Tone.PolySynth(6, Tone.Synth).toMaster();
polySynth.volume.value = -6;
// polySynth.volume.value = -8; //prev
// polySynth.set("detune", +1200); // octave = 12 semitones of 100 cents each
// polySynth.set("detune", +1200);

const bounceSynth = new Tone.Synth();
bounceSynth.volume.value = 2;
bounceSynth.toMaster();

var toneSnare = new Tone.NoiseSynth({
    "volume": -5.0,
    "envelope": {
        "attack": 0.001,
        "decay": 0.2,
        "sustain": 0
    },
    "filterEnvelope": {
        "attack": 0.001,
        "decay": 0.1,
        "sustain": 0
    }
}).toMaster();

// const player808HiHat = new Player(`${sampleBaseUrl}/808-hihat-vh.mp3`).toMaster();
// const playerHiHatOpen = new Tone.Player("./assets/sounds/drum-kits/dubstep/hihat-open.mp3").toMaster(); //PREV
const playerHiHatOpen = new Player("./assets/sounds/drum-kits/dubstep/hihat-open.mp3").toMaster();
const playerHiHat = new Player("./assets/sounds/drum-kits/dubstep/hihat-closed.mp3").toMaster();
playerHiHatOpen.volume.value = -2;
playerHiHat.volume.value = -2;

// const playerKick = new Player("./assets/sounds/drum-kits/analog/kick.mp3").toMaster(); //aka dubstep - 808?
// const playerKick = new Player("./assets/sounds/drum-kits/dubstep/kick.mp3").toMaster(); //aka analog - PREV
// const playerKick = new Player("./assets/sounds/drum-kits/electronic/kick.mp3").toMaster(); //guitar pluck
// const playerKick = new Player("./assets/sounds/drum-kits/percussion/kick.mp3").toMaster(); //normal
// const playerKick = new Player("./assets/sounds/drum-kits/808/808-kick-vh.mp3").toMaster(); // high
// const playerKick = new Player("./assets/sounds/drum-kits/808/808-kick-vm.mp3").toMaster(); // medium
// const playerKick = new Player("./assets/sounds/drum-kits/808/808-kick-vl.mp3").toMaster(); // low
const playerKick = new Player("./assets/sounds/drum-kits/hiphop/kick.mp3").toMaster(); //boring, but not distorted
playerKick.volume.value = +2;

// playerKick.volume.value = -6; // -6 broken
// playerKick.input.value = -4; //err
// {
//     onload: Tone.noOp ,
//     playbackRate: 1 ,
//     loop: false ,
//     autostart: false ,
//     loopStart: 0 ,
//     loopEnd: 0 ,
//     reverse: false ,
//     fadeIn: 0 ,
//     fadeOut: 0
// }

// console.log({playerKick});
// input: AudioParam {value: 1, automationRate: "a-rate", defaultValue: 1, minValue: -3.4028234663852886e+38, maxValue: 3.4028234663852886e+38}

const playerCrash = new Player("./assets/sounds/drum-kits/hiphop/clap.mp3").toMaster(); //hand clap echo
// const playerCrash = new Player("./assets/sounds/drum-kits/percussion/clap.mp3").toMaster(); //stick click

// const playerRide = new Player("./assets/sounds/drum-kits/dubstep/ride.wav").toMaster(); //drum stick click
const playerRide = new Player("./assets/sounds/drum-kits/hiphop/ride.mp3").toMaster(); //cool click pop
// const playerRide = new Player("./assets/sounds/drum-kits/electronic/ride.mp3").toMaster(); //high tick metal
// const playerRide = new Player("./assets/sounds/drum-kits/percussion/ride.mp3").toMaster(); //weird low squeak 
// const playerRide = new Player("./assets/sounds/drum-kits/analog/ride.mp3").toMaster(); // drum stick click

const playerTomHigh = new Player("./assets/sounds/drum-kits/electronic/tom-high.mp3").toMaster();
const playerTomMid = new Player("./assets/sounds/drum-kits/electronic/tom-mid.mp3").toMaster();
const playerTomLow = new Player("./assets/sounds/drum-kits/electronic/tom-low.mp3").toMaster();

let flameFirst = new Flame();

export default class Trigger {
    constructor() {
        // super();
    }
    
    triggerNote(obj) {
        // console.log({obj});

        const physics = new Physics();

        const instrument = new InstrumentMappings();

        globals.musicActive = true; //remove?

        // console.log('globals.inputMidi: ', globals.inputMidi);
        if (globals.inputMidi === true) {

        } else {

        }
        // let triggerObj = instrument.getNoteMapping(obj); //ORIG

        // console.log('Trigger -> addBody - note: ', obj.userData.opts.note);
        const triggerNote = obj.userData.opts.note ? (obj.userData.opts.note + obj.userData.opts.octave) : 'C4';
        let triggerObj = instrument.getInstrByNote(triggerNote);

        let combinedNote = triggerObj.note + triggerObj.octave;
        console.log('Trigger -> combinedNote: ', combinedNote);
        // console.log('triggerObj: ', triggerObj);

        let drumIndex = 0;
        // TODO: is if else performance causing sound bug?
        if (triggerObj.type === 'drum') {
            if (triggerObj.variation === 'kick') {
                // console.log('trigger -> playerKick: ', playerKick);
                playerKick.start();
                // toneKick.triggerAttackRelease("C2"); //deep
            } else if (triggerObj.variation === 'hihat') {
                playerHiHat.start();
            } else if (triggerObj.variation === 'hihat-open') {
                playerHiHatOpen.start();
            } else if (triggerObj.variation === 'snare') {
                toneSnare.triggerAttackRelease();
            } else if (triggerObj.variation === 'crash') {
                playerCrash.start();
                // toneCrash.triggerAttackRelease("C4"); //laser
            } else if (triggerObj.variation === 'ride') {
                playerRide.start();
            } else if (triggerObj.variation === 'tom-high') {
                playerTomHigh.start(); // key: 7
                // flameFirst.create(obj.initPosition);
            } else {
                console.log('UNDEF variation - triggerNote() -> triggerObj (drum): ', triggerObj);
                playerHiHat.start();
            }
            drumIndex++;
        } else if (triggerObj.type === 'chord') { // TODO: rename, universal chord / note accessor
            // console.log('triggerObj -> chord: ', triggerObj.chord);
            // polySynth.triggerAttackRelease(triggerObj.chord, '4n');
            // polySynth.triggerAttackRelease(combinedNote, '4n');
            polySynth.triggerAttackRelease(combinedNote, '8n');
        } else {
            bounceSynth.triggerAttackRelease(combinedNote, "8n");
            // console.log('triggerNote -> ballDesc: ', triggerObj.ballDesc, ', note: ', combinedNote);
        }

        globals.musicActive = false; //remove?

        if (globals.configColorAnimate === true && triggerObj.color) {
            // console.log("configColorAnimate -> GLOBALS: ", globals);
            if (triggerObj.type !== 'drum') {
                globals.activeInstrColor = triggerObj.color;
            }
        }

        // switch (obj.userData.opts.ballDesc) {
        //     case ('A'):
        //         bounceSynth.triggerAttackRelease("A3", "8n");
        //         console.log('triggerNote -> poolBalls.ballA');
        //         break;
        //     default:
        //         // debugger;
        //         bounceSynth.toMaster();
        //         bounceSynth.triggerAttackRelease("A2", "8n");
        //         console.log('default case');
        // }
        // //bounceSynth.triggerRelease();
        // //Tone.Transport.stop();

    }

}