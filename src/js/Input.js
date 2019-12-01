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

// const MIN_NOTE = 36; //Error: `NoteSequence` has a pitch outside of the valid range: 47
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
let resetState; // is this needed??

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
        console.log({input});

        let noteStartTime = 0;

        input.addListener('noteon', 1, e => {
            // console.log('noteon listener -> e: ', e);
            humanKeyDown(e.note.number, e.velocity);
            // uiHidden();

            noteStartTime = e.timestamp;
        });
        input.addListener('controlchange', 1, e => {
            // console.log('controlchange listener -> e: ', e);
            if (e.controller.number === TEMPO_MIDI_CONTROLLER) {
                Tone.Transport.bpm.value = (e.value / 128) * MAX_MIDI_BPM;
                echo.delayTime.value = Tone.Time('8n.').toSeconds();
            }
        });

        // TODO: how to map humanKeyUp to floor / ball restitution bounciness, how to map arpeggiator toggle to start or reset generatedSequence
        // input.addListener('noteoff', 1, e => humanKeyUp(e.note.number));
        input.addListener('noteoff', 1, e => {
            // console.log('noteoff listener -> e: ', e);
            // TODO: access pitchbend using: e.target._userHandlers.channel.pitchbend.1

            const tempNoteLength = e.timestamp - noteStartTime;
            humanKeyUp(e.note.number, tempNoteLength)
        });

        // input.addListener('pitchbend', 1, e => {
        //     console.log('pitchbend listener -> e: ', e); // no effect
        // });

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
        // console.log('(updateChord) REMOVE -> currentSeed: ', currentSeed);
    }

    if (stopCurrentSequenceGenerator) {
        stopCurrentSequenceGenerator();
        stopCurrentSequenceGenerator = null;
    }

    if (currentSeed.length && !stopCurrentSequenceGenerator) {
        resetState = true;
        // console.log('(updateChord) !stopCurrentSequenceGenerator -> currentSeed: ', currentSeed);
        stopCurrentSequenceGenerator = startSequenceGenerator(
            _.cloneDeep(currentSeed)
        );
    }
}

let humanKeyAdds = [],
    humanKeyRemovals = [];
function humanKeyDown(note, velocity = 0.7) {
    // console.log('(humanKeyDown) -> note: ', note);
    // console.log('(humanKeyDown) -> velocity: ', velocity);
    if (note < MIN_NOTE || note > MAX_NOTE) return;

    updateChord({ add: note });

    // let tonalNote = Tonal.Note.fromMidi(note);
    // let tonalFreq = Tonal.Note.midiToFreq(note);
    // const instrMapped = getInstrByInputNote(tonalNote);
    // instrMapped.color = '#64b5f6'; // med blue
    // physics.addBody(true, globals.dropPosX, instrMapped);

    if (note < MIN_NOTE || note > MAX_NOTE) return;
    humanKeyAdds.push({ note, velocity });
}

function humanKeyUp(note, timestampLength) {
    // console.log('humanKeyUp -> note: ', note);
    // console.log('humanKeyUp -> timestampLength: ', timestampLength);
    if (note < MIN_NOTE || note > MAX_NOTE) return;

    let tonalNote = Tonal.Note.fromMidi(note);
    let tonalFreq = Tonal.Note.midiToFreq(note);
    const instrMapped = getInstrByInputNote(tonalNote);
    instrMapped.color = '#64b5f6'; // med blue

    // instrMapped.length = timestampLength;
    instrMapped.length = timestampLength / 1000; // IMPORTANT - so length is in milliseconds 
    physics.addBody(true, globals.dropPosX, instrMapped);

    humanKeyRemovals.push({ note });
    updateChord({ remove: note });
}

function machineKeyDown(note = 60, time = 0) {
    // console.log('(machineKeyDown) -> note: ', note);
    // console.log('(machineKeyDown) -> time: ', time);
    if (note < MIN_NOTE || note > MAX_NOTE) return;

    let tonalNote = Tonal.Note.fromMidi(note);
    let instrMapped = getInstrByInputNote(tonalNote);

    if (instrMapped === undefined && tonalNote.length === 2) {
        // console.log('(machineKeyDown) UNDEF -> note: ', note);
        console.log('(machineKeyDown) UNDEF -> tonalNote: ', tonalNote);
        const undefNoteArr = tonalNote.split(''); // ERR: note.split is not a function - Eb4
        note = undefNoteArr[0] + undefNoteArr[2];
        instrMapped = getInstrByInputNote(note);
    }

    if (instrMapped === undefined) {
        instrMapped = getInstrByInputNote('C4');
    }

    // console.log('(machineKeyDown) -> instrMapped: ', instrMapped);
    instrMapped.color = '#ED4A82'; // pink
    physics.addBody(true, globals.dropPosX, instrMapped);
}

