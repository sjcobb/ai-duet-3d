import globals from './globals.js';
// import Helpers from './Helpers.js';
import Helpers from './Helpers.js';
import Trigger from './Trigger.js';
import InstrumentMappings from './InstrumentMappings.js';

import Flame from './Flame.js';

let flamePhysics = new Flame();


/*
 *** PHYSICS ***
 */

export default class Physics {

    constructor() {
        // this.trigger = new Trigger();

        // super();
    }

    //-----CANNON INIT------//
    // globals.world = new CANNON.World();

    initPhysics() {
        this.fixedTimeStep = 1.0 / 60.0;
        this.damping = 0.01;

        globals.world.broadphase = new CANNON.NaiveBroadphase();
        globals.world.gravity.set(0, -10, 0);
        this.debugRenderer = new THREE.CannonDebugRenderer(globals.scene, globals.world);

        const groundShape = new CANNON.Plane();
        const groundMaterial = new CANNON.Material(); //http://schteppe.github.io/cannon.js/docs/classes/Material.html
        const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI); // weird 0 zPos drop bug
        groundBody.addShape(groundShape);
        globals.world.add(groundBody);

        // if (this.useVisuals) this.helper.this.addVisual(groundBody, 'ground', false, true);
        this.addVisual(groundBody, 'ground', false, true);

        this.shapes = {};
        this.shapes.sphere = new CANNON.Sphere(0.5);
        this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

        this.groundMaterial = groundMaterial;

        // this.animate();
        this.initContactMaterial(0.3);

