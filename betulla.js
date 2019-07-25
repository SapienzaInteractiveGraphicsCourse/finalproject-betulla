var camera, scene, renderer;
var time = 0;
var playFlag = false;

function start_game() {
  var music = document.getElementById("menuMusic_id");
  music.muted = true;
  init();
  playFlag = true;
  animate();
  setInterval(messages, 1000);
}

function instructions() {
    var modal = document.getElementById("myModal");

    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

var clock, startTime;

var message = "Hi, I'm Camil, your co-pilot on this mission. Let's not waste time, did you hear the commander? We have to put out the fire! I remind you how to take off, first of all start the engines [-press M-]";

function init() {

    clock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 20000 );
    scene = new THREE.Scene();

    camera.position.set( 20, 8, 0 );
    camera.lookAt( scene.position );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    //Load canadair
	var loader = new THREE.GLTFLoader();

	loader.load( 'Models/Bombardier-415/bombardier_canadair.glb', function ( gltf ) {

	    model = gltf.scene;
	    model.position.set(0,0,0);
	    model.scale.set(5, 5, 5);

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
	    model.add( camera );
	    scene.add( model );

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	});

    light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    light.position.set( 0, 200, 0 );
    scene.add( light );
    /*light = new THREE.DirectionalLight( 0xffffff );
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

    window.addEventListener( 'resize', onWindowResize, false );

    //hide main menu
    document.getElementById('start_b_id').style.display = 'none';

    //show game window
    document.getElementById('game_id').style.display = 'block';

    game_scene_div = document.getElementById('game_id');
    game_scene_div.appendChild(renderer.domElement);

    startTime=clock.getElapsedTime();


}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    if(!playFlag) return;

    renderer.render(scene, camera);

    time += 0.01;
    
    curTime = clock.getElapsedTime() - startTime -0.5;
    if (curTime<0) curTime=0.0;

    document.getElementById('timer').innerHTML = "Timer: " + curTime.toFixed(2);
    document.getElementById('height').innerHTML = "Height: " + height.toFixed(0);
    document.getElementById('velocity').innerHTML = "Velocity: " + vel.toFixed(0);
    document.getElementById('roll').innerHTML = "Roll angle: " + roll.toFixed(0) + "°";
    document.getElementById('pitch').innerHTML = "Pitch angle: " + pitch.toFixed(0) + "°";
    document.getElementById('conversation').innerHTML = "Camil: " + message;

    requestAnimationFrame( animate );
}

var engine;
var reset;
var reset_int;
var reset_ext;
var motors = 0;
var weels = 0;
var speed_helic = 0;
var speed_weels = 0;
var t = 0;
var s = 0;
var carrello = true;
var ground = true;
var vel = 0;
var height = 0;
var flag = true;
var flag_int = true;
var flag_ext = true;
var flag_motors = false;
var tank = false;
var sea = false;
var fire = false;

var roll = 0;
var pitch = 0;


function go_motors() {
    elica_sx.rotation.x -= speed_helic;
    elica_dx.rotation.x += speed_helic;
    bulbo_sx.rotation.x -= speed_helic;
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

    if (model.rotation.x > 0) model.rotateX(-Math.PI/100*model.rotation.x);
    else model.rotateX(-Math.PI/100*model.rotation.x);

    if (model.rotation.z > 0) model.rotateZ(-Math.PI/100*model.rotation.z);
    else model.rotateZ(-Math.PI/100*model.rotation.z);

}

function set_flap_int() {
    if (timone.rotation.y < 0) timone.rotation.y += Math.PI/600;
    else timone.rotation.y -= Math.PI/600;
    if (flap_int_dx.rotation.z > 0) flap_int_dx.rotation.z -= Math.PI/600;
    else flap_int_dx.rotation.z += Math.PI/200;
    if (flap_int_sx.rotation.z > 0) flap_int_sx.rotation.z -= Math.PI/600;
    else flap_int_sx.rotation.z += Math.PI/200;
}

function set_flap_ext() {
    if (flap_timone.rotation.z > 0) flap_timone.rotation.z -= Math.PI/600;
    else flap_timone.rotation.z += Math.PI/600;
    if (flap_ext_sx.rotation.z > 0) flap_ext_sx.rotation.z -= Math.PI/700;
    else flap_ext_sx.rotation.z += Math.PI/250;
    if (flap_ext_dx.rotation.z > 0) flap_ext_dx.rotation.z -= Math.PI/700;
    else flap_ext_dx.rotation.z += Math.PI/250;
}

function motion() {

    if (ground) {
        if (flap_timone.rotation.z > 0 && vel > 150) { // up
            model.rotateZ(-Math.PI/400*flap_timone.rotation.z);
        }
        else if (height == 0){
            ruote_ant.rotation.z += speed_weels;
            ruote_pst_sx.rotation.z += speed_weels;
            ruote_pst_dx.rotation.z += speed_weels;
        }
        if (height > 100) ground = false;
    }
    else {

        if (flap_timone.rotation.z > 0) { // up
            model.rotateZ(-Math.PI/400*flap_timone.rotation.z);
        }
        else {
            model.rotateZ(-Math.PI/400*flap_timone.rotation.z);
        }

        if (flap_int_dx.rotation.z < 0) { // destra
            model.rotateX(Math.PI/400*flap_int_dx.rotation.z);
        }
        else { // sinistra
            model.rotateX(-Math.PI/400*flap_int_sx.rotation.z);
        }

    }

    model.translateX(-vel*0.01);
    camera.lookAt(model.position);

    roll = -model.rotation.x*180/Math.PI;
    pitch = -model.rotation.z*180/Math.PI;
}

function manage_velocity() {
    if (motors == 0) {
        if (vel > 0) vel += model.rotation.z - 0.1;
    }
    if (vel < 150) {
        if ( model.rotation.z >= 0 && ground && motors > 1) vel += 1.2;
        if (motors != 0 && !ground) vel += 1;
        if (!ground) stall();
    }
    else if (vel < 206 - model.rotation.z*20 && motors > 1) vel += 0.67;
    else if (vel < 263 - model.rotation.z*20 && motors > 2) vel += 0.5;
    else if (vel < 320 - model.rotation.z*20 && motors > 3) vel += 0.5;
    else if (vel < 376 - model.rotation.z*20 && motors > 4) vel += 0.33;

    else if (vel > 320 + model.rotation.z*20 && motors < 5) vel -= 0.5;
    else if (vel > 263 + model.rotation.z*20 && motors < 4) vel -= 0.5;
    else if (vel > 206 + model.rotation.z*20 && motors < 3) vel -= 0.5;
    else if (vel > 151 + model.rotation.z*20 && motors < 2) vel -= 0.5;

    height = model.position.y*0.1;

}

function stall() {
    messages = "Oh no, you stalled! Recovers as much speed as possible [-hold B-] and pull up [hold down S]";
    if (model.rotation.z > 0) vel += 2*model.rotation.z;

    if (flap_timone.rotation.z > 0) flap_timone.rotation.z -= Math.PI/300;
    else flap_timone.rotation.z += Math.PI/300;
    if (flap_ext_sx.rotation.z > 0) flap_ext_sx.rotation.z -= Math.PI/300;
    else flap_ext_sx.rotation.z += Math.PI/250;
    if (flap_ext_dx.rotation.z > 0) flap_ext_dx.rotation.z -= Math.PI/300;
    else flap_ext_dx.rotation.z += Math.PI/250;

    model.position.y += -0.1;

    if (model.rotation.z > Math.PI/2) model.rotation.z -= Math.PI/300;
    else model.rotation.z += Math.PI/300;
}

function messages() {
    if (height == 0 && motors == 0) message = "Hi, I'm Camil, your co-pilot on this mission. Let's not waste time, did you hear the commander? We have to put out the fire! I remind you how to take off, first of all start the engines [-press M-]";
    else if (height == 0 && motors != 0) message = "OK, now you have to reach the maximum possible speed [-hold B-] (at least 200 km / h) and pull the cloche [-hold S-]. Remember not to turn during the takeoff phase! Good luck with that. ";
    else if (height < 100 && carrello) message = "Perfect! Now close the landing gear [-press C-] and take a sufficient height (at least 100 meters) and go and load the water.";
    else if (vel < 200) message = "Be careful, you're flying too slowly! You should increase your speed [-hold B-].";
    else if (height < 70) message = "Be careful, you're flying too low, increase the altitude!";
    else if (sea && !tank) message = "All right, approach the water to fill the tank [-press spacebar-].";
    else if (!tank) message = "Go to the sea to fill the tank!";
    else if (fire) message = "Perfect, empty the tank to extinguish the fire [-press spacebar-].";
    else if (tank) message = "Come on, get to the fire and empty the tank!";

}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;

    //console.log(keyCode);

    if(!playFlag) return;

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
        if (!flag_motors) {
            flag_motors = true;
            setInterval(motion, 1);
            setInterval(manage_velocity, 40);
        }
    }
    else if (keyCode == 66) { // w
        clearInterval(reset);
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
        if (motors != 0 && motors != 5) {
            motors += 1;
            speed_helic += 0.05;
        }
        if (weels != 5) {
            weels += 1;
            speed_weels += 0.1;
        }

    }
    else if (keyCode == 78) { // s
        clearInterval(reset);
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
        if (motors != 0 && motors != 1) {
            motors -= 1;
            speed_helic -= 0.05;
        }
    }
    else if (keyCode == 65) { // a
        clearInterval(reset);
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
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
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
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
    else if (keyCode == 87) { // up-38
        clearInterval(reset);
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
        if (flap_timone.rotation.z > - Math.PI/8) {
            flap_timone.rotation.z -= Math.PI/300;
            flap_ext_sx.rotation.z += Math.PI/400;
            flap_ext_dx.rotation.z += Math.PI/400;
        }
    }

    else if (keyCode == 83) { // down-40
        clearInterval(reset);
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
        if (flap_timone.rotation.z <  Math.PI/8) {
            flap_timone.rotation.z += Math.PI / 300;
            flap_ext_sx.rotation.z -= Math.PI / 400;
            flap_ext_dx.rotation.z -= Math.PI / 400;
        }
    }

    else if (keyCode == 82) { // r
        if (!flag) {
            flag = true;
            reset = setInterval(reset_attitude, 10);
        }
    }

    else if (keyCode == 79) { // o
        if (!flag_int) {
            flag_int = true;
            reset_int = setInterval(set_flap_int, 10);
        }
    }

    else if (keyCode == 80) { // p
        if (!flag_ext) {
            flag_ext = true;
            reset_ext = setInterval(set_flap_ext, 10);
        }
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
};