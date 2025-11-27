import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ThreeMeshUI from 'three-mesh-ui';

// --- CONFIGURACIÓN DE FUENTES ---
const FONT_JSON = 'https://unpkg.com/three-mesh-ui/examples/assets/fonts/msdf/roboto/regular.json';
const FONT_IMAGE = 'https://unpkg.com/three-mesh-ui/examples/assets/fonts/msdf/roboto/regular.png';

// 1. CONFIGURACIÓN INICIAL
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 1.9;

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

// Configuración de tamaño para cada pantalla (ajusta estos valores según tu modelo)
const screenConfig = {
    'DisplayMonitor': { 
        title: "Sobre Mí", 
        color: 0x00d2ff,
        width: 5.9,   // Ajusta según el tamaño real en tu modelo
        height: 2.3   // Ajusta según el tamaño real en tu modelo
    },
    'Displayipad': { 
        title: "Proyectos", 
        color: 0xff9900,
        width: .5,
        height: 0.7
    },
    'Displaypared': { 
        title: "Habilidades", 
        color: 0x00ff88,
        width: 14.1,
        height: 8.6
    },
    'Displaytv': { 
        title: "Contacto", 
        color: 0xff3366,
        width: 3.4,
        height: 7.7
    }
};

// Contenido para cada pantalla
const screenContent = {
    'DisplayMonitor': { 
        buildUI: (container) => {
            container.add(
                new ThreeMeshUI.Text({
                    content: "Desarrollador Creativo\n\n",
                    fontSize: 0.08
                }),
                new ThreeMeshUI.Text({
                    content: "Me especializo en crear experiencias web inmersivas, combinando diseño 3D y lógica de programación.",
                    fontSize: 0.045
                })
            );
        }
    },
    'Displayipad': { 
        buildUI: (container) => {
            const row = new ThreeMeshUI.Block({
                width: 0.9,
                height: 0.5,
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundOpacity: 0
            });
            
            const p1 = new ThreeMeshUI.Block({ 
                width: 0.4, 
                height: 0.4, 
                backgroundColor: new THREE.Color(0x333333),
                backgroundOpacity: 0.7,
                padding: 0.02,
                borderRadius: 0.02
            });
            p1.add(
                new ThreeMeshUI.Text({ content: "E-Commerce 3D\n", fontSize: 0.04 }),
                new ThreeMeshUI.Text({ content: "Tienda interactiva", fontSize: 0.025 })
            );
            
            const p2 = new ThreeMeshUI.Block({ 
                width: 0.4, 
                height: 0.4, 
                backgroundColor: new THREE.Color(0x333333),
                backgroundOpacity: 0.7,
                padding: 0.02,
                borderRadius: 0.02
            });
            p2.add(
                new ThreeMeshUI.Text({ content: "App Finanzas\n", fontSize: 0.04 }),
                new ThreeMeshUI.Text({ content: "Dashboard Realtime", fontSize: 0.025 })
            );

            row.add(p1, p2);
            container.add(row);
        }
    },
    'Displaypared': { 
        buildUI: (container) => {
            const skills = ["JavaScript (ES6+)", "Three.js / WebGL", "HTML5 & CSS3", "Blender 3D", "React / Vue.js", "Node.js"];
            
            skills.forEach(skill => {
                const item = new ThreeMeshUI.Block({
                    width: 0.9,
                    height: 0.08,
                    margin: 0.01,
                    backgroundColor: new THREE.Color(0xffffff),
                    backgroundOpacity: 0.1,
                    justifyContent: 'center',
                    borderRadius: 0.02
                });
                item.add(new ThreeMeshUI.Text({ 
                    content: skill, 
                    fontSize: 0.035,
                    fontColor: new THREE.Color(0xffffff)
                }));
                container.add(item);
            });
        }
    },
    'Displaytv': { 
        buildUI: (container) => {
            container.add(
                new ThreeMeshUI.Text({ 
                    content: "¡Hablemos!\n\n", 
                    fontSize: 0.1,
                    fontColor: new THREE.Color(0xff3366)
                }),
                new ThreeMeshUI.Text({ 
                    content: "social@miportafolio.com\n", 
                    fontSize: 0.06 
                }),
                new ThreeMeshUI.Text({ 
                    content: "Disponible para freelance", 
                    fontSize: 0.04 
                })
            );
        }
    }
};

