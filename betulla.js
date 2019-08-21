var vittoria = false;

var camera, scene, renderer;

var playFlag = false; //false=menu/pausa, true=gioco attivo

var volume = true; //true= volume attivo
var menu_music = document.getElementById("menuMusic_id");

var first_time = true;

var waterPosition = [-15000, 6000];
var waterRadius = 12500;
const max_x_area= 20000;
const min_x_area= -20000;
const max_y_area= 10000;
const min_y_area= -10000;

var firePosition = [0,0];
var fireScale, fireSpeed, fireInterval;
var ilFuoco = [];
var fireParams = {
        color1: '#ffffff',
        color2: '#ffa000',
        color3: '#000000',
        colorBias: 0.8,
        burnRate: 0.63,
        diffuse: 4.33,
        viscosity: 0.26,
        expansion: - 0.17,
        swirl: 43.79,
        drag: 0.07,
        airSpeed: 12.0,
        windX: 0.0,
        windY: 0.75,
        speed: 500.0,
        massConservation: false
    };

function updateAll(fire) {
    fire.color1.set( fireParams.color1 );
    fire.color2.set( fireParams.color2 );
    fire.color3.set( fireParams.color3 );
    fire.colorBias = fireParams.colorBias;
    fire.burnRate = fireParams.burnRate;
    fire.diffuse = fireParams.diffuse;
    fire.viscosity = fireParams.viscosity;
    fire.expansion = fireParams.expansion;
    fire.swirl = fireParams.swirl;
    fire.drag = fireParams.drag;
    fire.airSpeed = fireParams.airSpeed;
    fire.windVector.x = fireParams.windX;
    fire.windVector.y = fireParams.windY;
    fire.speed = fireParams.speed;
    fire.massConservation = fireParams.massConservation;
    fire.clearSources();
    fire.addSource( 0.5, 0.1, 0.1, 1.0, 0.0, 1.0 );
}

fireParams.Campfire = function (fire) {
    fireParams.color1 = '#ffffff';
    fireParams.color2 = '#ffa000';
    fireParams.color3 = '#000000';
    fireParams.colorBias =  0.8;
    fireParams.burnRate = 0.63;
    fireParams.diffuse =4.33;
    fireParams.viscosity = 0.26;
    fireParams.expansion = - 0.17;
    fireParams.swirl = 43.79;
    fireParams.drag = 0.07;
    fireParams.airSpeed = 12.0;
    fireParams.windX = 0.0;
    fireParams.windY = 0.05;
    fireParams.speed = 500.0;
    fireParams.massConservation = false;
    updateAll(fire);
};

var renderRadius = 3000;

var trees = [];
var burnedTree = [];

var aeroporto = [];
var aeroportoRenderizzato = true;

var clock, startTime, pauseClock, pauseTime, waterClock;
var pauseInterval=0; //intervallo di tempo passato in pausa

var canvas, canvas_id;
var light_mode = false;

var difficulty_html, difficulty, height_difficulty;
const height_difficulty_h=6.3;
const height_difficulty_m=9.3;
const height_difficulty_e=13.3;
const height_difficulty_b=18.3;

var motor_sound=new initialize_sound("sounds/motors.ogg");
var cart_sound =new initialize_sound("sounds/cart.mp3");
var gameover_sound=new initialize_sound("sounds/gameover.mp3");
motor_sound.sound.loop=true;
cart_sound.sound.playbackRate=0.3;
cart_sound.sound.onended=function(){cart_soundFlag=true;};
cart_soundFlag=false;

var message = "Hi, I'm Camil, your co-pilot on this mission. Let's not waste time, did you hear the commander? We have to put out the fire! I remind you how to take off, first of all start the engines [-press M-]";
var message_gameOver = "";

const loadingManager = new THREE.LoadingManager( () => {
    
        const loadingScreen = document.getElementById( 'loading-screen' );
        loadingScreen.classList.add( 'fade-out' );
        loadingScreen.style.display = "none";
        loadingScreen.classList.remove( 'fade-out' );

        menu_music.muted = true;
        
        //show game window
        document.getElementById('game_id').style.display = 'block';

        playFlag = true;
        animate();
        setInterval(messages, 1000);
        startTime=clock.getElapsedTime();
        
        // optional: remove loader from DOM via event listener
        loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
        
} );

function onTransitionEnd( event ) {
    event.target.remove();   
}

const texLoader = new THREE.TextureLoader(loadingManager);
const GLTFloader = new THREE.GLTFLoader(loadingManager);

function start_game() {
    document.getElementById('loading-screen').style.display = "block";
    if (first_time) {
        init();
        first_time=false;
    }
    else {
        partial_init();
    }
}

function modal(my_modal) {

    var modal = document.getElementById(my_modal);
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    span.onclick = function() {
        if (my_modal!="myModal_5" || my_modal!="myModal_6" ) 
            modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal && my_modal!="myModal_5" && my_modal!="myModal_6" ) {
            if (my_modal=="myModal_3" ||my_modal=="myModal_4") play_pause();
            modal.style.display = "none";
        }
    }
}

function init() {

    difficulty_html = document.getElementById("lista_diff");
    difficulty = difficulty_html.options[difficulty_html.selectedIndex].text;

    if(difficulty === "Hard"){
        fireSpeed = 0.05;
        fireScale = 10;
        fireInterval = 1000;
        height_difficulty = height_difficulty_h;
    }
    if(difficulty === "Normal"){
        fireSpeed = 0.02;
        fireScale = 5;
        fireInterval = 1000;
        height_difficulty = height_difficulty_m;
    }
    if(difficulty === "Easy"){
        fireSpeed = 0.01;
        fireScale = 5;
        fireInterval = 1000;
        height_difficulty = height_difficulty_e;
    }
    if(difficulty === "Beginner"){
        fireSpeed = 0;
        fireScale = 2;
        fireInterval = 1000;
        height_difficulty = height_difficulty_b;
    }

    clock = new THREE.Clock();
    pauseClock = new THREE.Clock();
    waterClock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 180000 );

    scene = new THREE.Scene();
    fogColor = new THREE.Color(0xFFE5F9FF);
    scene.background = fogColor;
    scene.fog = new THREE.Fog(fogColor, renderRadius, 10001);

    camera.position.set( 20, 8, 0 );
    camera.lookAt( scene.position );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //Load canadair
    GLTFloader.load( 'Models/Bombardier-415/bombardier_canadair.glb', function ( gltf ) {

            model = gltf.scene;
            if(!light_mode){
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
                aeroporto.push(canadair2);
                aeroporto.push(canadair3);
            }
            model.position.set(10, 4, 9);
            model.scale.set(1, 1, 1);

            // Rename the children
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
            model.add( particleSys );
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

    // ground
    var groundGeometry = new THREE.PlaneBufferGeometry( 50000, 50000 );
    var groundMaterial = new THREE.MeshStandardMaterial( { roughness: 1, metalness: 1 } );
    var ground = new THREE.Mesh( groundGeometry, groundMaterial );
    ground.rotation.x = Math.PI * - 0.5;
    scene.add( ground );
    texLoader.load( "images/grass_grass_0107_01.jpg", function ( map ) {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.repeat.set( 500, 500 );
        groundMaterial.map = map;
        groundMaterial.needsUpdate = true;
    } );

    // lake
    var lakeGeometry = new THREE.CircleGeometry( waterRadius, 64 );
    var lakeMaterial = new THREE.MeshStandardMaterial( { shiness: 80, metalness: 1, color: 0x3794cf } );
    var lake = new THREE.Mesh( lakeGeometry, lakeMaterial );
    lake.rotation.x = Math.PI * - 0.5;
    lake.position.set(waterPosition[0], 2, waterPosition[1]);
    scene.add( lake );

    //load grass
    if(!light_mode){
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
    }

    //load airport

    // sidewalk
    GLTFloader.load('Models/sidewalk/scene.gltf', function ( gltf ) {
            street = gltf.scene;
            for(var i = 0; i < 15; i++){
                street = street.clone();
                street.position.set(-i*55, 0, 0);
                street.rotation.y = Math.PI/2;
                scene.add( street );
                aeroporto.push(street);
            }
            for(var i = 15; i < 30; i++){
                street = street.clone();
                street.position.set(-(i-15)*55, 0, 18);
                street.rotation.y = -Math.PI/2;
                scene.add( street );
                aeroporto.push(street);
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

    // tower
    if(!light_mode){
        GLTFloader.load('Models/radio_tower/scene.gltf', function ( gltf ) {
                tower = gltf.scene;
                tower.position.set(-600, 0, -60);
                tower.scale.set(0.2, 0.2, 0.2);
                scene.add( tower );
                aeroporto.push(tower);
            },
            // called while loading is progressing
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened' );
            });
    }
    // hangar
    if(!light_mode){
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
                aeroporto.push(hangar);
                aeroporto.push(hangar1);
                aeroporto.push(hangar2);
                aeroporto.push(hangar3);
                aeroporto.push(hangar4);
            },
            // called while loading is progressing
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened' );
            });
    }

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
            aeroporto.push(mesh);
            aeroporto.push(mesh1);
            aeroporto.push(mesh2);
            setInterval(render_airport, 2000);
        });
    });

    //load trees models
    var treeNum = 500;
    if(light_mode)
        treeNum = 200;
    GLTFloader.load('Models/trees/pine_tree_single_01/scene.gltf', function ( gltf ) {
            tree = gltf.scene;
            tree.scale.set(0.08, 0.08, 0.08);
            for(var i = 0; i < treeNum; i++){
                tree = tree.clone();
                trees.push(tree);
            }
            render_trees(0, 0);
            setInterval(update_trees,1000);
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        });

    GLTFloader.load('Models/albero_bruciato_1/scene.gltf', function ( gltf ) {
            tree = gltf.scene;
            tree.scale.set(4, 4, 4);
            for(var i = 0; i < 30; i++){
                tree = tree.clone();
                burnedTree.push(tree);
            }
            setInterval(update_burned_tree,2500);
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        });

    //fire
    maxX = max_x_area -3000;
    minX = min_x_area +3000;
    maxY = max_y_area - 3000;
    minY = min_y_area +3000;
    do{
            firePosition[0] = Math.floor(Math.random() * (maxX - minX)) + minX;
            firePosition[1] = Math.floor(Math.random() * (maxY - minY)) + minY;
        }while(posizione_sopra_acqua(firePosition[0], firePosition[1]) || posizione_sopra_aereoporto(firePosition[0], firePosition[1]));

    var plane = new THREE.PlaneBufferGeometry( 512, 512 );
    var fire = new Fire( plane, {
        textureWidth: 512,
        textureHeight: 512,
        debug: false
    } );
    fire.position.set(firePosition[0], 150*fireScale, firePosition[1]);
    fire.scale.set(fireScale, fireScale, fireScale);
    scene.add( fire );
    ilFuoco.push(fire);

    var fire1 = fire.clone()
    fire1.rotation.y = Math.PI/2;
    scene.add( fire1 );
    ilFuoco.push(fire1);

    var fire2 = fire.clone()
    fire2.rotation.y = Math.PI;
    scene.add( fire2 );
    ilFuoco.push(fire2);

    var fire3 = fire.clone()
    fire3.rotation.y = 3.1241;
    scene.add( fire3 );
    ilFuoco.push(fire3);
