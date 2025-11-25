import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ThreeMeshUI from 'three-mesh-ui';

// --- CONFIGURACIÓN DE FUENTES (Assets públicos para que funcione ya) ---
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

// Definimos qué contenido va en cada pantalla
const screenContent = {
    'DisplayMonitor': { 
        title: "Sobre Mí", 
        color: 0x00d2ff,
        buildUI: (container) => {
            container.add(
                new ThreeMeshUI.Text({
                    content: "Desarrollador Creativo\n\n",
                    fontSize: 0.05
                }),
                new ThreeMeshUI.Text({
                    content: "Me especializo en crear experiencias web inmersivas, combinando diseño 3D y lógica de programación.",
                    fontSize: 0.035
                })
            );
        }
    },
    'Displayipad': { 
        title: "Proyectos", 
        color: 0xff9900,
        buildUI: (container) => {
            // Fila para proyectos
            const row = new ThreeMeshUI.Block({
                width: container.width * 0.9,
                height: container.height * 0.6,
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundOpacity: 0
            });
            
            // Proyecto 1
            const p1 = new ThreeMeshUI.Block({ width: '48%', height: '100%', backgroundColor: new THREE.Color(0x333333) });
            p1.add(new ThreeMeshUI.Text({ content: "E-Commerce 3D\n", fontSize: 0.04 }), new ThreeMeshUI.Text({ content: "Tienda interactiva", fontSize: 0.025 }));
            
            // Proyecto 2
            const p2 = new ThreeMeshUI.Block({ width: '48%', height: '100%', backgroundColor: new THREE.Color(0x333333) });
            p2.add(new ThreeMeshUI.Text({ content: "App Finanzas\n", fontSize: 0.04 }), new ThreeMeshUI.Text({ content: "Dashboard Realtime", fontSize: 0.025 }));

            container.add(row);
            row.add(p1, p2);
        }
    },
    'Displaypared': { 
        title: "Habilidades", 
        color: 0x00ff88,
        buildUI: (container) => {
            const skills = ["JavaScript (ES6+)", "Three.js / WebGL", "HTML5 & CSS3", "Blender 3D"];
            skills.forEach(skill => {
                const item = new ThreeMeshUI.Block({
                    width: '100%',
                    height: 0.05,
                    margin: 0.01,
                    backgroundColor: new THREE.Color(0xffffff),
                    backgroundOpacity: 0.1,
                    justifyContent: 'center'
                });
                item.add(new ThreeMeshUI.Text({ content: skill, fontSize: 0.03 }));
                container.add(item);
            });
        }
    },
    'Displaytv': { 
        title: "Contacto", 
        color: 0xff3366,
        buildUI: (container) => {
            container.add(
                new ThreeMeshUI.Text({ content: "¡Hablemos!\n\n", fontSize: 0.08 }),
                new ThreeMeshUI.Text({ content: "social@miportafolio.com\n", fontSize: 0.04 }),
                new ThreeMeshUI.Text({ content: "Disponible para freelance", fontSize: 0.03 })
            );
        }
    }
};

