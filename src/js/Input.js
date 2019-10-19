import globals from './globals.js';
import InstrumentMappings from './InstrumentMappings.js';
import Tone from 'Tone';

import * as Tonal from "tonal";
// import { note, interval, transpose, distance, midi } from "tonal";

// import { has } from 'lodash-es';
// import { map, tail, times, uniq } from 'lodash';
import _ from 'lodash';

import * as WebMidi from "webmidi";
import Physics from './Physics.js';

// Neural.js
// CODEPEN DEMO DEBUG -> -> -> https://codepen.io/sjcobb/pen/QWLemdR
// Using the Improv RNN pretrained model from https://github.com/tensorflow/magenta/tree/master/magenta/models/improv_rnn

// Tone.Transport.clear()

const MIN_NOTE = 48;
const MAX_NOTE = 84;
let pulsePattern = true;

// new: https://github.com/tensorflow/magenta/tree/master/magenta/models/improv_rnn#chord-pitches-improv
// old: http://download.magenta.tensorflow.org/models/chord_pitches_improv.mag
// prev: https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/chord_pitches_improv

let rnn = new mm.MusicRNN(
    'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/chord_pitches_improv'
);
let temperature = 1.1;

let reverb = new Tone.Convolver('https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/hm2_000_ortf_48k.mp3').toMaster();
reverb.wet.value = 0.25;

let sampler = new Tone.Sampler(
    {
        C3: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-c3.mp3',
        'D#3': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-ds3.mp3',
        'F#3': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-fs3.mp3',
        A3: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-a3.mp3',
        C4: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-c4.mp3',
        'D#4': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-ds4.mp3',
        'F#4': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-fs4.mp3',
        A4: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-a4.mp3',
        C5: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-c5.mp3',
        'D#5': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-ds5.mp3',
        'F#5': 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-fs5.mp3',
        A5: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699/plastic-marimba-a5.mp3'
    }
).connect(reverb);
// sampler.release.value = 2;

// rnn: t
//     biasShapes: []
//     checkpointURL: "https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/chord_pitches_improv"
//     initialized: false
//     lstmCells: []
//     rawVars: {}
//     spec: undefined

/*
 *** INPUT - MIDI KEYS MAPPING ***
 * TODO *
 * - use https://github.com/tonaljs/tonal instead of keyCode_to_note
 */

const physics = new Physics();
const instrument = new InstrumentMappings();

// constants from neural-arpeggiator
const DEFAULT_BPM = 120;
const MAX_MIDI_BPM = 240;
const TEMPO_MIDI_CONTROLLER = 20; // Control changes for tempo for this controller id

const SEED_DEFAULT = [{ note: 60, time: Tone.now() }];
let currentSeed = [];
let stopCurrentSequenceGenerator;

let enabledWebMidi = false;
WebMidi.enable(err => {
    if (err) {
        console.info("WebMidi could not be enabled.", err);
        return;
    } else {
        console.info("WebMidi enabled...");
        enabledWebMidi = true;

        // var input = WebMidi.getInputByName("Axiom Pro 25 USB A In");
        var input = WebMidi.getInputByName("MPK mini play");
        // console.log({ input });

        if (input !== false) {
            globals.inputMidi = true;
            input.addListener('pitchbend', "all", function (e) {
                console.log("Pitch value: " + e.value); // Pitch value: -0.2528076171875
            });

            // https://www.smashingmagazine.com/2018/03/web-midi-api/
            // input.addListener('pitchbend', 3,
            //     function (e) {
            //         console.log("Received 'pitchbend' message.", e);
            //     }
            // );

            onActiveInputChange(input.id);
        }
        // _midiInput: MIDIInput
        // connection: "open"
        // id: "-456726709"
        // manufacturer: "AKAI"
        // name: "MPK mini play"
        // onmidimessage: ƒ ()
        // onstatechange: null
        // state: "connected"
        // type: "input"
        // version: ""
    }

});

// if (enabledWebMidi) {
//     // // var input = WebMidi.getInputByName("Axiom Pro 25 USB A In");
//     // var input = WebMidi.getInputByName("MPK mini play");
//     // console.log({input});

//     input.addListener('pitchbend', "all", function (e) {
//         console.log("Pitch value: " + e.value);
//     });
// }

/* teropa nerual-arpeggiator
https://codepen.io/teropa/pen/ddqEwj
https://codepen.io/sjcobb/pen/xxKXgVZ
*/