/*
    var fire4 = fire.clone()
    fire4.rotation.y = Math.PI/4;
    scene.add( fire4 );
    ilFuoco.push(fire4);

    var fire5 = fire.clone()
    fire5.rotation.y = 3*Math.PI/4;
    scene.add( fire5 );
    ilFuoco.push(fire5);

    var fire6 = fire.clone()
    fire6.rotation.y = 5*Math.PI/4;
    scene.add( fire6 );
    ilFuoco.push(fire6);

    var fire7 = fire.clone()
    fire7.rotation.y = 7*Math.PI/4;
    scene.add( fire7 );
    ilFuoco.push(fire7);
*/
    setInterval(fire_expansion, fireInterval);

    fireParams.Campfire(fire);

    //create water particles
    defineParticles ();

    // LIGHTS
    light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    light.position.set( 0, 1000000, 0 );
    scene.add( light );

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

    game_scene_div = document.getElementById('game_id');
    game_scene_div.appendChild(renderer.domElement);

    canvas = document.getElementsByTagName("canvas")[0].setAttribute("id", "canvas_id");
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
        document.getElementById('height').innerHTML = "Height: " + ((height-2.8).toFixed(0)>0? (height-2.8).toFixed(0):0)+" m";
        document.getElementById('velocity').innerHTML = "Velocity: " + vel.toFixed(0)+" km/h";
        document.getElementById('roll').innerHTML = "Roll angle: " + roll.toFixed(0) + "°";
        document.getElementById('pitch').innerHTML = "Pitch angle: " + pitch.toFixed(0) + "°";
        document.getElementById('conversation').innerHTML = "Camil: " + message;

        if (vittoria) modal("myModal_6");

        if (!ground){
            let r = roll.toFixed(0);
            let p = pitch.toFixed(0);
            if (posizione_sopra_acqua(model.position.x, model.position.z) && height<=height_difficulty &&
                r >-5 && r<5 && p>-12 && p<12) {
                onLake=true;
            }
        }

        if (height > 800) 
            game_over_menu("You've exceeded the 800-metre limit!");
        else if (model.position.x<min_x_area || model.position.x>max_x_area || model.position.z>max_y_area || model.position.z<min_y_area) 
            game_over_menu("You've gone too far!");
        else if (!posizione_sopra_acqua(model.position.x, model.position.z) && !ground && (( height < 4 && vel > 0) || 
            (height < 1)))
            game_over_menu("You crashed on the ground!");
        else if (posizione_sopra_acqua(model.position.x, model.position.z) && height < 1) 
            game_over_menu("You crashed in the lake!");
        else if (carrello && onLake) 
            game_over_menu("The wheels hit the lake and crashed you!");

        if (onLake && height > height_difficulty) {
            onLake = false;
        }

        if (emptyingTank==true){
            done=particleMgr();
            if (done){
                waterClock.stop();
                emptyingTank=false;
                pressed_bar =false;
                particleSys.visible = false;
            }
        }
    }
    requestAnimationFrame( animate );
}

var engine; // variabile associata alla funzione go_motors (necessaria per SetInterval)
var reset; // variabile associata alla funzione reset_attitude (necessaria per SetInterval)
var motors = 0; // livello velocità dei motori (0 - 1 - 2 - 3 - 4 - 5)
var weels = 0; // livello velocità delle ruote (0 - 1 - 2 - 3 - 4 - 5)
var speed_helic = 0; // velocità delle eliche
var speed_weels = 0; // velocità delle ruote
var t = 0; // variabile per interpolazione
var s = 0; // variabile per interpolazione
var carrello = true; // variabile booleana, true se il carrello è out, false se è in
var pressed_c = false; //true se premuto pulsante per chiudere carrello, necessario per restart con carrello out
var pressed_bar = false; //true se premuto pulsante per svuotare serbatoio, necessario per messaggio di errore
var ground = true; // variabile true se sono a terra (diventa false appena si superano i 10 metri)
var vel = 0; // velocità
var height = 0; // quota
var flag = true; // flag per impendire che venga chiamato SetInterval(reset_attitude) più volte durante l'esecuzione della funzione
var tank = false; // variabile true se il serbatoio è pieno, false altrimenti
var onLake = false; // variabile true se sto sul lago, false altrimenti
var fire = false; // variabile true se sono vicino all'incendio, false altrimenti
var emptyingTank=false; //true se si sta svuotando serbatoio
var roll = 0; // angolo di rollio
var pitch = 0; // angolo di beccheggio
var vec = new THREE.Vector3(0,1,0);


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

    if (roll > 0 && roll < 0.5) {
        model.rotateX(-Math.PI*roll/300);
        roll -= 180*roll/300;
    }
    else if (roll > -0.5 && roll < 0) {
        model.rotateX(Math.PI*roll/300);
        roll += 180*roll/300;
    }
    else if (roll > 0) {
        model.rotateX(-Math.PI/200);
        roll -= 180/200;
    }
    else if (roll < 0) {
        model.rotateX(Math.PI/200);
        roll += 180/200;
    }
    if (pitch > 0 && pitch < 0.5) {
        model.rotateZ(-Math.PI*pitch/300);
        pitch -= 180*pitch/300;
    }
    else if (pitch > -0.5 && pitch < 0) {
        model.rotateZ(-Math.PI*pitch/300);
        pitch -= 180*pitch/300;
    }
    else if (pitch > 0) {
        model.rotateZ(-Math.PI/200);
        pitch -= 180/200;
    }
    else if (pitch < 0) {
        model.rotateZ(Math.PI/200);
        pitch += 180/200;
    }

}

function motion() {

    if (!playFlag) return;

    if (ground) {
        if (flap_timone.rotation.z > 0 && vel > 150) { // up
            model.rotateZ(-Math.PI / 400);
            pitch -= 180 / 400;
        }
        else if (height < 4){
            ruote_ant.rotation.z += speed_weels;
            ruote_pst_sx.rotation.z += speed_weels;
            ruote_pst_dx.rotation.z += speed_weels;
        }
        if (height > 4) ground = false;
    }

    flap_timone.rotation.z = -pitch/2*Math.PI/180;
    flap_ext_dx.rotation.z = pitch/3*Math.PI/180;
    flap_ext_sx.rotation.z = pitch/3*Math.PI/180;
    timone.rotation.y = -roll/3*Math.PI/180;
    if (roll < 0) {
        flap_int_dx.rotation.z = +roll/2*Math.PI/180;
        flap_int_sx.rotation.z = -roll/4*Math.PI/180;
    }
    else {
        flap_int_sx.rotation.z = -roll/2*Math.PI/180;
        flap_int_dx.rotation.z = roll/4*Math.PI/180;
    }

    if (!onLake) model.rotateOnWorldAxis(vec, Math.PI*roll/20000);

    model.translateX(-vel*0.02);
    camera.lookAt(model.position);
}