// 4. FUNCIÓN MEJORADA PARA CREAR UI
function createScreenUI(mesh, key) {
    const config = screenConfig[key];
    const content = screenContent[key];
    
    if (!config || !content) {
        console.warn(`No config found for: ${key}`);
        return;
    }

    // Usar dimensiones configuradas
    const width = config.width;
    const height = config.height;

    // Crear contenedor principal
    const container = new ThreeMeshUI.Block({
        width: width,
        height: height,
        padding: 0.05,
        fontFamily: FONT_JSON,
        fontTexture: FONT_IMAGE,
        backgroundColor: new THREE.Color(0x000000),
        backgroundOpacity: 0.9,
        justifyContent: 'start',
        borderRadius: 0.03,
        textAlign: 'center'
    });

    // Agregar al mesh y posicionar
    mesh.add(container);
    
    // Posicionar ligeramente hacia adelante para que se vea sobre la pantalla
    container.position.set(0, 0, 0.02);

    // Header
    const header = new ThreeMeshUI.Block({
        width: '100%',
        height: 0.15,
        justifyContent: 'center',
        backgroundOpacity: 0,
        margin: 0.02
    });
    
    header.add(
        new ThreeMeshUI.Text({
            content: config.title,
            fontSize: 0.08,
            fontColor: new THREE.Color(config.color)
        })
    );
    container.add(header);

    // Línea decorativa
    const line = new ThreeMeshUI.Block({
        width: '90%',
        height: 0.005,
        backgroundColor: new THREE.Color(config.color),
        backgroundOpacity: 0.7,
        margin: 0.02
    });
    container.add(line);

    // Contenido principal
    const contentBody = new ThreeMeshUI.Block({
        width: '100%',
        height: 0.7,
        justifyContent: 'center',
        backgroundOpacity: 0,
        padding: 0.02
    });
    container.add(contentBody);

    // Construir contenido específico
    content.buildUI(contentBody);
}

// 5. CARGAR MODELO
const loader = new GLTFLoader();
loader.load('assets/Portafolio2.glb', (gltf) => {
    model = gltf.scene;
    
    model.traverse((child) => {
        if (child.isMesh || child.type === "Object3D") {
            child.castShadow = true;
            child.receiveShadow = true;

            // Identificar Room
            if (child.name.includes('room') || child.name === 'room') {
                roomMesh = child;
                child.material = child.material.clone(); 
            }

            // Mapeo de empties a pantallas
            const emptyToKey = {
                "monitor-empty": "DisplayMonitor",
                "ipad-empty": "Displayipad", 
                "pared-empty": "Displaypared",
                "tv-empty": "Displaytv"
            };

            // Crear UI para empties
            for (const emptyName in emptyToKey) {
                if (child.name === emptyName || child.name.includes(emptyName)) {
                    const key = emptyToKey[emptyName];
                    clickableObjects.push(child);
                    
                    // Pequeño delay para asegurar que el mesh esté listo
                    setTimeout(() => {
                        createScreenUI(child, key);
                    }, 100);
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

// 6. INTERACCIÓN MEJORADA
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (event.target.closest('.nav-bar')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        let targetObj = intersects[0].object;
        
        // Subir en la jerarquía hasta encontrar el objeto clickeable original
        while (targetObj && !clickableObjects.includes(targetObj) && targetObj.parent) {
            targetObj = targetObj.parent;
        }

        if (targetObj && clickableObjects.includes(targetObj)) {
            moveToObject(targetObj);
        }
    }
});

function moveToObject(mesh) {
    const targetPos = new THREE.Vector3();
    mesh.getWorldPosition(targetPos);
    
    const offset = new THREE.Vector3(0, 0, 2.5);
    offset.applyQuaternion(mesh.getWorldQuaternion(new THREE.Quaternion()));
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

// 7. EVENT LISTENERS
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

window.addEventListener('navigateToSection', (e) => {
    const targetName = e.detail.target;
    const targetMesh = clickableObjects.find(obj => 
        obj.name && obj.name.toLowerCase().includes(targetName.toLowerCase())
    );
    if(targetMesh) moveToObject(targetMesh);
});

window.addEventListener('resetViewRequest', resetCamera);

// 8. LOOP PRINCIPAL
function animate() {
    requestAnimationFrame(animate);
    
    ThreeMeshUI.update();
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});