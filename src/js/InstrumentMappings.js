/*
 *** MAPPING METHODS ***
 */
/*jshint esversion: 6 */

import * as Tonal from "tonal";

//-----INIT INSTRUMENT MAPPING------//
//TODO: instrumentMapping obj should be part of getInstrumentMapping() so default params can be set for optional configs, ex: movement = 'physics'

export default class InstrumentMappings {

    constructor() {
        // super();
    }
    
    // getInstrumentMapping(index, obj) {
    //     // return (obj.userData.opts.moveControl ? false : true);
    //     // return (value * this.notationConstants[providedUnits].digits);
    //     const instrumentMapping = getInstrumentMappingTemplate();
    //     return instrumentMapping[obj] ? instrumentMapping[obj] : globalLetterNumArr[index];
    // }
    
    getKeyboardMapping(input) {
        const instrumentMapping = getInstrumentMappingTemplate();
        for (var key in instrumentMapping) {
            if (instrumentMapping.hasOwnProperty(key)) {
                if (input === instrumentMapping[key].keyInput) {
                    const instrumentMappedObj = instrumentMapping[key];
                    instrumentMappedObj.objName = key;
                    return instrumentMappedObj;
                }
            }
        }
    }
    
    getNoteMapping(obj) {
        const instrumentMapping = getInstrumentMappingTemplate();
        for (var key in instrumentMapping) {
            if (instrumentMapping.hasOwnProperty(key)) {
                // if (obj.userData.opts.ballDesc === instrumentMapping[key].ballDesc) { //keyInput is preferable to ballDesc since there should not be duplicates 
                if (obj.userData.opts.keyInput === instrumentMapping[key].keyInput) {
                    //TODO: are both getNoteMapping and getKeyboardMapping needed?
                    const instrumentMappedObj = instrumentMapping[key];
                    return instrumentMappedObj;
                }
    
            }
        }
    }

    // getInstrByNote(inputNote = 'C4') {
    //     const instrumentMapping = getInstrumentMappingTemplate();
    //     for (var key in instrumentMapping) {
    //         if (instrumentMapping.hasOwnProperty(key)) {

    //             // const instrNote = obj.userData.opts.note + obj.userData.opts.octave;
    //             const instrNote = inputNote;
    //             // console.log({instrNote});
    //             const currNote = instrumentMapping[key].note + instrumentMapping[key].octave;
    //             // console.log({currNote});
                
    //             // if (instrNote === inputNote) {
    //             if (instrNote === currNote) {
    //                 //TODO: are both getNoteMapping and getKeyboardMapping needed?
    //                 const instrumentMappedObj = instrumentMapping[key];
    //                 // console.log({instrumentMappedObj});
    //                 return instrumentMappedObj;
    //             }
    
    //         }
    //     }
    // }
}

export function generateInstrMetadata(note) {
    // console.log('(generateInstrMetadata) -> note: ', note);
    
    // let tonalNote = note.isInteger() ? Tonal.Note.fromMidi(note) : note;
    let tonalNote = isNaN(note) ? note : Tonal.Note.fromMidi(note);
    // let tonalFreq = Tonal.Note.midiToFreq(note);
    
    // console.log('(generateInstrMetadata) -> tonalNote: ', tonalNote);

    // console.log({tonalNote});
    // console.log({tonalFreq});
    
    const baseNote = tonalNote.length === 3 ? tonalNote[0] + tonalNote[2] : tonalNote;
    // console.log({baseNote});
    const instrMapped = getInstrByInputNote(baseNote);

    if (tonalNote.length === 3) {
        instrMapped.note = tonalNote[0] + tonalNote[1];
        instrMapped.ballDesc = tonalNote[0] + tonalNote[1];
        // instrMapped.ballDesc = tonalNote;
    }

    // console.log('(generateInstrMetadata) -> instrMapped: ', instrMapped);
    // TODO: best way to set color for machine, human, reg keyboard???
    if (instrMapped.color) {
        // instrMapped.color = '#64b5f6'; // human blue
        instrMapped.color = '#FFFF00'; // yellow
    }
    
    return instrMapped;
}

export function getInstrByInputNote(note = 'C4') {
    return getInstrByNote(note);
}

export function getInstrByNote(inputNote = 'C4') {
    const instrumentMapping = getInstrumentMappingTemplate();
    for (var key in instrumentMapping) {
        if (instrumentMapping.hasOwnProperty(key)) {

            // const instrNote = obj.userData.opts.note + obj.userData.opts.octave;
            const instrNote = inputNote;
            // console.log({instrNote});
            const currNote = instrumentMapping[key].note + instrumentMapping[key].octave;
            // console.log({currNote});
            
            // if (instrNote === inputNote) {
            if (instrNote === currNote) {
                //TODO: are both getNoteMapping and getKeyboardMapping needed?
                const instrumentMappedObj = instrumentMapping[key];
                // console.log({instrumentMappedObj});
                return instrumentMappedObj;
            }

        }
    }
}