function manage_velocity() {

    /* livelli di velocità:
        motori 0 -> si scende fino a circa 150 km/h e poi si stalla
        motori 1 -> velocità di 150 km/h
        motori 2 -> velocità di 206 km/h
        motori 3 -> velocità di 263 km/h
        motori 4 -> velocità di 320 km/h
        motori 5 -> velocità di 376 km/h
     */

    if (!playFlag) return;

    if (ground && motors > 0 && vel < 151) vel += 1.2;
    if (vel < 206+(Math.sin(pitch*Math.PI/180)*20) && motors > 1) vel += 0.67; // se la velocità è minore di 206 e i motori sono stettati a 2,3,4 o 5, accelera di 0.67
    else if (vel < 263+(Math.sin(pitch*Math.PI/180)*20) && motors > 2) vel += 0.5; // se la velocità è minore di 263 e i motori sono stettati a 3,4 o 5, accelera di 0.5
    else if (vel < 320+(Math.sin(pitch*Math.PI/180)*20) && motors > 3) vel += 0.5; // se la velocità è minore di 320 e i motori sono stettati a 4 o 5, accelera di 0.5
    else if (vel < 376+(Math.sin(pitch*Math.PI/180)*20) && motors > 4) vel += 0.33; // se la velocità è minore di 376 e i motori sono stettati a 5, accelera di 0.33

    // le accelerazioni sono scalate così da avere accelerazioni maggiori a velocità più basse

    else if (vel > 376+(Math.sin(pitch*Math.PI/180)*20)) vel -= 0.5; // decelera se la velocità è maggiore della velocità relativa al livello del motore a cui ci si trova
    else if (vel > 320+(Math.sin(pitch*Math.PI/180)*20) && motors < 5) vel -= 0.5;
    else if (vel > 263+(Math.sin(pitch*Math.PI/180)*20) && motors < 4) vel -= 0.5;
    else if (vel > 206+(Math.sin(pitch*Math.PI/180)*20) && motors < 3) vel -= 0.5;
    else if (vel > 151+(Math.sin(pitch*Math.PI/180)*20) && motors < 2) vel -= 0.5;

    height = model.position.y*0.4;

}

function messages() {

    exclamation = [ "Perfect!", "Well done!", "Good job!"];

    if (ground && motors == 0) message = "Hi, I'm Camil, your co-pilot on this mission. Let's not waste time, did you hear the commander? We have to put out the fire! I remind you how to take off, first of all start the engines [-press M-]";
    else if (ground && motors != 0) message = "OK, now you have to reach the maximum possible speed [-hold B-] (at least 150 km / h) and pull the cloche [-hold S-]. Remember not to turn during the takeoff phase! Good luck with that. ";
    else if (carrello) message = "Perfect! Now close the landing gear [-press C-] and take a sufficient height (at least 100 meters) and go and load the water.";
    else if (height > 700) message = "Decrease the altitude immediately or we'll fail the mission!";
    else if (height > 600) message = "Hey, you're flying too high! Go down to a more acceptable altitude.";
    else if (model.position.x<(min_x_area+3000) || model.position.x>(max_x_area-3000) || 
        model.position.z>(max_y_area-3000) || model.position.z<(min_y_area+3000)) message="You are going too far! Come back or you will fail your mission!"
    else if (vel < 200) message = "Be careful, you're flying too slowly! You should increase your speed [-hold B-].";
    else if (height < 90 && !posizione_sopra_acqua(model.position.x, model.position.z)) message = "Be careful, you're flying too low, increase the altitude!";
    else if (!onLake && !tank && posizione_sopra_acqua(model.position.x, model.position.z)) message = "Descend to an altitude of at least " + (height_difficulty-3.3) + " meters to be able to fill the tank";
    else if (onLake && !tank) message = "All right, fill the tank [-press spacebar-].";
    else if (onLake && tank) message = "Perfect, now gain some altitude and go to the fire.";
    else if (!tank) message = "Ok, now go to the lake to fill the tank!";
    else if (fire && tank) message = "Perfect, empty the tank to extinguish the fire [-press spacebar-].";
    else if (pressed_bar && !emptyingTank) message= "You can't empty the tank while you're turning! Re-try with roll angle between -20° and 20° and a pitch between -40° and 80°";
    else if (tank) message = "Come on, get to the fire and empty the tank!";
    else if (emptyingTank && fire) message= exclamation[Math.floor(Math.random()*textArray.length)];
    else if (emptyingTank && !fire) message= "You need to empty the tank on the fire!";

}