let activeInput;
function onActiveInputChange(id) {
    if (activeInput) {
        activeInput.removeListener();
    }
    let input = WebMidi.getInputById(id);
    if (input) {
        input.addListener('noteon', 1, e => {
            humanKeyDown(e.note.number, e.velocity);
            // hideUI();
        });
        input.addListener('controlchange', 1, e => {
            if (e.controller.number === TEMPO_MIDI_CONTROLLER) {
                Tone.Transport.bpm.value = (e.value / 128) * MAX_MIDI_BPM;
                echo.delayTime.value = Tone.Time('8n.').toSeconds();
            }
        });
        input.addListener('noteoff', 1, e => humanKeyUp(e.note.number));
        // for (let option of Array.from(inputSelector.children)) {
        //     option.selected = option.value === id;
        // }
        activeInput = input;
    }
}

function onActiveOutputChange(id) {
    if (activeOutput !== 'internal') {
        outputs[activeOutput] = null;
    }
    activeOutput = id;
    if (activeOutput !== 'internal') {
        let output = WebMidi.getOutputById(id);
        outputs[id] = {
            play: (note, velocity = 1, time, hold = false) => {
                if (!hold) {
                    let delay = (time - Tone.now()) * 1000;
                    let duration = Tone.Time('16n').toMilliseconds();
                    output.playNote(note, 'all', {
                        time: delay > 0 ? `+${delay}` : WebMidi.now,
                        velocity,
                        duration
                    });
                }
            },
            stop: (note, time) => {
                let delay = (time - Tone.now()) * 1000;
                output.stopNote(note, 2, {
                    time: delay > 0 ? `+${delay}` : WebMidi.now
                });
            }
        };
    }
    // for (let option of Array.from(outputSelector.children)) {
    //     option.selected = option.value === id;
    // }
}

function getInstrByInputNote(note = 'C4') {
    return instrument.getInstrByNote(note);
}

function updateChord({ add = null, remove = null }) {
    if (add) {
        currentSeed.push({ note: add, time: Tone.now() });
    }
    // https://lodash.com/docs/2.4.2#some -> returns as soon as it finds a passing value
    if (remove && _.some(currentSeed, { note: remove })) {
        _.remove(currentSeed, { note: remove });
    }

    if (stopCurrentSequenceGenerator) {
        stopCurrentSequenceGenerator();
        stopCurrentSequenceGenerator = null;
    }

    if (currentSeed.length && !stopCurrentSequenceGenerator) {
        resetState = true;
        console.log('(updateChord) !stopCurrentSequenceGenerator -> currentSeed: ', currentSeed);
        stopCurrentSequenceGenerator = startSequenceGenerator(
            _.cloneDeep(currentSeed)
        );
    }
}

let humanKeyAdds = [],
    humanKeyRemovals = [];
function humanKeyDown(note, velocity = 0.7) {
    // if (note < MIN_NOTE || note > MAX_NOTE) return;

    let tonalNote = Tonal.Note.fromMidi(note);
    let tonalFreq = Tonal.Note.midiToFreq(note);

    updateChord({ add: note });

    const instrMapped = getInstrByInputNote(tonalNote);
    instrMapped.color = '#64b5f6'; // med blue
    
    physics.addBody(true, globals.dropPosX, instrMapped);

    if (note < MIN_NOTE || note > MAX_NOTE) return;
    humanKeyAdds.push({ note, velocity });
}

function humanKeyUp(note) {
    if (note < MIN_NOTE || note > MAX_NOTE) return;
    humanKeyRemovals.push({ note });
    updateChord({ remove: note });
}

function machineKeyDown(note = 60, time = 0) {
    // console.log('machineKeyDown -> note: ', note);
    // console.log('machineKeyDown -> time: ', time);
    // if (note < MIN_NOTE || note > MAX_NOTE) return;

    let tonalNote = Tonal.Note.fromMidi(note);
    let instrMapped = getInstrByInputNote(tonalNote);
    if (instrMapped === undefined) {
        const undefNoteArr = note.split('');
        note = undefNoteArr[0] + undefNoteArr[2];
        instrMapped = getInstrByInputNote(note);
    }
    // instrMapped.color = '#e91e63'; // red (nerual melody autocompletion)
    instrMapped.color = '#ED4A82'; // pink
    // instrMapped.color = '#f9bb2d'; // orange (ai duet original)

    physics.addBody(true, globals.dropPosX, instrMapped);

    // if (note < MIN_NOTE || note > MAX_NOTE) return;
}

function buildNoteSequence(seed) {
    console.log('buildNoteSequence -> seed: ', seed);
    // seed = SEED_DEFAULT

    const seqOpts = {
        ticksPerQuarter: 220,
        totalTime: seed.length * 0.5,
        quantizationInfo: {
            stepsPerQuarter: 1
        },
        timeSignatures: [
            {
                time: 0,
                numerator: 4,
                denominator: 4
            }
        ],
        tempos: [
            {
                time: 0,
                qpm: 120
            }
        ],
        notes: seed.map((n, idx) => ({
            pitch: n.note,
            startTime: idx * 0.5,
            endTime: (idx + 1) * 0.5
        }))
    };
    return mm.sequences.quantizeNoteSequence(
        seqOpts,
        1
    );
}

