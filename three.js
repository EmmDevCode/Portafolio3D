import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// 1. CONFIGURACIÓN INICIAL DE ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 12, 15);

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
cssRenderer.domElement.style.pointerEvents = 'all';
container.appendChild(cssRenderer.domElement);

// 3. CONTROLES 
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

// 5. CONFIGURACIÓN DE PANTALLAS (DATOS + HTML)
const PIXELS_PER_UNIT = 120; 


const screenConfig = {
    'DisplayMonitor': { 
        width: 5.9,
        height: 2.3,
        cssClass: 'screen-monitor',
        html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%; height: 100%; padding: 10px;">
                <img src="assets/perfil.png" alt="Foto de Emmanuel" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 2px solid #ffffffff;">
                <!-- Contenedor para la animación typewriter -->
                <div id="typewriter-container" style="font-size: 2em; color: #ffffffff; margin-bottom: 0.1em; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">
                    Hi, I AM <span id="typewriter-text">EMMANUEL</span>
                </div>
                <p style="font-size: 1em; margin-top: 10px; max-width: 85%; line-height: 1.3; color: #ccc;">
                    I'm a systems engineering student, I love everything about technology, I know a little bit about everything
                </p>
            </div>
        `
    },

        'Displayipad': { 
        width: 1.5,
        height: 2,
        cssClass: 'screen-ipad',
        html: `
            <div style="width:100%; height:100%;">
                <h2>Proyectos</h2>
                <!-- Envolver el grid en un div con clase para aplicar transform -->
                <div class="ipad-content">
                    <div class="project-grid">
                        <div class="project-card">
                            <a href="https://github.com/EmmDevCode/Login_bear_project" target="_blank" class="project-link">
                                <!-- Icono de Login (llave) -->
                                <i class="fas fa-key"></i>
                                <h3>Login bear with Rive</h3>
                            </a>
                        </div>
                        <div class="project-card">
                            <a href="https://github.com/EmmDevCode/RATING_BEAR" target="_blank" class="project-link">
                                <!-- Icono de Estrella -->
                                <i class="fas fa-star"></i>
                                <h3>Rating bear</h3>
                            </a>
                        </div>
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
                    <div class="skill-badge"><i class="fab fa-flutter"></i> Flutter</div>
                    <div class="skill-badge"><i class="fab fa-react"></i> React</div>
                    <div class="skill-badge"><i class="fas fa-shapes"></i> Blender</div>
                    <div class="skill-badge"><i class="fab fa-html5"></i> HTML5/CSS3</div>
                </div>
            </div>
        `
    },

    'Displaytv': { 
    width: 3.4,  
    height: 7.7,  
    cssClass: 'screen-tv',
    html: `
       <div class="tv-content">
        <h2>CONTACTO</h2>
        <div class="social-icon" onclick="openGitHub()">
            <i class="fab fa-github"></i>
        </div>
        <form class="contact-form">
            <input type="email" placeholder="Tu email" required />
            <textarea placeholder="Mensaje" required></textarea>
            <button type="submit">Enviar</button>
        </form>
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

    //DESPLAZAMIENTO ESPECÍFICO PARA EL IPAD 
    if (parentName === 'Displayipad') {
    const offset = new THREE.Vector3(-0.06, 0.07, 0); 
    offset.applyQuaternion(cssObj.quaternion); 
    cssObj.position.add(offset); 
    }

    const scaleFactor = 1 / PIXELS_PER_UNIT;
    cssObj.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // F. Interactividad (Click en el HTML mueve la cámara)
div.addEventListener('pointerdown', (e) => {
    // Verificar si el click fue en un elemento interactivo (input, button, .social-icon)
   if (
    e.target.tagName === 'INPUT' ||
    e.target.tagName === 'TEXTAREA' ||
    e.target.tagName === 'BUTTON' ||
    e.target.classList.contains('social-icon') ||
    e.target.classList.contains('project-link') || 
    e.target.closest('input') ||
    e.target.closest('textarea') ||
    e.target.closest('button') ||
    e.target.closest('.social-icon') ||
    e.target.closest('.project-link') 
) {
    
    e.stopPropagation(); 
    return; 
}

    // Si no fue en un elemento interactivo, mover la cámara
    moveToObject(cssObj, config.width); 
});

    
    const githubIcon = div.querySelector('.social-icon');
    if (githubIcon) {
        githubIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se dispare el moveToObject
            window.open('https://github.com/EmmDevCode', '_blank');
        });
    }

    
    cssObj.name = parentName; 
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

        // Verificar si es un empties
        for (const [emptyName, configKey] of Object.entries(emptyToKey)) {
            if (child.name === emptyName || child.name.includes(emptyName)) {
                const config = screenConfig[configKey];
                if (config) {
                    // Crea la pantalla CSS3D en la posición del empty
                    const cssScreen = createCSSObject(
                        config, 
                        child.position, 
                        child.quaternion,
                        configKey // Pasam la clave como nombre (DisplayMonitor)
                    );
                    
                    // Añadir a la escena
                    scene.add(cssScreen);
                    
                    
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

    // --- AÑADIR LA ANIMACIÓN TYPWRITER AQUÍ ---

setTimeout(() => {
    const el = document.getElementById('typewriter-text');

    if (!el) return;

    const words = ["EMMANUEL", "STUDENT", "PROGRAMMER"];
    let index = 0;
    let isDeleting = false;
    let charIndex = 0;

    function typeLoop() {
        const word = words[index];

        if (!isDeleting) {
            // ESCRIBIR
            el.textContent = word.substring(0, charIndex++);
            if (charIndex > word.length) {
                isDeleting = true;
                setTimeout(typeLoop, 1200); // pausa al terminar palabra
                return;
            }
        } else {
            // BORRAR
            el.textContent = word.substring(0, charIndex--);
            if (charIndex < 0) {
                isDeleting = false;
                index = (index + 1) % words.length;
            }
        }

        const speed = isDeleting ? 60 : 95;

        gsap.delayedCall(speed / 1000, typeLoop);
    }

    typeLoop();
}, 1000);
    
    controls.target.set(0, 1, 0); 
    controls.update();

}, undefined, (error) => {
    console.error("Error cargando GLB:", error);
});


// 7. LÓGICA DE MOVIMIENTO DE CÁMARA
function moveToObject(object, objectWidth = 2) {
    const targetPos = new THREE.Vector3();
    // Obtener posición global 
    object.getWorldPosition(targetPos);
    
    // Definir el offset para mirar desde arriba 
    let offset;
    if (object.name === 'Displayipad') {
        offset = new THREE.Vector3(0, 0, -3); 
    } else {
        // Para otros objetos, mantenemos el comportamiento original
        offset = new THREE.Vector3(0, 0, Math.max(2, objectWidth * 0.8));
    }
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
   
    const targetObj = clickableObjects.find(obj => obj.name === targetName);
    
    if(targetObj) {
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