document.addEventListener('keyup', logKey);
function logKey() {
    if (!flag) {
        flag = true;
        reset = setInterval(reset_attitude, 1);
    }
}

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {

    if (!playFlag) return;

    switch (event.keyCode) {

        case 77: // m
            if (motors == 0) {
                motors = 1;
                speed_helic = 0.05;
                engine = setInterval(go_motors, 1);
                //sound on
                motor_sound.sound.play();
                setInterval(motion, 1);
                setInterval(manage_velocity, 40);
            }
            break;

        case 66: // b
            clearInterval(reset);
            flag = false;
            if (motors != 0 && motors != 5) {
                motors += 1;
                speed_helic += 0.05;
                motor_sound.sound.playbackRate += .7;
            }
            if (weels != 5) {
                weels += 1;
                speed_weels += 0.1;
            }
            break;

        case 78: // n
            clearInterval(reset);
            flag = false;
            if (motors != 0 && motors != 1) {
                motors -= 1;
                speed_helic -= 0.05;
                motor_sound.sound.playbackRate -= .7;
            }
            break;

        case 65: // a
            if (pitch < 0.05 && pitch > -0.05 && roll <= 90 && !ground && !emptyingTank && !onLake) {
                clearInterval(reset);
                flag = false;
                model.rotateX(Math.PI / 300);
                roll += 180 / 300;
            }
            break;

        case 68: // d
            if (pitch < 0.05 && pitch > -0.05 && roll >= -90 && !ground && !emptyingTank && !onLake) {
                clearInterval(reset);
                flag = false;
                model.rotateX(-Math.PI / 300);
                roll -= 180 / 300;
            }
            break;

        case 87: // w
            if (roll < 0.05 && roll > -0.05 && pitch <= 60 && !emptyingTank && !onLake && !ground) {
                clearInterval(reset);
                flag = false;
                model.rotateZ(Math.PI / 400);
                pitch += 180 / 400;
            }
            break;

        case 83: // s
            if (roll < 0.05 && roll > -0.05 && pitch >= -60 && ((motors > 1 || pitch >= 0) && vel >= 180) && !emptyingTank && (!ground || vel > 150)) {
                clearInterval(reset);
                flag = false;
                model.rotateZ(-Math.PI / 400);
                pitch -= 180 / 400;
            }
            break;

        case 67: // c
            if (carrello && !ground) {
                t = 0;
                s = 0;
                carrello = false;
                pressed_c = true;
                cart_sound.sound.play();
                setInterval(close_doors_ant, 10);
                setInterval(close_doors_back, 10);
            }
            break;

        case 32: //space bar
            if (tank) {
                pressed_bar = true;
                let r = roll.toFixed(0);
                let p = pitch.toFixed(0);
                if (r > -20 && r < 20 && p > -40 && p < 80 && (!onLake || height > height_difficulty)) {
                    waterClock.start();
                    tank = false;
                    emptyingTank = true;
                    moving_bar(0);
                }
                if(posizione_sopra_fuoco(model.position.x,model.position.z)){
                    var distanzaDaFuoco = Math.sqrt(Math.pow((model.position.x - firePosition[0]),2)
                        + Math.pow(model.position.z - firePosition[1],2));
                    var quanto = 7 - Math.abs(distanzaDaFuoco)/100;
                    if(quanto < 0)
                        quanto = 2;
                    fire_extinguish(quanto);
                }
            } else if (onLake && !emptyingTank) {
                moving_bar(1);
                tank = true;
            }
            break;
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
    else {
        if (!playFlag) {
            menu_music.muted = false;
        }
        motor_sound.sound.volume = 1;
        cart_sound.sound.volume = 1;
    }
}

function activate_light_mode(){
    elem= document.getElementById("buttonL");
    elem.style.transition = "opacity 0.5s linear 0s";
    elem.style.WebkitTransition ="opacity 0.5s linear 0s";
    elem.style.OTransition="opacity 0.5s linear 0s";
    elem.style.MozTransition="opacity 0.5s linear 0s";
    if (light_mode) {
        light_mode=false;
        elem.style.opacity = 0.5;
    }
    else {
        light_mode=true;
        elem.style.opacity = 1;
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

function game_over_menu(message){ //to call when gameover
    playFlag = false;
    motor_sound.sound.pause();
    cart_sound.sound.pause();
    document.getElementById("gameover_msg").innerHTML= message;
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

    clearInterval(motion);
    clearInterval(manage_velocity);
    clearInterval(go_motors);
    clearInterval(reset_attitude);
    clearInterval(close_doors_ant);
    clearInterval(close_doors_back);

    if(difficulty === "Hard")
        fireScale = 10;
    else if(difficulty === "Normal")
        fireScale = 5;
    else if(difficulty === "Easy")
        fireScale = 5;
    else
        fireScale = 2;

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
    pressed_bar=false;
    ground = true;
    vel = 0;
    height = 0;
    flag = true;
    tank = false;
    onLake = false;
    fire = false;
    emptyingTank=false;
    roll = 0;
    pitch = 0;
    aeroportoRenderizzato = true;
    vittoria = false;

    particles = [];
    time = [];

    //hide game window during loading
    document.getElementById('game_id').style.display = 'none';

    //svuotata barra tank
    document.getElementById("tankBar").style.width = "0%";

    //rinizializzato aeroporto
    for(var i = 0; i < aeroporto.length; i++)
        scene.add(aeroporto[i]);

    model.position.set(10, 4, 9);
    scene.remove(model);
    model.dispose();
}

function partial_init(){
    difficulty_html = document.getElementById("lista_diff");
    difficulty = difficulty_html.options[difficulty_html.selectedIndex].text;

    if(difficulty === "Hard"){
        fireSpeed = 0.05;
        fireScale = 10;
        fireInterval = 1000;
        height_difficulty = height_difficulty_h;
    }
    if(difficulty === "Normal"){
        fireSpeed = 0.02;
        fireScale = 5;
        fireInterval = 1000;
        height_difficulty = height_difficulty_m;
    }
    if(difficulty === "Easy"){
        fireSpeed = 0.01;
        fireScale = 5;
        fireInterval = 1000;
        height_difficulty = height_difficulty_e;
    }
    if(difficulty === "Beginner"){
        fireSpeed = 0;
        fireScale = 2;
        fireInterval = 1000;
        height_difficulty = height_difficulty_b;
    }

    GLTFloader.load( 'Models/Bombardier-415/bombardier_canadair.glb', function ( gltf ) {

            model = gltf.scene;
            model.position.set(10, 4, 9);
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
            model.add( particleSys );
            scene.add( model );
        },function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        });

    //create water particles
    defineParticles();

    game_scene_div = document.getElementById('game_id');
    game_scene_div.appendChild(renderer.domElement);

}

//PARTICELLE STUFF
const gAccel = -9.81
const particleCount = 6096; /* Falling particles.*/

var globlPart = /* Falling particles coordinate proprieties.  */
    {
        pXVar: 0,
        pXMean: 0,

        pYVar: -350,
        pYMean: -0.5,

        pZVar: -3,
        pZMean: 1.5,

        initVel: 0.5,
        visible: false
    };

var particles = []; /* Falling particles.  */
var particleSys;
var time = []; /* Clock for main waterfall particles.  */
var pGeometry;

function defineParticles ()
{
    pGeometry = new THREE.Geometry();

    var particleTex = THREE.ImageUtils.loadTexture ("images/drop2.png");
    particleTex.wrapS = particleTex.wrapT = THREE.RepeatWrapping;
    particleTex.repeat.set (1, 1);

    pMaterial = new THREE.PointCloudMaterial
    ({
        color: 0x3399ff, /* Blue-like colour.  */
        map: particleTex, /* Texture.  */
        size: 0.3,
        sizeAttenuation: true,
        fog: true,
        transparent: true, /* Alpha channel = 0; propriety inherited
                      from Material.  */
    });

    /* Creates falling particles.  */
    for (p = 0; p < particleCount; p++){
        /* Initial position and velocity added to pGeometry.  */
        particles[p] =
            {
                position: new THREE.Vector3 (
                    (Math.random() * globlPart.pXVar) +
                    globlPart.pXMean,
                    (Math.random() * globlPart.pYVar) +
                    globlPart.pYMean,
                    (Math.random() * globlPart.pZVar) +
                    globlPart.pZMean),
                velocity: new THREE.Vector3 (
                    (Math.random() * globlPart.initVel) +
                    globlPart.initVel,
                    globlPart.initVel,
                    (Math.random() * globlPart.initVel) +
                    globlPart.initVel),
            };
        if (particles[p].position.z<0) particles[p].velocity.z *=-1;
        pGeometry.vertices.push (particles[p].position);

        /* Start the particle clock.  */
        time[p] = new THREE.Clock ();
        time[p].start ();
    }

    particleSys = new THREE.PointCloud (pGeometry ,pMaterial);
    particleSys.sortParticles = true;
    particleSys.visible = false; /* Inherited from Object3D.  */
}

/* Particle manager function, called by renderer.  */
function particleMgr ()
{
    var count=0;
    /* Get the number of particles.  */
    var pCount =particleCount;
    while (pCount--){ /* Loop all particles. */
        /* Get the current particle.  */
        var particle = particles[pCount];
        /* Calculate elapsed time and use modulus operator to
           solve animation problems.  */
        var elapsed = (time[pCount].getElapsedTime ()) % 20;

        /* Check if we need to reset particle position.  */
        if (particle.position.y < -50) /* - height */
        {
            if (waterClock.getElapsedTime()>3){
                particle.position.y = -500;
                if (pCount == 1) pGeometry.verticesNeedUpdate = true;
                count+=1;
                continue;
            }
            /* Check if the particles can be made visible.  */
            if (particleSys.visible == false && pCount == 1)
                particleSys.visible = true;

            /* Particle clock reset.  */
            time[pCount] = new THREE.Clock ();
            time[pCount].start ();

            /* Assign random positions for x and z (in a fixed
               range), but not for y which has fixed values.  */
            particle.position.x = (Math.random()
                * globlPart.pXVar)
                + globlPart.pXMean;
            particle.velocity.x = (Math.random()
                * globlPart.initVel)
                + globlPart.initVel;

            particle.position.y = (Math.random() * globlPart.pYVar) +
                globlPart.pYMean;
            particle.velocity.y = globlPart.initVel;

            particle.position.z = (Math.random()
                * globlPart.pZVar)
                + globlPart.pZMean;
            particle.velocity.z = (Math.random() * globlPart.initVel) +
                globlPart.initVel;
            if (particle.position.z<0) particle.velocity.z *=-1;

        }
        else
        {
            /* vy = g * t (where t is the leapsed time.)  */
            particle.velocity.y = gAccel * elapsed;
            /* y = 1/2 * g * t^2 (uniform acceleration.)  */
            particle.position.y += (1/2) * particle.velocity.y
                * elapsed;

            /* vx = v0 (where x corresponds to z.)  */
            particle.velocity.x += 0;
            /* x = v0 * t  */
            particle.position.x += particle.velocity.x * elapsed;

            if (particle.velocity.z>=0) particle.velocity.z += 0.2 * elapsed;
            else particle.velocity.z -= 0.2 * elapsed;

            particle.position.z += particle.velocity.z * elapsed;
        }
        /* Reassign particle to main particles array  */
        particles[pCount] = particle;
        if (pCount == 1) pGeometry.verticesNeedUpdate = true;
    }
    if (count==particleCount) return true;
}

function moving_bar(fill){
    var elem = document.getElementById("tankBar");
    elem.style.transition = "width 3.5s linear 0s";
    elem.style.WebkitTransition ="width 3.5s linear 0s";
    elem.style.OTransition="width 3.5s linear 0s";
    elem.style.MozTransition="width 3.5s linear 0s";
    if (fill) elem.style.width = "100%";
    else elem.style.width = "0%";
}

function posizione_sopra_aereoporto(posX, posY) {
    if(posY < 100 && posY > -100 && posX > -1000 && posX < 100)
        return true;
    return false;
}

function posizione_sopra_acqua(posX, posY){
    if( (posX - waterPosition[0]) * (posX - waterPosition[0]) +
        (posY - waterPosition[1]) * (posY - waterPosition[1]) <= waterRadius * waterRadius)
        return true;
    return false;
}

function posizione_sopra_fuoco(posX, posY){
    if( (posX - firePosition[0]) * (posX - firePosition[0]) + 
        (posY - firePosition[1]) * (posY - firePosition[1]) <= (200*fireScale) * (200*fireScale))
        return true;
    return false;
}

function render_trees(posX, posY){
    var minX = posX - renderRadius;
    var maxX = posX + renderRadius;
    var minY = posY - renderRadius;
    var maxY = posY + renderRadius;
    for(var i = 0; i < trees.length; i++){
        var j = 0;
        do{
            var posizioneX = Math.floor(Math.random() * (maxX - minX)) + minX;
            var posizioneY = Math.floor(Math.random() * (maxY - minY)) + minY;
            j++;
            if(j == 5)
                break;
        }while(posizione_sopra_acqua(posizioneX, posizioneY) || posizione_sopra_aereoporto(posizioneX, posizioneY));
        if(j == 5){
            scene.remove(trees[i]);
        }
        else{
            trees[i].position.set(posizioneX, 0, posizioneY);
            scene.add(trees[i]);
        }
    }
}

function update_trees(){
    if (!playFlag) return;

    var posizioneAereoX = model.position.x;
    var posizioneAereoY = model.position.z;
    var minX = posizioneAereoX - renderRadius;
    var maxX = posizioneAereoX + renderRadius;
    var minY = posizioneAereoY - renderRadius;
    var maxY = posizioneAereoY + renderRadius;
    var posizioneX = 0;
    var posizioneY = 0;

    if(posizione_sopra_acqua(posizioneAereoX, posizioneAereoY)){
        var minX = waterPosition[0] - waterRadius;
        var maxX = waterPosition[0] + waterRadius;
        var minY = waterPosition[1] - waterRadius;
        var maxY = waterPosition[1] + waterRadius;  
    }
    if(posizione_sopra_fuoco(posizioneAereoX, posizioneAereoY))
        fire = true;
    else
        fire = false;

    for(var i = 0; i < trees.length; i++){
        if(trees[i].position.x < maxX && trees[i].position.x > minX &&
            trees[i].position.z < maxY && trees[i].position.z > minY){
            continue;
        }
        var j = 0;
        do{
            j++;
            if(j == 5)
                break;
            posizioneX = Math.floor(Math.random() * (maxX - minX)) + minX;
            posizioneY = Math.floor(Math.random() * (maxY - minY)) + minY;
        }while(posizione_sopra_acqua(posizioneX, posizioneY) || posizione_sopra_aereoporto(posizioneX, posizioneY) 
            || posizione_sopra_fuoco(posizioneX, posizioneY));
        if(j == 5){
            scene.remove(trees[i]);
        }
        else{
            trees[i].position.set(posizioneX, 0, posizioneY);
            scene.add(trees[i]);
        }
    }
}
function update_burned_tree(){
    var posizioneAereoX = model.position.x;
    var posizioneAereoY = model.position.z;
    var minX = posizioneAereoX - renderRadius;
    var maxX = posizioneAereoX + renderRadius;
    var minY = posizioneAereoY - renderRadius;
    var maxY = posizioneAereoY + renderRadius;
    var fireRadius = 120 * fireScale;
    var fireMinX = firePosition[0] - fireRadius;
    var fireMaxX = firePosition[0] + fireRadius;
    var fireMinY = firePosition[1] - fireRadius;
    var fireMaxY = firePosition[1] + fireRadius;

    for (var i = 0; i < burnedTree.length; i++){
        if((!burnedTree[i].position.x < maxX && burnedTree[i].position.x > minX)
            || !(burnedTree[i].position.y < maxY && burnedTree[i].position.y > minY)){
            scene.remove(burnedTree[i]);
        }
        if(posizione_sopra_fuoco(burnedTree[i].position.x, burnedTree[i].position.z)){
            scene.add(burnedTree[i]);
            continue;
        }
        if(firePosition[0] < maxX && firePosition[0] > minX 
            && firePosition[1] < maxY && firePosition[1] > minY ){
            var posizioneX = 0;
            var posizioneY = 0;
            var j = 0;
            do{
                j++;
                if(j == 5)
                break;
                posizioneX = Math.floor(Math.random() * (fireMaxX - fireMinX)) + fireMinX;
                posizioneY = Math.floor(Math.random() * (fireMaxY - fireMinY)) + fireMinY;
            }while(!posizione_sopra_fuoco(posizioneX, posizioneY) && posizione_sopra_aereoporto (posizioneX, posizioneY)
                && posizione_sopra_acqua(posizioneX, posizioneX));
            if(j == 5){
                scene.remove(trees[i]);
            }
            else{
                burnedTree[i].position.set(posizioneX, 30, posizioneY);
                scene.add(burnedTree[i]);
            }
        }
    }
}

function render_airport(){
    if (!playFlag) return;
    var posAereoX = model.position.x;
    var posAereoY = model.position.z;
    if(posAereoX*posAereoX + posAereoY*posAereoY < renderRadius*renderRadius && !aeroportoRenderizzato){
        for(var i = 0; i < aeroporto.length; i++)
            scene.add(aeroporto[i]);
        aeroportoRenderizzato = true;
    }
    else if(posAereoX*posAereoX + posAereoY*posAereoY > (renderRadius*2)*(renderRadius*2) && aeroportoRenderizzato){
        for(var i = 0; i < aeroporto.length; i++)
            scene.remove(aeroporto[i]);
        aeroportoRenderizzato = false;
    }
}

function fire_expansion(){
    console.log(fireScale);
    if (!playFlag) return;
    if (ilFuoco[0].scale.x < 0.2) {
        vittoria = true;
        return;
    }
    if(ilFuoco[0].scale.x > 30){
        return;
    }
    fireScale = fireScale + fireSpeed;
    for(var i = 0; i < ilFuoco.length; i++){
        ilFuoco[i].scale.set(fireScale, fireScale, fireScale);
        ilFuoco[i].position.set(firePosition[0], 110*fireScale, firePosition[1]);
    }  
}

function fire_extinguish(quanto){
    fireScale = fireScale - quanto;
    for(var i = 0; i < ilFuoco.length; i++){
        ilFuoco[i].scale.set(fireScale, fireScale, fireScale);
        ilFuoco[i].position.set(firePosition[0], 110*fireScale, firePosition[1]);
    }
    if(quanto >= fireScale - 0.2)
        vittoria = true;
}

//Fire
var Fire = function ( geometry, options ) {

    THREE.Mesh.call( this, geometry );

    this.type = 'Fire';

    this.clock = new THREE.Clock();

    options = options || {};

    var textureWidth = options.textureWidth || 512;
    var textureHeight = options.textureHeight || 512;
    var oneOverWidth = 1.0 / textureWidth;
    var oneOverHeight = 1.0 / textureHeight;

    var debug = ( options.debug === undefined ) ? false : options.debug;
    this.color1 = options.color1 || new THREE.Color( 0xffffff );
    this.color2 = options.color2 || new THREE.Color( 0xffa000 );
    this.color3 = options.color3 || new THREE.Color( 0x000000 );
    this.colorBias = ( options.colorBias === undefined ) ? 0.8 : options.colorBias;
    this.diffuse = ( options.diffuse === undefined ) ? 1.33 : options.diffuse;
    this.viscosity = ( options.viscosity === undefined ) ? 0.25 : options.viscosity;
    this.expansion = ( options.expansion === undefined ) ? - 0.25 : options.expansion;
    this.swirl = ( options.swirl === undefined ) ? 50.0 : options.swirl;
    this.burnRate = ( options.burnRate === undefined ) ? 0.3 : options.burnRate;
    this.drag = ( options.drag === undefined ) ? 0.35 : options.drag;
    this.airSpeed = ( options.airSpeed === undefined ) ? 6.0 : options.airSpeed;
    this.windVector = options.windVector || new THREE.Vector2( 0.0, 0.75 );
    this.speed = ( options.speed === undefined ) ? 500.0 : options.speed;
    this.massConservation = ( options.massConservation === undefined ) ? false : options.massConservation;

    var size = textureWidth * textureHeight;
    this.sourceData = new Uint8Array( 4 * size );

    this.clearSources = function () {

        for ( var y = 0; y < textureHeight; y ++ ) {

            for ( var x = 0; x < textureWidth; x ++ ) {

                var i = y * textureWidth + x;
                var stride = i * 4;

                this.sourceData[ stride ] = 0;
                this.sourceData[ stride + 1 ] = 0;
                this.sourceData[ stride + 2 ] = 0;
                this.sourceData[ stride + 3 ] = 0;

            }

        }

        this.sourceMaterial.uniforms[ "sourceMap" ].value = this.internalSource;
        this.sourceMaterial.needsUpdate = true;

        return this.sourceData;

    };

    this.addSource = function ( u, v, radius, density = null, windX = null, windY = null ) {

        var startX = Math.max( Math.floor( ( u - radius ) * textureWidth ), 0 );
        var startY = Math.max( Math.floor( ( v - radius ) * textureHeight ), 0 );
        var endX = Math.min( Math.floor( ( u + radius ) * textureWidth ), textureWidth );
        var endY = Math.min( Math.floor( ( v + radius ) * textureHeight ), textureHeight );

        for ( var y = startY; y < endY; y ++ ) {

            for ( var x = startX; x < endX; x ++ ) {

                var diffX = x * oneOverWidth - u;
                var diffY = y * oneOverHeight - v;

                if ( diffX * diffX + diffY * diffY < radius * radius ) {

                    var i = y * textureWidth + x;
                    var stride = i * 4;

                    if ( density != null ) {

                        this.sourceData[ stride ] = Math.min( Math.max( density, 0.0 ), 1.0 ) * 255;

                    }
                    if ( windX != null ) {

                        var wind = Math.min( Math.max( windX, - 1.0 ), 1.0 );
                        wind = ( wind < 0.0 ) ? Math.floor( wind * 127 ) + 255 : Math.floor( wind * 127 );
                        this.sourceData[ stride + 1 ] = wind;

                    }
                    if ( windY != null ) {

                        var wind = Math.min( Math.max( windY, - 1.0 ), 1.0 );
                        wind = ( wind < 0.0 ) ? Math.floor( wind * 127 ) + 255 : Math.floor( wind * 127 );
                        this.sourceData[ stride + 2 ] = wind;

                    }

                }

            }

        }

        this.internalSource.needsUpdate = true;

        return this.sourceData;

    };

    // When setting source map, red channel is density. Green and blue channels
    // encode x and y velocity respectively as signed chars:
    // (0 -> 127 = 0.0 -> 1.0, 128 -> 255 = -1.0 -> 0.0 )
    this.setSourceMap = function ( texture ) {

        this.sourceMaterial.uniforms[ "sourceMap" ].value = texture;

    };

    var parameters = {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false
    };


    this.field0 = new THREE.WebGLRenderTarget( textureWidth, textureHeight, parameters );

    this.field0.background = new THREE.Color( 0x000000 );

    this.field1 = new THREE.WebGLRenderTarget( textureWidth, textureHeight, parameters );

    this.field0.background = new THREE.Color( 0x000000 );

    this.fieldProj = new THREE.WebGLRenderTarget( textureWidth, textureHeight, parameters );

    this.field0.background = new THREE.Color( 0x000000 );

    if ( ! THREE.Math.isPowerOfTwo( textureWidth ) ||
        ! THREE.Math.isPowerOfTwo( textureHeight ) ) {

        this.field0.texture.generateMipmaps = false;
        this.field1.texture.generateMipmaps = false;
        this.fieldProj.texture.generateMipmaps = false;

    }


    this.fieldScene = new THREE.Scene();
    this.fieldScene.background = new THREE.Color( 0x000000 );

    this.orthoCamera = new THREE.OrthographicCamera( textureWidth / - 2, textureWidth / 2, textureHeight / 2, textureHeight / - 2, 1, 2 );
    this.orthoCamera.position.z = 1;

    this.fieldGeometry = new THREE.PlaneBufferGeometry( textureWidth, textureHeight );

    this.internalSource = new THREE.DataTexture( this.sourceData, textureWidth, textureHeight, THREE.RGBAFormat );

    // Source Shader

    var shader = Fire.SourceShader;
    this.sourceMaterial = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: false
    } );

    this.clearSources();

    this.sourceMesh = new THREE.Mesh( this.fieldGeometry, this.sourceMaterial );
    this.fieldScene.add( this.sourceMesh );

    // Diffuse Shader

    var shader = Fire.DiffuseShader;
    this.diffuseMaterial = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: false
    } );

    this.diffuseMaterial.uniforms[ "oneOverWidth" ].value = oneOverWidth;
    this.diffuseMaterial.uniforms[ "oneOverHeight" ].value = oneOverHeight;

    this.diffuseMesh = new THREE.Mesh( this.fieldGeometry, this.diffuseMaterial );
    this.fieldScene.add( this.diffuseMesh );

    // Drift Shader

    shader = Fire.DriftShader;
    this.driftMaterial = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: false
    } );

    this.driftMaterial.uniforms[ "oneOverWidth" ].value = oneOverWidth;
    this.driftMaterial.uniforms[ "oneOverHeight" ].value = oneOverHeight;

    this.driftMesh = new THREE.Mesh( this.fieldGeometry, this.driftMaterial );
    this.fieldScene.add( this.driftMesh );

    // Projection Shader 1

    shader = Fire.ProjectionShader1;
    this.projMaterial1 = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: false
    } );

    this.projMaterial1.uniforms[ "oneOverWidth" ].value = oneOverWidth;
    this.projMaterial1.uniforms[ "oneOverHeight" ].value = oneOverHeight;

    this.projMesh1 = new THREE.Mesh( this.fieldGeometry, this.projMaterial1 );
    this.fieldScene.add( this.projMesh1 );

    // Projection Shader 2

    shader = Fire.ProjectionShader2;
    this.projMaterial2 = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: false
    } );


    this.projMaterial2.uniforms[ "oneOverWidth" ].value = oneOverWidth;
    this.projMaterial2.uniforms[ "oneOverHeight" ].value = oneOverHeight;

    this.projMesh2 = new THREE.Mesh( this.fieldGeometry, this.projMaterial2 );
    this.fieldScene.add( this.projMesh2 );

    // Projection Shader 3

    shader = Fire.ProjectionShader3;
    this.projMaterial3 = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: false
    } );


    this.projMaterial3.uniforms[ "oneOverWidth" ].value = oneOverWidth;
    this.projMaterial3.uniforms[ "oneOverHeight" ].value = oneOverHeight;

    this.projMesh3 = new THREE.Mesh( this.fieldGeometry, this.projMaterial3 );
    this.fieldScene.add( this.projMesh3 );

    // Color Shader

    if ( debug ) {

        shader = Fire.DebugShader;

    } else {

        shader = Fire.ColorShader;

    }
    this.material = new THREE.ShaderMaterial( {
        uniforms: shader.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: true
    } );

    this.material.uniforms[ "densityMap" ].value = this.field1.texture;

    this.configShaders = function ( dt ) {

        this.diffuseMaterial.uniforms[ "diffuse" ].value = dt * 0.05 * this.diffuse;
        this.diffuseMaterial.uniforms[ "viscosity" ].value = dt * 0.05 * this.viscosity;
        this.diffuseMaterial.uniforms[ "expansion" ].value = Math.exp( this.expansion * - 1.0 );
        this.diffuseMaterial.uniforms[ "swirl" ].value = Math.exp( this.swirl * - 0.1 );
        this.diffuseMaterial.uniforms[ "drag" ].value = Math.exp( this.drag * - 0.1 );
        this.diffuseMaterial.uniforms[ "burnRate" ].value = this.burnRate * dt * 0.01;
        this.driftMaterial.uniforms[ "windVector" ].value = this.windVector;
        this.driftMaterial.uniforms[ "airSpeed" ].value = dt * this.airSpeed * 0.001 * textureHeight;
        this.material.uniforms[ "color1" ].value = this.color1;
        this.material.uniforms[ "color2" ].value = this.color2;
        this.material.uniforms[ "color3" ].value = this.color3;
        this.material.uniforms[ "colorBias" ].value = this.colorBias;

    };

    this.clearDiffuse = function () {

        this.diffuseMaterial.uniforms[ "expansion" ].value = 1.0;
        this.diffuseMaterial.uniforms[ "swirl" ].value = 1.0;
        this.diffuseMaterial.uniforms[ "drag" ].value = 1.0;
        this.diffuseMaterial.uniforms[ "burnRate" ].value = 0.0;

    };

    this.swapTextures = function () {

        var swap = this.field0;
        this.field0 = this.field1;
        this.field1 = swap;

    };

    this.saveRenderState = function ( renderer ) {

        this.savedRenderTarget = renderer.getRenderTarget();
        this.savedVrEnabled = renderer.vr.enabled;
        this.savedShadowAutoUpdate = renderer.shadowMap.autoUpdate;
        this.savedAntialias = renderer.antialias;
        this.savedToneMapping = renderer.toneMapping;

    };

    this.restoreRenderState = function ( renderer ) {

        renderer.vr.enabled = this.savedVrEnabled;
        renderer.shadowMap.autoUpdate = this.savedShadowAutoUpdate;
        renderer.setRenderTarget( this.savedRenderTarget );
        renderer.antialias = this.savedAntialias;
        renderer.toneMapping = this.savedToneMapping;

    };

    this.renderSource = function ( renderer ) {

        this.sourceMesh.visible = true;

        this.sourceMaterial.uniforms[ "densityMap" ].value = this.field0.texture;

        renderer.setRenderTarget( this.field1 );
        renderer.render( this.fieldScene, this.orthoCamera );

        this.sourceMesh.visible = false;

        this.swapTextures();

    };

    this.renderDiffuse = function ( renderer ) {

        this.diffuseMesh.visible = true;

        this.diffuseMaterial.uniforms[ "densityMap" ].value = this.field0.texture;

        renderer.setRenderTarget( this.field1 );
        renderer.render( this.fieldScene, this.orthoCamera );

        this.diffuseMesh.visible = false;

        this.swapTextures();

    };

    this.renderDrift = function ( renderer ) {

        this.driftMesh.visible = true;

        this.driftMaterial.uniforms[ "densityMap" ].value = this.field0.texture;

        renderer.setRenderTarget( this.field1 );
        renderer.render( this.fieldScene, this.orthoCamera );

        this.driftMesh.visible = false;

        this.swapTextures();

    };

    this.renderProject = function ( renderer ) {

        // Projection pass 1

        this.projMesh1.visible = true;

        this.projMaterial1.uniforms[ "densityMap" ].value = this.field0.texture;

        renderer.setRenderTarget( this.fieldProj );
        renderer.render( this.fieldScene, this.orthoCamera );

        this.projMesh1.visible = false;

        this.projMaterial2.uniforms[ "densityMap" ].value = this.fieldProj.texture;

        // Projection pass 2

        this.projMesh2.visible = true;

        for ( var i = 0; i < 20; i ++ ) {

            renderer.setRenderTarget( this.field1 );
            renderer.render( this.fieldScene, this.orthoCamera );

            var temp = this.field1;
            this.field1 = this.fieldProj;
            this.fieldProj = temp;

            this.projMaterial2.uniforms[ "densityMap" ].value = this.fieldProj.texture;

        }

        this.projMesh2.visible = false;

        this.projMaterial3.uniforms[ "densityMap" ].value = this.field0.texture;
        this.projMaterial3.uniforms[ "projMap" ].value = this.fieldProj.texture;

        // Projection pass 3

        this.projMesh3.visible = true;

        renderer.setRenderTarget( this.field1 );
        renderer.render( this.fieldScene, this.orthoCamera );

        this.projMesh3.visible = false;

        this.swapTextures();

    };

    this.onBeforeRender = function ( renderer ) {

        var delta = this.clock.getDelta();
        if ( delta > 0.1 ) {

            delta = 0.1;

        }
        var dt = delta * ( this.speed * 0.1 );

        this.configShaders( dt );

        this.saveRenderState( renderer );

        renderer.vr.enabled = false; // Avoid camera modification and recursion
        renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows
        renderer.antialias = false;
        renderer.toneMapping = THREE.NoToneMapping;

        this.sourceMesh.visible = false;
        this.diffuseMesh.visible = false;
        this.driftMesh.visible = false;
        this.projMesh1.visible = false;
        this.projMesh2.visible = false;
        this.projMesh3.visible = false;

        this.renderSource( renderer );

        this.clearDiffuse();
        for ( var i = 0; i < 21; i ++ ) {

            this.renderDiffuse( renderer );

        }
        this.configShaders( dt );
        this.renderDiffuse( renderer );

        this.renderDrift( renderer );

        if ( this.massConservation ) {

            this.renderProject( renderer );
            this.renderProject( renderer );

        }

        // Final result out for coloring

        this.material.map = this.field1.texture;
        this.material.transparent = true;
        this.material.minFilter = THREE.LinearFilter,
            this.material.magFilter = THREE.LinearFilter,

            this.restoreRenderState( renderer );

    };

};


