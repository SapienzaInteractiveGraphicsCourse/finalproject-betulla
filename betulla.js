var mesh;
var camera, scene, renderer, controls;

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
    //console.log(model);


    helperGun = new THREE.SkeletonHelper(model);
    helperGun.material.linewidth = 3;
    helperGun.visible = true;
    helperGun.traverse( function ( skeleton ) {
        //Here we traverse the skeleton and we get the elements that we need


    });

    model.traverse(function (children){

        if (children.name == "heliceG") elica_sx = children;
        if (children.name == "heliceD") elica_dx = children;

        if (children.name == "voletG") flap_int_sx = children;
        if (children.name == "voletD") flap_int_dx = children;

        if (children.name == "alieronG") flap_ext_sx = children;
        if (children.name == "alieronD") flap_ext_dx = children;

        if (children.name == "profondeur") flap_timone = children;
        if (children.name == "direction") timone = children;

        if (children.name == "bolG") bulbo_sx = children;
        if (children.name == "bolD") bulbo_dx = children;

        if (children.name == "porteG") carrello_ant_sx = children;
        if (children.name == "porteD") carrello_ant_dx = children;

        if (children.name == "trappeG") carrello_pst_sx = children;
        if (children.name == "trappeD") carrello_pst_dx = children;

        if (children.name == "roueA") ruote_ant = children;
        if (children.name == "roueG") ruote_pst_sx = children;
        if (children.name == "roueD") ruote_pst_dx = children;

        if (children.name == "axeA") asse_ant = children;

        if (children.name == "axeG1") sospensione_1_sx = children;
        if (children.name == "axeG2") sospensione_2_sx = children;
        if (children.name == "axeG3") sospensione_3_sx = children;
        if (children.name == "axeG4") sospensione_4_sx = children;
        if (children.name == "axeD1") sospensione_1_dx = children;
        if (children.name == "axeD2") sospensione_2_dx = children;
        if (children.name == "axeD3") sospensione_3_dx = children;
        if (children.name == "axeD4") sospensione_4_dx = children;

        if (children.name == "parapG1") supp_carrello_basso_sx = children;
        if (children.name == "parapG2") supp_carrello_alto_sx = children;
        if (children.name == "parapD1") supp_carrello_basso_dx = children;
        if (children.name == "parapD2") supp_carrello_alto_dx = children;

    });

    //console.log("CICCIOFORMAGGIO");
    //console.log(elica_sx);
    //console.log(elica_sx);
    //elica_sx.rotation.x = Math.PI/3;
    //elica_sx.position.set(10, 10, 10);
    //console.log(model.children[140]);
    //console.log(model.children[140].id);
    scene.add( model );

}, undefined, function ( error ) {

    //console.error( error );

} );