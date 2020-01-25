import Store from './Store.js';
import InstrumentMappings from './InstrumentMappings.js';
import { generateInstrMetadata, getInstrByInputNote } from './InstrumentMappings.js';
import Tone from 'Tone';
import * as Tonal from "tonal";
import _ from 'lodash';
import * as WebMidi from "webmidi";
import Physics from './Physics.js';

let rnn = new mm.MusicRNN(
    'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/chord_pitches_improv'
);
let temperature = 1.1;
const MIN_NOTE = 48; 
const MAX_NOTE = 84;

const physics = new Physics();
const instrument = new InstrumentMappings();

const MAX_MIDI_BPM = 240;
const TEMPO_MIDI_CONTROLLER = 20; // Control changes for tempo for this controller id

const SEED_DEFAULT = [{ note: 60, time: Tone.now() }];
let currentSeed = [];
let stopCurrentSequenceGenerator;
let resetState;

let enabledWebMidi = false;
WebMidi.enable(err => {
    if (err) {
        console.info("WebMidi could not be enabled.", err);
        return;
    } else {
        console.info("WebMidi enabled...");
        enabledWebMidi = true;

        var input = WebMidi.getInputByName("MPK mini play");
        // console.log({input});
        
        if (input !== false) {
            Store.inputMidi = true;

            // TODO: how to map pitchbend arpeggiator to start or reset generatedSequence
            // input.addListener('pitchbend', "all", function (e) {
            //     console.log("Pitch value: " + e.value); // Pitch value: -0.2528076171875
            // });

            // input.addListener('pitchbend', 3,
            //     function (e) {
            //         console.log("Received 'pitchbend' message.", e);
            //     }
            // );

            onActiveInputChange(input.id);
        }
    }

});

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
            humanKeyDown(e.note.number, e.velocity);
            noteStartTime = e.timestamp;
        });
        input.addListener('controlchange', 1, e => {
            if (e.controller.number === TEMPO_MIDI_CONTROLLER) {
                Tone.Transport.bpm.value = (e.value / 128) * MAX_MIDI_BPM;
                echo.delayTime.value = Tone.Time('8n.').toSeconds();
            }
        });

        input.addListener('noteoff', 1, e => {
            // TODO: potentially access pitchbend using: e.target._userHandlers.channel.pitchbend.1
            const tempNoteLength = e.timestamp - noteStartTime;
            humanKeyUp(e.note.number, tempNoteLength)
        });

        // input.addListener('pitchbend', 1, e => {
        //     console.log('pitchbend listener -> e: ', e); // no effect
        // });

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
}