Fire.prototype = Object.create( THREE.Mesh.prototype );
Fire.prototype.constructor = Fire;

Fire.SourceShader = {

    uniforms: {
        'sourceMap': {
            value: null
        },
        'densityMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform sampler2D sourceMap;',
        'uniform sampler2D densityMap;',

        'varying vec2 vUv;',

        'void main() {',
        '    vec4 source = texture2D( sourceMap, vUv );',
        '    vec4 current = texture2D( densityMap, vUv );',

        '    vec2 v0 = (current.gb - step(0.5, current.gb)) * 2.0;',
        '    vec2 v1 = (source.gb - step(0.5, source.gb)) * 2.0;',

        '    vec2 newVel = v0 + v1;',

        '    newVel = clamp(newVel, -0.99, 0.99);',
        '    newVel = newVel * 0.5 + step(0.0, -newVel);',

        '    float newDensity = source.r + current.a;',
        '    float newTemp = source.r + current.r;',

        '    newDensity = clamp(newDensity, 0.0, 1.0);',
        '    newTemp = clamp(newTemp, 0.0, 1.0);',

        '    gl_FragColor = vec4(newTemp, newVel.xy, newDensity);',

        '}'

    ].join( "\n" )
};

Fire.DiffuseShader = {

    uniforms: {
        'oneOverWidth': {
            value: null
        },
        'oneOverHeight': {
            value: null
        },
        'diffuse': {
            value: null
        },
        'viscosity': {
            value: null
        },
        'expansion': {
            value: null
        },
        'swirl': {
            value: null
        },
        'drag': {
            value: null
        },
        'burnRate': {
            value: null
        },
        'densityMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform float oneOverWidth;',
        'uniform float oneOverHeight;',
        'uniform float diffuse;',
        'uniform float viscosity;',
        'uniform float expansion;',
        'uniform float swirl;',
        'uniform float burnRate;',
        'uniform float drag;',
        'uniform sampler2D densityMap;',

        'varying vec2 vUv;',

        'void main() {',

        '    vec4 dC = texture2D( densityMap, vUv );',
        '    vec4 dL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y) );',
        '    vec4 dR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y) );',
        '    vec4 dU = texture2D( densityMap, vec2(vUv.x, vUv.y - oneOverHeight) );',
        '    vec4 dD = texture2D( densityMap, vec2(vUv.x, vUv.y + oneOverHeight) );',
        '    vec4 dUL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y - oneOverHeight) );',
        '    vec4 dUR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y - oneOverHeight) );',
        '    vec4 dDL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y + oneOverHeight) );',
        '    vec4 dDR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y + oneOverHeight) );',

        '    dC.yz = (dC.yz - step(0.5, dC.yz)) * 2.0;',
        '    dL.yz = (dL.yz - step(0.5, dL.yz)) * 2.0;',
        '    dR.yz = (dR.yz - step(0.5, dR.yz)) * 2.0;',
        '    dU.yz = (dU.yz - step(0.5, dU.yz)) * 2.0;',
        '    dD.yz = (dD.yz - step(0.5, dD.yz)) * 2.0;',
        '    dUL.yz = (dUL.yz - step(0.5, dUL.yz)) * 2.0;',
        '    dUR.yz = (dUR.yz - step(0.5, dUR.yz)) * 2.0;',
        '    dDL.yz = (dDL.yz - step(0.5, dDL.yz)) * 2.0;',
        '    dDR.yz = (dDR.yz - step(0.5, dDR.yz)) * 2.0;',

        '    vec4 result = (dC + vec4(diffuse, viscosity, viscosity, diffuse) * ( dL + dR + dU + dD + dUL + dUR + dDL + dDR )) / (1.0 + 8.0 * vec4(diffuse, viscosity, viscosity, diffuse)) - vec4(0.0, 0.0, 0.0, 0.001);',

        '    float temperature = result.r;',
        '    temperature = clamp(temperature - burnRate, 0.0, 1.0);',

        '    vec2 velocity = result.yz;',

        '    vec2 expansionVec = vec2(dL.w - dR.w, dU.w - dD.w);',

        '    vec2 swirlVec = vec2((dL.z - dR.z) * 0.5, (dU.y - dD.y) * 0.5);',

        '    velocity = velocity + (1.0 - expansion) * expansionVec + (1.0 - swirl) * swirlVec;',

        '    velocity = velocity - (1.0 - drag) * velocity;',

        '    gl_FragColor = vec4(temperature, velocity * 0.5 + step(0.0, -velocity), result.w);',

        '    gl_FragColor = gl_FragColor * step(oneOverWidth, vUv.x);',
        '    gl_FragColor = gl_FragColor * step(oneOverHeight, vUv.y);',
        '    gl_FragColor = gl_FragColor * step(vUv.x, 1.0 - oneOverWidth);',
        '    gl_FragColor = gl_FragColor * step(vUv.y, 1.0 - oneOverHeight);',

        '}'

    ].join( "\n" )
};

