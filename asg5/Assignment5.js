import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1));

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(-5, 5, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff0000, 5);
pointLight.position.set(-5, 5, 0);
scene.add(pointLight);

const loader = new THREE.CubeTextureLoader();
scene.background = loader.load([
    'skybox/right.jpg', 'skybox/left.jpg',
    'skybox/top.jpg', 'skybox/bottom.jpg',
    'skybox/back.jpg', 'skybox/front.jpg'
]);

const boxTexture = new THREE.TextureLoader().load('assets/textures/crate.jpg');
const boxMaterial = new THREE.MeshStandardMaterial({ map: boxTexture });
const texturedBox = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), boxMaterial);
texturedBox.position.set(0, 1, 0);
scene.add(texturedBox);

const geomTypes = [THREE.BoxGeometry, THREE.SphereGeometry, THREE.CylinderGeometry];
for (let i = 0; i < 20; i++) {
    let geom;
    if (i % 3 === 1) {
        geom = new geomTypes[i % 3](1, 32, 32);
    } else {
        geom = new geomTypes[i % 3](1, 1, 1);
    }
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(Math.random() * 10 - 5, Math.random() * 10, Math.random() * 20 - 15);
    scene.add(mesh);
}

const animatedBox = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
animatedBox.position.set(0, 5, 0);
scene.add(animatedBox);

const gltfLoader = new GLTFLoader();
gltfLoader.load('assets/models/porsche.glb', (gltf) => {
    const model = gltf.scene;
    model.position.set(-5, 0, 0);
    scene.add(model);
});

function animate() {
    requestAnimationFrame(animate);

    animatedBox.rotation.x += 0.01;
    texturedBox.rotation.y += 0.005;

    renderer.render(scene, camera);
}
animate();

const horizontalMirrorGeometry = new THREE.PlaneGeometry(20, 50);
const horizontalMirror = new Reflector(horizontalMirrorGeometry, {
    clipBias: 0.003,
    textureWidth: window.innerWidth,
    textureHeight: window.innerHeight,
    color: 0x999999,
});
horizontalMirror.rotation.x = -Math.PI / 2;
horizontalMirror.position.set(0, -1, 0);
scene.add(horizontalMirror);

scene.fog = new THREE.Fog(0xcccccc, 10, 50);
renderer.setClearColor(scene.fog.color);

const particles = new THREE.BufferGeometry();
const count = 500;
const positions = [];

for (let i = 0; i < count; i++) {
    positions.push(
        (Math.random() - 0.5) * 100,
        Math.random() * 20 + 5,
        (Math.random() - 0.5) * 100
    );
}

particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    size: 0.3,
    color: 0xffff00,
    transparent: true,
    opacity: 0.8
});

const particleSystem = new THREE.Points(particles, material);
scene.add(particleSystem);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
