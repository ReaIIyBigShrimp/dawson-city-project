if (!Detector.webgl) Detector.addGetWebGLMessage();
var effectFXAA;
var mouseX = 0,
    mouseY = 0,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    camera, scene, renderer, material, composer, 
    controls,
    directionalLight;


function init() {
    var container;
    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 400;
    // Allows for camera swoop action
    camera.position.y = 200;
    camera.position.x = 200;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);
    
    stats = new Stats();
    container.appendChild( stats.dom );

    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    axesHelper.position.set(0,100,0);
    

    // Test focus object
    function makeCube() {
        var geo = new THREE.BoxGeometry(50, 50, 50);
        var cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x123456
        });
        var mesh = new THREE.Mesh(geo, cubeMaterial);
        scene.add(mesh);
    }
    //makeCube();

    let addLighting = () => {
        let light = new THREE.AmbientLight( 0x404040, 1.5 ); // soft white light
        scene.add( light );
    }

    let addDirectionalLighting = () => {
        let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
        scene.add( directionalLight );
    }
    addDirectionalLighting();

    addLighting();
    let addControls = () => {
        controls = new THREE.OrbitControls( camera );
        //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.minDistance = 100;
        controls.maxDistance = 700;
        controls.maxPolarAngle = Math.PI / 2;

        /* controls = new THREE.FlyControls( camera );
				controls.movementSpeed = 1000;
				controls.domElement = renderer.domElement;
				controls.rollSpeed = Math.PI / 24;
				controls.autoForward = false;
				controls.dragToLook = false;
 */
    }

    addControls();
    function importTerrain() {
        var loader = new THREE.OBJLoader();
        // load a resource
        loader.load(
            // resource URL
            'terrainTest_01.obj',
            // called when resource is loaded
            function (object) {
                scene.add(object);
                object.position.set(10,10,10);
                object.scale.set(30,30,30);

                console.log("Terrain loaded");
            },
            // called when loading is in progresses
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // called when loading has errors
            function (error) {
                console.log('An error occurred: ' + error);
            }
        );
    }
    importTerrain();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    
    // Other test effects
    var renderModel = new THREE.RenderPass(scene, camera);
    var effectBloom = new THREE.BloomPass(3);
    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    var width = window.innerWidth || 2;
    var height = window.innerHeight || 2;
    effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
    effectCopy.renderToScreen = true;
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderModel);
    // composer.addPass(effectFXAA);
    // composer.addPass(effectBloom);
    composer.addPass(effectCopy);

    window.addEventListener('resize', onWindowResize, false);

    
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.reset();
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

function onDocumentTouchMove(event) {
    if (event.touches.length == 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}
//
function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
    controls.update(); 
}

function render() {
    document.getElementById("camera").innerHTML = camera.position.x;
    document.getElementById("mouse").innerHTML = mouseX;
    // camera.position.x -= (mouseX + camera.position.x) * .05;
    // camera.position.y -= (-mouseY + camera.position.y) * .05;
    // camera.lookAt(scene.position);

    /* var time = Date.now() * 0.0005;
    for (var i = 0; i < scene.children.length; i++) {
        var object = scene.children[i];
        if (object instanceof THREE.Line) object.rotation.y = time * (i % 2 ? 1 : -1);
    } */

    
    controls.update();

    renderer.clear();
    composer.render();
}

init();
animate();