Fire.DriftShader = {

    uniforms: {
        'oneOverWidth': {
            value: null
        },
        'oneOverHeight': {
            value: null
        },
        'windVector': {
            value: new THREE.Vector2( 0.0, 0.0 )
        },
        'airSpeed': {
            value: null
        },
        'densityMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform float oneOverWidth;',
        'uniform float oneOverHeight;',
        'uniform vec2 windVector;',
        'uniform float airSpeed;',
        'uniform sampler2D densityMap;',

        'varying vec2 vUv;',

        'void main() {',
        '    vec2 velocity = texture2D( densityMap, vUv ).gb;',
        '    velocity = (velocity - step(0.5, velocity)) * 2.0;',

        '    velocity = velocity + windVector;',

        '    vec2 sourcePos = vUv - airSpeed * vec2(oneOverWidth, oneOverHeight) * velocity;',

        '    vec2 units = sourcePos / vec2(oneOverWidth, oneOverHeight);',

        '    vec2 intPos = floor(units);',
        '    vec2 frac = units - intPos;',
        '    intPos = intPos * vec2(oneOverWidth, oneOverHeight);',

        '    vec4 dX0Y0 = texture2D( densityMap, intPos + vec2(0.0, -oneOverHeight) );',
        '    vec4 dX1Y0 = texture2D( densityMap, intPos + vec2(oneOverWidth, 0.0) );',
        '    vec4 dX0Y1 = texture2D( densityMap, intPos + vec2(0.0, oneOverHeight) );',
        '    vec4 dX1Y1 = texture2D( densityMap, intPos + vec2(oneOverWidth, oneOverHeight) );',


        '    dX0Y0.gb = (dX0Y0.gb - step(0.5, dX0Y0.gb)) * 2.0;',
        '    dX1Y0.gb = (dX1Y0.gb - step(0.5, dX1Y0.gb)) * 2.0;',
        '    dX0Y1.gb = (dX0Y1.gb - step(0.5, dX0Y1.gb)) * 2.0;',
        '    dX1Y1.gb = (dX1Y1.gb - step(0.5, dX1Y1.gb)) * 2.0;',

        '    vec4 source = mix(mix(dX0Y0, dX1Y0, frac.x), mix(dX0Y1, dX1Y1, frac.x), frac.y);',

        '    source.gb = source.gb * 0.5 + step(0.0, -source.gb);',

        '    gl_FragColor = source;',

        '}'

    ].join( "\n" )
};