function buildNoteSequence(seed) {
    // console.log('(buildNoteSequence) -> seed: ', seed);
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

function getSequenceLaunchWaitTime(seed) {
    if (seed.length <= 1) {
        return 1;
    }
    let intervals = getSeedIntervals(seed);
    let maxInterval = _.max(intervals);
    return maxInterval * 2;
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

function detectChord(notes) {
    notes = notes.map(n => Tonal.Note.pc(Tonal.Note.fromMidi(n.note))).sort();
    return Tonal.PcSet.modes(notes)
        .map((mode, i) => {
            const tonic = Tonal.Note.name(notes[i]);
            const names = Tonal.Dictionary.chord.names(mode);
            return names.length ? tonic + names[0] : null;
        })
        .filter(x => x);
}


function startSequenceGenerator(seed) {
    // console.log('(startSequenceGenerator) -> seed: ', seed);
    let running = true;
    let lastGenerationTask = Promise.resolve(); // TODO: fix Promise vs async/await
    
    let chords = detectChord(seed);
    let chord = _.first(chords) || 'CM';
    let seedSeq = buildNoteSequence(seed);

    let generatedSequence =
        Math.random() < 0.7 ? _.clone(seedSeq.notes.map(n => n.pitch)) : [];
    // console.log('(startSequenceGenerator) -> generatedSequence: ', generatedSequence);

    let launchWaitTime = getSequenceLaunchWaitTime(seed); // returns 1 or 0.3
    let playIntervalTime = getSequencePlayIntervalTime(seed); // 0.25
    let generationIntervalTime = playIntervalTime / 2;

    function generateNext() {
        if (!running) return;
        if (generatedSequence.length < 10) {
            lastGenerationTask = rnn
            .continueSequence(seedSeq, 20, temperature, [chord])
            .then(genSeq => {
                generatedSequence = generatedSequence.concat(
                    genSeq.notes.map(n => n.pitch)
                );
                // console.log('(generateNext) .then -> generatedSequence: ', generatedSequence);
                updateUI(generatedSequence);

                setTimeout(generateNext, generationIntervalTime * 1000);
            });
        } else {
            // console.log('(generateNext) ELSE -> generatedSequence: ', generatedSequence);
            setTimeout(generateNext, generationIntervalTime * 1000);
        }
    }
    
    function consumeNext(time) {
        // console.log('consumeNext -> time: ', time);
        if (generatedSequence.length) {
            console.log('consumeNext -> generatedSequence: ', generatedSequence);
            let note = generatedSequence.shift();
            if (note > 0) {
                // machineKeyDown(note, time); // IMPORTANT
            }
        }
    }
    
    setTimeout(generateNext, launchWaitTime * 1000);

    let consumerId = Tone.Transport.scheduleRepeat(
        consumeNext,
        playIntervalTime,
        Tone.Transport.seconds + launchWaitTime
    );
    
    // updateUI(generatedSequence);

    return () => {
        running = false;
        Tone.Transport.clear(consumerId);
    };
}

function updateUI(machineSequence) {
    // console.log('updateUI -> machineSequence: ', machineSequence);

    // if (globals.ui.machine.currentSequence.length > 0) {
    // if (machineSequence.length > 1) {
    if (machineSequence.length > 0) {
        globals.ui.machine.currentSequence = machineSequence;
    }
}
let machineDataId = document.getElementById('machineData');
setInterval(() => {
    if (globals.ui) {
        if (globals.ui.machine.currentSequence.length > 0) {

            // mappedNotes = notes.map(n => Tonal.Note.pc(Tonal.Note.fromMidi(n.note))).sort();
            // let mappedNotes = globals.ui.machine.currentSequence.map(n => Tonal.Note.pc(Tonal.Note.fromMidi(n.note)));
            let mappedNotes = globals.ui.machine.currentSequence.map(note => Tonal.Note.fromMidi(note));

            // console.log('mappedNotes: ', mappedNotes);
            // console.log(globals.ui.machine.currentSequence);
            // machineDataId.innerHTML = globals.ui.machine.currentSequence;
            machineDataId.innerHTML = mappedNotes;
        }
    }
}, 5000);

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
// if (globals.drumsOnly !== true) {
    initRNN();
// }

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

        // if (globals.autoStart === true && Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        // }

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