// --- LÓGICA PRINCIPAL DE THREE.JS ---
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. CONFIGURACIÓN INICIAL
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 8); // Posición inicial

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 1.9; // Limitar para no ver por debajo del piso

// 2. LUCES
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// 3. GESTIÓN DE OBJETOS
let model, roomMesh;
const clickableObjects = [];
const screenData = {
    'DisplayMonitor': { mesh: null, htmlId: 'content-monitor' },
    'Displayipad':    { mesh: null, htmlId: 'content-ipad' },
    'Displaypared':   { mesh: null, htmlId: 'content-pared' },
    'Displaytv':      { mesh: null, htmlId: 'content-tv' }
};

// 4. CARGAR MODELO
const loader = new GLTFLoader();
loader.load('assets/Portafolio2.glb', (gltf) => {
    model = gltf.scene;
    
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Identificar Room
            if (child.name.includes('room') || child.name === 'room') {
                roomMesh = child;
                // Clonar material para poder cambiarle el color solo a esto
                child.material = child.material.clone(); 
            }

            // Identificar Pantallas
            for (const key in screenData) {
                if (child.name === key || child.name.includes(key)) {
                    screenData[key].mesh = child;
                    clickableObjects.push(child);
                }
            }
        }
    });

    scene.add(model);
    
    // Quitar pantalla de carga
    const loaderEl = document.getElementById('loading-screen');
    if(loaderEl) {
        loaderEl.style.opacity = 0;
        setTimeout(() => loaderEl.style.display = 'none', 500);
    }
    
    // Centrar cámara inicial
    controls.target.set(0, 1, 0); 
    controls.update();

}, undefined, (error) => {
    console.error("Error cargando GLB:", error);
});

// 5. INTERACCIÓN (RAYCASTER)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    // Evitar clicks si se está tocando la interfaz
    if (event.target.closest('.nav-bar') || event.target.closest('.section-content')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const objectName = intersects[0].object.name;
        // Buscar la llave correcta en nuestro diccionario
        for (const key in screenData) {
            if (objectName.includes(key)) {
                moveToObject(key);
                break;
            }
        }
    }
});

// Función para mover la cámara (Animación GSAP)
function moveToObject(key) {
    const data = screenData[key];
    if (!data || !data.mesh) return;

    // Calcular posición objetivo (frente al objeto)
    const targetPos = new THREE.Vector3();
    data.mesh.getWorldPosition(targetPos);
    
    const offset = new THREE.Vector3(0, 0, 5); // Distancia
    offset.applyQuaternion(data.mesh.getWorldQuaternion(new THREE.Quaternion()));
    const camPos = targetPos.clone().add(offset);

    // Animar Cámara
    gsap.to(camera.position, {
        x: camPos.x, y: camPos.y, z: camPos.z,
        duration: 1.5, ease: "power2.inOut"
    });

    // Animar Punto de Mira (Controls Target)
    gsap.to(controls.target, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 1.5, ease: "power2.inOut",
        onUpdate: () => controls.update(),
        onComplete: () => {
            // Llamar función global definida en script.js
            if(window.showHtmlContent) window.showHtmlContent(data.htmlId);
        }
    });
}

function resetCamera() {
    // Ocultar HTML
    if(window.hideHtmlContent) window.hideHtmlContent();

    // Regresar a vista general
    gsap.to(camera.position, {
        x: 5, y: 5, z: 8,
        duration: 1.5, ease: "power2.inOut"
    });
    gsap.to(controls.target, {
        x: 0, y: 1, z: 0,
        duration: 1.5, ease: "power2.inOut",
        onUpdate: () => controls.update()
    });
}

// 6. EVENTOS PERSONALIZADOS (Comunicación con script.js)

// Escuchar cambio de tema
window.addEventListener('themeChanged', (e) => {
    const isLight = e.detail.isLightMode;
    
    // Cambiar fondo
    const bgColor = isLight ? 0xf0f0f0 : 0x1a1a1a;
    scene.background.set(bgColor);

    // Cambiar color del cuarto (si existe)
    if (roomMesh) {
        const roomColor = isLight ? 0xffffff : 0x222222;
        gsap.to(roomMesh.material.color, {
            r: new THREE.Color(roomColor).r,
            g: new THREE.Color(roomColor).g,
            b: new THREE.Color(roomColor).b,
            duration: 0.5
        });
    }
});

// Escuchar navegación desde botones UI
window.addEventListener('navigateToSection', (e) => {
    moveToObject(e.detail.target);
});

// Escuchar reset de vista
window.addEventListener('resetViewRequest', () => {
    resetCamera();
});

// 7. LOOP PRINCIPAL
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});