import Store from './Store.js';
import Tone from 'Tone';
import Physics from './Physics.js';
import Flame from './Flame.js';

let flameAudio = new Flame();

/*
 *** AUDIO ***
 */


const physics = new Physics();

//-----INSTRUMENT PARTS------//
var allDrumsPart = new Tone.Part(function(time, instr) {
    // physics.addBody(true, time * Store.multiplierPosX, instr);
    physics.addBody(true, Store.dropPosX, instr);
}, [
    ["0:0:0", Store.instr.kickPrimary],
    // ["0:0:0", Store.instr.snarePrimary],

    // ["0:6:0", Store.instr.kickPrimary],
    ["0:6:0", Store.instr.snarePrimary],

    ["0:10:0", Store.instr.kickPrimary],
    // ["0:10:0", Store.instr.snarePrimary],

    // ["0:10:0", Store.instr.snarePrimary],

    // ["0:8:0", Store.instr.crashPrimary],
    // ["0:8:0", Store.instr.snarePrimary],

    // ["0:4:0", Store.instr.tomHigh],
]);
allDrumsPart.loop = true;
// allDrumsPart.start("1:0:0");

var introPart = new Tone.Part(function(time, instr) {
    // TODO: use Store.dropCoordCircle [0] and [719] for dropPosX and dropPosY (must be added as param to addBody) coordinates
    // console.log('introPart -> dropPosX, dropPosY: ', Store.dropPosX, '-', Store.dropPosY);
    physics.addBody(true, Store.dropPosX, instr, 0);
    // physics.addBody(true, time * Store.multiplierPosX, instr); // sine wave
}, [
    ["0:0:0", Store.instr.hiHatClosed],
    ["0:1:0", Store.instr.hiHatClosed],
    ["0:2:0", Store.instr.hiHatClosed],
    ["0:3:0", Store.instr.hiHatClosed],
    ["0:4:0", Store.instr.hiHatClosed],
    ["0:5:0", Store.instr.hiHatClosed],
    ["0:6:0", Store.instr.hiHatClosed],
    ["0:7:0", Store.instr.hiHatClosed],
    ["0:8:0", Store.instr.hiHatClosed],
    ["0:9:0", Store.instr.hiHatClosed],
    ["0:10:0", Store.instr.hiHatClosed],
    ["0:11:0", Store.instr.hiHatClosed],
    // ["0:0:0", Store.instr.hiHatOpen],
]);
introPart.loop = 6;
introPart.loop = true;
// introPart.start("0:0:0");

var secPosPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, Store.dropPosX, instr, 1);
}, [
    //[ "0:0:0", Store.instr.hiHatClosed],
    // ["0:2:0", Store.instr.kickPrimary],
    ["0:0:0", Store.instr.snarePrimary],
]);
secPosPart.loop = true;
// secPosPart.start("0:0:0");


var thirdPosPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, Store.dropPosX, instr, 2);
}, [
    ["0:0:0", Store.instr.kickPrimary],
]);
thirdPosPart.loop = true;
// thirdPosPart.start("0:0:0");

var fourthPosPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, Store.dropPosX, instr, 3);
}, [
    ["0:0:0", Store.instr.kickPrimary],
]);
fourthPosPart.loop = true;
// fourthPosPart.start("0:0:0");


// var groovePart = new Tone.Part(function(time, instr) {
//     physics.addBody(true, time * Store.multiplierPosX, instr);
// }, [
//     ["0:0:0", Store.instr.hiHatClosed],
//     ["0:2:0", Store.instr.hiHatClosed],
//     ["0:3:0", Store.instr.hiHatClosed],
//     ["0:4:0", Store.instr.hiHatOpen],

//     ["0:8:0", Store.instr.snarePrimary],

//     ["0:6:0", Store.instr.kickPrimary],
// ]);
// groovePart.loop = 2;
// // groovePart.start("0:0:0");

//-----KEYBOARED PARTS------//

var introPianoPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * Store.multiplierPosX, instr);
}, [
    ["0:0:0", Store.instr.sphereChordC5],
    ["0:4:0", Store.instr.sphereChordF5],
    ["0:8:0", Store.instr.sphereChordA4],
    ["0:9:0", Store.instr.sphereChordA4],
    ["0:10:0", Store.instr.sphereChordG4],
]);
// introPianoPart.loop = 2;
introPianoPart.loop = true;
// introPianoPart.start("0:0:0");

/*
const boleroFireChords = [
    ["0:0:0", Store.instr.sphereChordF],
    ["0:1:0", Store.instr.sphereChordD],
    ["0:3:0", Store.instr.sphereChordF],
    ["0:4:0", Store.instr.sphereChordD],
    ["0:6:0", Store.instr.sphereChordA3],
    ["0:7:0", Store.instr.sphereChordF],
    ["0:9:0", Store.instr.sphereChordA3],
    ["0:10:0", Store.instr.sphereChordF],
    // ["0:11:0", Store.instr.flameCenter],
];

let flameActive = false;
const pianoChordsFirstPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * Store.multiplierPosX, instr);
}, boleroFireChords);

// boleroFireChords.push(["0:11:0", Store.instr.flameCenter]);
const pianoChordsSecondPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * Store.multiplierPosX, instr);
}, boleroFireChords);

pianoChordsFirstPart.loop = 2;
// pianoChordsFirstPart.start("1:0:0");
// pianoChordsFirstPart.start("4:0:0");
pianoChordsFirstPart.start(Store.triggerAnimationTime); //"4:0:0"

pianoChordsSecondPart.loop = 2;
// pianoChordsSecondPart.start("6:0:0");
pianoChordsSecondPart.start("9:0:0");

var animationPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * Store.multiplierPosX, instr);
}, [
    // ["0:0:0", Store.instr.flameCenter],
    ["0:0:0", Store.instr.flameCenter],
]);
animationPart.start("6:4:3");
// animationPart.start("0:0:0");

var animationPart2 = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * Store.multiplierPosX, instr);
}, [
    ["0:0:0", Store.instr.flameCenter],
]);
// animationPart2.start("10:5:0"); //TODO: add second animation part for fire
animationPart2.start("11:5:0"); //TODO: add second animation part for fire

// animationPart.start("5:10:0");
// animationPart.start("6:0:0");
// var animationEvent = new Tone.Event(function(time, instr){
// 	physics.addBody(true, time * Store.multiplierPosX, instr);
// //}, ["0:0:0", Store.instr.flameCenter]);
// }, [["0:0:0", Store.instr.flameCenter]]); //err: TypeError: Failed to execute 'setValueAtTime' on 'AudioParam': The provided float value is non-finite.
// animationEvent.start("5:11:0");

var pianoChordsFinalPart = new Tone.Part(function(time, instr) {
    physics.addBody(true, time * Store.multiplierPosX, instr);
}, [
    // ["0:0:0", Store.instr.flameCenter], //too soon
    ["0:0:0", Store.instr.sphereChordE],
    ["0:2:0", Store.instr.sphereChordG],
    ["0:4:0", Store.instr.sphereChordA3],
    ["0:5:0", Store.instr.sphereChordA3],
    ["0:6:0", Store.instr.sphereChordB3],
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