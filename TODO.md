## Roadmap

- use githack to create CodePen demo from bundle, ex: https://rawcdn.githack.com/sjcobb/ai-duet-3d/0.3/src/js/app.js
- https://www.8notes.com/scores/22764.asp Sheet music
- bah bah black sheep: https://musescore.com/user/19028991/scores/5511489
- 

### 0.4
- [x] map note length (triggerRelease) to bounce height, see addBody -> sphereRestitution or initContactMaterial restitutionValue param

### 0.5
- [x] rename state variables to store, separate property for UI related variables

### 0.6
- [ ] fix Three.js warnings: 
    - https://stackoverflow.com/questions/37914161/three-js-render-warning-render-count-or-primcount-is-0
- [ ] display key signature in UI
- [ ] update instrumentMappings to use key of B major instead of C

### 0.7
- [ ] balls drop and hit key of 3D piano
- [ ] robot drops balls from top of mountain, spinner knocks off balls that do not need to hit 3D piano

### 0.8
- [ ] instrument animations mapped to note sequences, ex: flamePhysics.create triggered on FD - FD -- A3F - A3F added to note sequence (use humanKeyAdds array? or buildNoteSequence function)
- [ ] different worlds: space, ice mountain, cartoon forest

### 1.0
- [ ] full UI implementation
- [ ] different iframes / canvas for each instrument type, separate routes with different globals can be used
- [ ] support for computer keyboard in addition to MIDI controller
- [ ] UI for editable 'instrument - shape - note - keyboard' mapping object
- [ ] record and playback audio, import and convert MIDI notes to Tone.js friendly JSON using https://github.com/Tonejs/Midi

## Backlog

- Flow GL skybox background: https://echarts.apache.org/examples/en/editor.html?c=flowGL-noise&gl=1&theme=dark

- [ ] Circular camera animation, movement between scenes (from drum stage back to piano stage)
- [ ] frequency visualizer UI dashboard, see: https://threejs.org/examples/webaudio_visualizer.html
- [ ]
- [ ] look into using approach from webaudio_timing demo https://threejs.org/examples/#webaudio_timing https://threejs.org/docs/#api/en/loaders/AudioLoader https://github.com/mrdoob/three.js/blob/master/examples/webaudio_timing.html#L225
- [ ] positional audio spheres (similar to lost-woods): https://threejs.org/docs/#api/en/audio/PositionalAudio
- [ ]
- [ ] pipe dream assets - https://threejs.org/docs/#api/en/geometries/TubeGeometry
- [ ] create asset in Blender for Lil A.I.
- [ ]
- [ ] 3d pipe research: https://github.com/mrdoob/three.js/issues/905 https://blog.selfshadow.com/2011/10/17/perp-vectors/ http://pandaqi.com/Games/4-phaser-shapes-and-geometries
- [ ] Fix audio quality in recordings, normalize instrument types (drums louder than keyboard), adjust high vs low frequencies
- [ ] Keep camera in line with ballX position automatically
- [ ]
- [ ] Other shapes besides spheres - each shape has different sound / wave type
- [ ] Contact surfaces light up based on note color
- [ ] Clean up instrumentMapping template and getters
- [ ] Different contact surfaces with different restitution
- [x] new drum machine wheel / metronome paradigm - use rotating clock hand to hit drums: https://codepen.io/danlong/pen/LJQYYN
- [x] AI duet - figure out machineKeyDown timing (use Tone.Transport.scheduleRepeat?)
- [x] Web MIDI API support to connect to keyboard
- [x] Dynamically set zPos based on note position in staff (position.z in instrumentMapping getter)
- [x] Fix Fire class and shader import
- [x] Arrow key controls
- [x] support PolySynth in getInstrumentMappingTemplate to allow chords
- [x] variation added for striped balls
- [x] configurable static row positioning of ball array using globalShowStaticRows
- [x] dynamic associatation of keyName with keyMapped options for dropped balls
- [x] set fill styles from instrumentMapping obj instead of THREEx.createPoolBall
- [x] How to drop balls without stacking?