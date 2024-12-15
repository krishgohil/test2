import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Scene setup
const scene = new THREE.Scene();

// Create canvas for gradient background
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 1024;

// Create simple dark gradient
const gradient = context.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.8
);

gradient.addColorStop(0, '#ffffff');    
gradient.addColorStop(1, '#000000');    

context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

// Apply gradient as background
const gradientTexture = new THREE.CanvasTexture(canvas);
scene.background = gradientTexture;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Camera movement mode
let cameraMode = 'xz';

// Button event listeners
document.getElementById('xzMode').addEventListener('click', () => {
    cameraMode = 'xz';
    document.getElementById('xzMode').classList.add('active');
    document.getElementById('zMode').classList.remove('active');
});

document.getElementById('zMode').addEventListener('click', () => {
    cameraMode = 'z';
    document.getElementById('zMode').classList.add('active');
    document.getElementById('xzMode').classList.remove('active');
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lights setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
frontLight.position.set(0, 5, 5);
scene.add(frontLight);

const sideLight = new THREE.DirectionalLight(0xffffff, 0.5);
sideLight.position.set(5, 3, 0);
scene.add(sideLight);

// Loader setup
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
dracoLoader.setDecoderConfig({ type: 'js' });

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
let model;

// Camera animation variables
let time = 0;
const SPEED = 0.5;
let radius = 3;
const ANGLE_RANGE = 0.1;
const CAMERA_HEIGHT = 0.5;
const Z_MOTION_RANGE = 0.25;

function animate() {
    requestAnimationFrame(animate);
    time += SPEED * 0.01;

    if (cameraMode === 'xz') {
        const angle = Math.PI / 2 + Math.sin(time) * ANGLE_RANGE;
        camera.position.x = Math.cos(angle) * radius;
        camera.position.y = CAMERA_HEIGHT;
        camera.position.z = Math.sin(angle) * radius;
    } else {
        const zOffset = Math.sin(time) * Z_MOTION_RANGE;
        camera.position.x = 0;
        camera.position.y = CAMERA_HEIGHT;
        camera.position.z = radius + zOffset;
    }

    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer.render(scene, camera);
}

loader.load(
    './car.glb',
    (gltf) => {
        model = gltf.scene;
        scene.add(model);

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        // radius = maxDim * 1.2;
        radius = maxDim * 1;

        camera.position.set(0, CAMERA_HEIGHT, radius);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        model.rotation.y = -Math.PI / 8;

        animate();
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('Error loading GLB:', error);
    }
);

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';