function getSeedIntervals(seed) {
    let intervals = [];
    for (let i = 0; i < seed.length - 1; i++) {
        let rawInterval = seed[i + 1].time - seed[i].time;
        let measure = _.minBy(['8n', '4n'], subdiv =>
        Math.abs(rawInterval - Tone.Time(subdiv).toSeconds())
        );
        intervals.push(Tone.Time(measure).toSeconds());
    }
    return intervals;
}

function getSequencePlayIntervalTime(seed = SEED_DEFAULT) {
    if (seed.length <= 1) {
        return Tone.Time('8n').toSeconds();
    }
    let intervals = getSeedIntervals(seed).sort();
    return _.first(intervals);
}

function seqToTickArray(seq) {
    // console.log('seqToTickArray -> seq: ', seq);
    // e.notes[{pitch: 59, quantizedStartStep: 1, quantizedEndStep: 3},{pitch: 62, quantizedStartStep: 3, quantizedEndStep: 5}]
    // https://lodash.com/docs/4.17.15#times // invokes the iteratee n times, returning an array of the results of each invocation
    // https://lodash.com/docs/4.17.15#flatMap // creates a flattened array of values by running each element in collection thru iteratee and flattening the mapped results
    return _.flatMap(seq.notes, n =>
        [n.pitch].concat(
            _.times(n.quantizedEndStep - n.quantizedStartStep - 1, () => null) 

            // pulsePattern
            // ? []
            // : _.times(n.quantizedEndStep - n.quantizedStartStep - 1, () => null)
        )
    );
}

function detectChord(seed) {
    // console.log('detectChord -> seed: ', seed);
    const notes = seed.notes.map(n => Tonal.Note.pc(Tonal.Note.fromMidi(n.note))).sort();
    return Tonal.PcSet.modes(notes)
        .map((mode, i) => {
        const tonic = Tonal.Note.name(notes[i]);
        const names = Tonal.Dictionary.chord.names(mode);
        return names.length ? tonic + names[0] : null;
        })
        .filter(x => x);
}

// let running = false;
let running;
let consumerId;
function startSequenceGenerator(seed = []) {
    // console.log('startSequenceGenerator -> seed: ', seed);

    running = true;
    // let lastGenerationTask = Promise.resolve(); // TODO: fix Promise vs async/await
    let lastGenerationTask;
    
    let launchWaitTime = 1; // 1
    let playIntervalTime = getSequencePlayIntervalTime(seed); // 0.25
    
    // let generatedSequence =
    //     Math.random() < 0.7 ? _.clone(seed.notes.map(n => n.pitch)) : [];

    let chord = 'CM';
    if (seed.notes) {
        let chords = detectChord(seed);
        chord = _.first(chords) || 'CM';
    }
    
    let seedSeq = buildNoteSequence(seed);

    let generatedSequence = Math.random() < 0.7 ? _.clone(seedSeq.notes.map(n => n.pitch)) : []; // why random???
    // let generatedSequence = seedSeq.notes.map(n => n.pitch); //PREV
    
    let generationIntervalTime = playIntervalTime / 2; // needed?
    generationIntervalTime = 0;

    function generateNext() {
        if (!running) return;

        if (generatedSequence.length >= 0) {
            rnn.continueSequence(seedSeq, 20, temperature, [chord]).then(genSeq => {
                // generatedSequence = generatedSequence.concat(seqToTickArray(genSeq));
                // generatedSequence = Math.random() < 0.7 ? _.clone(seedSeq.notes.map(n => n.pitch)) : [];

                generatedSequence = _.clone(seedSeq.notes.map(n => n.pitch));

                // console.log('generateNext -> generatedSequence: ', generatedSequence);
                setTimeout(generateNext, generationIntervalTime * 1000);
            });
        }
    }

    function consumeNext(time) {
        // console.log('consumeNext -> time: ', time);
        // console.log('consumeNext -> generatedSequence: ', generatedSequence);
        if (generatedSequence.length) {
            let note = generatedSequence.shift();
            if (note > 0) {
                machineKeyDown(note, time);
            }
        }
    }
    
    // setTimeout(generateNext, launchWaitTime * 1000);
    // generateNext();
    // let consumerId = Tone.Transport.scheduleRepeat(
    consumerId = Tone.Transport.scheduleRepeat(
        consumeNext,
        playIntervalTime,
        Tone.Transport.seconds + launchWaitTime
    );

    setInterval(() => {
        console.log('... ... ... ... CLEARED ... ... ... ...')
        // generatedSequence = [];
        // currentSeed = []; // TODO: fix duplicate currentSeed never clearing so same notes always start generatedSequence

        humanKeyRemovals = [];
    }, 12000);

    return () => {
        clearTransport();
    }
}