Fire.ProjectionShader1 = {

    uniforms: {
        'oneOverWidth': {
            value: null
        },
        'oneOverHeight': {
            value: null
        },
        'densityMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform float oneOverWidth;',
        'uniform float oneOverHeight;',
        'uniform sampler2D densityMap;',

        'varying vec2 vUv;',

        'void main() {',
        '    float dL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y) ).g;',
        '    float dR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y) ).g;',
        '    float dU = texture2D( densityMap, vec2(vUv.x, vUv.y - oneOverHeight) ).b;',
        '    float dD = texture2D( densityMap, vec2(vUv.x, vUv.y + oneOverHeight) ).b;',

        '    dL = (dL - step(0.5, dL)) * 2.0;',
        '    dR = (dR - step(0.5, dR)) * 2.0;',
        '    dU = (dU - step(0.5, dU)) * 2.0;',
        '    dD = (dD - step(0.5, dD)) * 2.0;',

        '    float h = (oneOverWidth + oneOverHeight) * 0.5;',
        '    float div = -0.5 * h * (dR - dL + dD - dU);',

        '    gl_FragColor = vec4( 0.0, 0.0, div * 0.5 + step(0.0, -div), 0.0);',

        '}'

    ].join( "\n" )
};

Fire.ProjectionShader2 = {

    uniforms: {
        'oneOverWidth': {
            value: null
        },
        'oneOverHeight': {
            value: null
        },
        'densityMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform float oneOverWidth;',
        'uniform float oneOverHeight;',
        'uniform sampler2D densityMap;',

        'varying vec2 vUv;',

        'void main() {',
        '    float div = texture2D( densityMap, vUv ).b;',
        '    float pL = texture2D( densityMap, vec2(vUv.x - oneOverWidth, vUv.y) ).g;',
        '    float pR = texture2D( densityMap, vec2(vUv.x + oneOverWidth, vUv.y) ).g;',
        '    float pU = texture2D( densityMap, vec2(vUv.x, vUv.y - oneOverHeight) ).g;',
        '    float pD = texture2D( densityMap, vec2(vUv.x, vUv.y + oneOverHeight) ).g;',

        '    float divNorm = (div - step(0.5, div)) * 2.0;',
        '    pL = (pL - step(0.5, pL)) * 2.0;',
        '    pR = (pR - step(0.5, pR)) * 2.0;',
        '    pU = (pU - step(0.5, pU)) * 2.0;',
        '    pD = (pD - step(0.5, pD)) * 2.0;',

        '    float p = (divNorm + pR + pL + pD + pU) * 0.25;',

        '    gl_FragColor = vec4( 0.0, p * 0.5 + step(0.0, -p), div, 0.0);',

        '}'

    ].join( "\n" )
};

