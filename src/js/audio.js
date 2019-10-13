import globals from './globals.js';
import Tone from 'Tone';
import Physics from './Physics.js';
import Flame from './Flame.js';

let flameAudio = new Flame();

/*
 *** AUDIO ***
 */

/*
const physics = new Physics();

//-----INSTRUMENT PARTS------//
var allDrumsPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    ["0:0:0", globals.instr.kickPrimary],
    ["0:6:0", globals.instr.kickPrimary],
    ["0:7:0", globals.instr.kickPrimary],

    ["0:10:0", globals.instr.snarePrimary],

    ["0:4:0", globals.instr.crashPrimary],

    ["0:4:0", globals.instr.tomHigh],
]);
allDrumsPart.loop = true;
// allDrumsPart.start("0:0:0");
allDrumsPart.start("2:0:0");

var secondVerseDrumsPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    ["0:0:0", globals.instr.ridePrimary],
    ["0:2:0", globals.instr.ridePrimary],
    ["0:4:0", globals.instr.ridePrimary],
    ["0:6:0", globals.instr.ridePrimary],
]);
secondVerseDrumsPart.loop = 4;
secondVerseDrumsPart.start("7:0:0");

var introPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    ["0:0:0", globals.instr.hiHatClosed],
    ["0:2:0", globals.instr.hiHatClosed],
    ["0:2:3", globals.instr.hiHatClosed],
    ["0:2:6", globals.instr.hiHatClosed],
    ["0:2:9", globals.instr.hiHatClosed],

    ["0:6:0", globals.instr.hiHatClosed],
    ["0:6:3", globals.instr.hiHatClosed],
    ["0:6:6", globals.instr.hiHatClosed],
    ["0:6:9", globals.instr.hiHatClosed],
    ["0:10:0", globals.instr.hiHatOpen],
]);
introPart.loop = 6;
introPart.start("0:0:0");

var groovePart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    ["0:0:0", globals.instr.hiHatClosed],
    ["0:2:0", globals.instr.hiHatClosed],
    ["0:3:0", globals.instr.hiHatClosed],
    ["0:4:0", globals.instr.hiHatOpen],

    ["0:8:0", globals.instr.snarePrimary],

    ["0:6:0", globals.instr.kickPrimary],
]);
groovePart.loop = 2;
// groovePart.start("0:0:0");

//-----KEYBOARED PARTS------//

var introPianoPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    ["0:0:0", globals.instr.sphereChordC],
    ["0:4:0", globals.instr.sphereChordF],
    ["0:8:0", globals.instr.sphereChordG],
    ["0:9:0", globals.instr.sphereChordG],
]);
introPianoPart.loop = 2;
// introPianoPart.start("6:0:0");

const boleroFireChords = [
    ["0:0:0", globals.instr.sphereChordF],
    ["0:1:0", globals.instr.sphereChordD],
    ["0:3:0", globals.instr.sphereChordF],
    ["0:4:0", globals.instr.sphereChordD],
    ["0:6:0", globals.instr.sphereChordA3],
    ["0:7:0", globals.instr.sphereChordF],
    ["0:9:0", globals.instr.sphereChordA3],
    ["0:10:0", globals.instr.sphereChordF],
    // ["0:11:0", globals.instr.flameCenter],
];

let flameActive = false;
const pianoChordsFirstPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, boleroFireChords);

// boleroFireChords.push(["0:11:0", globals.instr.flameCenter]);
const pianoChordsSecondPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, boleroFireChords);

pianoChordsFirstPart.loop = 2;
// pianoChordsFirstPart.start("1:0:0");
// pianoChordsFirstPart.start("4:0:0");
pianoChordsFirstPart.start(globals.triggerAnimationTime); //"4:0:0"

pianoChordsSecondPart.loop = 2;
// pianoChordsSecondPart.start("6:0:0");
pianoChordsSecondPart.start("9:0:0");

var animationPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    // ["0:0:0", globals.instr.flameCenter],
    ["0:0:0", globals.instr.flameCenter],
]);
animationPart.start("6:4:3");
// animationPart.start("0:0:0");

var animationPart2 = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    ["0:0:0", globals.instr.flameCenter],
]);
// animationPart2.start("10:5:0"); //TODO: add second animation part for fire
animationPart2.start("11:5:0"); //TODO: add second animation part for fire

// animationPart.start("5:10:0");
// animationPart.start("6:0:0");
// var animationEvent = new Tone.Event(function(time, instr){
// 	physics.addBody(true, time * globals.multiplierPosX, instr);
// //}, ["0:0:0", globals.instr.flameCenter]);
// }, [["0:0:0", globals.instr.flameCenter]]); //err: TypeError: Failed to execute 'setValueAtTime' on 'AudioParam': The provided float value is non-finite.
// animationEvent.start("5:11:0");

var pianoChordsFinalPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * globals.multiplierPosX, instr);
}, [
    // ["0:0:0", globals.instr.flameCenter], //too soon
    ["0:0:0", globals.instr.sphereChordE],
    ["0:2:0", globals.instr.sphereChordG],
    ["0:4:0", globals.instr.sphereChordA3],
    ["0:5:0", globals.instr.sphereChordA3],
    ["0:6:0", globals.instr.sphereChordB3],
]);
pianoChordsFinalPart.loop = 2;
// pianoChordsFinalPart.start("0:0:0");
pianoChordsFinalPart.start("6:0:0"); //PREV
// pianoChordsFinalPart.start("7:0:0");

// //
// introPianoPart.add("4m", instrMappedC); //did not hear
// introPianoPart.add("1m", "C#+11");

export default class Audio {
    
    constructor() {

    }
}

*/