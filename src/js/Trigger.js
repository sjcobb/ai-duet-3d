import Tone from 'Tone';
import { Transport, Player, Players, Part, Time, Volume } from 'Tone';

import { generateInstrMetadata } from './InstrumentMappings.js';

// import Transport from 'Tone/core/Transport';
// import Volume from 'Tone/component/Volume';

import Store from './Store.js';

import InstrumentMappings from './InstrumentMappings.js';
import { getInstrByNote } from './InstrumentMappings.js';

import Physics from './Physics.js';
import Flame from './Flame.js';

//-----TONE------//
// Tone.Transport.bpm.value = 200; //PREV
// Tone.Transport.bpm.value = 120;
Tone.Transport.bpm.value = Store.bpm;
// Tone.Transport.bpm.rampTo(120, 10);

// https://tonejs.github.io/docs/r13/Transport#timesignature
// Tone.Transport.timeSignature = 12; // v0.4, v0.5

// Tone.Transport.timeSignature = 4;     // DEFAULT

// Tone.Transport.setLoopPoints(0, "13m"); //starts over at beginning
// Tone.Transport.loop = true; //TODO: *** clear all addBody objects if Transport loop true

//-----SYNTH ASSETS------//
// https://tonejs.github.io/examples/polySynth.html
// https://tonejs.github.io/docs/13.8.25/PolySynth

// var polySynth = new Tone.PolySynth(6, Tone.Synth, {
// Store.polySynth = new Tone.PolySynth(4, Tone.Synth, { // default
Store.polySynth = new Tone.PolySynth(10, Tone.Synth, {
    // oscillator: {
    //     type: "triangle", // sine, square, sawtooth, triangle (default), custom
    //     // frequency: 440 ,
    //     // detune: 0 ,
    //     // phase: 0 ,
    //     // partials: [] ,
    //    partialCount: 0
    // },
    // // https://tonejs.github.io/docs/13.8.25/Envelope
    envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
        // attack: 0.1,
        // decay: 0.2,
        // sustain: 1, // v0.5
        // sustain: 0.5, 
        // release: 0.8,
    },
    // // https://tonejs.github.io/docs/13.8.25/Filter#type
    // filter: {
	// 	// type: "highpass", // lowpass, highpass, bandpass, lowshelf, highshelf, notch, allpass, peaking
	// },
}).toMaster();

// Store.polySynth.volume.value = -8; // v0.4, v0.5
Store.polySynth.volume.value = -6;
// Store.polySynth.set("detune", +1200); // octave = 12 semitones of 100 cents each
// Store.polySynth.set("detune", +1200);

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
const playerKick = new Player("./assets/sounds/drum-kits/808/808-kick-vm.mp3").toMaster(); // medium
// const playerKick = new Player("./assets/sounds/drum-kits/808/808-kick-vl.mp3").toMaster(); // low

// const playerKick = new Player("./assets/sounds/drum-kits/hiphop/kick.mp3").toMaster(); //v2, v3, v4 (boring, but not distorted)
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
        // console.log(obj.userData.opts);

        const physics = new Physics();

        const instrument = new InstrumentMappings();

        Store.musicActive = true; //remove?

        // console.log('Store.inputMidi: ', Store.inputMidi);
        if (Store.inputMidi === true) {

        } else {

        }
        // console.log('Trigger -> addBody - opts: ', obj.userData.opts);
        
        let triggerObj = {};
        let combinedNote = 'C1';
        if (obj.userData.opts.type !== 'drum') {
            combinedNote = obj.userData.opts.note ? (obj.userData.opts.note + obj.userData.opts.octave) : 'C4';
            // console.log({combinedNote});

            Store.dashboard.lastNote = combinedNote;

            Store.dashboard.allPlayedNotes.push(combinedNote);
            // Store.dashboard.allPlayedNotes.push(obj.userData.opts.note);
            // Store.dashboard.allPlayedOctaves.push(obj.userData.opts.octave);
            // // Store.dashboard.noteCountsDataset.source.note.push(obj.userData.opts.note);
            // // Store.dashboard.noteCountsDataset.source.octave.push(obj.userData.opts.octave);

            // const noteDatum = {

            // };
            // Store.dashboard.noteCounts.push(
            //     {
            //         note: obj.userData.opts.note,
            //         octave: obj.userData.opts.octave,
            //         count: 1
            //     }
            // )

            // if (Store.instr[obj.userData.opts.objName].count != null) {
            //     Store.instr[obj.userData.opts.objName].count++;
            // } else {
            //     Store.instr[obj.userData.opts.objName].count = 1;
            // }

            if (Store.dashboard.noteCountsObj[combinedNote] != null) {
                Store.dashboard.noteCountsObj[combinedNote].count++;
            } else {
                Store.dashboard.noteCountsObj[combinedNote] = {
                    note: obj.userData.opts.note,
                    octave: obj.userData.opts.octave,
                    count: 1,
                };
                // Store.dashboard.noteCountsObj[combinedNote].count = 1;
            }
            // console.log(Object.entries(Store.dashboard.noteCountsObj));
            // Store.dashboard.noteCountsArr = Object.entries(Store.dashboard.noteCountsObj);

            Store.dashboard.noteCountsArr = [];
            for (let key in Store.dashboard.noteCountsObj){
                // console.log({key});
                Store.dashboard.noteCountsArr.push(Store.dashboard.noteCountsObj[key]);
            }

            // https://stackoverflow.com/a/8900824/7639084
            Store.dashboard.noteCountsArr.sort(function(a, b) {
                // console.log(a, b);
                var textA = a.note.toUpperCase();
                var textB = b.note.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            // console.log('triggerNote -> Store.dashboard.allPlayedNotes: ', Store.dashboard.allPlayedNotes);

            Store.dashboard.recentPlayedNotes.push(combinedNote);
            // console.log('triggerNote -> Store.dashboard.recentPlayedNotes: ', Store.dashboard.recentPlayedNotes);

            triggerObj = obj.userData.opts;

        } else {
            triggerObj = instrument.getNoteMapping(obj); //ORIG
        }
        
        // console.log('Trigger -> combinedNote: ', combinedNote);
        let drumIndex = 0;
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
                // console.log('UNDEF variation - triggerNote() -> triggerObj (drum): ', triggerObj);
                playerHiHat.start();
            }
            drumIndex++;
        } else if (triggerObj.type === 'chord') { // TODO: rename, universal chord / note accessor
            // console.log('triggerNote (chord) -> combinedNote: ', combinedNote);
            // console.log('triggerNote (chord) -> triggerObj: ', triggerObj);

            // console.log('triggerNote (chord) -> obj.userData.opts.duration: ', obj.userData.opts.duration);
            const noteLength = obj.userData.opts.duration ? obj.userData.opts.duration : 0.15;
            Store.polySynth.triggerAttackRelease(combinedNote, noteLength);
        } else {
            bounceSynth.triggerAttackRelease(combinedNote, "8n");
            // console.log('triggerNote -> ballDesc: ', triggerObj.ballDesc, ', note: ', combinedNote);
        }

        Store.musicActive = false; //remove?

        if (Store.configColorAnimate === true && triggerObj.color) {
            // console.log("configColorAnimate -> GLOBALS: ", globals);
            if (triggerObj.type !== 'drum') {
                Store.activeInstrColor = triggerObj.color;
            }
        }
    }

}



