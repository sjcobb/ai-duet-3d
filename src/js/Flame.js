import Store from './Store.js';
// import THREE.Fire from '../vendor/Fire.js';
// import Fire from './Fire.js';

// import FireShader from '../vendor/FireShader.js';

// import Fire from 'Fire';

/*
 *** Flame ***
 */

export default class Flame {
    
    // constructor(fireParam) {
    constructor() {
        // this.triggerTime = fireParam;
    }

    create(pos) {
        // console.log(pos);
        // console.log(globals);
        // console.log(Store.flameArr);

        const fireTex = Store.loader.load("assets/flame/FireOrig.png");
        const volumetricFire = new THREE.Fire(fireTex);

        // volumetricFire.material.uniforms.magnitude.value = 0.5; //PREV: higher = spaciness
        // volumetricFire.material.uniforms.lacunarity.value = 0.1;   //PREV: lower = more cartoony
        // volumetricFire.material.uniforms.lacunarity.gain = 0.1;     //PREV: more = less height
        
        // volumetricFire.material.uniforms.magnitude.value = 0.7;
        volumetricFire.material.uniforms.magnitude.value = 1.0;
        volumetricFire.material.uniforms.lacunarity.value = 1.8;   //lower = more cartoony
        // volumetricFire.material.uniforms.lacunarity.value = 2.0;   //lower = more cartoony
        //volumetricFire.material.uniforms.lacunarity.value = 1.0; //higher = more grainy
        //volumetricFire.material.uniforms.noiseScale.value.x = 2.5; //num of fires horiz

        // volumetricFire.scale.set(6, 6.8, 6.0); //PREV: width, height, z
        volumetricFire.scale.set(6, 7.5, 6.0); //width, height, z
        // volumetricFire.scale.set(15, 22, 15); //
        // volumetricFire.scale.set(150, 220, 150); // TODO: fix scale for higher values & position

        // volumetricFire.position.set(Store.view.posBehindX + 30, 3.5, Store.view.posBehindZ);
        // volumetricFire.position.set(pos.x, 3.5, Store.view.posBehindZ);
        volumetricFire.position.set(pos.x, Store.view.posBehindY, Store.view.posBehindZ);

        var wireframeMat = new THREE.MeshBasicMaterial({
            color : new THREE.Color(0xffffff),
            wireframe : true
        });
        var wireframe = new THREE.Mesh(volumetricFire.geometry, wireframeMat.clone());
        volumetricFire.add(wireframe);
        wireframe.visible = false;

        // Store.flameArr.push(volumetricFire)
        Store.flameArr = [volumetricFire];
        // Store.scene.add(volumetricFire);
        Store.scene.add(Store.flameArr[0]);
    }

    addFire(posX = Store.view.posBehindX + 22, currentTime) {
        volumetricFire.position.set(posX, 0, Store.view.posBehindZ);
        scene.add(volumetricFire);
    }

}