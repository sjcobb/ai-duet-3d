/*
 *** DRUMS ***
 * https://dev.opera.com/articles/drum-sounds-webaudio *
 * https://github.com/chrislo/drum_synthesis/blob/gh-pages/javascripts/drums.js *
 */
/*jshint esversion: 6 */

//TODO: rebuild drumKit using teropa 'Neural Drum Machine ex (use Tone.Players, Tone.Panner, Tone.Convolver for reverb, Tone.LFO for low-freq oscillation)
//https://codepen.io/teropa/pen/JLjXGK
//toNoteSequence() - https://tensorflow.github.io/magenta-js/music/modules/_core_sequences_.html#quantizenotesequence


//TODO: MIDI support to connect to keyboard, see midiClockSender

//-----SNARE------//
function Snare(context) {
    // console.log({context});
    this.context = context;
}
Snare.prototype.setup = function() {
    this.noise = this.context.createBufferSource();
    this.noise.buffer = this.noiseBuffer();

    var noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    this.noise.connect(noiseFilter);

    this.noiseEnvelope = this.context.createGain();
    noiseFilter.connect(this.noiseEnvelope);

    this.noiseEnvelope.connect(this.context.destination);

    this.osc = this.context.createOscillator();
    this.osc.type = 'triangle';

    this.oscEnvelope = this.context.createGain();
    // this.oscEnvelope.value = 0.001; //prev: 0.009999999776482582
    // console.log(this.oscEnvelope);

    this.osc.connect(this.oscEnvelope);
    this.oscEnvelope.connect(this.context.destination);
};
Snare.prototype.noiseBuffer = function() {
    var bufferSize = this.context.sampleRate;
    var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    var output = buffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
        // output[i] = Math.random() * 1.2 - 1;
    }

    return buffer;
};
Snare.prototype.trigger = function(time) {
    this.setup();

    // this.noiseEnvelope.gain.setValueAtTime(0.001, time); //deeper thud
    this.noiseEnvelope.gain.setValueAtTime(1, time);
    // this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2); //prev: 0.01, -2 (fuzzy)
    this.noise.start(time);

    //TODO: Reduce volume here: //https://stackoverflow.com/questions/43386277/how-to-control-the-sound-volume-of-audio-buffer-audiocontext
    this.osc.frequency.setValueAtTime(100, time);
    this.oscEnvelope.gain.setValueAtTime(0.7, time);
    this.oscEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    this.osc.start(time);

    this.osc.stop(time + 0.2);
    this.noise.stop(time + 0.2); //reduce make deep thud
};

//-----KICK------//
function Kick(context) {
    this.context = context;
}
Kick.prototype.setup = function() {
    this.osc = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.osc.connect(this.gain);
    this.gain.connect(this.context.destination);
};
Kick.prototype.trigger = function(time) {
    this.setup();

    this.osc.frequency.setValueAtTime(150, time);
    this.gain.gain.setValueAtTime(1, time);

    this.osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    this.gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    this.osc.start(time);

    this.osc.stop(time + 0.5);
};

//-----HIHAT------//
//https://github.com/chrislo/drum_synthesis/blob/gh-pages/javascripts/drums.js#L80
function HiHat(context, buffer) {
    this.context = context;
    this.buffer = buffer;

    // sampleLoader('./assets/samples/hihat.wav', context);
}
HiHat.prototype.setup = function() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.context.destination);
};
HiHat.prototype.trigger = function(time) {
    this.setup();

    this.source.start(time);
};

//-----SAMPLES------//
// var sampleLoader = function(url, context, callback) {
var sampleLoader = function(url, context) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            window.buffer = buffer;
            // callback();
        });
    };
    // console.log({ request });
    // console.log('sampleLoader -> WINDOW.BUFFER: ', window.buffer);
    request.send();
};
// sampleLoader('../assets/samples/hihat.wav', context, setup);