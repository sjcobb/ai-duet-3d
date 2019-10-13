import FireShader from './FireShader.js';

/**
 * see: mattatz / http://github.com/mattatz
 * Ray tracing based real-time procedural volumetric fire object for three.js
 */

// THREE.Fire = function ( fireTex, color ) {
export default class Fire {

    constructor() {
        // super();
    }

    init() {
        var fireMaterial = new THREE.ShaderMaterial( {
            defines         : FireShader.defines,
            uniforms        : THREE.UniformsUtils.clone( FireShader.uniforms ),
            vertexShader    : FireShader.vertexShader,
            fragmentShader  : FireShader.fragmentShader,
            transparent     : true,
            depthWrite      : false,
            depthTest       : false
        } );
    
        // initialize uniforms 
    
        fireTex.magFilter = fireTex.minFilter = THREE.LinearFilter;
        fireTex.wrapS = fireTex.wrapT = THREE.ClampToEdgeWrapping;
        
        fireMaterial.uniforms.fireTex.value = fireTex;
        fireMaterial.uniforms.color.value = color || new THREE.Color( 0xeeeeee );
        fireMaterial.uniforms.invModelMatrix.value = new THREE.Matrix4();
        fireMaterial.uniforms.scale.value = new THREE.Vector3( 1, 1, 1 );
        fireMaterial.uniforms.seed.value = Math.random() * 19.19;
    
        THREE.Mesh.call( this, new THREE.BoxGeometry( 1.0, 1.0, 1.0 ), fireMaterial );

        // THREE.Fire.prototype = Object.create( THREE.Mesh.prototype );
        // THREE.Fire.prototype.constructor = THREE.Fire;
    }

    create() {
        const fireTex = globals.loader.load("assets/flame/FireOrig.png");
        volumetricFire = new THREE.Fire(fireTex);
        volumetricFire.scale.set(6, 6.8, 6.0); //width, height, z
        volumetricFire.position.set(globals.posBehindX + 30, 3.5, globals.posBehindZ);
        var wireframeMat = new THREE.MeshBasicMaterial({
            color : new THREE.Color(0xffffff),
            wireframe : true
        });
        var wireframe = new THREE.Mesh(volumetricFire.geometry, wireframeMat.clone());
        volumetricFire.add(wireframe);
        wireframe.visible = false;
        globals.scene.add(volumetricFire);
    }

    // update = function ( time ) {
    //     var invModelMatrix = this.material.uniforms.invModelMatrix.value;
    //     this.updateMatrixWorld();
    //     invModelMatrix.getInverse( this.matrixWorld );
    //     if( time !== undefined ) {
    //         this.material.uniforms.time.value = time;
    //     }
    //     this.material.uniforms.invModelMatrix.value = invModelMatrix;
    //     this.material.uniforms.scale.value = this.scale;
    // };

};