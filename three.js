import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// IMPORTANTE: Importamos el renderizador CSS3D
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// 1. CONFIGURACIÓN INICIAL DE ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 8);

// 2. CONFIGURACIÓN DE RENDERIZADORES
const container = document.getElementById('canvas-container');

// A) Renderizador WebGL (Modelos 3D, luces, sombras)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
// Posicionamiento absoluto para superponer
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = 0;
renderer.domElement.style.zIndex = 1; // Detrás del CSS para ver los objetos pero delante del fondo
renderer.domElement.style.pointerEvents = 'none'; // Permitir clicks a través del canvas 3D hacia el CSS
container.appendChild(renderer.domElement);

// B) Renderizador CSS3D (Elementos HTML en pantallas)
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = 0;
cssRenderer.domElement.style.zIndex = 2; // Encima para recibir clicks
container.appendChild(cssRenderer.domElement);

// 3. CONTROLES (OrbitControls debe controlar el elemento superior, el CSS Renderer)
const controls = new OrbitControls(camera, cssRenderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 1.9;

// 4. LUCES
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// 5. CONFIGURACIÓN DE PANTALLAS (TUS DATOS + HTML)
// "pixelsPerUnit" define la calidad. 100px por cada 1 unidad de Three.js.
// Si tu pared mide 14 unidades, tendrá 1400px de ancho en HTML.
const PIXELS_PER_UNIT = 120; 

const screenConfig = {
    'DisplayMonitor': { 
        width: 5.9,
        height: 2.3,
        cssClass: 'screen-monitor',
        html: `
            <div>
                <h1>Hola, Soy Emmanuel</h1>
                <p>Desarrollador <span class="highlight">Creative Frontend</span> & 3D Enthusiast</p>
                <p style="font-size: 1rem; margin-top: 20px; opacity: 0.8;">(Click para acercar)</p>
            </div>
        `
    },
    'Displayipad': { 
        width: 0.9, // Ajusté ligeramente para mejor proporción iPad
        height: 1.2,
        cssClass: 'screen-ipad',
        html: `
            <div style="width:100%; height:100%;">
                <h2>Proyectos</h2>
                <div class="project-grid">
                    <div class="project-card">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Shop 3D</h3>
                        <p>React + Three.js</p>
                    </div>
                    <div class="project-card">
                        <i class="fas fa-chart-line"></i>
                        <h3>Finance</h3>
                        <p>D3.js Dashboard</p>
                    </div>
                </div>
            </div>
        `
    },
    'Displaypared': { 
        width: 14.1,
        height: 8.6,
        cssClass: 'screen-pared',
        html: `
            <div style="width:100%;">
                <h2>Habilidades Técnicas</h2>
                <div class="skills-container">
                    <div class="skill-badge"><i class="fab fa-js"></i> JavaScript</div>
                    <div class="skill-badge"><i class="fas fa-cube"></i> Three.js</div>
                    <div class="skill-badge"><i class="fab fa-react"></i> React</div>
                    <div class="skill-badge"><i class="fas fa-shapes"></i> Blender</div>
                    <div class="skill-badge"><i class="fab fa-html5"></i> HTML5/CSS3</div>
                    <div class="skill-badge"><i class="fas fa-server"></i> Node.js</div>
                </div>
            </div>
        `
    },

    'Displaytv': { 
    // INTERCAMBIADAS: ahora width es el lado largo (7.7) y height el corto (3.4)
    width: 3.4,   // ← Era height
    height: 7.7,  // ← Era width
    cssClass: 'screen-tv',
    html: `
        <div>
            <h2>CONTACTO</h2>
            <div class="contact-info">emmdev@code.com</div>
            <div class="socials">
                <i class="fab fa-linkedin"></i>
                <i class="fab fa-github"></i>
                <i class="fab fa-twitter"></i>
            </div>
        </div>
    `
}
};

// 6. GESTIÓN DE OBJETOS Y CARGA
let model, roomMesh;
const clickableObjects = []; // Guardamos referencias para mover la cámara

function createCSSObject(config, position, quaternion, parentName) {
    // A. Crear el elemento DOM
    const div = document.createElement('div');
    div.className = `screen-base ${config.cssClass}`;
    div.innerHTML = config.html;
    
    // B. Calcular tamaño en píxeles basado en la configuración y densidad
    const pixelWidth = config.width * PIXELS_PER_UNIT;
    const pixelHeight = config.height * PIXELS_PER_UNIT;
    
    div.style.width = `${pixelWidth}px`;
    div.style.height = `${pixelHeight}px`;
    
    // C. Crear el objeto CSS3D
    const cssObj = new CSS3DObject(div);
    
    // D. Posición y Rotación (Copiadas del Empty de Blender)
    cssObj.position.copy(position);
    cssObj.quaternion.copy(quaternion);
    
    // E. Escala (Inversa a la densidad para que coincida con el tamaño 3D)
    // Matemáticamente: si el div es 100 veces más grande (por PIXELS_PER_UNIT),
    // reducimos la escala 100 veces.
    const scaleFactor = 1 / PIXELS_PER_UNIT;
    cssObj.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // F. Interactividad (Click en el HTML mueve la cámara)
    // Agregamos el listener directamente al DOM, ya que el Raycaster no detecta CSS
    div.addEventListener('pointerdown', (e) => {
        // Detener propagación para que no interfiera con orbit controls si no es necesario
        // e.stopPropagation(); 
        moveToObject(cssObj, config.width); // Pasamos el objeto y su ancho para calcular zoom
    });

    // Guardamos referencia para la navbar externa
    cssObj.name = parentName; // Ej: "DisplayMonitor"
    clickableObjects.push(cssObj);

    return cssObj;
}

const loader = new GLTFLoader();
loader.load('assets/Portafolio2.glb', (gltf) => {
    model = gltf.scene;
    
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.name.includes('room') || child.name === 'room') {
                roomMesh = child;
            }
        }

        // Mapeo de empties
        const emptyToKey = {
            "monitor-empty": "DisplayMonitor",
            "ipad-empty": "Displayipad", 
            "pared-empty": "Displaypared",
            "tv-empty": "Displaytv"
        };

        // Verificar si es uno de nuestros empties
        for (const [emptyName, configKey] of Object.entries(emptyToKey)) {
            if (child.name === emptyName || child.name.includes(emptyName)) {
                const config = screenConfig[configKey];
                if (config) {
                    // Crear la pantalla CSS3D en la posición del empty
                    const cssScreen = createCSSObject(
                        config, 
                        child.position, 
                        child.quaternion,
                        configKey // Pasamos la clave como nombre (DisplayMonitor)
                    );
                    
                    // Añadimos a la escena
                    scene.add(cssScreen);
                    
                    // Opcional: Ocultar el empty original si tenía geometría (visibilidad)
                    child.visible = false; 
                }
            }
        }
    });

    scene.add(model);
    
    // Ocultar loader
    const loaderEl = document.getElementById('loading-screen');
    if(loaderEl) {
        loaderEl.style.opacity = 0;
        setTimeout(() => loaderEl.style.display = 'none', 500);
    }
    
    controls.target.set(0, 1, 0); 
    controls.update();

}, undefined, (error) => {
    console.error("Error cargando GLB:", error);
});