function clearTransport() {
    running = false;
    if (consumerId) {
        Tone.Transport.clear(consumerId); 
    }
}

function generateDummySequence(seed = SEED_DEFAULT) {
    const sequence = rnn.continueSequence(
        buildNoteSequence(seed), // TODO: fix err - seed.map is not a function
        20,
        temperature,
        ['Cm']
    );
    return sequence;
}

/* AYSNC - AWAIT VERSION */
// rnn.initialize();
initRNN(); // TODO: move to async function

function resolveDummyPattern() {
    return new Promise(resolve => {
        // setTimeout(() => {
            resolve(generateDummySequence());
        // }, 2000);

        // //Tone.Transport.start();
    });
}
function initRNN() {
    return new Promise(resolve => {
        rnn.initialize();
        console.log('initRNN -> rnn: ', rnn);
        resolve('resolved');
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
        // console.log('initRNN -> Tone.Transport.state: ', Tone.Transport.state); //'started' or 'stopped'
    });
}

document.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (event) {
        let keyMapped = instrument.getKeyboardMapping(keyName);
        // console.log({ keyMapped });

        switch (keyName) {
            case ('9'):
                console.log('9 pressed - patternInfinite = false');
                globals.patternInfinite = false;
                break;
            case ('8'):
                console.log('8 pressed... ...');
                Tone.Transport.start();
                break;
            case ('7'):
                        console.log('7 pressed... ... STOP ... ...');
                        Tone.Transport.stop();
                        break;
            case ('0'):
                console.log('0 pressed -> generateDummySequence...')
                
                // let generatedPattern = [];
                async function asyncGeneratePattern() {
                    console.log('asyncGeneratePattern() run......');
                    let generatedPattern = await resolveDummyPattern();
                    console.log({generatedPattern});
                    
                    if (generatedPattern) {
                        startSequenceGenerator(generatedPattern);
                        console.log('Tone.Transport - STARTED');
                        Tone.Transport.start();
                    }
                }

                if (globals.patternInfinite === true) {
                    setInterval(() => {
                        asyncGeneratePattern();
                    }, 4000);
                } else {
                    asyncGeneratePattern();
                }
            default:

        }
    }
}, false);

/* PROMISE VERSION */
// let bufferLoadPromise = new Promise(res => Tone.Buffer.on('load', res));
// Promise.all([bufferLoadPromise, rnn.initialize()])
//   .then(generateDummySequence)
// //   .then(() => {
// //     Tone.Transport.start();
// //     onScreenKeyboardContainer.classList.add('loaded');
// //     document.querySelector('.loading').remove();
// //   });
// // // StartAudioContext(Tone.context, document.documentElement);

/*
 * https://codepen.io/sjcobb/pen/QWLemdR
 * https://github.com/tensorflow/magenta/tree/master/magenta/models/improv_rnn
 * https://tensorflow.github.io/magenta-js/music/modules/_core_sequences_.html#quantizenotesequence
 * https://bl.ocks.org/virtix/be35c6c69b08c10b0968fb5f8a657474
 * https://medium.com/@oluwafunmi.ojo/getting-started-with-magenta-js-e7ffbcb64c21
 * https://observablehq.com/@visnup/using-magenta-music-as-a-midi-player
 *
 * quantizeNoteSequence
 * console.log of consumeNext -> generatedSequence:  (15) [69, 67, 74, 76, 83, 81, 79, 78, 79, 77, 74, 76, 76, 72, 69]
 * also see: updateChord -> currentSeed
 * results in:
 * machineKeyDown -> note:  69
 * machineKeyDown -> time:  2.7666666666666697
 */

/* Neural Drum Machine
* https://codepen.io/teropa/pen/JLjXGK
*
*/
// function visualizePlay(time, stepIdx, drumIdx) {
//     Tone.Draw.schedule(() => {
//         if (!stepEls[stepIdx]) return;
//         let animTime = oneEighth * 4 * 1000;
//         let cellEl = stepEls[stepIdx].cellEls[drumIdx];
//         if (cellEl.classList.contains('on')) {
//             let baseColor = stepIdx < state.seedLength ? '#e91e63' : '#64b5f6';
//             cellEl.animate(
//                 [
//                     {
//                         transform: 'translateZ(-100px)',
//                         backgroundColor: '#fad1df'
//                     },
//                     {
//                         transform: 'translateZ(50px)',
//                         offset: 0.7
//                     },
//                     { transform: 'translateZ(0)', backgroundColor: baseColor }
//                 ],
//                 { duration: animTime, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
//             );
//         }
//     }, time);
// }