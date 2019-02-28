if (!Detector.webgl) Detector.addGetWebGLMessage();
var effectFXAA;
var mouseX = 0,
    mouseY = 0,
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    camera, scene, renderer, material, composer;


function init() {
    var container;
    container = document.createElement('div');
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(33, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 400;
    // Allows for camera swoop action
    camera.position.y = 10000;
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

    // Test focus object
    function makeCube() {
        var geo = new THREE.BoxGeometry(50, 50, 50);
        var cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x123456
        });
        var mesh = new THREE.Mesh(geo, cubeMaterial);
        scene.add(mesh);
    }
    makeCube();

    function importTerrain() {
        var loader = new THREE.OBJLoader();
        // load a resource
        loader.load(
            // resource URL
            'terrainTest.obj',
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

                console.log('An error happened');
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
    composer.addPass(effectFXAA);
    composer.addPass(effectBloom);
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
}

function render() {
    document.getElementById("camera").innerHTML = camera.position.x;
    document.getElementById("mouse").innerHTML = mouseX;
    camera.position.x -= (mouseX + camera.position.x) * .05;
    camera.position.y -= (-mouseY + camera.position.y) * .05;
    camera.lookAt(scene.position);

    var time = Date.now() * 0.0005;
    for (var i = 0; i < scene.children.length; i++) {
        var object = scene.children[i];
        if (object instanceof THREE.Line) object.rotation.y = time * (i % 2 ? 1 : -1);
    }

    renderer.clear();
    composer.render();
}

init();
animate();