function updateChord({ add = null, remove = null }) {
    if (add) {
        currentSeed.push({ note: add, time: Tone.now() });
    }

    if (remove && _.some(currentSeed, { note: remove })) {
        _.remove(currentSeed, { note: remove });
    }

    if (stopCurrentSequenceGenerator) {
        stopCurrentSequenceGenerator();
        stopCurrentSequenceGenerator = null;
    }

    if (currentSeed.length && !stopCurrentSequenceGenerator) {
        resetState = true;
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

    if (Store.ai.enabled === true) {
        updateChord({ add: note });

        // TODO: implement UI for turning on / off AI instead of using MIDI controller
        if (note === 72 || note === 67 || note === 66) { // C5, G5, Gb5
            Store.machineTrigger = true;
        } else {
            humanKeyAdds.push({ note, velocity });
        }

        if (note === 71) { // B5
            Store.machineTrigger = false;
        }
    }
    
}

function humanKeyUp(note, timestampLength) {
    // console.log('humanKeyUp -> note: ', note);
    // console.log('humanKeyUp -> timestampLength: ', timestampLength);
    if (note < MIN_NOTE || note > MAX_NOTE) return;

    const instrMapped = generateInstrMetadata(note);

    // TODO: move duration and addBody call back to humanKeyDown
    const maxNoteLength = 500;
    timestampLength = timestampLength > maxNoteLength ? maxNoteLength : timestampLength;
    instrMapped.duration = timestampLength / 1000; // IMPORTANT - so length is in milliseconds 

    if (Store.ai.enabled === true) {

        if (note !== 72 && note !== 71 && note !== 67 && note !== 66) { // B5, C6, G5, Gb5
            physics.addBody(true, Store.dropPosX, instrMapped);
        }

        humanKeyRemovals.push({ note });
        updateChord({ remove: note });
    } else {
        physics.addBody(true, Store.dropPosX, instrMapped);
    }
    
}

function machineKeyDown(note = 60, time = 0) {
    // console.log('(machineKeyDown) -> note: ', note);
    // console.log('(machineKeyDown) -> time: ', time);
    
    const TEMP_MIN_NOTE = 60;

    if (note < TEMP_MIN_NOTE || note > MAX_NOTE) return;

    const instrMapped = generateInstrMetadata(note);
    if (instrMapped.color) {
        instrMapped.color = '#ED4A82'; // pink
    }

    // drops sphere that triggers note
    physics.addBody(true, Store.dropPosX, instrMapped);
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
    return _.flatMap(seq.notes, n =>
        [n.pitch].concat(
            _.times(n.quantizedEndStep - n.quantizedStartStep - 1, () => null) 

            // pulsePattern
            // ? []
            // : _.times(n.quantizedEndStep - n.quantizedStartStep - 1, () => null)
        )
    );
}

// TODO: save chords to display circle of fifths heatmap data visualization
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

    let launchWaitTime = getSequenceLaunchWaitTime(seed); // returns 1 or 0.3
    launchWaitTime = 0.1;
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
                setTimeout(generateNext, generationIntervalTime * 1000);
            });
        } else {
            setTimeout(generateNext, generationIntervalTime * 1000);
        }
    }
    
    function consumeNext(time) {
        // console.log('consumeNext -> time: ', time);
        if (generatedSequence.length) {
            // console.log('consumeNext -> generatedSequence: ', generatedSequence);
            updateUI(generatedSequence);
            
            let note = generatedSequence.shift();

            if (note > 0 && Store.machineTrigger === true) {
                machineKeyDown(note, time);
            }
        }
    }
    
    setTimeout(generateNext, launchWaitTime * 1000);

    let consumerId = Tone.Transport.scheduleRepeat(
        consumeNext,
        playIntervalTime,
        Tone.Transport.seconds + launchWaitTime
    );

    return () => {
        running = false;
        Tone.Transport.clear(consumerId);
    };
}

function updateUI(machineSequence) {
    if (machineSequence.length > 0) {
        Store.ui.machine.currentSequence = machineSequence;
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

if (Store.ai.enabled === true) {
    initRNN();
}

function resolveDummyPattern() {
    return new Promise(resolve => {
        // setTimeout(() => {
            resolve(generateDummySequence());
        // }, 2000);
    });
}
function initRNN() {
    return new Promise(resolve => {
        rnn.initialize();
        console.log('initRNN -> rnn: ', rnn);
        resolve('resolved');

        // if (Store.view.songAutoStart === true && Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        // }
    });
}

// TODO: move to UI implementation for debugging
// document.addEventListener('keydown', (event) => {
//     const keyName = event.key;
//     if (event) {
//         let keyMapped = instrument.getKeyboardMapping(keyName);
//         switch (keyName) {
//             case ('9'):
//                 Store.patternInfinite = false;
//                 break;
//             case ('8'):
//                 Tone.Transport.start();
//                 break;
//             case ('7'):
//                     Tone.Transport.stop();
//                     break;
//             case ('0'):
//                 // let generatedPattern = [];
//                 async function asyncGeneratePattern() {
//                     let generatedPattern = await resolveDummyPattern();
//                     console.log({generatedPattern});
//                     if (generatedPattern) {
//                         startSequenceGenerator(generatedPattern);
//                         Tone.Transport.start();
//                     }
//                 }
//                 if (Store.patternInfinite === true) {
//                     setInterval(() => {
//                         asyncGeneratePattern();
//                     }, 4000);
//                 } else {
//                     asyncGeneratePattern();
//                 }
//             default:
//         }
//     }
// }, false);

/* REFERENCE: Neural Drum Machine
* https://codepen.io/teropa/pen/JLjXGK
* TODO: use magenta's drums_rnn as left hand for rhythm--map to chords instead of individual drum types
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