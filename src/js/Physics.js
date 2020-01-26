import Store from './Store.js';
// import Helpers from './Helpers.js';
import Helpers from './Helpers.js';
import Trigger from './Trigger.js';
import InstrumentMappings from './InstrumentMappings.js';
import { getInstrumentMappingTemplate } from './InstrumentMappings.js';

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
    // Store.world = new CANNON.World();

    initPhysics() {
        this.fixedTimeStep = 1.0 / 60.0;
        this.damping = 0.01;

        Store.world.broadphase = new CANNON.NaiveBroadphase();
        Store.world.gravity.set(0, -10, 0);
        this.debugRenderer = new THREE.CannonDebugRenderer(Store.scene, Store.world);

        this.shapes = {};
        this.shapes.sphere = new CANNON.Sphere(0.5);
        this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

        // this.animate();
        this.initGroundContactMaterial(0.3);
        // this.initGroundContactMaterial(0.3, [0, 10, 0]);
        // this.initGroundContactMaterial(0.3, [0, 5, 0], [2, 2, 0.1]);

        // this.addSpinner();
    }

    initGroundContactMaterial(restitutionValue = 0.3, posArr=[0, -6, 0], sizeArr=[5000, 10, 5]) {

        if (Store.view.showStaff.treble === true && Store.view.showStaff.bass === true) {
            posArr = [0, -6, -2];
            sizeArr = [5000, 15, 5];
        }

        // FLOOR
        //TODO: add colored ground on contact here
        //http://schteppe.github.io/cannon.js/docs/classes/ContactMaterial.html
        // const groundShape = new CANNON.Plane(); // invisible plane across entire screen

        // const groundShape = new CANNON.Box(new CANNON.Vec3(10, 10, 0.1));
        // const groundShape = new CANNON.Box(new CANNON.Vec3(15, 15, 5)); // 0.3
        // const groundShape = new CANNON.Box(new CANNON.Vec3(1500, 20, 5));
        const groundShape = new CANNON.Box(new CANNON.Vec3(...sizeArr));

        // http://schteppe.github.io/cannon.js/docs/classes/Material.html
        const tempMaterial = new CANNON.Material({ restitution: 1, friction: 1 });
        // const tempMaterial = new CANNON.Material();
        // console.log({tempMaterial});

        const groundBody = new CANNON.Body({ mass: 0, material: tempMaterial });

        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); //PREV
        // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0.5, 0, 0), -Math.PI / 2); // invisible giant hill

        // groundBody.position.set(0, -6, 0);
        groundBody.position.set(...posArr);
        // console.log({groundBody});

        // https://stackoverflow.com/a/35101095 - “Glueing together” two bodies in cannon.js
        groundBody.addShape(groundShape);
        Store.world.add(groundBody);

        // if (this.useVisuals) this.helper.this.addVisual(groundBody, 'ground', false, true);
        this.addVisual(groundBody, 'ground', false, true);

        // https://github.com/schteppe/cannon.js/issues/300
        // https://github.com/schteppe/cannon.js/blob/master/demos/bounce.html
        // restitutionValue = 200;
        // const material = new CANNON.Material(); //why both tempMaterial and material needed?
        // const restitutionGround = new CANNON.ContactMaterial(tempMaterial, material, { friction: 0.0, restitution: restitutionValue });
        // Store.world.addContactMaterial(restitutionGround);
    }

    // addBody(sphere = true, xPosition = 5.5, options = '', timeout = 0) {
    addBody(sphere = true, xPosition=5.5, options = '', index=0) { // TODO: take yPosition from Store.dropCoordCircleInterval[] loop, swap yPos to zPos

        if (options === '') {
            const instrument = new InstrumentMappings();
            const defaultInstr = getInstrumentMappingTemplate();
            options = defaultInstr.hiHatClosed;
        }

        let objSize = options.size !== undefined ? options.size : 'md';
        if (objSize === 'xl') {
            objSize = 2.0;
        } else {
            // objSize = 0.5; // v0.3
            // objSize = 0.65; // too big for D maj chord
            objSize = 0.50;
        }

        // console.log('addBody -> options: ', options);       

        const trigger = new Trigger();

        let sphereRestitution = 0.3;
        if (options.type === 'drum') {
            sphereRestitution = 0.3; //prev: 0.9, 0.1 = one bounce
        } else {
            // console.log('options.duration: ', options.duration);
            if (options.duration > 0) { // TODO: rename options.noteLength so not confusing with arr length
                // sphereRestitution = options.length / 2;
                // sphereRestitution = options.duration * 0.65; // PREV
                sphereRestitution = options.duration * 0.58;
                // sphereRestitution = options.length * 1;

                // TODO: clean up bounciness default and min / max height
                // if (sphereRestitution < 0.225) {
                // if (sphereRestitution < 0.19) {
                //     sphereRestitution = 0.19;
                //     // sphereRestitution = 0.225;
                // }
            }
            // console.log({sphereRestitution});
        }
        const material = new CANNON.Material({ restitution: sphereRestitution, friction: 1 }); 

        // https://schteppe.github.io/cannon.js/docs/classes/Body.html
        // const body = new CANNON.Body({ mass: 5, material: material }); // v0.3, v0.4
        const body = new CANNON.Body({ mass: 550, material: material });
        
        this.shapes = {};
        // this.shapes.sphere = new CANNON.Sphere(0.5);
        this.shapes.sphere = new CANNON.Sphere(objSize);
        this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));

        if (sphere) {
            body.addShape(this.shapes.sphere);
        } else {
            body.addShape(this.shapes.box);
        }

        let xRand = Math.random() * (15 - 1) + 1; //rdm b/w 1 and 15
        let xPos = xPosition; //TODO: remove xPosition param if not used
        
        if (Store.autoScroll === true) {
            if (options.type === 'drum') {
                xPos = -(Store.ticks);
            } else {
                xPos = -(Store.ticks);
                Store.InstrumentCounter++;
            }
        }

        // https://stackoverflow.com/questions/44630265/how-can-i-set-z-up-coordinate-system-in-three-js
        // const yPos = 20; // v0.4, v0.5
        // const yPos = 1;
        const yPos = 30;

        /*** Randomized Y drop point ***/
        // const y = Math.random() * (10 - 5) + 5; //rdm b/w 5 and 10

        let zPos;
        zPos = options.originalPosition !== undefined ? options.originalPosition.z : Math.random() * (15 - 5) - 2;
        // zPos = Store.dropPosY; // drum spinner (v0.3)

        // body.mass = 1; // feather light
        // body.mass = 8; // heavy

        if (options.type === 'drum') {
            // TODO: new drum machine paradigm - use rotating clock hand to hit drums
            // https://codepen.io/danlong/pen/LJQYYN
            // zPos += 10; // PREV: see Store.staffLineInitZ and Store.staffLineSecondZ

            zPos -= 8; // TODO: is this still needed?
        } else {
            // zPos -= 3; // v0.4, v0.5

            zPos += 2;
        }

        if (Store.cameraCircularAnimation === true) {
            Store.dropOffset = options.variation === 'snare' ? Store.dropOffset -= 0.8 : 0;
            Store.dropOffset = options.variation === 'kick' ? Store.dropOffset -= 1.2 : 0;
            Store.dropOffset = options.variation === 'hihat' ? Store.dropOffset -= 1.6 : 0;
            // console.log('Store.dropOffset: ', Store.dropOffset); // DEBUG
            // xPos += Store.dropOffset;
            // zPos += Store.dropOffset;

            xPos = Store.dropCoordCircleInterval[index].px;
            zPos = Store.dropCoordCircleInterval[index].py;
        }

        // zPos = options.originalPosition.z;

        body.position.set((sphere) ? -xPos : xPos, yPos, zPos);

        body.linearDamping = Store.damping; // 0.01
        // body.linearDamping = 0.01; // v0.2, v0.3

        // body.angularVelocity.z = 12; //too much rotation - hard to read note letter
        // body.angularVelocity.z = 6; //prev
        body.angularVelocity.z = 0;

        if (options.type === 'animation') {
            flamePhysics.create({x: -xPos});
            Store.flameCounter++;
            return;
        }
        
        Store.world.add(body);

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
                // console.log('ev.contact.ni', ev.contact.ni); // DEBUG USE
                // console.log('ev.contact.rj', ev.contact.rj);

                //TODO: determine best way to convert from negative scientific notation without rounding to -0, ex: -2.220446049250313e-16
                // const roundedHitMetric = parseInt(ev.contact.ni.z);
                // if (ev.contact.ni.x !== -0 || roundedHitMetric !== -2) {
                if (ev.contact.ni.x !== -0) {
                    // console.log('HIT ev.contact.ni', ev.contact.ni);
                    spinnerCollideCount++;
                } else {
                    // console.log('MISS ev.contact.ni', ev.contact.ni);
                    // console.log('MISS roundedHitMetric', roundedHitMetric);
                }
                bodyCollideCount++;
            }

            if (Store.triggerOn === 'contact') {
                if (bodyCollideCount === 1) {
                    trigger.triggerNote(body);
                    notePlayed = true;
                }
            } else if (Store.triggerOn === 'spinner') {
                if (spinnerCollideCount === 1 && notePlayed !== true) { // 0.3
                    trigger.triggerNote(body);
                    notePlayed = true;
                }
            }
        });

    }

    addVisual(body, name, castShadow = true, receiveShadow = true, options = 'Z') {

        // const objSize = options.size ? options.size : 'md';
        // console.log('(addVisual) -> options: ', options);

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
            Store.scene.add(mesh);
        }
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

                    // TODO: if options.size is 'xl' make sphere larger, need to fix Cannon addShape so physics still work
                    // const sphereGeo = new THREE.SphereGeometry(12, 12, 12);
                    sphereGeo.name = 'sphereGeo'; //*** important for rotation when Store.view.cameraPositionBehind true

                    mesh = new THREE.Mesh(sphereGeo, poolBallMaterial); //prev: material
                    
                    // TODO: add configurable height / size
                    mesh.scale.set(1.35, 1.35, 1.35);
                    break;

                case CANNON.Shape.types.PARTICLE:
                    mesh = new THREE.Mesh(game.particleGeo, game.particleMaterial);
                    const s = this.settings;
                    mesh.scale.set(s.particleSize, s.particleSize, s.particleSize);
                    break;

                case CANNON.Shape.types.PLANE:
                    // geometry = new THREE.PlaneGeometry(10, 10, 4, 4); // too short
                    // geometry = new THREE.PlaneGeometry(20, 10, 4, 4);
                    geometry = new THREE.PlaneGeometry(0, 0, 0, 0);
                    mesh = new THREE.Object3D();

                    // TODO: try changing mesh.name to fix no color update
                    mesh.name = 'groundPlane';
                    // geometry.colorsNeedUpdate = true; //no effect

                    const submesh = new THREE.Object3D();

                    // const randColor = (Math.random()*0xFFFFFF<<0).toString(16);
                    // const tempColor = parseInt('0x' + randColor); //or options.color
                    
                    const tempColor = Store.activeInstrColor;
                    // const tempColor = '#9F532A'; //red

                    const defaultColor = new THREE.Color(tempColor);
                    material.color = defaultColor;

                    const ground = new THREE.Mesh(geometry, material);
                    // ground.scale.set(500, 6, 100); // PREV
                    ground.scale.set(10, 10, 10); // no effect
                    ground.name = 'groundMesh';

                    //TODO: use correctly - https://threejs.org/docs/#manual/en/introduction/How-to-update-things
                    // ground.colorsNeedUpdate = true;

                    submesh.add(ground);
                    mesh.add(submesh);
                    break;

                case CANNON.Shape.types.BOX:
                    // NEW Ground for drum spinner, PLANE no longer used since infinite invisible contact not needed
                    const boxGeometry = new THREE.BoxGeometry(shape.halfExtents.x * 2,
                        shape.halfExtents.y * 2,
                        shape.halfExtents.z * 2);

                    // console.log({shape});

                    // const boxGeometry = new THREE.BoxGeometry(25, 25, 0.5); // does not coincide with contact surface size

                    material.color = new THREE.Color(Store.activeInstrColor);;

                    // boxGeometry.scale.set(10, 10, 10); // not a function
                    mesh = new THREE.Mesh(boxGeometry, material);
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
                if (mesh.geometry.name === 'sphereGeo' && Store.view.cameraPositionBehind) {
                    // console.log('sphereGeo debug rotation: ', mesh.rotation);
                    mesh.rotation.set(0, -1.5, 0); //x: more faces downwards, y: correct - around center, z
                }
            }

            obj.add(mesh);
            obj.name = 'physicsParent';
            // console.log({obj}); //name = groundPlane is child of Object3D type
        });

        // console.log('(shape2Mesh) -> obj: ', obj);
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

    addSpinner() {
        // DRUM MACHINE WHEEL: 
        // https://codepen.io/danlong/pen/LJQYYN?editors=1010
        // FORK: https://codepen.io/sjcobb/pen/vYYpKMv

        // const rotationSpeed = Store.bpm * 0.011;
        // const rotationSpeed = Store.bpm * 0.019; 
        // const rotationSpeed = Store.bpm * 0.027; // prev
        const rotationSpeed = Store.bpm * 0.025;
        // console.log({rotationSpeed});

        const spinnerLength = 28;

        // CANNON (PHYSICS)
        let boxShape = new CANNON.Box(new CANNON.Vec3(12.25, 0.5, 0.5)); // no effect

        // https://schteppe.github.io/cannon.js/docs/classes/Body.html
        Store.spinnerBody = new CANNON.Body({
            // mass: 1000,
            mass: 1000,
            // angularVelocity: new CANNON.Vec3(0, 5 ,0),
            angularVelocity: new CANNON.Vec3(0, rotationSpeed, 0), // TODO: spinner speed (2nd param, y) map to Tone.Transport bpm
            // angularVelocity: new CANNON.Vec3(12, rotationSpeed, 0), // wave shutter up & down
            // angularVelocity: new CANNON.Vec3(0, rotationSpeed, 10), // vertical clock tower - USE
            angularDamping: 0, // default=0.01
            // linearDamping: 0.01,
            fixedRotation: true, // IMPORTANT
            // boundingRadius: 2
            // interpolatedPosition: {x: 100, y: 100, z: 100}
        });
        // Store.spinnerBody.quaternion = new CANNON.Quaternion(-0.5, -0.5, 0.5, 0.5); // rotate standing up
        // Store.spinnerBody.quaternion = new CANNON.Quaternion(0.5, 0.5, 0.5, 0.5); // rotate standing up
        // Store.spinnerBody.quaternion = new CANNON.Quaternion(0, 0.5, 0.5, 0.5); // woah
        
        Store.spinnerBody.quaternion = new CANNON.Quaternion(0, 0.5, 0.05, 0.5); // decent - stage under - wobbly

        Store.spinnerBody.addShape(boxShape);
        // console.log('Store.spinnerBody: ', Store.spinnerBody);
        console.log(Store.spinnerBody);

        // Store.spinnerBody.position.set(0, 0.25, 0); // no effect

        Store.spinnerBody.name = 'spinner';
        
        // THREE JS (VISUAL)
        // var geometry = new THREE.BoxBufferGeometry( 24.5, 0.5, 0.5 );
        var geometry = new THREE.BoxBufferGeometry(spinnerLength, 0.5, 0.5);
        // geometry.rotateX(THREE.Math.degToRad(90)); // TODO: animate rotation so rect goes in circle
        // geometry.rotateY(THREE.Math.degToRad(45)); // no effect
        // console.log({geometry});

        // var material = new THREE.MeshBasicMaterial({color: 0xff0000}); red
        var material = new THREE.MeshBasicMaterial({color: 0x003366}); //midnight blue
        let spinner = new THREE.Mesh(geometry, material);
        // console.log({spinner});

        // Store.meshes.push(spinner);
        Store.bodies.push(Store.spinnerBody);
        Store.scene.add(spinner);
        Store.world.addBody(Store.spinnerBody);
    }

    updatePhysics() {
        // TODO: uncomment debugRenderer after fix scene undef err
        if (this.physics.debugRenderer !== undefined) {
            this.physics.debugRenderer.scene.visible = true;
        }
    }

    // updateMeshPositions() {
    //     for (var i = 0; i !== this.meshes.length; i++) {
    //         Store.meshes[i].position.copy(this.bodies[i].position);
    //         Store.meshes[i].quaternion.copy(this.bodies[i].quaternion);
    //     }
    // },

    updateBodies(world) {

        // Store.spinnerBody.position.set(0, -1.5, 0);

        // IMPORTANT: cannon.js boilerplate
        // world.bodies.forEach(function(body) {
        Store.world.bodies.forEach(function(body) {
            if (body.threemesh != undefined) {
                body.threemesh.position.copy(body.position);
                body.threemesh.quaternion.copy(body.quaternion);
            }
        });

        // TODO: standard way to update bodies? Store.bodies and Store.meshes shouldn't only be for spinner
        // for (var i = 0; i !== Store.meshes.length; i++) {
        //     Store.meshes[i].position.copy(Store.bodies[i].position);
        //     Store.meshes[i].quaternion.copy(Store.bodies[i].quaternion);
        // }
    }

}