//-----RECORDING------//
// https://codepen.io/gregh/project/editor/aAexRX

const physics = new Physics();

// const recordingNotes = Store.dashboard.midiConvertData.source;

// const recordingNotes = [{"duration":0.8,"name":"A#4","time":0,"velocity":1},{"duration":0.08333333333333326,"name":"A#4","time":1.0666666666666667,"velocity":1},{"duration":0.08749999999999991,"name":"A#4","time":1.2,"velocity":1},{"duration":0.08916666666666662,"name":"A#4","time":1.3291666666666666,"velocity":1},{"duration":0.08333333333333326,"name":"A#4","time":1.4666666666666666,"velocity":1},{"duration":0.12916666666666665,"name":"A#4","time":1.5999999999999999,"velocity":1},{"duration":0.08333333333333326,"name":"G#4","time":1.8666666666666665,"velocity":1},{"duration":0.5333333333333334,"name":"A#4","time":1.9999999999999998,"velocity":1},{"duration":0.08333333333333348,"name":"A#4","time":2.6666666666666665,"velocity":1},{"duration":0.08749999999999991,"name":"A#4","time":2.8,"velocity":1},{"duration":0.08916666666666684,"name":"A#4","time":2.9291666666666663,"velocity":1},{"duration":0.08333333333333348,"name":"A#4","time":3.0666666666666664,"velocity":1},{"duration":0.12916666666666687,"name":"A#4","time":3.1999999999999997,"velocity":1},{"duration":0.08333333333333348,"name":"G#4","time":3.466666666666667,"velocity":1},{"duration":0.5958333333333337,"name":"A#4","time":3.6,"velocity":1},{"duration":0.08333333333333304,"name":"A#4","time":4.2666666666666675,"velocity":1},{"duration":0.08750000000000036,"name":"A#4","time":4.4,"velocity":1},{"duration":0.0891666666666664,"name":"A#4","time":4.529166666666668,"velocity":1},{"duration":0.08333333333333304,"name":"A#4","time":4.666666666666668,"velocity":1},{"duration":0.12916666666666643,"name":"A#4","time":4.800000000000001,"velocity":1},{"duration":0.0625,"name":"F4","time":5.000000000000001,"velocity":1},{"duration":0.0625,"name":"F4","time":5.1000000000000005,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":5.2,"velocity":1},{"duration":0.0625,"name":"F4","time":5.4,"velocity":1},{"duration":0.0625,"name":"F4","time":5.5,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":5.6,"velocity":1},{"duration":0.0625,"name":"F4","time":5.8,"velocity":1},{"duration":0.0625,"name":"F4","time":5.8999999999999995,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":5.999999999999999,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":6.199999999999999,"velocity":1},{"duration":0.2625000000000002,"name":"A#4","time":6.3999999999999995,"velocity":1},{"duration":0.1299999999999999,"name":"D4","time":6.8,"velocity":0.8661417322834646},{"duration":0.13416666666666632,"name":"D4","time":6.93,"velocity":0.8661417322834646},{"duration":0.13333333333333375,"name":"C4","time":7.066666666666666,"velocity":0.8661417322834646},{"duration":0.2999999999999998,"name":"D4","time":7.2,"velocity":0.8661417322834646},{"duration":0.09999999999999964,"name":"A#4","time":7.5,"velocity":1},{"duration":0.09166666666666679,"name":"A#4","time":7.6,"velocity":1},{"duration":0.09166666666666679,"name":"C5","time":7.7,"velocity":1},{"duration":0.09166666666666679,"name":"D5","time":7.800000000000001,"velocity":1},{"duration":0.09166666666666679,"name":"D#5","time":7.900000000000001,"velocity":1},{"duration":0.2916666666666661,"name":"F5","time":8.000000000000002,"velocity":1},{"duration":0.09166666666666679,"name":"A#4","time":8.3,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"A#4","time":8.4,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"C5","time":8.5,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"D5","time":8.6,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"D#5","time":8.7,"velocity":0.8661417322834646},{"duration":0.1999999999999993,"name":"F5","time":8.799999999999999,"velocity":0.8661417322834646},{"duration":0.1999999999999993,"name":"F5","time":8.999999999999998,"velocity":1},{"duration":0.12916666666666643,"name":"F5","time":9.199999999999998,"velocity":1},{"duration":0.1349999999999998,"name":"F#5","time":9.329166666666664,"velocity":1},{"duration":0.13333333333333286,"name":"G#5","time":9.466666666666663,"velocity":1},{"duration":0.2916666666666661,"name":"A#5","time":9.599999999999996,"velocity":1},{"duration":0.09166666666666679,"name":"F#4","time":9.899999999999995,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"F#4","time":9.999999999999995,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"G#4","time":10.099999999999994,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"A#4","time":10.199999999999994,"velocity":0.8661417322834646},{"duration":0.09166666666666679,"name":"C5","time":10.299999999999994,"velocity":0.8661417322834646},{"duration":0.19166666666666643,"name":"C#5","time":10.399999999999993,"velocity":0.8661417322834646},{"duration":0.13083333333333336,"name":"A#5","time":10.52916666666666,"velocity":1},{"duration":0.125,"name":"A#5","time":10.666666666666659,"velocity":1},{"duration":0.125,"name":"A#5","time":10.799999999999992,"velocity":1},{"duration":0.13083333333333336,"name":"G#5","time":10.929166666666658,"velocity":1},{"duration":0.125,"name":"F#5","time":11.066666666666658,"velocity":1},{"duration":0.12916666666666643,"name":"G#5","time":11.19999999999999,"velocity":1},{"duration":0.125,"name":"F#5","time":11.466666666666656,"velocity":1},{"duration":0.13000000000000078,"name":"G#4","time":11.599999999999989,"velocity":0.8661417322834646},{"duration":0.1341666666666672,"name":"G#4","time":11.72999999999999,"velocity":0.8661417322834646},{"duration":0.13333333333333286,"name":"F#4","time":11.866666666666656,"velocity":0.8661417322834646},{"duration":0.2666666666666675,"name":"G#4","time":11.99999999999999,"velocity":0.8661417322834646},{"duration":0.13333333333333286,"name":"G#4","time":12.266666666666657,"velocity":0.8661417322834646},{"duration":0.13000000000000078,"name":"G#4","time":12.39999999999999,"velocity":0.8661417322834646},{"duration":0.1341666666666672,"name":"F#4","time":12.52999999999999,"velocity":0.8661417322834646},{"duration":0.13333333333333286,"name":"G#4","time":12.666666666666657,"velocity":0.8661417322834646},{"duration":0.19166666666666643,"name":"D#5","time":12.79999999999999,"velocity":1},{"duration":0.09166666666666679,"name":"D#5","time":12.99999999999999,"velocity":1},{"duration":0.09166666666666679,"name":"F5","time":13.099999999999989,"velocity":1},{"duration":0.7999999999999989,"name":"F#5","time":13.199999999999989,"velocity":1},{"duration":0.09999999999999964,"name":"F#4","time":13.399999999999988,"velocity":0.8661417322834646},{"duration":0.09999999999999964,"name":"G#4","time":13.499999999999988,"velocity":0.8661417322834646},{"duration":0.40000000000000036,"name":"A#4","time":13.599999999999987,"velocity":0.8661417322834646},{"duration":0.1999999999999993,"name":"F5","time":13.999999999999988,"velocity":1},{"duration":0.1999999999999993,"name":"D#5","time":14.199999999999987,"velocity":1},{"duration":0.19166666666666643,"name":"C#5","time":14.399999999999986,"velocity":1},{"duration":0.09166666666666679,"name":"C#5","time":14.599999999999985,"velocity":1},{"duration":0.09166666666666679,"name":"D#5","time":14.699999999999985,"velocity":1},{"duration":0.7999999999999989,"name":"F5","time":14.799999999999985,"velocity":1},{"duration":0.09999999999999964,"name":"F4","time":14.999999999999984,"velocity":0.8661417322834646},{"duration":0.09999999999999964,"name":"F#4","time":15.099999999999984,"velocity":0.8661417322834646},{"duration":0.40000000000000036,"name":"G#4","time":15.199999999999983,"velocity":0.8661417322834646},{"duration":0.19166666666666643,"name":"D#5","time":15.599999999999984,"velocity":1},{"duration":0.19166666666666643,"name":"C#5","time":15.799999999999983,"velocity":1},{"duration":0.10000000000000142,"name":"C5","time":15.999999999999982,"velocity":1},{"duration":0.09166666666666501,"name":"C5","time":16.199999999999985,"velocity":1},{"duration":0.09166666666666501,"name":"D5","time":16.299999999999983,"velocity":1},{"duration":0.8000000000000043,"name":"E5","time":16.39999999999998,"velocity":1},{"duration":0.10000000000000142,"name":"E4","time":16.59999999999998,"velocity":0.8661417322834646},{"duration":0.10000000000000142,"name":"F4","time":16.69999999999998,"velocity":0.8661417322834646},{"duration":0.1999999999999993,"name":"G4","time":16.799999999999983,"velocity":0.8661417322834646},{"duration":0.10000000000000142,"name":"G4","time":16.999999999999982,"velocity":0.8661417322834646},{"duration":0.10000000000000142,"name":"A4","time":17.099999999999984,"velocity":0.8661417322834646},{"duration":0.3999999999999986,"name":"G5","time":17.199999999999985,"velocity":1},{"duration":0.1999999999999993,"name":"C5","time":17.399999999999984,"velocity":0.8661417322834646},{"duration":0.12916666666666643,"name":"F5","time":17.599999999999984,"velocity":1},{"duration":0.0625,"name":"F4","time":17.799999999999983,"velocity":1},{"duration":0.0625,"name":"F4","time":17.899999999999984,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":17.999999999999986,"velocity":1},{"duration":0.0625,"name":"F4","time":18.199999999999985,"velocity":1},{"duration":0.0625,"name":"F4","time":18.299999999999986,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":18.399999999999988,"velocity":1},{"duration":0.0625,"name":"F4","time":18.599999999999987,"velocity":1},{"duration":0.0625,"name":"F4","time":18.69999999999999,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":18.79999999999999,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":18.99999999999999,"velocity":1},{"duration":0.2624999999999993,"name":"A#4","time":19.19999999999999,"velocity":1},{"duration":0.129999999999999,"name":"D4","time":19.599999999999987,"velocity":0.7480314960629921},{"duration":0.13416666666666544,"name":"D4","time":19.729999999999986,"velocity":0.7480314960629921},{"duration":0.13333333333333286,"name":"C4","time":19.866666666666653,"velocity":0.7480314960629921},{"duration":0.3000000000000007,"name":"D4","time":19.999999999999986,"velocity":0.7480314960629921},{"duration":0.09166666666666501,"name":"A#4","time":20.299999999999986,"velocity":1},{"duration":0.09166666666666501,"name":"A#4","time":20.399999999999984,"velocity":1},{"duration":0.09166666666666501,"name":"C5","time":20.499999999999982,"velocity":1},{"duration":0.09166666666666501,"name":"D5","time":20.59999999999998,"velocity":1},{"duration":0.09166666666666501,"name":"D#5","time":20.699999999999978,"velocity":1},{"duration":0.29166666666666785,"name":"F5","time":20.799999999999976,"velocity":1},{"duration":0.09166666666666501,"name":"A#4","time":21.099999999999977,"velocity":0.8661417322834646},{"duration":0.09166666666666501,"name":"A#4","time":21.199999999999974,"velocity":0.8661417322834646},{"duration":0.09166666666666501,"name":"C5","time":21.299999999999972,"velocity":0.8661417322834646},{"duration":0.09166666666666501,"name":"D5","time":21.39999999999997,"velocity":0.8661417322834646},{"duration":0.09166666666666501,"name":"D#5","time":21.499999999999968,"velocity":0.8661417322834646},{"duration":0.19166666666666643,"name":"F5","time":21.599999999999966,"velocity":0.8661417322834646},{"duration":0.1999999999999993,"name":"F5","time":21.799999999999965,"velocity":1},{"duration":0.125,"name":"F5","time":21.999999999999964,"velocity":1},{"duration":0.13083333333333158,"name":"F#5","time":22.12916666666663,"velocity":1},{"duration":0.125,"name":"G#5","time":22.26666666666663,"velocity":1},{"duration":1.1916666666666664,"name":"A#5","time":22.399999999999963,"velocity":1},{"duration":0.3916666666666657,"name":"C#6","time":23.599999999999962,"velocity":1},{"duration":0.3999999999999986,"name":"C6","time":23.99999999999996,"velocity":1},{"duration":0.6625000000000014,"name":"A5","time":24.39999999999996,"velocity":1},{"duration":0.3916666666666657,"name":"F5","time":25.19999999999996,"velocity":1},{"duration":1.1999999999999993,"name":"F#5","time":25.59999999999996,"velocity":1},{"duration":0.3916666666666657,"name":"A#5","time":26.799999999999958,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":27.199999999999957,"velocity":1},{"duration":0.8000000000000007,"name":"F5","time":27.599999999999955,"velocity":1},{"duration":0.3916666666666657,"name":"F5","time":28.399999999999956,"velocity":1},{"duration":1.1999999999999993,"name":"F#5","time":28.799999999999955,"velocity":1},{"duration":0.3916666666666657,"name":"A#5","time":29.999999999999954,"velocity":1},{"duration":0.12916666666666643,"name":"F4","time":30.399999999999952,"velocity":1},{"duration":0.7916666666666679,"name":"F5","time":30.79999999999995,"velocity":1},{"duration":0.3999999999999986,"name":"D5","time":31.59999999999995,"velocity":1},{"duration":1.2000000000000028,"name":"D#5","time":31.99999999999995,"velocity":1},{"duration":0.3916666666666657,"name":"F#5","time":33.19999999999995,"velocity":1},{"duration":0.3999999999999986,"name":"F5","time":33.59999999999995,"velocity":1},{"duration":0.7916666666666643,"name":"C#5","time":33.99999999999995,"velocity":1},{"duration":0.3916666666666657,"name":"A#4","time":34.79999999999995,"velocity":1},{"duration":0.19166666666666998,"name":"C5","time":35.199999999999946,"velocity":1},{"duration":0.09166666666666856,"name":"C5","time":35.39999999999995,"velocity":1},{"duration":0.09166666666666856,"name":"D5","time":35.49999999999995,"velocity":1},{"duration":0.8000000000000114,"name":"E5","time":35.59999999999995,"velocity":1},{"duration":0.10000000000000142,"name":"E4","time":35.799999999999955,"velocity":0.8661417322834646},{"duration":0.10000000000000142,"name":"F4","time":35.899999999999956,"velocity":0.8661417322834646},{"duration":0.20000000000000284,"name":"G4","time":35.99999999999996,"velocity":0.8661417322834646},{"duration":0.10000000000000142,"name":"G4","time":36.19999999999996,"velocity":0.8661417322834646},{"duration":0.10000000000000142,"name":"A4","time":36.29999999999996,"velocity":0.8661417322834646},{"duration":0.20000000000000284,"name":"A#4","time":36.39999999999996,"velocity":0.8661417322834646},{"duration":0.20000000000000284,"name":"C5","time":36.599999999999966,"velocity":0.8661417322834646},{"duration":0.12916666666666998,"name":"F5","time":36.79999999999997,"velocity":1},{"duration":0.0625,"name":"F4","time":36.99999999999997,"velocity":1},{"duration":0.0625,"name":"F4","time":37.09999999999997,"velocity":1},{"duration":0.12916666666666998,"name":"F4","time":37.199999999999974,"velocity":1},{"duration":0.0625,"name":"F4","time":37.39999999999998,"velocity":1},{"duration":0.0625,"name":"F4","time":37.49999999999998,"velocity":1},{"duration":0.12916666666666998,"name":"F4","time":37.59999999999998,"velocity":1},{"duration":0.0625,"name":"F4","time":37.79999999999998,"velocity":1},{"duration":0.0625,"name":"F4","time":37.899999999999984,"velocity":1},{"duration":0.12916666666666998,"name":"F4","time":37.999999999999986,"velocity":1},{"duration":0.12916666666666998,"name":"F4","time":38.19999999999999,"velocity":1},{"duration":1.6000000000000014,"name":"A#4","time":38.39999999999999,"velocity":1}];

