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

    /*light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    light.position.set( 0, 200, 0 );
    scene.add( light );
    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 200, 100 );
    light.castShadow = true;
    light.shadow.camera.top = 180;
    light.shadow.camera.bottom = - 100;
    light.shadow.camera.left = - 120;
    light.shadow.camera.right = 120;
    scene.add( light );*/

    /*var light = new THREE.PointLight( 0xffffff, 20, 100 );
    light.position.set( 50, 50, 50 );
    scene.add( light );*/

    /*new THREE.MTLLoader().setPath( 'Models/Bombardier-415/' ).load( 'cl415.mtl', function ( materials ) {
            materials.preload();
            new THREE.OBJLoader().setMaterials( materials ).setPath( 'Models/Bombardier-415/' ).load( 'cl415.obj', function ( object ) {
                    scene.add( object );
                } );
        } );*/

    // LIGHTS
    dirLight = new THREE.DirectionalLight( 0xffffff, 4 );
    dirLight.position.set( - 1, -1.75, 1 );
    scene.add( dirLight );
    dirLight = new THREE.DirectionalLight( 0xffffff, 4 );
    dirLight.position.set(  1, 1.75, -1 );
    scene.add( dirLight );

    var skyGeo = new THREE.SphereGeometry(100000, 25, 25);
    var loader  = new THREE.TextureLoader();
    texture = loader.load( "Models/Sky/sky.jpg" );
    var material = new THREE.MeshPhongMaterial({
        map: texture,
    });
    var sky = new THREE.Mesh(skyGeo, material);
    sky.material.side = THREE.BackSide;
    scene.add(sky);

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

    model.traverse(function (children){

        if (children.name == "heliceG") elica_sx = children;
        if (children.name == "heliceD") elica_dx = children;

        if (children.name == "voletG") flap_int_sx = children;
        if (children.name == "voletD") flap_int_dx = children;

        if (children.name == "aileronG") flap_ext_sx = children;
        if (children.name == "aileronD") flap_ext_dx = children;

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

var engine;
var reset;
var motors = 0;
var speed_helic = 0;

function go_motors() {
    elica_sx.rotation.x += speed_helic;
    elica_dx.rotation.x += speed_helic;
}

function reset_attitude() {
    if (timone.rotation.y < 0) timone.rotation.y += Math.PI/600;
    else timone.rotation.y -= Math.PI/600;
    if (flap_timone.rotation.z > 0) flap_timone.rotation.z -= Math.PI/600;
    else flap_timone.rotation.z += Math.PI/600;
    if (flap_int_dx.rotation.z > 0) flap_int_dx.rotation.z -= Math.PI/600;
    else flap_int_dx.rotation.z += Math.PI/200;
    if (flap_int_sx.rotation.z > 0) flap_int_sx.rotation.z -= Math.PI/600;
    else flap_int_sx.rotation.z += Math.PI/200;
    if (flap_ext_sx.rotation.z > 0) flap_ext_sx.rotation.z -= Math.PI/700;
    else flap_ext_sx.rotation.z += Math.PI/250;
    if (flap_ext_dx.rotation.z > 0) flap_ext_dx.rotation.z -= Math.PI/700;
    else flap_ext_dx.rotation.z += Math.PI/250;
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;

    //console.log(keyCode);

    if (keyCode == 77) { // m
        if (motors == 0){
            motors = 1;
            speed_helic = 0.05;
            engine = setInterval(go_motors, 1);
        }
        else {
            motors = 0;
            speed_helic = 0;
            clearInterval(engine);
        }
    }
    else if (keyCode == 87) { // w
        if (motors != 0 && motors != 5) {
            motors += 1;
            speed_helic += 0.05;
        }

    }
    else if (keyCode == 83) { // s
        if (motors != 0 && motors != 1) {
            motors -= 1;
            speed_helic -= 0.05;
        }
    }
    else if (keyCode == 65) { // a
        clearInterval(reset);
        if (flap_int_dx.rotation.z < 0) {
            flap_int_dx.rotation.z += Math.PI/200;
            flap_int_sx.rotation.z -= Math.PI/600;
            flap_ext_dx.rotation.z += Math.PI/250;
            flap_ext_sx.rotation.z -= Math.PI/700;
        }
        else if (flap_int_sx.rotation.z > - Math.PI/4) {
            flap_int_sx.rotation.z -= Math.PI/200;
            flap_int_dx.rotation.z += Math.PI/600;
            flap_ext_sx.rotation.z -= Math.PI/250;
            flap_ext_dx.rotation.z += Math.PI/700;
        }
        if (timone.rotation.y > - Math.PI/12) {
            timone.rotation.y -= Math.PI/600;
        }
    }
    else if (keyCode == 68) { // d
        clearInterval(reset);
        if (flap_int_sx.rotation.z < 0) {
            flap_int_sx.rotation.z += Math.PI/200;
            flap_int_dx.rotation.z -= Math.PI/600;
            flap_ext_sx.rotation.z += Math.PI/250;
            flap_ext_dx.rotation.z -= Math.PI/700;
        }
        else if (flap_int_dx.rotation.z > - Math.PI/4) {
            flap_int_dx.rotation.z -= Math.PI/200;
            flap_int_sx.rotation.z += Math.PI/600;
            flap_ext_dx.rotation.z -= Math.PI/250;
            flap_ext_sx.rotation.z += Math.PI/700;
        }
        if (timone.rotation.y < Math.PI/12) {
            timone.rotation.y += Math.PI/600;
        }
    }
    else if (keyCode == 38) { // up
        clearInterval(reset);
        if (flap_timone.rotation.z > - Math.PI/12) {
            flap_timone.rotation.z -= Math.PI/600;
        }
    }

    else if (keyCode == 40) { // down
        clearInterval(reset);
        if (flap_timone.rotation.z <  Math.PI/8) {
            flap_timone.rotation.z += Math.PI / 300;
        }
    }

    else if (keyCode == 82) { // r
        reset = setInterval(reset_attitude, 20);
    }

    else if (keyCode == 67) { // c
        if (asse_ant.rotation.z > Math.PI/2) {
            asse_ant.position.y += 0.005;
            asse_ant.rotation.z += Math.PI / 200;
            ruote_ant.position.y += 0.005;
            ruote_ant.position.x += 0.01 * Math.cos(asse_ant.rotation.z);
            ruote_ant.position.y += 0.01 * Math.sin(asse_ant.rotation.z);
        }
        else {
            carrello_ant_sx.rotation.x = -0.313373;
            carrello_ant_sx.rotation.z = -0.060885;
            carrello_ant_sx.rotation.y = 0.110415;
            carrello_ant_sx.position.x = -7.59577;
            carrello_ant_sx.position.y = -3.69995;
            carrello_ant_sx.position.z = 0.0035;


            /*
            x = -7.59577
            y = -0.181294
            z = -3.69995
            -0.313373d
            -0.060885d
            0.110415d


            -7.57884
            0.197958
            -3.73626
            -180.595d
            14.9628d
            -1.08939d

             */

        }
    }
};