export function getInstrumentMappingTemplate(movement = 'physics') {
    //const instrumentMapping = {
    return {
        flameCenter: {
            type: 'animation',
            triggerOn: 2,
            timesTriggered: 0,
            originalPosition: { x: 0, y: 0, z: -5 }
        },
        hiHatClosed: {
            ballDesc: 'H',
            // color: '#ff0000', //red
            color: '#64b5f6', // human (lt blue)
            keyInput: '1',
            movement: movement, //default: 'physics', or 'static'
            type: 'drum',
            variation: 'hihat',
            // originalPosition: { x: -3, y: 1.5, z: 1 }
            originalPosition: { x: 0, y: 0, z: 10 }
        },
        hiHatOpen: {
            ballDesc: 'H',
            // ballDesc: 'H+',
            // color: '#990000', //dkred
            color: '#64b5f6', // human (lt blue)
            keyInput: '2',
            // movement: 'static',
            type: 'drum',
            variation: 'hihat-open',
            originalPosition: { x: 0, y: 0, z: -3 }
        },
        snarePrimary: {
            ballDesc: 'S',
            // color: '#FFFF00', //yellow
            color: '#64b5f6', // human (lt blue)
            keyInput: '3',
            type: 'drum',
            variation: 'snare',
            originalPosition: { x: -3, y: 1.5, z: 1 }
            // originalPosition: { x: 0, y: 0, z: (globalStaffLineSecondZ + 5) }
        },
        kickPrimary: {
            // ballDesc: 'K', // beat-v1
            // ballDesc: 'B',
            ballDesc: '808',
            // color: '#003366', //midnight blue
            color: '#64b5f6', // human (lt blue)
            keyInput: '4',
            type: 'drum',
            variation: 'kick',
            // originalPosition: { x: 0, y: 0, z: 5 }, // drum staff
            // originalPosition: { x: 0, y: 0, z: 4 }, // B
            originalPosition: { x: 0, y: 0, z: 2 }, // B
            // originalPosition: { x: 0, y: 0, z: 1 },
            size: 'xl',
        },
        crashPrimary: {
            ballDesc: 'Cr',
            // color: '#FFA500', //orange
            color: '#8B008B', //darkmagenta
            color: '#64b5f6', // human (lt blue)
            keyInput: '5',
            type: 'drum',
            variation: 'crash', //aka clap
            // originalPosition: { x: 0, y: 0, z: -4 }
            originalPosition: { x: 0, y: 0, z: 2 }
        },
        ridePrimary: {
            ballDesc: 'R',
            // color: '#FFD700', //gold
            color: '#64b5f6', // human (lt blue)
            keyInput: '6',
            type: 'drum',
            variation: 'ride',
            originalPosition: { x: 0, y: 0, z: -2 }
        },
        tomHigh: {
            ballDesc: 'T',
            // color: '#006400', //dkgreen
            color: '#64b5f6', // human (lt blue)
            keyInput: '7',
            type: 'drum',
            variation: 'tom-high',
            originalPosition: { x: 0, y: 0, z: 0 }
        },
        sphereChordG1: {
            ballDesc: 'G',
            color: '#4B0AA1', //V - dkblue
            keyInput: '\\',
            note: 'G',
            octave: 1,
            chord: ['G1', 'B1', 'D1'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 15 }
        },
        sphereChordA1: {
            ballDesc: 'A',
            color: '#C6018B', //VI - pink (or: #BB0181)
            keyInput: 'Z',
            note: 'A',
            octave: 1,
            chord: ['A1', 'C2', 'E2'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 14 } //low
        },
        sphereChordB1: {
            ballDesc: 'B',
            color: '#FF872B', //VII - orange
            keyInput: 'X',
            note: 'B',
            octave: 1,
            chord: ['B1', 'D2', 'F2'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 13 } //low
        },
        sphereChordC2: {
            ballDesc: 'C',
            color: '#0018F9', //I - blue
            keyInput: 'C',
            note: 'C',
            octave: 2,
            chord: ['C2', 'E2', 'A2'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 12 } //low
        },
        sphereChordD2: {
            ballDesc: 'D',
            color: '#680896', //II - purple
            keyInput: 'V',
            note: 'D',
            chord: ['D2', 'F2', 'A2'],
            octave: 2,
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 11 }
        },
        sphereChordE2: {
            ballDesc: 'E',
            color: '#FF001F', //III - redorange
            keyInput: 'B',
            note: 'E',
            chord: ['E2', 'G2', 'B2'],
            octave: 2,
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 10 }
        },
        sphereChordF2: {
            ballDesc: 'F',
            color: '#006CFA', //IV - medblue
            keyInput: 'N',
            note: 'F',
            octave: 2,
            chord: ['F2', 'A2', 'C3'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 9 }
        },
        sphereChordG2: {
            ballDesc: 'G',
            color: '#4B0AA1', //V - dkblue
            keyInput: 'M',
            note: 'G',
            octave: 2,
            chord: ['G2', 'B2', 'D3'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 8 } //low G
        },
        sphereChordA2: {
            ballDesc: 'A',
            color: '#C6018B', //VI - pink
            keyInput: 'z',
            note: 'A',
            octave: 2,
            chord: ['A2', 'C3', 'E3'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 7 }
        },
        sphereChordB2: {
            ballDesc: 'B',
            color: '#FF872B', //VII - orange
            keyInput: 'x',
            note: 'B',
            octave: 2,
            chord: ['B2', 'D3', 'F3'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 6 }
        },
        sphereChordC3: {
            ballDesc: 'C',
            color: '#0018F9', //I - blue
            keyInput: 'c',
            note: 'C',
            octave: 3,
            chord: ['C3', 'E3', 'G3'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 5 }
        },
        sphereChordD3: {
            ballDesc: 'D',
            color: '#680896', //II - purple
            keyInput: 'v',
            note: 'D',
            octave: 3,
            chord: ['D3', 'F3', 'A3'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 4 }
        },
        sphereChordE3: {
            ballDesc: 'E',
            color: '#FF001F', //III - redorange
            keyInput: 'b',
            note: 'E',
            octave: 3,
            chord: ['E3', 'G3', 'B3'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 3 }
        },
        sphereChordF3: {
            ballDesc: 'F',
            color: '#006CFA', //IV - medblue
            keyInput: 'n',
            note: 'F',
            octave: 3,
            chord: ['F3', 'A3', 'C4'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 2 }
        },
        sphereChordG3: {
            ballDesc: 'G',
            color: '#4B0AA1', //V - dkblue
            keyInput: 'm',
            note: 'G',
            octave: 3,
            chord: ['G3', 'B3', 'D4'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 1 }
        },
        sphereChordA3: {
            ballDesc: 'A',
            color: '#C6018B', //VI - pink
            keyInput: 'g',
            note: 'A',
            octave: 3,
            chord: ['A3', 'C4', 'E4'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: 0 }
        },
        sphereChordB3: {
            ballDesc: 'B',
            color: '#FF872B', //VII - orange
            keyInput: 'h',
            note: 'B',
            octave: 3,
            chord: ['B3', 'D4', 'F4'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -1 }
        },
        sphereChordC4: {
            ballDesc: 'C',
            color: '#0018F9', //I - blue
            keyInput: 'j',
            note: 'C',
            octave: 4,
            chord: ['C4', 'E4', 'G4'],
            type: 'chord',
            // length: '8n', // '4n', '2n'
            duration: '8n',
            originalPosition: { x: 0, y: 0, z: -2 }
        },
        sphereChordD4: {
            ballDesc: 'D',
            color: '#680896', //II - purple
            keyInput: 'k',
            note: 'D',
            octave: 4,
            chord: ['D4', 'F4', 'A4'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -3 }
        },
        sphereChordE4: {
            ballDesc: 'E',
            color: '#FF001F', //III - redorange
            keyInput: 'l',
            note: 'E',
            octave: 4,
            chord: ['E4', 'G4', 'B4'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -4 }
        },
        sphereChordF4: {
            ballDesc: 'F',
            color: '#006CFA', //IV - medblue
            keyInput: 'G',
            note: 'F',
            octave: 4,
            chord: ['F4', 'A4', 'C5'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -5 }
        },
        sphereChordG4: {
            ballDesc: 'G',
            color: '#4B0AA1', //V - dkblue
            keyInput: 'H',
            note: 'G',
            octave: 4,
            chord: ['G4', 'B4', 'D5'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -6 }
        },
        sphereChordA4: {
            ballDesc: 'A',
            color: '#C6018B', //VI - pink
            keyInput: 'J',
            note: 'A',
            octave: 4,
            chord: ['A4', 'C5', 'E5'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -7 }
        },
        sphereChordB4: {
            ballDesc: 'B',
            color: '#FF872B', //VII - orange
            keyInput: 'K',
            note: 'B',
            octave: 4,
            chord: ['B4', 'D5', 'F5'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -8 }
        },
        sphereChordC5: {
            ballDesc: 'C',
            color: '#0018F9', //I - blue
            keyInput: 'L',
            note: 'C',
            octave: 5,
            chord: ['C5', 'E5', 'G5'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -9 }
        },
        sphereChordD5: {
            ballDesc: 'D',
            color: '#680896', //II - purple
            keyInput: ';',
            note: 'D',
            octave: 5,
            chord: ['D5', 'F5', 'A5'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -10 }
        },
        sphereChordE5: {
            ballDesc: 'E',
            color: '#FF001F', //III - redorange
            keyInput: 'F',
            note: 'E',
            octave: 5,
            chord: ['E5', 'G5', 'B5'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -11 }
        },
        sphereChordF5: {
            ballDesc: 'F',
            color: '#006CFA', //IV - medblue
            keyInput: '?',
            note: 'F',
            octave: 5,
            chord: ['F5', 'A5', 'C6'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -12 }
        },
        sphereChordG5: {
            ballDesc: 'G',
            color: '#4B0AA1', //V - dkblue
            keyInput: '?',
            note: 'G',
            octave: 5,
            chord: ['G5', 'B5', 'D6'],
            type: 'chord',
            originalPosition: { x: 0, y: 0, z: -13 }
        },
        // Db2, Eb2, Gb2, Ab2, Bb2, Db3, Eb3, Gb3, Ab3, Bb3
    };
}