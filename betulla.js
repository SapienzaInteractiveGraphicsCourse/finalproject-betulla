var camera, scene, renderer;
var playFlag = false; //false=menu/pausa, true=gioco attivo
var volume=true; //true= volume attivo
var menu_music= document.getElementById("menuMusic_id");

var waterPosition;
var firePosition;


function start_game() {
  menu_music.muted = true;
  init();
  playFlag = true;
  animate();
  setInterval(messages, 1000);
}

function modal(my_modal) {
    var modal = document.getElementById(my_modal);

    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    span.onclick = function() {
        if (my_modal!="myModal_5") modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal && my_modal!="myModal_5") {
        	if (my_modal=="myModal_3" ||my_modal=="myModal_4") play_pause();
            	modal.style.display = "none";
        }
    }
}

var texLoader = new THREE.TextureLoader();
var GLTFloader = new THREE.GLTFLoader();

var clock, startTime, pauseClock, pauseTime;
var pauseInterval=0; //intervallo di tempo passato in pausa
var canvas, canvas_id;
var difficulty_html, difficulty;
var fire_speed;
const fire_speed_h=30;
const fire_speed_m=20;
const fire_speed_e=10;
const fire_speed_b=0;
var motor_sound=new initialize_sound("sounds/motors.ogg");
motor_sound.sound.loop=true;
var cart_sound =new initialize_sound("sounds/cart.mp3");
cart_sound.sound.playbackRate=0.8;
cart_sound.sound.onended=function(){cart_soundFlag=true;};
cart_soundFlag=false;
var gameover_sound= new initialize_sound("sounds/gameover.mp3");

var message = "Hi, I'm Camil, your co-pilot on this mission. Let's not waste time, did you hear the commander? We have to put out the fire! I remind you how to take off, first of all start the engines [-press M-]";