// Twinkle Twinkle Little Star
const recordingFirstNotes = [
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
    {
        "duration": 0.5999999999999999,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 1920,
        "time": 1.2,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 1.2,
        "durationTicks": 1920,
        "midi": 52,
        "name": "E3",
        "ticks": 1920,
        "time": 1.2,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.6000000000000001,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 2880,
        "time": 1.7999999999999998,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 0.6000000000000001,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 3840,
        "time": 2.4,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 1.1999999999999997,
        "durationTicks": 1920,
        "midi": 53,
        "name": "F3",
        "ticks": 3840,
        "time": 2.4,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 4800,
        "time": 3,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 1.2000000000000002,
        "durationTicks": 1920,
        "midi": 67,
        "name": "G4",
        "ticks": 5760,
        "time": 3.5999999999999996,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 1.2000000000000002,
        "durationTicks": 1920,
        "midi": 52,
        "name": "E3",
        "ticks": 5760,
        "time": 3.5999999999999996,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 7680,
        "time": 4.8,
        "velocity": 0.5275590551181102
    },
    {
        "duration": 1.2000000000000002,
        "durationTicks": 1920,
        "midi": 50,
        "name": "D3",
        "ticks": 7680,
        "time": 4.8,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 8640,
        "time": 5.3999999999999995,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 9600,
        "time": 6,
        "velocity": 0.5748031496062992
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 48,
        "name": "C3",
        "ticks": 9600,
        "time": 6,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 10560,
        "time": 6.6,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 960,
        "midi": 62,
        "name": "D4",
        "ticks": 11520,
        "time": 7.199999999999999,
        "velocity": 0.5590551181102362
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 960,
        "midi": 53,
        "name": "F3",
        "ticks": 11520,
        "time": 7.199999999999999,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 960,
        "midi": 62,
        "name": "D4",
        "ticks": 12480,
        "time": 7.8,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 960,
        "midi": 55,
        "name": "G3",
        "ticks": 12480,
        "time": 7.8,
        "velocity": 0.6141732283464567
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 60,
        "name": "C4",
        "ticks": 13440,
        "time": 8.4,
        "velocity": 0.5354330708661418
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 52,
        "name": "E3",
        "ticks": 13440,
        "time": 8.4,
        "velocity": 0.5511811023622047
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 48,
        "name": "C3",
        "ticks": 14400,
        "time": 9,
        "velocity": 0.5669291338582677
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 15360,
        "time": 9.6,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 52,
        "name": "E3",
        "ticks": 15360,
        "time": 9.6,
        "velocity": 0.6614173228346457
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 16320,
        "time": 10.2,
        "velocity": 0.6141732283464567
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 17280,
        "time": 10.799999999999999,
        "velocity": 0.5354330708661418
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 1920,
        "midi": 53,
        "name": "F3",
        "ticks": 17280,
        "time": 10.799999999999999,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 18240,
        "time": 11.4,
        "velocity": 0.5669291338582677
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 19200,
        "time": 12,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 55,
        "name": "G3",
        "ticks": 19200,
        "time": 12,
        "velocity": 0.6535433070866141
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 20160,
        "time": 12.6,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 62,
        "name": "D4",
        "ticks": 21120,
        "time": 13.2,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 55,
        "name": "G3",
        "ticks": 21120,
        "time": 13.2,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 23040,
        "time": 14.399999999999999,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 1920,
        "midi": 52,
        "name": "E3",
        "ticks": 23040,
        "time": 14.399999999999999,
        "velocity": 0.5590551181102362
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 24000,
        "time": 15,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 24960,
        "time": 15.6,
        "velocity": 0.5354330708661418
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 1920,
        "midi": 53,
        "name": "F3",
        "ticks": 24960,
        "time": 15.6,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 25920,
        "time": 16.2,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 26880,
        "time": 16.8,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 55,
        "name": "G3",
        "ticks": 26880,
        "time": 16.8,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 27840,
        "time": 17.4,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 62,
        "name": "D4",
        "ticks": 28800,
        "time": 18,
        "velocity": 0.5669291338582677
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 55,
        "name": "G3",
        "ticks": 28800,
        "time": 18,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 60,
        "name": "C4",
        "ticks": 30720,
        "time": 19.2,
        "velocity": 0.5748031496062992
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 48,
        "name": "C3",
        "ticks": 30720,
        "time": 19.2,
        "velocity": 0.5748031496062992
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 60,
        "name": "C4",
        "ticks": 31680,
        "time": 19.8,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 32640,
        "time": 20.4,
        "velocity": 0.6692913385826772
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 52,
        "name": "E3",
        "ticks": 32640,
        "time": 20.4,
        "velocity": 0.6692913385826772
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 33600,
        "time": 21,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 34560,
        "time": 21.599999999999998,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 1.2000000000000028,
        "durationTicks": 1920,
        "midi": 53,
        "name": "F3",
        "ticks": 34560,
        "time": 21.599999999999998,
        "velocity": 0.6614173228346457
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 35520,
        "time": 22.2,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 67,
        "name": "G4",
        "ticks": 36480,
        "time": 22.8,
        "velocity": 0.5433070866141733
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 52,
        "name": "E3",
        "ticks": 36480,
        "time": 22.8,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 38400,
        "time": 24,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 50,
        "name": "D3",
        "ticks": 38400,
        "time": 24,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 39360,
        "time": 24.599999999999998,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 40320,
        "time": 25.2,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 48,
        "name": "C3",
        "ticks": 40320,
        "time": 25.2,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 41280,
        "time": 25.8,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 62,
        "name": "D4",
        "ticks": 42240,
        "time": 26.4,
        "velocity": 0.5748031496062992
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 53,
        "name": "F3",
        "ticks": 42240,
        "time": 26.4,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 62,
        "name": "D4",
        "ticks": 43200,
        "time": 27,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 55,
        "name": "G3",
        "ticks": 43200,
        "time": 27,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 60,
        "name": "C4",
        "ticks": 44160,
        "time": 27.599999999999998,
        "velocity": 0.5590551181102362
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 48,
        "name": "C3",
        "ticks": 44160,
        "time": 27.599999999999998,
        "velocity": 0.5433070866141733
    }
];