// 4. FUNCIÓN PARA CREAR LA UI EN CADA PANTALLA
function createScreenUI(mesh, key) {
    // 1. Obtener dimensiones de la pantalla original
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Pequeño ajuste para que quepa dentro del marco
    const width = size.x * 0.9;
    const height = size.y * 0.9;

    // 2. Crear el Contenedor Principal
    const container = new ThreeMeshUI.Block({
        width: width,
        height: height,
        padding: 0.05,
        fontFamily: FONT_JSON,
        fontTexture: FONT_IMAGE,
        backgroundColor: new THREE.Color(0x000000),
        backgroundOpacity: 0.8,
        justifyContent: 'start',
        borderRadius: 0.05
    });

    // 3. Posicionar el contenedor SOBRE la malla
    // Importante: Lo agregamos como hijo para que rote/mueva con la pantalla
    mesh.add(container);
    
    // Ajuste de posición: Lo movemos un pelín hacia adelante en Z (o Y dependiendo de la orientación local)
    // Asumiremos que el eje Z local del mesh apunta hacia afuera de la pantalla. 
    // Si sale al revés o de lado, ajusta aquí (ej: container.rotation.y = Math.PI).
    container.position.set(0, 0, 0.01); 

    // 4. Header Común
    const data = screenContent[key];
    
    const header = new ThreeMeshUI.Block({
        width: '100%',
        height: height * 0.2,
        justifyContent: 'center',
        backgroundOpacity: 0
    });
    
    header.add(
        new ThreeMeshUI.Text({
            content: data.title,
            fontSize: 0.06,
            fontColor: new THREE.Color(data.color)
        })
    );
    container.add(header);

    // 5. Contenido Específico
    const contentBody = new ThreeMeshUI.Block({
        width: '100%',
        height: height * 0.75, // El resto del espacio
        justifyContent: 'center',
        backgroundOpacity: 0
    });
    container.add(contentBody);

    // Llamamos a la función constructora específica
    if(data.buildUI) data.buildUI(contentBody);
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

            // === Ajuste para tus empties =========================================
// Mapeo: EMPTY → KEY de screenContent
const emptyToKey = {
    "monitor-empty": "DisplayMonitor",
    "ipad-empty": "Displayipad",
    "pared-empty": "Displaypared",
    "tv-empty": "Displaytv"
};

// Detectamos empties y les colocamos UI
for (const emptyName in emptyToKey) {
    if (child.name === emptyName) {
        const key = emptyToKey[emptyName];
        clickableObjects.push(child);
        createScreenUI(child, key);
    }
}
        }
    });

    scene.add(model);
    
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

// 6. INTERACCIÓN (RAYCASTER)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.nav-bar')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        // En lugar de buscar por nombre exacto, buscamos el padre si tocamos la UI
        let targetObj = intersects[0].object;
        
        // Si clickeamos texto o fondo de UI, subimos hasta encontrar el mesh pantalla
        while(!screenContent[targetObj.name] && targetObj.parent) {
             // Pequeño hack: intentamos ver si el nombre del padre matchea alguna key
             let found = false;
             for(const key in screenContent) {
                 if(targetObj.name.includes(key)) { found = true; break; }
             }
             if(!found) targetObj = targetObj.parent;
             else break;
        }

        // Navegamos al objeto
        const objectName = targetObj.name;
        for (const key in screenContent) {
            if (objectName.includes(key)) {
                moveToObject(targetObj);
                break;
            }
        }
    }
});

function moveToObject(mesh) {
    const targetPos = new THREE.Vector3();
    mesh.getWorldPosition(targetPos);
    
    const offset = new THREE.Vector3(0, 0, 4); // Distancia de zoom
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
        // NOTA: Ya no llamamos a showHtmlContent porque la UI ya está ahí
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

// 7. LISTENERS
window.addEventListener('themeChanged', (e) => {
    const isLight = e.detail.isLightMode;
    const bgColor = isLight ? 0xf0f0f0 : 0x1a1a1a;
    scene.background.set(bgColor);
    if (roomMesh) {
        const roomColor = isLight ? 0xffffff : 0x222222;
        gsap.to(roomMesh.material.color, { r: new THREE.Color(roomColor).r, g: new THREE.Color(roomColor).g, b: new THREE.Color(roomColor).b, duration: 0.5 });
    }
});

window.addEventListener('navigateToSection', (e) => {
    // Buscar el mesh en clickableObjects que coincida con el target
    const targetName = e.detail.target;
    const targetMesh = clickableObjects.find(obj => obj.name.includes(targetName));
    if(targetMesh) moveToObject(targetMesh);
});

window.addEventListener('resetViewRequest', () => resetCamera());

// 8. LOOP PRINCIPAL
function animate() {
    requestAnimationFrame(animate);
    
    // IMPORTANTE: Actualizar ThreeMeshUI
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