function init() {

    difficulty_html = document.getElementById("lista_diff");
    difficulty = difficulty_html.options[difficulty_html.selectedIndex].text;

    if(difficulty === "Hard"){
        fire_speed = fire_speed_h;
    }
    if(difficulty === "Normal"){
        fire_speed = fire_speed_m;
    }
    if(difficulty === "Easy"){
        fire_speed = fire_speed_e;
    }
    if(difficulty === "Beginner"){
        fire_speed = fire_speed_b;
    }

    clock = new THREE.Clock();
    pauseClock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000000 );
    scene = new THREE.Scene();

    camera.position.set( 20, 8, 0 );
    camera.lookAt( scene.position );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //Load canadair


	GLTFloader.load( 'Models/Bombardier-415/bombardier_canadair.glb', function ( gltf ) {

	    model = gltf.scene;
        canadair2 = model.clone();
        canadair3 = model.clone();

        canadair2.position.set(-300, 5, -60);
        canadair2.scale.set(1, 1, 1);
        canadair2.rotation.y = Math.PI *  0.5;
        scene.add(canadair2);

        canadair3.position.set(-5, 5, 50);
        canadair3.scale.set(1, 1, 1);
        canadair3.rotation.y = -Math.PI *0.5;
        scene.add(canadair3);


	    model.position.set(10, 5, 9);
	    model.scale.set(1, 1, 1);

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
            var worldAxis = new THREE.AxesHelper(20);
            model.add(worldAxis);
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

    //load the world

    /*
    var geometryPlane = new THREE.PlaneGeometry( 100000, 100000);
    var terrainTexture = texLoader.load( "images/tough_grass.jpg" );
    var terrainMaterial = new THREE.MeshBasicMaterial( { map: terrainTexture, side: THREE.DoubleSide} );
    //terrainMaterial.magFilter = THREE.LinearFilter;
    //terrainMaterial.minFilter = THREE.LinearFilter;
    terrainMaterial.wrapS = THREE.RepeatWrapping; 
    terrainMaterial.wrapT = THREE.RepeatWrapping;
    //terrainMaterial.repeat.set( 4, 4 ); 
    var materialPlane = new THREE.MeshBasicMaterial( {color: 0x003300, side: THREE.DoubleSide} );
    var terrain = new THREE.Mesh( geometryPlane, terrainMaterial );
    terrain.position.y = 0;
    terrain.rotation.x = Math.PI/2;
    scene.add( terrain );
    */

    // ground
    var groundGeometry = new THREE.PlaneBufferGeometry( 100000, 100000 );
    var groundMaterial = new THREE.MeshStandardMaterial( { roughness: 1, metalness: 1 } );
    var ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.rotation.x = Math.PI * - 0.5;
    scene.add( ground );
    texLoader.load( "images/grass_grass_0107_01.jpg", function ( map ) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.repeat.set( 5000, 5000 );
        groundMaterial.map = map;
        groundMaterial.needsUpdate = true;
    } );

    //load grass and tree
    var grassLine = [];
    var grassLine2 = [];
    GLTFloader.load('Models/yet_another_grass_model/scene.gltf', function ( gltf ) {
        grass = gltf.scene;
        grass.scale.set(0.05, 0.05, 0.05);
        grass.position.set(-20, 0, 60);

        for(var i = 0; i < 12; i++){
            grassLine[i] = grass.clone();
            grassLine[i].position.set(-i*70, 0, 60);
            scene.add( grassLine[i] );
        }
        for(var j = 5; j < 12; j++){
            grassLine2[j] = grass.clone();
            grassLine2[j].position.set(-j*70, 0, 130);
            scene.add( grassLine2[j] );
        }
        for(var j = 12; j < 19; j++){
            grassLine2[j] = grass.clone();
            grassLine2[j].position.set(-(j-10)*70, 0, -110);
            scene.add( grassLine2[j] );
        }
        for(var i = 12; i < 24; i++){
            grassLine[i] = grass.clone();
            grassLine[i].position.set(-(i-12)*70, 0, -40);
            scene.add( grassLine[i] );
        }

        //scene.add( grass );
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    });

    //load airport
    var streets = [];
    GLTFloader.load('Models/sidewalk/scene.gltf', function ( gltf ) {
        street = gltf.scene;
        for(var i = 0; i < 15; i++){
            streets[i] = street.clone();
            streets[i].position.set(-i*55, 0, 0);
            streets[i].rotation.y = Math.PI/2;
            scene.add( streets[i] );
        }
        for(var i = 15; i < 30; i++){
            streets[i] = street.clone();
            streets[i].position.set(-(i-15)*55, 0, 18);
            streets[i].rotation.y = -Math.PI/2;
            scene.add( streets[i] );
        }
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    });

    GLTFloader.load('Models/radio_tower/scene.gltf', function ( gltf ) {
        tower = gltf.scene;
        tower.position.set(-600, 0, -60);
        tower.scale.set(0.2, 0.2, 0.2);
        scene.add( tower );
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    });

    GLTFloader.load('Models/abandoned_building/scene.gltf', function ( gltf ) {
        building = gltf.scene;
        building.position.set(-150, 0, -60);
        building.scale.set(0.05, 0.05, 0.05);
        scene.add( building );
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    });


    GLTFloader.load('Models/hangar/scene.gltf', function ( gltf ) {
        hangar = gltf.scene;
        hangar.position.set(-100, 0, 60);
        hangar.scale.set(3, 3, 3);
        //hanger.rotation.y = Math.PI/2;
        scene.add( hangar );

        hangar1 = hangar.clone();
        hangar1.position.set(-150, 0, 60);
        hangar1.scale.set(3, 3, 3);
        scene.add(hangar1);

        hangar2 = hangar.clone();
        hangar2.position.set(-200, 0, 60);
        hangar2.scale.set(3, 3, 3);
        scene.add(hangar2);

        hangar3 = hangar.clone();
        hangar3.position.set(-50, 0, 60);
        hangar3.scale.set(3, 3, 3);
        scene.add(hangar3);

        hangar4 = hangar.clone();
        hangar4.position.set(-250, 0, 60);
        hangar4.scale.set(3, 3, 3);
        scene.add(hangar4);
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    });

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load("Models/angar/Shelter_simple.mtl", function(materials){
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load("Models/angar/Shelter_simple.obj", function(mesh){

            mesh.traverse(function(node){
                if( node instanceof THREE.Mesh ){
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            mesh.position.set(-60, -5, -60);
            mesh.scale.set(1, 1, 1);
            scene.add(mesh);

            mesh1 = mesh.clone()
            mesh1.position.set(0, -5, -60);
            mesh1.scale.set(1, 1, 1);
            scene.add(mesh1);

            mesh2 = mesh.clone()
            mesh2.position.set(-300, -5, 60);
            mesh2.scale.set(1, 1, 1);
            scene.add(mesh2);

        });
    });
/*
    //load the forest
    GLTFloader.load('Models/alberi_1/scene.gltf', function ( gltf ) {
        tree = gltf.scene;
        tree.position.set(-600, 0, 0);
        tree.scale.set(0.3, 0.3, 0.3);
        //hanger.rotation.y = Math.PI/2;
        scene.add( tree );
    },
    // called while loading is progressing
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    });
*/


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
    dirLight.penumbra = 0.5;
    dirLight.decay = 1.3;
    dirLight.distance = 200;
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 550;
    dirLight.shadow.mapSize.height = 550;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500
    scene.add( dirLight );

    dirLight = new THREE.DirectionalLight( 0xffffff, 4 );
    dirLight.position.set(  1, 1.75, -1 );
    dirLight.penumbra = 0.5;
    dirLight.decay = 1.3;
    dirLight.distance = 200;
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 550;
    dirLight.shadow.mapSize.height = 550;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500
    scene.add( dirLight );

    var skyGeo = new THREE.SphereGeometry(100000, 25, 25);
    texture = texLoader.load( "images/sky.jpg" );
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const shader = THREE.ShaderLib.equirect;
    var skyMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide,
    });
    skyMaterial.uniforms.tEquirect.value = texture;
    sky = new THREE.Mesh(skyGeo, skyMaterial);
    scene.add(sky);

    window.addEventListener( 'resize', onWindowResize, false );

    //show game window
    document.getElementById('game_id').style.display = 'block';

    game_scene_div = document.getElementById('game_id');
    game_scene_div.appendChild(renderer.domElement);

    canvas = document.getElementsByTagName("canvas")[0].setAttribute("id", "canvas_id");
    startTime=clock.getElapsedTime();

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {

    renderer.render(scene, camera);

    if(playFlag) {
    	
    	curTime = clock.getElapsedTime() -pauseInterval - startTime -0.5;
    	if (curTime<0) curTime=0.0;

    	document.getElementById('timer').innerHTML = "Timer: " + compute_time(curTime);
    	document.getElementById('height').innerHTML = "Height: " + height.toFixed(0)+" m";
    	document.getElementById('velocity').innerHTML = "Velocity: " + vel.toFixed(0)+" km/h";
    	document.getElementById('roll').innerHTML = "Roll angle: " + roll.toFixed(0) + "°";
    	document.getElementById('pitch').innerHTML = "Pitch angle: " + pitch.toFixed(0) + "°";
    	document.getElementById('conversation').innerHTML = "Camil: " + message;

    	if (height>=800) game_over_menu();
	}
    requestAnimationFrame( animate );
}

var engine; // variabile associata alla funzione go_motors (necessaria per SetInterval)
var reset; // variabile associata alla funzione reset_attitude (necessaria per SetInterval)
var reset_int; // variabile associata alla funzione set_flap_int (necessaria per SetInterval)
var reset_ext; // variabile associata alla funzione set_flap_ext (necessaria per SetInterval)
var motors = 0; // livello velocità dei motori (0 - 1 - 2 - 3 - 4 - 5)
var weels = 0; // livello velocità delle ruote (0 - 1 - 2 - 3 - 4 - 5)
var speed_helic = 0; // velocità delle eliche
var speed_weels = 0; // velocità delle ruote
var t = 0; // variabile per interpolazione
var s = 0; // variabile per interpolazione
var carrello = true; // variabile booleana, true se il carrello è out, false se è in
var pressed_c = false; //true se premuto pulsante per chiudere carrello, necessario per restart con carrello out
var ground = true; // variabile true se sono a terra (diventa false appena si superano i 10 metri)
var vel = 0; // velocità
var height = 0; // quota
var flag = true; // flag per impendire che venga chiamato SetInterval(reset_attitude) più volte durante l'esecuzione della funzione
var flag_int = true; // flag per impendire che venga chiamato SetInterval(set_flap_int) più volte durante l'esecuzione della funzione
var flag_ext = true; // flag per impendire che venga chiamato SetInterval(set_flap_ext) più volte durante l'esecuzione della funzione
var flag_motors = false; // variabile per far eseguire le funzioni SetInterval(motion) e SetInterval(manage_velocity) solo una volta
var tank = false; // variabile true se il serbatoio è pieno, false altrimenti
var sea = false; // variabile true se sto sulla verticale del mare, false se sto sulla terra
var fire = false; // variabile true se sono vicino all'incendio, false altrimenti
var water = false; // variabile true se sto scaricando l'acqua, false altrimenti
var roll = 0; // angolo di rollio
var pitch = 0; // angolo di beccheggio


function go_motors() {

	if (!playFlag) return; 

    elica_sx.rotation.x -= speed_helic;
    elica_dx.rotation.x += speed_helic;
    bulbo_sx.rotation.x -= speed_helic;
    bulbo_dx.rotation.x += speed_helic;
}

function close_doors_ant() {

	if (!pressed_c) return;

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

	if (!pressed_c) return;

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

    /*if (timone.rotation.y < 0) timone.rotation.y += Math.PI/600;
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
    else model.rotateZ(-Math.PI/100*model.rotation.z);*/

    set_flap_int();
    set_flap_ext();
    model.rotation.x = 0;
    model.rotation.z = 0;

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

	if (!playFlag) return; 

    if (ground) {
        if (flap_timone.rotation.z > 0 && vel > 150) { // up
            model.rotateZ(-Math.PI/400*flap_timone.rotation.z);
        }
        else if (height < 5){
            ruote_ant.rotation.z += speed_weels;
            ruote_pst_sx.rotation.z += speed_weels;
            ruote_pst_dx.rotation.z += speed_weels;
        }
        if (height > 5) ground = false;
    }
    else if (!water) {

        if (flap_timone.rotation.z > 0) { // up
            model.rotateZ(-Math.PI/250*flap_timone.rotation.z);
        }
        else {
            model.rotateZ(-Math.PI/250*flap_timone.rotation.z);
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

    roll = -model.rotation.x*180/Math.PI*;
    pitch = -model.rotation.z*180/Math.PI;
}

function manage_velocity() {

    // TODO - Tommi - sistemare manage_velocity (tutta la parte relativa allo stallo)

    /* livelli di velocità:
        motori 0 -> si scende fino a circa 150 km/h e poi si stalla
        motori 1 -> velocità di 150 km/h
        motori 2 -> velocità di 206 km/h
        motori 3 -> velocità di 263 km/h
        motori 4 -> velocità di 320 km/h
        motori 5 -> velocità di 376 km/h
     */

    if (!playFlag) return;

    if (motors == 0) if (vel > 0) vel += - 0.5; // se i motori sono spenti, decelera di 0.5
    if (vel < 150) {
        if ( model.rotation.z >= 0 && ground && motors > 1) vel += 1.2;
        if (motors != 0 && !ground) vel += 1;
        if (!ground) stall();
    }
    else if (vel < 206 && motors > 1) vel += 0.67; // se la velocità è minore di 206 e i motori sono stettati a 2,3,4 o 5, accelera di 0.67
    else if (vel < 263 && motors > 2) vel += 0.5; // se la velocità è minore di 263 e i motori sono stettati a 3,4 o 5, accelera di 0.5
    else if (vel < 320 && motors > 3) vel += 0.5; // se la velocità è minore di 320 e i motori sono stettati a 4 o 5, accelera di 0.5
    else if (vel < 376 && motors > 4) vel += 0.33; // se la velocità è minore di 376 e i motori sono stettati a 5, accelera di 0.33

        // le accelerazioni sono scalate così da avere accelerazioni maggiori a velocità più basse

    else if (vel > 320 && motors < 5) vel -= 0.5; // decelera se la velocità è maggiore della velocità relativa al livello del motore a cui ci si trova
    else if (vel > 263 && motors < 4) vel -= 0.5;
    else if (vel > 206 && motors < 3) vel -= 0.5;
    else if (vel > 151 && motors < 2) vel -= 0.5;

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
    if (height < 5 && motors == 0) message = "Hi, I'm Camil, your co-pilot on this mission. Let's not waste time, did you hear the commander? We have to put out the fire! I remind you how to take off, first of all start the engines [-press M-]";
    else if (height < 5 && motors != 0) message = "OK, now you have to reach the maximum possible speed [-hold B-] (at least 150 km / h) and pull the cloche [-hold S-]. Remember not to turn during the takeoff phase! Good luck with that. ";
    else if (height > 700) message = "Decrease the altitude immediately or we'll fail the mission!";
    else if (height > 600) message = "Hey, you're flying too high! Go down to a more acceptable altitude.";
    else if (height > 5 && height < 100 && carrello) message = "Perfect! Now close the landing gear [-press C-] and take a sufficient height (at least 100 meters) and go and load the water.";
    else if (vel < 200) message = "Be careful, you're flying too slowly! You should increase your speed [-hold B-].";
    else if (height < 70) message = "Be careful, you're flying too low, increase the altitude!";
    else if (sea && !tank) message = "All right, approach the water to fill the tank [-press spacebar-].";
    else if (!tank) message = "Ok, now go to the sea to fill the tank!";
    else if (fire) message = "Perfect, empty the tank to extinguish the fire [-press spacebar-].";
    else if (tank) message = "Come on, get to the fire and empty the tank!";

}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;

    console.log(keyCode);

    if(!playFlag) return;

    if (keyCode == 77) { // m
        if (motors == 0){
            motors = 1;
            speed_helic = 0.05;
            engine = setInterval(go_motors, 1);
            //sound on
            motor_sound.sound.play();
        }
        else {
            motors = 0;
            speed_helic = 0;
            clearInterval(engine);
            //sound off
            motor_sound.sound.pause();
            motor_sound.sound.currentTime = 0;
            motor_sound.sound.playbackRate=1;
        }
        if (!flag_motors) {
            flag_motors = true;
            setInterval(motion, 1);
            setInterval(manage_velocity, 40);
        }
    }
    else if (keyCode == 66) { // b
        clearInterval(reset);
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
        if (motors != 0 && motors != 5) {
            motors += 1;
            speed_helic += 0.05;
            motor_sound.sound.playbackRate +=.7;
        }
        if (weels != 5) {
            weels += 1;
            speed_weels += 0.1;
        }

    }
    else if (keyCode == 78) { // n
        clearInterval(reset);
        clearInterval(reset_int);
        clearInterval(reset_ext);
        flag = false;
        flag_int = false;
        flag_ext = false;
        if (motors != 0 && motors != 1) {
            motors -= 1;
            speed_helic -= 0.05;
            motor_sound.sound.playbackRate -=.7;
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
    else if (keyCode == 87) { // w
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

    else if (keyCode == 83) { // s
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
        if (carrello && height>10) {
            t = 0;
            s = 0;
            carrello = false;
            pressed_c= true;
            cart_sound.sound.play();
            setInterval(close_doors_ant, 10);
            setInterval(close_doors_back, 10);
        }
    }

    else if (keyCode == 88) { // x
        if (!flag_ext) {
            flag_ext = true;
            reset_ext = setInterval(set_flap_ext, 10);
        }
    }

    else if (keyCode == 90) { // z
        if (!flag_ext) {
            flag_ext = true;
            reset_ext = setInterval(set_flap_ext, 10);
        }
    }
};

//implement timer
function compute_time(time){
    var hours = Math.floor(time / 3600);
    time = time - hours * 3600;
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    return(hours.toFixed(0)+":"+minutes.toFixed(0)+":"+seconds.toFixed(2));
}

//Implement audio
function initialize_sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
}

function switchImage(){ ////mute/unmute button
  if (volume) {
  	volume=false;
    audio_game(0);
    document.getElementById("audio").src = 'images/mute.png';
  }
  else {
  	volume=true;
    audio_game(1);
    document.getElementById("audio").src = 'images/unmute.png';
  }
}

//control audio volume
function audio_game(val){
  if (val === 0){
    if (!playFlag){
        menu_music.muted=true;
    }
    motor_sound.sound.volume=0;
    cart_sound.sound.volume=0;
  }
  else{
    if (!playFlag){
        menu_music.muted=false;
    }
    motor_sound.sound.volume=1;
    cart_sound.sound.volume=1;
  }
}

function play_pause() {
	if (!playFlag) {

		playFlag = true;

		menu_music.muted=true;
		if(motors>0) motor_sound.sound.play();
		if (!cart_soundFlag && !carrello) cart_sound.sound.play();

		pauseInterval+=pauseClock.getElapsedTime()-pauseTime;

	} else {

		playFlag = false;
		pauseTime=pauseClock.getElapsedTime();

		motor_sound.sound.pause();
		cart_sound.sound.pause();
		if (volume) menu_music.muted=false;
	}
}

function game_over_menu(){ //to call when gameover
	playFlag = false;
	motor_sound.sound.pause();
	cart_sound.sound.pause();
	modal("myModal_5");
	if (volume) gameover_sound.sound.play();
}

function restart_game() {
	if (confirm("Are you sure?")) {
		document.getElementById("myModal_3").style.display = "none";
		document.getElementById("myModal_5").style.display = "none";
		canvas_id = document.getElementById("canvas_id");
		canvas_id.remove();
		reset_var();
		start_game();
	} 
}

function load_menu(){
	if (confirm("Are you sure?")) {
		document.getElementById("myModal_3").style.display = "none";
		document.getElementById("myModal_5").style.display = "none";
		canvas_id = document.getElementById("canvas_id");
		canvas_id.remove();
		reset_var();
		if (volume) menu_music.muted=false;
		else menu_music.muted=true;
		document.getElementById('game_id').style.display = 'none';
	}
}

function reset_var(){
	clearInterval(engine);
	clearInterval(reset);
	clearInterval(reset_int);
	clearInterval(reset_ext);

	clearInterval(motion);
    clearInterval(manage_velocity);
    clearInterval(go_motors);
    clearInterval(reset_attitude);
    clearInterval(set_flap_int);
    clearInterval(set_flap_ext);
    clearInterval(close_doors_ant);
    clearInterval(close_doors_back);

    pauseInterval=0;
	playFlag = false;
	motor_sound.sound.playbackRate=1;
	cart_soundFlag=false;
	message = "Hi, I'm Camil, your co-pilot on this mission. Let's not waste time, did you hear the commander? We have to put out the fire! I remind you how to take off, first of all start the engines [-press M-]";
	motors = 0;
	weels = 0;
	speed_helic = 0;
	speed_weels = 0;
	t = 0;
	s = 0;
	carrello = true;
	pressed_c=false;
	ground = true;
	vel = 0;
	height = 0;
	flag = true;
	flag_int = true;
	flag_ext = true;
	flag_motors = false;
	tank = false;
	sea = false;
	fire = false;
	roll = 0;
	pitch = 0;

	scene.remove(model);
	scene.remove(terrain);
	scene.remove( light );
	scene.remove( dirLight );
	scene.remove(sky);
	model.dispose();
	terrain.dispose();
	sky.geometry.dispose();
	sky.material.dispose();

	scene.dispose();
    scene = null;
    camera = null;
    renderer && renderer.renderLists.dispose();
    renderer = null;
    clock = null;
    pauseClock = null;
    light = null;
    dirLight = null;
}