// Bah Bah Black Sheep
const recordingSecondNotes = [
    {
        "duration": 0.6,
        "durationTicks": 256,
        "midi": 60,
        "name": "C4",
        "ticks": 0,
        "time": 0,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 1.2,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 0,
        "time": 0,
        "velocity": 0.5669291338582677
    },
    {
        "duration": 0.6,
        "durationTicks": 256,
        "midi": 60,
        "name": "C4",
        "ticks": 256,
        "time": 0.6,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.5999999999999999,
        "durationTicks": 256,
        "midi": 67,
        "name": "G4",
        "ticks": 512,
        "time": 1.2,
        "velocity": 0.7795275590551181
    },
    {
        "duration": 1.2,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 512,
        "time": 1.2,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.6000000000000001,
        "durationTicks": 256,
        "midi": 67,
        "name": "G4",
        "ticks": 768,
        "time": 1.7999999999999998,
        "velocity": 0.6614173228346457
    },
    {
        "duration": 0.2999999999999998,
        "durationTicks": 128,
        "midi": 69,
        "name": "A4",
        "ticks": 1024,
        "time": 2.4,
        "velocity": 0.7401574803149606
    },
    {
        "duration": 1.1999999999999997,
        "durationTicks": 512,
        "midi": 53,
        "name": "F3",
        "ticks": 1024,
        "time": 2.4,
        "velocity": 0.6929133858267716
    },
    {
        "duration": 0.30000000000000027,
        "durationTicks": 128,
        "midi": 71,
        "name": "B4",
        "ticks": 1152,
        "time": 2.6999999999999997,
        "velocity": 0.7401574803149606
    },
    {
        "duration": 0.2999999999999998,
        "durationTicks": 128,
        "midi": 72,
        "name": "C5",
        "ticks": 1280,
        "time": 3,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 0.2999999999999998,
        "durationTicks": 128,
        "midi": 69,
        "name": "A4",
        "ticks": 1408,
        "time": 3.3,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 1.2000000000000002,
        "durationTicks": 512,
        "midi": 67,
        "name": "G4",
        "ticks": 1536,
        "time": 3.5999999999999996,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 1.2000000000000002,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 1536,
        "time": 3.5999999999999996,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 256,
        "midi": 65,
        "name": "F4",
        "ticks": 2048,
        "time": 4.8,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 1.2000000000000002,
        "durationTicks": 512,
        "midi": 53,
        "name": "F3",
        "ticks": 2048,
        "time": 4.8,
        "velocity": 0.6929133858267716
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 256,
        "midi": 65,
        "name": "F4",
        "ticks": 2304,
        "time": 5.3999999999999995,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 256,
        "midi": 64,
        "name": "E4",
        "ticks": 2560,
        "time": 6,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 2560,
        "time": 6,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 256,
        "midi": 64,
        "name": "E4",
        "ticks": 2816,
        "time": 6.6,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 256,
        "midi": 62,
        "name": "D4",
        "ticks": 3072,
        "time": 7.199999999999999,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 512,
        "midi": 55,
        "name": "G3",
        "ticks": 3072,
        "time": 7.199999999999999,
        "velocity": 0.7244094488188977
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 256,
        "midi": 62,
        "name": "D4",
        "ticks": 3328,
        "time": 7.8,
        "velocity": 0.6535433070866141
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 60,
        "name": "C4",
        "ticks": 3584,
        "time": 8.4,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 3584,
        "time": 8.4,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 256,
        "midi": 67,
        "name": "G4",
        "ticks": 4096,
        "time": 9.6,
        "velocity": 0.7480314960629921
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 4096,
        "time": 9.6,
        "velocity": 0.6456692913385826
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 67,
        "name": "G4",
        "ticks": 4352,
        "time": 10.2,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 0.29999999999999893,
        "durationTicks": 128,
        "midi": 67,
        "name": "G4",
        "ticks": 4480,
        "time": 10.5,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 256,
        "midi": 65,
        "name": "F4",
        "ticks": 4608,
        "time": 10.799999999999999,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 512,
        "midi": 53,
        "name": "F3",
        "ticks": 4608,
        "time": 10.799999999999999,
        "velocity": 0.6929133858267716
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 256,
        "midi": 65,
        "name": "F4",
        "ticks": 4864,
        "time": 11.4,
        "velocity": 0.6535433070866141
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 256,
        "midi": 64,
        "name": "E4",
        "ticks": 5120,
        "time": 12,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 5120,
        "time": 12,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 64,
        "name": "E4",
        "ticks": 5376,
        "time": 12.6,
        "velocity": 0.6535433070866141
    },
    {
        "duration": 0.29999999999999893,
        "durationTicks": 128,
        "midi": 64,
        "name": "E4",
        "ticks": 5504,
        "time": 12.9,
        "velocity": 0.6535433070866141
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 62,
        "name": "D4",
        "ticks": 5632,
        "time": 13.2,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 55,
        "name": "G3",
        "ticks": 5632,
        "time": 13.2,
        "velocity": 0.7086614173228346
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 256,
        "midi": 67,
        "name": "G4",
        "ticks": 6144,
        "time": 14.399999999999999,
        "velocity": 0.6771653543307087
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 6144,
        "time": 14.399999999999999,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.29999999999999893,
        "durationTicks": 128,
        "midi": 67,
        "name": "G4",
        "ticks": 6400,
        "time": 15,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 67,
        "name": "G4",
        "ticks": 6528,
        "time": 15.299999999999999,
        "velocity": 0.6614173228346457
    },
    {
        "duration": 0.29999999999999893,
        "durationTicks": 128,
        "midi": 65,
        "name": "F4",
        "ticks": 6656,
        "time": 15.6,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 512,
        "midi": 53,
        "name": "F3",
        "ticks": 6656,
        "time": 15.6,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 67,
        "name": "G4",
        "ticks": 6784,
        "time": 15.899999999999999,
        "velocity": 0.6771653543307087
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 69,
        "name": "A4",
        "ticks": 6912,
        "time": 16.2,
        "velocity": 0.7244094488188977
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 65,
        "name": "F4",
        "ticks": 7040,
        "time": 16.5,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 256,
        "midi": 64,
        "name": "E4",
        "ticks": 7168,
        "time": 16.8,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 256,
        "midi": 48,
        "name": "C3",
        "ticks": 7168,
        "time": 16.8,
        "velocity": 0.6456692913385826
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 62,
        "name": "D4",
        "ticks": 7424,
        "time": 17.4,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 256,
        "midi": 55,
        "name": "G3",
        "ticks": 7424,
        "time": 17.4,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 128,
        "midi": 62,
        "name": "D4",
        "ticks": 7552,
        "time": 17.7,
        "velocity": 0.6692913385826772
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 60,
        "name": "C4",
        "ticks": 7680,
        "time": 18,
        "velocity": 0.6377952755905512
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 512,
        "midi": 48,
        "name": "C3",
        "ticks": 7680,
        "time": 18,
        "velocity": 0.5826771653543307
    }
]