// 7. LÓGICA DE MOVIMIENTO DE CÁMARA
function moveToObject(object, objectWidth = 2) {
    const targetPos = new THREE.Vector3();
    // Obtener posición mundial (útil si estuviera agrupado, aunque aquí están en root)
    object.getWorldPosition(targetPos);
    
    const offset = new THREE.Vector3(0, 0, Math.max(2, objectWidth * 0.8)); // Distancia dinámica según tamaño
    offset.applyQuaternion(object.getWorldQuaternion(new THREE.Quaternion()));
    
    const camPos = targetPos.clone().add(offset);

    gsap.to(camera.position, {
        x: camPos.x, y: camPos.y, z: camPos.z,
        duration: 1.5, ease: "power2.inOut"
    });

    gsap.to(controls.target, {
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        duration: 1.5, ease: "power2.inOut",
        onUpdate: () => controls.update()
    });
}

function resetCamera() {
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

// 8. EVENTOS EXTERNOS
window.addEventListener('navigateToSection', (e) => {
    const targetName = e.detail.target;
    // Buscamos en nuestros objetos CSS creados
    const targetObj = clickableObjects.find(obj => obj.name === targetName);
    
    if(targetObj) {
        // Necesitamos el ancho para calcular el zoom, lo sacamos del config
        const width = screenConfig[targetName]?.width || 2;
        moveToObject(targetObj, width);
    }
});

window.addEventListener('resetViewRequest', resetCamera);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('themeChanged', (e) => {
    const isLight = e.detail.isLightMode;
    const bgColor = isLight ? 0xf0f0f0 : 0x1a1a1a;
    scene.background.set(bgColor);
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

// 9. LOOP PRINCIPAL
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    // Renderizamos ambas capas
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
}
animate();