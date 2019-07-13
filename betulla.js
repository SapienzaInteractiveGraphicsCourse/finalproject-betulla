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

loader.load( 'Models/Bombardier-415/bombardier_canadair.glb', function ( gltf ) {


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
    scene.add( model );

}, undefined, function ( error ) {
    console.error( error );
} );

var engine;
var reset;
var total_reset;
var motors = 0;
var weels = 0;
var speed_helic = 0;
var speed_weels = 0;
var t = 0;
var s = 0;
var carrello = true;
var ground = false;
var vel = 0;
var vel_x = 0;
var vel_y = 0;
var vel_z = 0;

function go_motors() {
    elica_sx.rotation.x += speed_helic;
    elica_dx.rotation.x += speed_helic;
    bulbo_sx.rotation.x += speed_helic;
    bulbo_dx.rotation.x += speed_helic;
}

function close_doors_ant() {
    var final_pos_carrello_ant_sx = [-7.581658840179443, -3.7419378757476807, 0.19173964858055115];
    var final_pos_carrello_ant_dx = [-7.5800251960754395, -3.73860764503479, -0.18563362956047058];
    var final_ori_carrello_ant_sx = [0.009189425971824428, -0.00554940649972749, 0.0018415058893600554];
    var final_ori_carrello_ant_dx = [3.1403668839430146-2*Math.PI, -0.0003022653574889117, 0.2552230979322464];
    var init_pos_carrello_ant_sx = [carrello_ant_sx.position.x, carrello_ant_sx.position.y, carrello_ant_sx.position.z];
    var init_pos_carrello_ant_dx = [carrello_ant_dx.position.x, carrello_ant_dx.position.y, carrello_ant_dx.position.z];
    var init_ori_carrello_ant_sx = [carrello_ant_sx.rotation.x, carrello_ant_sx.rotation.y, carrello_ant_sx.rotation.z];
    var init_ori_carrello_ant_dx = [carrello_ant_dx.rotation.x, carrello_ant_dx.rotation.y, carrello_ant_dx.rotation.z];

    if (asse_ant.rotation.z < Math.PI/2) {
        asse_ant.position.y += 0.005;
        asse_ant.rotation.z += Math.PI / 200;
        ruote_ant.position.y += 0.005;
        ruote_ant.position.x += 0.01 * Math.cos(asse_ant.rotation.z);
        ruote_ant.position.y += 0.01 * Math.sin(asse_ant.rotation.z);
    }
    else {
        carrello_ant_sx.position.x = init_pos_carrello_ant_sx[0] + t * (final_pos_carrello_ant_sx[0] - init_pos_carrello_ant_sx[0]);
        carrello_ant_sx.position.y = init_pos_carrello_ant_sx[1] + t * (final_pos_carrello_ant_sx[1] - init_pos_carrello_ant_sx[1]);
        carrello_ant_sx.position.z = init_pos_carrello_ant_sx[2] + t * (final_pos_carrello_ant_sx[2] - init_pos_carrello_ant_sx[2]);
        carrello_ant_sx.rotation.x = init_ori_carrello_ant_sx[0] + t * (final_ori_carrello_ant_sx[0] - init_ori_carrello_ant_sx[0]);
        carrello_ant_sx.rotation.y = init_ori_carrello_ant_sx[1] + t * (final_ori_carrello_ant_sx[1] - init_ori_carrello_ant_sx[1]);
        carrello_ant_sx.rotation.z = init_ori_carrello_ant_sx[2] + t * (final_ori_carrello_ant_sx[2] - init_ori_carrello_ant_sx[2]);

        carrello_ant_dx.position.x = init_pos_carrello_ant_dx[0] + t * (final_pos_carrello_ant_dx[0] - init_pos_carrello_ant_dx[0]);
        carrello_ant_dx.position.y = init_pos_carrello_ant_dx[1] + t * (final_pos_carrello_ant_dx[1] - init_pos_carrello_ant_dx[1]);
        carrello_ant_dx.position.z = init_pos_carrello_ant_dx[2] + t * (final_pos_carrello_ant_dx[2] - init_pos_carrello_ant_dx[2]);
        carrello_ant_dx.rotation.x = init_ori_carrello_ant_dx[0] + t * (final_ori_carrello_ant_dx[0] - init_ori_carrello_ant_dx[0]);
        carrello_ant_dx.rotation.y = init_ori_carrello_ant_dx[1] + t * (final_ori_carrello_ant_dx[1] - init_ori_carrello_ant_dx[1]);
        carrello_ant_dx.rotation.z = init_ori_carrello_ant_dx[2] + t * (final_ori_carrello_ant_dx[2] - init_ori_carrello_ant_dx[2]);
        t += 0.01;
    }

}