// Alphabet Song
const recordingThirdNotes = [
    {
        "duration": 0.6,
        "durationTicks": 960,
        "midi": 60,
        "name": "C4",
        "ticks": 0,
        "time": 0,
        "velocity": 0.5354330708661418
    },
    {
        "duration": 0.6,
        "durationTicks": 960,
        "midi": 60,
        "name": "C4",
        "ticks": 960,
        "time": 0.6,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.5999999999999999,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 1920,
        "time": 1.2,
        "velocity": 0.6850393700787402
    },
    {
        "duration": 0.6000000000000001,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 2880,
        "time": 1.7999999999999998,
        "velocity": 0.6141732283464567
    },
    {
        "duration": 0.6000000000000001,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 3840,
        "time": 2.4,
        "velocity": 0.6535433070866141
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 4800,
        "time": 3,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 1.2000000000000002,
        "durationTicks": 1920,
        "midi": 67,
        "name": "G4",
        "ticks": 5760,
        "time": 3.5999999999999996,
        "velocity": 0.5669291338582677
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 7680,
        "time": 4.8,
        "velocity": 0.5748031496062992
    },
    {
        "duration": 0.6000000000000005,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 8640,
        "time": 5.3999999999999995,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 9600,
        "time": 6,
        "velocity": 0.5669291338582677
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 10560,
        "time": 6.6,
        "velocity": 0.6141732283464567
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 480,
        "midi": 62,
        "name": "D4",
        "ticks": 11520,
        "time": 7.199999999999999,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 0.2999999999999998,
        "durationTicks": 480,
        "midi": 62,
        "name": "D4",
        "ticks": 12000,
        "time": 7.5,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.2999999999999998,
        "durationTicks": 480,
        "midi": 62,
        "name": "D4",
        "ticks": 12480,
        "time": 7.8,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 480,
        "midi": 62,
        "name": "D4",
        "ticks": 12960,
        "time": 8.1,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 60,
        "name": "C4",
        "ticks": 13440,
        "time": 8.4,
        "velocity": 0.5433070866141733
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 15360,
        "time": 9.6,
        "velocity": 0.6535433070866141
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 16320,
        "time": 10.2,
        "velocity": 0.6456692913385826
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 17280,
        "time": 10.799999999999999,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 18240,
        "time": 11.4,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 19200,
        "time": 12,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 20160,
        "time": 12.6,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 62,
        "name": "D4",
        "ticks": 21120,
        "time": 13.2,
        "velocity": 0.5433070866141733
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 480,
        "midi": 67,
        "name": "G4",
        "ticks": 23040,
        "time": 14.399999999999999,
        "velocity": 0.7401574803149606
    },
    {
        "duration": 0.3000000000000007,
        "durationTicks": 480,
        "midi": 67,
        "name": "G4",
        "ticks": 23520,
        "time": 14.7,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.5999999999999996,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 24000,
        "time": 15,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 1.200000000000001,
        "durationTicks": 1920,
        "midi": 65,
        "name": "F4",
        "ticks": 24960,
        "time": 15.6,
        "velocity": 0.5511811023622047
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 26880,
        "time": 16.8,
        "velocity": 0.6062992125984252
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 27840,
        "time": 17.4,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 62,
        "name": "D4",
        "ticks": 28800,
        "time": 18,
        "velocity": 0.5590551181102362
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 60,
        "name": "C4",
        "ticks": 30720,
        "time": 19.2,
        "velocity": 0.5433070866141733
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 60,
        "name": "C4",
        "ticks": 31680,
        "time": 19.8,
        "velocity": 0.5669291338582677
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 32640,
        "time": 20.4,
        "velocity": 0.7165354330708661
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 67,
        "name": "G4",
        "ticks": 33600,
        "time": 21,
        "velocity": 0.5905511811023622
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 34560,
        "time": 21.599999999999998,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 69,
        "name": "A4",
        "ticks": 35520,
        "time": 22.2,
        "velocity": 0.5826771653543307
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 67,
        "name": "G4",
        "ticks": 36480,
        "time": 22.8,
        "velocity": 0.5118110236220472
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 38400,
        "time": 24,
        "velocity": 0.5748031496062992
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 65,
        "name": "F4",
        "ticks": 39360,
        "time": 24.599999999999998,
        "velocity": 0.6220472440944882
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 40320,
        "time": 25.2,
        "velocity": 0.5511811023622047
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 64,
        "name": "E4",
        "ticks": 41280,
        "time": 25.8,
        "velocity": 0.6299212598425197
    },
    {
        "duration": 0.6000000000000014,
        "durationTicks": 960,
        "midi": 62,
        "name": "D4",
        "ticks": 42240,
        "time": 26.4,
        "velocity": 0.5748031496062992
    },
    {
        "duration": 0.5999999999999979,
        "durationTicks": 960,
        "midi": 62,
        "name": "D4",
        "ticks": 43200,
        "time": 27,
        "velocity": 0.5984251968503937
    },
    {
        "duration": 1.1999999999999993,
        "durationTicks": 1920,
        "midi": 60,
        "name": "C4",
        "ticks": 44160,
        "time": 27.599999999999998,
        "velocity": 0.5354330708661418
    }
];

// console.log({recordingNotes});

const recordingPart = new Tone.Part(function(time, datum){
    // console.log(time);
    // console.log(datum);

    const instrMapped = generateInstrMetadata(datum.name);

    const maxDuration = 1.0;
    // instrMapped.duration = datum.duration > maxDuration ? maxDuration: datum.duration;
    instrMapped.duration = datum.duration / 2;
    // console.log({instrMapped});

    // // Store.polySynth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
    // // bounceSynth.triggerAttackRelease(note.name, note.duration, time, note.velocity);

    physics.addBody(true, Store.dropPosX, instrMapped, 0);

}, recordingFirstNotes);      // twinkle twinkle little star
// }, recordingSecondNotes);  // bah bah black sheep
// }, recordingThirdNotes);  // alphabet song

// recordingPart.loop = true;
recordingPart.start("0:0:0");