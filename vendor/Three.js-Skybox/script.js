// FPS
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer( );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// update viewport on resize
window.addEventListener( 'resize', function() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize( width, height );
    camera.aspect = width / height; //aspect ratio
    camera.updateProjectionMatrix();
});

// controls
controls = new THREE.OrbitControls( camera, renderer.domElement);

// Object loader
// var loader = new THREE.ObjectLoader();

// loader.load (
//     ' objects/mars-rover.json ',
//     function( object ) {
//         scene.add( object );
//     }
// );

// creates the shape
var geometry = new THREE.CubeGeometry( 250, 250, 250 );
var cubeMaterials = [
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( "img/nightsky_ft.png" ), side: THREE.DoubleSide }), //front side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'img/nightsky_bk.png' ), side: THREE.DoubleSide }), //back side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'img/nightsky_up.png' ), side: THREE.DoubleSide }), //up side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'img/nightsky_dn.png' ), side: THREE.DoubleSide }), //down side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'img/nightsky_rt.png' ), side: THREE.DoubleSide }), //right side
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( 'img/nightsky_lf.png' ), side: THREE.DoubleSide }) //left side
];

var cubeMaterial = new THREE.MeshFaceMaterial( cubeMaterials );
var cube = new THREE.Mesh( geometry, cubeMaterial );
scene.add( cube );


// Camera Position
camera.position.z = 3;

// lighting
var ambientLight = new THREE.AmbientLight( 0xFFFFFF, 0.3 );
scene.add( ambientLight );



//game logic
var update = function ( ) {
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.005;
};

//render logic
var render = function ( ) {
    renderer.render( scene, camera );
};

//run game loop (update, render, repeat)
var GameLoop = function () {
    requestAnimationFrame( GameLoop);
    update();
    render();
};

GameLoop();