function close_doors_back() {

    var final_pos_carrello_pst_sx = [-1.0702261924743652, -3.2571945667266846, 1.3294000625610352];
    var final_ori_carrello_pst_sx = [-0.013760069104879721, 0.0010154504545003445, -0.006800981813350741];
    var final_pos_supp_basso_sx = [-1.1008645296096802, -2.730417251586914, 1.2280879020690918];
    var final_ori_supp_basso_sx = 1.3306488571676325-Math.PI;
    var final_pos_supp_alto_sx = [-1.114345669746399, -2.27807354927063, 1.163169264793396];
    var final_ori_supp_alto_sx = -1.8306488571676325;
    var final_pos_ruota_pst_sx = [-1.1200060844421387, -2.3823976516723633, 1.6959213018417358];
    var final_pos_asse_1_sx = [-1.1200062036514282, -2.2238004207611084, 1.5058563327789307];
    var final_ori_asse_1_sx = 0;
    var final_pos_asse_2_sx = [-1.1197788715362549, -2.0379133224487305, 1.3566317558288574];
    var final_ori_asse_2_sx = 0;
    var final_pos_asse_3_sx = [-1.1200604438781738, -1.5747488975524902, 1.3177553415298462];
    var final_ori_asse_3_sx = 0.8764418449473805;
    var final_pos_asse_4_sx = [-1.1219122409820557, -1.3398488759994507, 1.3025320768356323];
    var final_ori_asse_4_sx = -1.986052477534856;

    var final_pos_carrello_pst_dx = [-1.0618342161178589, -3.2560136795043945, -1.3136529922485352];
    var final_ori_carrello_pst_dx = [-0.025530539303034824, -0.03173290729587884, 0.008300842718581268];
    var final_pos_supp_basso_dx = [-1.1167556047439575, -2.669661521911621, -1.2342480421066284];
    var final_ori_supp_basso_dx = 1.9066757628243294;
    var final_pos_supp_alto_dx = [-1.0971845388412476, -2.2489614486694336, -1.224416971206665];
    var final_ori_supp_alto_dx = 1.972308585227403;
    var final_pos_ruota_pst_dx = [-1.1200060844421387, -2.3764915466308594, -1.7284152507781982];
    var final_pos_asse_1_dx = [-1.1200062036514282, -2.182696580886841, -1.5058563327789307];
    var final_ori_asse_1_dx = 0;
    var final_pos_asse_2_dx = [-1.1193243265151978, -1.97075617313385, -1.355661600112915];
    var final_ori_asse_2_dx = 0;
    var final_pos_asse_3_dx = [-1.1200610399246216, -1.5276141166687012, -1.3424134254455566];
    var final_ori_asse_3_dx = -0.8681319586471605;
    var final_pos_asse_4_dx = [-1.1219122409820557, -1.2948439598083496, -1.317768955230713];
    var final_ori_asse_4_dx = 1.922513169813446;

    carrello_pst_sx.position.x = carrello_pst_sx.position.x + s * (final_pos_carrello_pst_sx[0] - carrello_pst_sx.position.x);
    carrello_pst_sx.position.y = carrello_pst_sx.position.y + s * (final_pos_carrello_pst_sx[1] - carrello_pst_sx.position.y);
    carrello_pst_sx.position.z = carrello_pst_sx.position.z + s * (final_pos_carrello_pst_sx[2] - carrello_pst_sx.position.z);
    carrello_pst_sx.rotation.x = carrello_pst_sx.rotation.x + s * (final_ori_carrello_pst_sx[0] - carrello_pst_sx.rotation.x);
    carrello_pst_sx.rotation.y = carrello_pst_sx.rotation.y + s * (final_ori_carrello_pst_sx[1] - carrello_pst_sx.rotation.y);
    carrello_pst_sx.rotation.z = carrello_pst_sx.rotation.z + s * (final_ori_carrello_pst_sx[2] - carrello_pst_sx.rotation.z);
    supp_carrello_basso_sx.position.x = supp_carrello_basso_sx.position.x + s * (final_pos_supp_basso_sx[0] - supp_carrello_basso_sx.position.x);
    supp_carrello_basso_sx.position.y = supp_carrello_basso_sx.position.y + s * (final_pos_supp_basso_sx[1] - supp_carrello_basso_sx.position.y);
    supp_carrello_basso_sx.position.z = supp_carrello_basso_sx.position.z + s * (final_pos_supp_basso_sx[2] - supp_carrello_basso_sx.position.z);
    supp_carrello_basso_sx.rotation.x = supp_carrello_basso_sx.rotation.x + s * (final_ori_supp_basso_sx - supp_carrello_basso_sx.rotation.x);
    supp_carrello_alto_sx.position.x = supp_carrello_alto_sx.position.x + s * (final_pos_supp_alto_sx[0] - supp_carrello_alto_sx.position.x);
    supp_carrello_alto_sx.position.y = supp_carrello_alto_sx.position.y + s * (final_pos_supp_alto_sx[1] - supp_carrello_alto_sx.position.y);
    supp_carrello_alto_sx.position.z = supp_carrello_alto_sx.position.z + s * (final_pos_supp_alto_sx[2] - supp_carrello_alto_sx.position.z);
    supp_carrello_alto_sx.rotation.x = supp_carrello_alto_sx.rotation.x + s * (final_ori_supp_alto_sx - supp_carrello_alto_sx.rotation.x);
    ruote_pst_sx.position.y = ruote_pst_sx.position.y + s * (final_pos_ruota_pst_sx[1] - ruote_pst_sx.position.y);
    ruote_pst_sx.position.z = ruote_pst_sx.position.z + s * (final_pos_ruota_pst_sx[2] - ruote_pst_sx.position.z);
    sospensione_1_sx.position.y = sospensione_1_sx.position.y + s * (final_pos_asse_1_sx[1] - sospensione_1_sx.position.y);
    sospensione_1_sx.position.z = sospensione_1_sx.position.z + s * (final_pos_asse_1_sx[2] - sospensione_1_sx.position.z);
    sospensione_1_sx.rotation.x = sospensione_1_sx.rotation.x + s * (final_ori_asse_1_sx - sospensione_1_sx.rotation.x);
    sospensione_2_sx.position.y = sospensione_2_sx.position.y + s * (final_pos_asse_2_sx[1] - sospensione_2_sx.position.y);
    sospensione_2_sx.position.z = sospensione_2_sx.position.z + s * (final_pos_asse_2_sx[2] - sospensione_2_sx.position.z);
    sospensione_2_sx.rotation.x = sospensione_2_sx.rotation.x + s * (final_ori_asse_2_sx - sospensione_2_sx.rotation.x);
    sospensione_3_sx.position.y = sospensione_3_sx.position.y + s * (final_pos_asse_3_sx[1] - sospensione_3_sx.position.y);
    sospensione_3_sx.position.z = sospensione_3_sx.position.z + s * (final_pos_asse_3_sx[2] - sospensione_3_sx.position.z);
    sospensione_3_sx.rotation.x = sospensione_3_sx.rotation.x + s * (final_ori_asse_3_sx - sospensione_3_sx.rotation.x);
    sospensione_4_sx.position.y = sospensione_4_sx.position.y + s * (final_pos_asse_4_sx[1] - sospensione_4_sx.position.y);
    sospensione_4_sx.position.z = sospensione_4_sx.position.z + s * (final_pos_asse_4_sx[2] - sospensione_4_sx.position.z);
    sospensione_4_sx.rotation.x = sospensione_4_sx.rotation.x + s * (final_ori_asse_4_sx - sospensione_4_sx.rotation.x);

    carrello_pst_dx.position.x = carrello_pst_dx.position.x + s * (final_pos_carrello_pst_dx[0] - carrello_pst_dx.position.x);
    carrello_pst_dx.position.y = carrello_pst_dx.position.y + s * (final_pos_carrello_pst_dx[1] - carrello_pst_dx.position.y);
    carrello_pst_dx.position.z = carrello_pst_dx.position.z + s * (final_pos_carrello_pst_dx[2] - carrello_pst_dx.position.z);
    carrello_pst_dx.rotation.x = carrello_pst_dx.rotation.x + s * (final_ori_carrello_pst_dx[0] - carrello_pst_dx.rotation.x);
    carrello_pst_dx.rotation.y = carrello_pst_dx.rotation.y + s * (final_ori_carrello_pst_dx[1] - carrello_pst_dx.rotation.y);
    carrello_pst_dx.rotation.z = carrello_pst_dx.rotation.z + s * (final_ori_carrello_pst_dx[2] - carrello_pst_dx.rotation.z);
    supp_carrello_basso_dx.position.x = supp_carrello_basso_dx.position.x + s * (final_pos_supp_basso_dx[0] - supp_carrello_basso_dx.position.x);
    supp_carrello_basso_dx.position.y = supp_carrello_basso_dx.position.y + s * (final_pos_supp_basso_dx[1] - supp_carrello_basso_dx.position.y);
    supp_carrello_basso_dx.position.z = supp_carrello_basso_dx.position.z + s * (final_pos_supp_basso_dx[2] - supp_carrello_basso_dx.position.z);
    supp_carrello_basso_dx.rotation.x = supp_carrello_basso_dx.rotation.x + s * (final_ori_supp_basso_dx - supp_carrello_basso_dx.rotation.x);
    supp_carrello_alto_dx.position.x = supp_carrello_alto_dx.position.x + s * (final_pos_supp_alto_dx[0] - supp_carrello_alto_dx.position.x);
    supp_carrello_alto_dx.position.y = supp_carrello_alto_dx.position.y + s * (final_pos_supp_alto_dx[1] - supp_carrello_alto_dx.position.y);
    supp_carrello_alto_dx.position.z = supp_carrello_alto_dx.position.z + s * (final_pos_supp_alto_dx[2] - supp_carrello_alto_dx.position.z);
    supp_carrello_alto_dx.rotation.x = supp_carrello_alto_dx.rotation.x + s * (final_ori_supp_alto_dx - supp_carrello_alto_dx.rotation.x);
    ruote_pst_dx.position.y = ruote_pst_dx.position.y + s * (final_pos_ruota_pst_dx[1] - ruote_pst_dx.position.y);
    ruote_pst_dx.position.z = ruote_pst_dx.position.z + s * (final_pos_ruota_pst_dx[2] - ruote_pst_dx.position.z);
    sospensione_1_dx.position.y = sospensione_1_dx.position.y + s * (final_pos_asse_1_dx[1] - sospensione_1_dx.position.y);
    sospensione_1_dx.position.z = sospensione_1_dx.position.z + s * (final_pos_asse_1_dx[2] - sospensione_1_dx.position.z);
    sospensione_1_dx.rotation.x = sospensione_1_dx.rotation.x + s * (final_ori_asse_1_dx - sospensione_1_dx.rotation.x);
    sospensione_2_dx.position.y = sospensione_2_dx.position.y + s * (final_pos_asse_2_dx[1] - sospensione_2_dx.position.y);
    sospensione_2_dx.position.z = sospensione_2_dx.position.z + s * (final_pos_asse_2_dx[2] - sospensione_2_dx.position.z);
    sospensione_2_dx.rotation.x = sospensione_2_dx.rotation.x + s * (final_ori_asse_2_dx - sospensione_2_dx.rotation.x);
    sospensione_3_dx.position.y = sospensione_3_dx.position.y + s * (final_pos_asse_3_dx[1] - sospensione_3_dx.position.y);
    sospensione_3_dx.position.z = sospensione_3_dx.position.z + s * (final_pos_asse_3_dx[2] - sospensione_3_dx.position.z);
    sospensione_3_dx.rotation.x = sospensione_3_dx.rotation.x + s * (final_ori_asse_3_dx - sospensione_3_dx.rotation.x);
    sospensione_4_dx.position.y = sospensione_4_dx.position.y + s * (final_pos_asse_4_dx[1] - sospensione_4_dx.position.y);
    sospensione_4_dx.position.z = sospensione_4_dx.position.z + s * (final_pos_asse_4_dx[2] - sospensione_4_dx.position.z);
    sospensione_4_dx.rotation.x = sospensione_4_dx.rotation.x + s * (final_ori_asse_4_dx - sospensione_4_dx.rotation.x);



    s += 0.001;

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

function reset_all() {

}

function motion() {
    if (ground) {
        ruote_ant.rotation.z += speed_weels;
        ruote_pst_sx.rotation.z += speed_weels;
        ruote_pst_dx.rotation.z += speed_weels;
    }
    else {
        model.rotation.z = -flap_timone.rotation.z;
        if (flap_int_dx.rotation.z > 0) {
            model.rotation.x = -flap_int_sx.rotation.z*0.8;
        }
        else model.rotation.x = flap_int_dx.rotation.z*0.8;
    }
}

function manage_velocity() {
    if (motors == 0) vel = 0;
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
        setInterval(motion, 1);
    }
    else if (keyCode == 87) { // w
        if (motors != 0 && motors != 5) {
            motors += 1;
            speed_helic += 0.05;
        }
        if (weels != 5) {
            weels += 1;
            speed_weels += 0.1;
        }
        setInterval(motion, 1);

    }
    else if (keyCode == 83) { // s
        if (motors != 0 && motors != 1) {
            motors -= 1;
            speed_helic -= 0.05;
        }
    }
    else if (keyCode == 65) { // a
        clearInterval(reset);
        clearInterval(total_reset);
        if (flap_int_dx.rotation.z < 0) {
            flap_int_dx.rotation.z += Math.PI/200;
            flap_int_sx.rotation.z -= Math.PI/600;
        }
        else if (flap_int_sx.rotation.z > - Math.PI/4) {
            flap_int_sx.rotation.z -= Math.PI/200;
            flap_int_dx.rotation.z += Math.PI/600;
        }
        if (timone.rotation.y > - Math.PI/12) {
            timone.rotation.y -= Math.PI/600;
        }
    }
    else if (keyCode == 68) { // d
        clearInterval(reset);
        clearInterval(total_reset);
        if (flap_int_sx.rotation.z < 0) {
            flap_int_sx.rotation.z += Math.PI/200;
            flap_int_dx.rotation.z -= Math.PI/600;
        }
        else if (flap_int_dx.rotation.z > - Math.PI/4) {
            flap_int_dx.rotation.z -= Math.PI/200;
            flap_int_sx.rotation.z += Math.PI/600;
        }
        if (timone.rotation.y < Math.PI/12) {
            timone.rotation.y += Math.PI/600;
        }
    }
    else if (keyCode == 101) { // up-38
        clearInterval(reset);
        clearInterval(total_reset);
        if (flap_timone.rotation.z > - Math.PI/8) {
            flap_timone.rotation.z -= Math.PI/300;
            flap_ext_sx.rotation.z += Math.PI/400;
            flap_ext_dx.rotation.z += Math.PI/400;
        }
    }

    else if (keyCode == 98) { // down-40
        clearInterval(reset);
        clearInterval(total_reset);
        if (flap_timone.rotation.z <  Math.PI/8) {
            flap_timone.rotation.z += Math.PI / 300;
            flap_ext_sx.rotation.z -= Math.PI / 400;
            flap_ext_dx.rotation.z -= Math.PI / 400;
        }
    }

    else if (keyCode == 82) { // r
        reset = setInterval(reset_attitude, 20);
    }

    else if (keyCode == 82) { // r
        total_reset = setInterval(reset_all, 20);
    }

    else if (keyCode == 67) { // c
        if (carrello) {
            t = 0;
            s = 0;
            carrello = false;
            setInterval(close_doors_ant, 10);
            setInterval(close_doors_back, 10);
        }
    }

    /*
    else if (keyCode == 85) carrello_ant_dx.rotation.x += 0.01;
    else if (keyCode == 73) carrello_ant_dx.rotation.y += 0.01;
    else if (keyCode == 79) carrello_ant_dx.rotation.z += 0.01;
    else if (keyCode == 74) carrello_ant_dx.rotation.x -= 0.01;
    else if (keyCode == 75) carrello_ant_dx.rotation.y -= 0.01;
    else if (keyCode == 76) carrello_ant_dx.rotation.z -= 0.01;

    else if (keyCode == 82) console.log(carrello_ant_dx.rotation);*/
};