Fire.ProjectionShader3 = {

    uniforms: {
        'oneOverWidth': {
            value: null
        },
        'oneOverHeight': {
            value: null
        },
        'densityMap': {
            value: null
        },
        'projMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform float oneOverWidth;',
        'uniform float oneOverHeight;',
        'uniform sampler2D densityMap;',
        'uniform sampler2D projMap;',

        'varying vec2 vUv;',

        'void main() {',
        '    vec4 orig = texture2D(densityMap, vUv);',

        '    float pL = texture2D( projMap, vec2(vUv.x - oneOverWidth, vUv.y) ).g;',
        '    float pR = texture2D( projMap, vec2(vUv.x + oneOverWidth, vUv.y) ).g;',
        '    float pU = texture2D( projMap, vec2(vUv.x, vUv.y - oneOverHeight) ).g;',
        '    float pD = texture2D( projMap, vec2(vUv.x, vUv.y + oneOverHeight) ).g;',

        '    float uNorm = (orig.g - step(0.5, orig.g)) * 2.0;',
        '    float vNorm = (orig.b - step(0.5, orig.b)) * 2.0;',

        '    pL = (pL - step(0.5, pL)) * 2.0;',
        '    pR = (pR - step(0.5, pR)) * 2.0;',
        '    pU = (pU - step(0.5, pU)) * 2.0;',
        '    pD = (pD - step(0.5, pD)) * 2.0;',

        '    float h = (oneOverWidth + oneOverHeight) * 0.5;',
        '    float u = uNorm - (0.5 * (pR - pL) / h);',
        '    float v = vNorm - (0.5 * (pD - pU) / h);',

        '    gl_FragColor = vec4( orig.r, u * 0.5 + step(0.0, -u), v * 0.5 + step(0.0, -v), orig.a);',

        '}'

    ].join( "\n" )
};

Fire.ColorShader = {

    uniforms: {
        'color1': {
            value: null
        },
        'color2': {
            value: null
        },
        'color3': {
            value: null
        },
        'colorBias': {
            value: null
        },
        'densityMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform vec3 color1;',
        'uniform vec3 color2;',
        'uniform vec3 color3;',
        'uniform float colorBias;',
        'uniform sampler2D densityMap;',

        'varying vec2 vUv;',

        'void main() {',
        '    float density = texture2D( densityMap, vUv ).a;',
        '    float temperature = texture2D( densityMap, vUv ).r;',

        '    float bias = clamp(colorBias, 0.0001, 0.9999);',

        '    vec3 blend1 = mix(color3, color2, temperature / bias) * (1.0 - step(bias, temperature));',
        '    vec3 blend2 = mix(color2, color1, (temperature - bias) / (1.0 - bias) ) * step(bias, temperature);',

        '    gl_FragColor = vec4(blend1 + blend2, density);',
        '}'

    ].join( "\n" )
};

Fire.DebugShader = {

    uniforms: {
        'color1': {
            value: null
        },
        'color2': {
            value: null
        },
        'color3': {
            value: null
        },
        'colorBias': {
            value: null
        },
        'densityMap': {
            value: null
        }
    },

    vertexShader: [
        'varying vec2 vUv;',

        'void main() {',

        '     vUv = uv;',

        '     vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        '     gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join( "\n" ),

    fragmentShader: [
        'uniform sampler2D densityMap;',

        'varying vec2 vUv;',

        'void main() {',
        '    float density;',
        '    density = texture2D( densityMap, vUv ).a;',

        '    vec2 vel = texture2D( densityMap, vUv ).gb;',

        '    vel = (vel - step(0.5, vel)) * 2.0;',

        '    float r = density;',
        '    float g = max(abs(vel.x), density * 0.5);',
        '    float b = max(abs(vel.y), density * 0.5);',
        '    float a = max(density * 0.5, max(abs(vel.x), abs(vel.y)));',

        '    gl_FragColor = vec4(r, g, b, a);',

        '}'

    ].join( "\n" )
};