        this.addSpinner();
    }

    initContactMaterial(restitutionValue = 0.3) {
        //TODO: add colored ground on contact here
        //http://schteppe.github.io/cannon.js/docs/classes/ContactMaterial.html
        const groundShape = new CANNON.Plane();
        const tempMaterial = new CANNON.Material(); //http://schteppe.github.io/cannon.js/docs/classes/Material.html
        const groundBody = new CANNON.Body({ mass: 0, material: tempMaterial });

        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);

        groundBody.addShape(groundShape);
        globals.world.add(groundBody);

        // if (this.useVisuals) this.helper.this.addVisual(groundBody, 'ground', false, true);
        this.addVisual(groundBody, 'ground', false, true);

        this.shapes = {};
        this.shapes.sphere = new CANNON.Sphere(0.5);
        this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

        const material = new CANNON.Material(); //why both tempMaterial and material needed?
        const materialGround = new CANNON.ContactMaterial(tempMaterial, material, { friction: 0.0, restitution: restitutionValue });
        globals.world.addContactMaterial(materialGround);
    }

    addBody(sphere = true, xPosition = 5.5, options = '', timeout = 0) {

        if (options === '') {
            const instrument = new InstrumentMappings();
            const defaultInstr = instrument.getInstrumentMappingTemplate();
            options = defaultInstr.hiHatClosed;
        }

        const trigger = new Trigger();

        const material = new CANNON.Material();
        const body = new CANNON.Body({ mass: 5, material: material });
        // const body = new CANNON.Body({ mass: 1, material: material }); //no effect

        this.shapes = {};
        this.shapes.sphere = new CANNON.Sphere(0.5);
        this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        if (sphere) {
            body.addShape(this.shapes.sphere);
        } else {
            body.addShape(this.shapes.box);
        }

        let xRand = Math.random() * (15 - 1) + 1; //rdm b/w 1 and 15
        let xPos = xPosition; //TODO: remove xPosition param if not used

        if (globals.autoScroll === true) {
            if (options.type === 'drum') {
                xPos = -(globals.ticks);
            } else {
                xPos = -(globals.ticks);
                globals.InstrumentCounter++;
            }
        }

        const yPos = 20; //PREV, just right
        // const yPos = 26;

        /*** Randomized Y drop point ***/
        // const y = Math.random() * (10 - 5) + 5; //rdm b/w 5 and 10

        let zPos;
        zPos = options.originalPosition !== undefined ? options.originalPosition.z : Math.random() * (15 - 5) - 2;

        zPos = globals.dropPosY;

        if (options.type === 'drum') {
            // TODO: new drum machine paradigm - use rotating clock hand to hit drums
            // https://codepen.io/danlong/pen/LJQYYN
            // zPos += 10; // PREV: see globals.staffLineInitZ and globals.staffLineSecondZ

            zPos -= 8;
        } else {
            zPos -= 3; //PREV
            // zPos = 0;
        }
        // zPos = options.originalPosition.z;

        body.position.set((sphere) ? -xPos : xPos, yPos, zPos);

        body.linearDamping = globals.damping;

        // body.angularVelocity.z = 12; //too much rotation - hard to read note letter
        // body.angularVelocity.z = 6; //prev
        body.angularVelocity.z = 0;

        if (options.type === 'animation') {
            // console.log('addBody -> animation: ', options);
            
            // if (globals.flameCounter % 2 === 0) {
            // if (globals.flameCounter % 3 === 0) {
            // console.log(globals.flameCounter);
            // if (globals.flameCounter === 4) {
            // if (globals.flameCounter % 2 === 1) { //is flame is called odd num of times
            // if (globals.flameCounter === 1) {
            //     flamePhysics.create({x: -xPos});
            //     globals.flameCounter = 0;
            // }
            flamePhysics.create({x: -xPos});

            globals.flameCounter++;
            return;
        }
        
        // setTimeout(function() { //TODO: remove setTimeout param if not needed anymore
            globals.world.add(body);
        // }, timeout);

        // if (this.useVisuals) this.helper.this.addVisual(body, (sphere) ? 'sphere' : 'box', true, false);

        body.userData = {
            opts: options
        };
        this.addVisual(body, (sphere) ? 'sphere' : 'box', true, false, options);

        let notePlayed = false;
        let bodyCollideCount = 0;
        let spinnerCollideCount = 0;
        body.addEventListener('collide', function(ev) {
            // console.log('body collide ev: ', ev);
            // console.log('body collide event: ', ev.body);
            // console.log('body collide INERTIA: ', ev.body.inertia);
            // console.log('contact between two bodies: ', ev.contact);
            // console.log(bodyCollideCount);
            if (ev.contact) {
                console.log('ev.contact.ni', ev.contact.ni); // DEBUG USE
                // console.log('ev.contact.rj', ev.contact.rj);
                // if (ev.contact.ri.y === -0.5) {
                // if (ev.contact.rj.x < 0) {
                // if (ev.contact.rj.x < -10) {
                // if (ev.contact.ri.x === 0) {
                // if (ev.contact.rj.z === 0) {
                if (ev.contact.ni.x > 0.9) {
                    // console.log('... ...');
                    spinnerCollideCount++;
                }
                bodyCollideCount++;
            }

            /* IMPORTANT - TODO: uncomment for previous collision functionality (diff for drum vs reg sphere) */
            // if (options.type === 'drum') {
            //     if (bodyCollideCount <= 0) {
            //         trigger.triggerNote(body);
            //     }
            // } else {
                // if (bodyCollideCount <= 0) { // PREV: play note one time on collide
                if (spinnerCollideCount === 1 && notePlayed !== true) { 
                    // console.log('spinnerCollideCount ev: ', ev);
                    trigger.triggerNote(body);
                    notePlayed = true;
                }
            // }

            // console.log(bodyCollideCount);
            // setTimeout(() => {
            //     if (bodyCollideCount >= 3) { //play note one time on collide
            //         console.log({ body });
            //         globals.world.remove(body);
            //         // http://www.html5gamedevs.com/topic/28819-solved-how-dispose-mesh-in-oncollideevent/
            //     }
            // }, 2000); //does not work

            // if (ev.contact) {
            //     console.log('ev.contact.ni', ev.contact.ni);
            //     // console.log('ev.contact.rj', ev.contact.rj);
            //     // if (ev.contact.ri.y === -0.5) {
            //     // if (ev.contact.rj.x < 0) {
            //     // if (ev.contact.rj.x < -10) {
            //     // if (ev.contact.ri.x === 0) {
            //     // if (ev.contact.rj.z === 0) {
            //     if (ev.contact.ni.x > 0.9) {
            //         console.log('... ...');
            //         spinnerCollideCount++;
            //     }
            //     bodyCollideCount++;
            // }
        });

        const defaultRestitution = 0.3; //bounciness 

        let sphereRestitution;
        if (options.type === 'drum') {
            sphereRestitution = 0.5; //prev: 0.9, 0.1 = one bounce
        } else {
            // TODO: map note duration to sphereRestitution so longer note length = bouncier
                // 1/4 note = 0.25, 1/2 = 0.50 ???
            sphereRestitution = 0.1;
        }

        if (globals.cameraPositionBehind === true) {
            // body.quaternion.x = 11; //sideways spin
            // body.quaternion.y = 11;
            // body.quaternion.z = 0.5;
            // console.log(body); //TODO: rotate adjust HERE!!!
        }

    }

    addVisual(body, name, castShadow = true, receiveShadow = true, options = 'Z') {
        body.name = name;
        if (this.currentMaterial === undefined) this.currentMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        if (this.settings === undefined) {
            this.settings = {
                stepFrequency: 60,
                quatNormalizeSkip: 2,
                quatNormalizeFast: true,
                gx: 0,
                gy: 0,
                gz: 0,
                iterations: 3,
                tolerance: 0.0001,
                k: 1e6,
                d: 3,
                scene: 0,
                paused: false,
                rendermode: "solid",
                constraints: false,
                contacts: false, // Contact points
                cm2contact: false, // center of mass to contact points
                normals: false, // contact normals
                axes: false, // "local" frame axes
                particleSize: 0.1,
                shadows: false,
                aabbs: false,
                profiling: false,
                maxSubSteps: 3
            };

            this.particleGeo = new THREE.SphereGeometry(1, 16, 8);
            this.particleMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        }
        // What geometry should be used?
        let mesh;
        if (body instanceof CANNON.Body) {
            mesh = this.shape2Mesh(body, castShadow, receiveShadow, options);
            // console.log(mesh);
            mesh.userData.type = 'physics';
        }

        if (mesh) {
            // Add body
            body.threemesh = mesh;
            mesh.castShadow = castShadow;
            mesh.receiveShadow = receiveShadow;
            globals.scene.add(mesh);
        }
    }

    addSpinner() {
        // DRUM MACHINE WHEEL: 
        // https://codepen.io/danlong/pen/LJQYYN?editors=1010
        // FORK: https://codepen.io/sjcobb/pen/vYYpKMv

        // const rotationSpeed = globals.bpm * 0.1;
        const rotationSpeed = globals.bpm * 0.025;
        console.log({rotationSpeed});
        // CANNON (PHYSICS)
        let boxShape = new CANNON.Box(new CANNON.Vec3(12.25, 0.5, 0.5));

        // https://schteppe.github.io/cannon.js/docs/classes/Body.html
        globals.spinnerBody = new CANNON.Body({
            // mass: 1000,
            mass: 1000,
            // angularVelocity: new CANNON.Vec3(0, 5 ,0),
            angularVelocity: new CANNON.Vec3(0, rotationSpeed, 0), // TODO: spinner speed (2nd param, y) map to Tone.Transport bpm
            angularDamping: 0, // default=0.01
            // linearDamping: 0.01,
            fixedRotation: true,
        });
        // console.log(globals.spinnerBody);
        globals.spinnerBody.addShape(boxShape);
        globals.spinnerBody.position.set(0, 0.25, 0);
        // spinnerBody.position.set(0, -25, 0);
        globals.spinnerBody.name = 'spinner';
        
        // THREE JS (VISUAL)
        // var geometry = new THREE.BoxBufferGeometry( 24.5, 0.5, 0.5 );
        var geometry = new THREE.BoxBufferGeometry( 28, 0.5, 0.5 );
        geometry.rotateX(THREE.Math.degToRad(90)); // TODO: animate rotation so rect goes in circle

        // var material = new THREE.MeshBasicMaterial( {color: 0xff0000} ); red
        var material = new THREE.MeshBasicMaterial( {color: 0x003366} ); //midnight blue
        let spinner = new THREE.Mesh( geometry, material );
        console.log({spinner});
        spinner.position.y = 6;

        // push to meshes & bodies
        // this.meshes.push(spinner);
        // this.bodies.push(this.spinnerBody);
        // this.scene.add(spinner);
        // this.world.addBody(this.spinnerBody);
        // this.bodies.push(this.spinnerBody);

        globals.meshes.push(spinner);
        globals.bodies.push(globals.spinnerBody);
        globals.scene.add(spinner);
        globals.world.addBody(globals.spinnerBody);
    }

    shape2Mesh(body, castShadow, receiveShadow, options) {
        const helpers = new Helpers();

        const obj = new THREE.Object3D();

        // const material = this.currentMaterial; // TODO: fix floor color by refactoring currentMaterial;
        const material = new THREE.MeshLambertMaterial({ color: 0x888888 });

        const game = this;
        let index = 0;

        body.shapes.forEach(function(shape) {
            let mesh;
            let geometry;
            let v0, v1, v2;
            // let material = {}; // TODO: remove once floor color fixed

            switch (shape.type) {

                case CANNON.Shape.types.SPHERE:
                    const fillStyleMapping = options.color;

                    // console.log('shape2Mesh -> options: ', options);

                    let stripedVariation = false; //TODO: cleanup, use ternary operator 
                    if (options.variation === 'striped') {
                        stripedVariation = true;
                    }
                    const poolTexture = helpers.ballTexture(options.ballDesc, stripedVariation, fillStyleMapping, 512);

                    // const poolBallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 }); //PREV
                    // const poolBallMaterial = new THREE.MeshLambertMaterial({ color: 0xf3f3f3 });
                    const poolBallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
                    poolBallMaterial.map = poolTexture;
                    const sphereGeo = new THREE.SphereGeometry(shape.radius, 8, 8);
                    sphereGeo.name = 'sphereGeo'; //*** important for rotation when globals.cameraPositionBehind true

                    mesh = new THREE.Mesh(sphereGeo, poolBallMaterial); //prev: material
                    break;

                case CANNON.Shape.types.PARTICLE:
                    mesh = new THREE.Mesh(game.particleGeo, game.particleMaterial);
                    const s = this.settings;
                    mesh.scale.set(s.particleSize, s.particleSize, s.particleSize);
                    break;

                case CANNON.Shape.types.PLANE:
                    // geometry = new THREE.PlaneGeometry(10, 10, 4, 4); // too short
                    geometry = new THREE.PlaneGeometry(20, 10, 4, 4);
                    mesh = new THREE.Object3D();

                    // TODO: try changing mesh.name to fix no color update
                    mesh.name = 'groundPlane';
                    // geometry.colorsNeedUpdate = true; //no effect

                    const submesh = new THREE.Object3D();

                    // const randColor = (Math.random()*0xFFFFFF<<0).toString(16);
                    // const tempColor = parseInt('0x' + randColor); //or options.color
                    
                    const tempColor = globals.activeInstrColor;
                    // const tempColor = '#9F532A'; //red

                    const defaultColor = new THREE.Color(tempColor);
                    material.color = defaultColor;

                    const ground = new THREE.Mesh(geometry, material);
                    ground.scale.set(500, 6, 100); // TODO: how to sync visible teal ground size with Cannon contact invisible ground
                    ground.name = 'groundMesh';

                    //TODO: use correctly - https://threejs.org/docs/#manual/en/introduction/How-to-update-things
                    // ground.colorsNeedUpdate = true;

                    submesh.add(ground);
                    mesh.add(submesh);
                    break;

                case CANNON.Shape.types.BOX:
                    const box_geometry = new THREE.BoxGeometry(shape.halfExtents.x * 2,
                        shape.halfExtents.y * 2,
                        shape.halfExtents.z * 2);
                    mesh = new THREE.Mesh(box_geometry, material);
                    break;

                case CANNON.Shape.types.CONVEXPOLYHEDRON:
                    const geo = new THREE.Geometry();

                    // Add vertices
                    shape.vertices.forEach(function(v) {
                        geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
                    });

                    shape.faces.forEach(function(face) {
                        // add triangles
                        const a = face[0];
                        for (let j = 1; j < face.length - 1; j++) {
                            const b = face[j];
                            const c = face[j + 1];
                            geo.faces.push(new THREE.Face3(a, b, c));
                        }
                    });
                    geo.computeBoundingSphere();
                    geo.computeFaceNormals();
                    mesh = new THREE.Mesh(geo, material);
                    break;

                case CANNON.Shape.types.HEIGHTFIELD:
                    geometry = new THREE.Geometry();

                    v0 = new CANNON.Vec3();
                    v1 = new CANNON.Vec3();
                    v2 = new CANNON.Vec3();
                    for (let xi = 0; xi < shape.data.length - 1; xi++) {
                        for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
                            for (let k = 0; k < 2; k++) {
                                shape.getConvexTrianglePillar(xi, yi, k === 0);
                                v0.copy(shape.pillarConvex.vertices[0]);
                                v1.copy(shape.pillarConvex.vertices[1]);
                                v2.copy(shape.pillarConvex.vertices[2]);
                                v0.vadd(shape.pillarOffset, v0);
                                v1.vadd(shape.pillarOffset, v1);
                                v2.vadd(shape.pillarOffset, v2);
                                geometry.vertices.push(
                                    new THREE.Vector3(v0.x, v0.y, v0.z),
                                    new THREE.Vector3(v1.x, v1.y, v1.z),
                                    new THREE.Vector3(v2.x, v2.y, v2.z)
                                );
                                var i = geometry.vertices.length - 3;
                                geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
                            }
                        }
                    }
                    geometry.computeBoundingSphere();
                    geometry.computeFaceNormals();
                    mesh = new THREE.Mesh(geometry, material);
                    break;

                case CANNON.Shape.types.TRIMESH:
                    geometry = new THREE.Geometry();

                    v0 = new CANNON.Vec3();
                    v1 = new CANNON.Vec3();
                    v2 = new CANNON.Vec3();
                    for (let i = 0; i < shape.indices.length / 3; i++) {
                        shape.getTriangleVertices(i, v0, v1, v2);
                        geometry.vertices.push(
                            new THREE.Vector3(v0.x, v0.y, v0.z),
                            new THREE.Vector3(v1.x, v1.y, v1.z),
                            new THREE.Vector3(v2.x, v2.y, v2.z)
                        );
                        var j = geometry.vertices.length - 3;
                        geometry.faces.push(new THREE.Face3(j, j + 1, j + 2));
                    }
                    geometry.computeBoundingSphere();
                    geometry.computeFaceNormals();
                    mesh = new THREE.Mesh(geometry, MutationRecordaterial);
                    break;

                default:
                    throw "Visual type not recognized: " + shape.type;
            }

            mesh.receiveShadow = receiveShadow;
            mesh.castShadow = castShadow;

            mesh.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = castShadow;
                    child.receiveShadow = receiveShadow;
                }
            });

            var o = body.shapeOffsets[index];
            var q = body.shapeOrientations[index++];
            mesh.position.set(o.x, o.y, o.z);

            mesh.quaternion.set(q.x, q.y, q.z, q.w);

            if (mesh.geometry) {
                if (mesh.geometry.name === 'sphereGeo' && globals.cameraPositionBehind) {
                    // console.log('sphereGeo debug rotation: ', mesh.rotation);
                    mesh.rotation.set(0, -1.5, 0); //x: more faces downwards, y: correct - around center, z
                }
            }

            obj.add(mesh);
            obj.name = 'physicsParent';
            // console.log({obj}); //name = groundPlane is child of Object3D type
        });

        return obj;
    }

    createCannonTrimesh(geometry) {
        if (!geometry.isBufferGeometry) return null;

        const posAttr = geometry.attributes.position;
        const vertices = geometry.attributes.position.array;
        let indices = [];
        for (let i = 0; i < posAttr.count; i++) {
            indices.push(i);
        }

        return new CANNON.Trimesh(vertices, indices);
    }

    createCannonConvex(geometry) {
        if (!geometry.isBufferGeometry) return null;

        const posAttr = geometry.attributes.position;
        const floats = geometry.attributes.position.array;
        const vertices = [];
        const faces = [];
        let face = [];
        let index = 0;
        for (let i = 0; i < posAttr.count; i += 3) {
            vertices.push(new CANNON.Vec3(floats[i], floats[i + 1], floats[i + 2]));
            face.push(index++);
            if (face.length == 3) {
                faces.push(face);
                face = [];
            }
        }

        return new CANNON.ConvexPolyhedron(vertices, faces);
    }

    updatePhysics() {
        // TODO: uncomment debugRenderer after fix scene undef err
        if (this.physics.debugRenderer !== undefined) {
            this.physics.debugRenderer.scene.visible = true;
        }
    }

    // updateMeshPositions() {
    //     for (var i = 0; i !== this.meshes.length; i++) {
    //         globals.meshes[i].position.copy(this.bodies[i].position);
    //         globals.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    //     }
    // },

    updateBodies(world) {

        // globals.spinnerBody.position.set(0, 0.25, 0);
        globals.spinnerBody.position.set(0, 0.25 ,0);

        // IMPORTANT: cannon.js boilerplate
        // world.bodies.forEach(function(body) {
        globals.world.bodies.forEach(function(body) {
            if (body.threemesh != undefined) {
                body.threemesh.position.copy(body.position);
                body.threemesh.quaternion.copy(body.quaternion);
            }
        });

        // TODO: standard way to update bodies? globals.bodies and globals.meshes shouldn't only be for spinner
        for (var i = 0; i !== globals.meshes.length; i++) {
            globals.meshes[i].position.copy(globals.bodies[i].position);
            globals.meshes[i].quaternion.copy(globals.bodies[i].quaternion);
        }
    }

}