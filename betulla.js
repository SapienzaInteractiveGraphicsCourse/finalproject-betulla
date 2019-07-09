var camera, scene, renderer, controls;
var mesh;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 20000 );
    camera.position.z = 400;
    scene = new THREE.Scene();

    var geometry = new THREE.BoxBufferGeometry( 10, 10, 10 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    mesh = new THREE.Mesh( geometry, material );
    //scene.add( mesh );

    scene.background = new THREE.Color( 0xffffff );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize, false );

    controls = new THREE.OrbitControls( camera, document );

    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set( 0, 20, 100 );
    controls.update();

    light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    light.position.set( 0, 200, 0 );
    scene.add( light );
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 200, 100 );
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = - 100;
    light.shadow.camera.left = - 120;
    light.shadow.camera.right = 120;
    scene.add( light );

    /*new THREE.MTLLoader().setPath( 'Models/Bombardier-415/' ).load( 'cl415.mtl', function ( materials ) {
            materials.preload();
            new THREE.OBJLoader().setMaterials( materials ).setPath( 'Models/Bombardier-415/' ).load( 'cl415.obj', function ( object ) {
                    scene.add( object );
                } );
        } );*/
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    controls.update();
}

var loader = new THREE.GLTFLoader();

loader.load( 'Models/Bombardier-415/canadair.glb', function ( gltf ) {

    model = gltf.scene;
    model.position.set(5,1,0);
    model.scale.set(5, 5, 5);
    console.log(model);
    scene.add( model );
}, undefined, function ( error ) {

    console.error( error );

} );