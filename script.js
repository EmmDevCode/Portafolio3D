// --- SCRIPT PARA LÓGICA DE INTERFAZ (UI) ---

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Manejo del Tema (Oscuro/Claro)
    const themeBtn = document.getElementById('theme-btn');
    const icon = themeBtn.querySelector('i');
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        // Cambiar icono
        if (document.body.classList.contains('light-mode')) {
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            icon.classList.replace('fa-moon', 'fa-sun');
        }

        // Despachar evento personalizado para que Three.js se entere
        const event = new CustomEvent('themeChanged', { 
            detail: { isLightMode: document.body.classList.contains('light-mode') } 
        });
        window.dispatchEvent(event);
    });

    // 2. Botones de cierre en modales
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Ocultar todos los modales
            document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
            
            // Avisar a Three.js que regrese la cámara
            window.dispatchEvent(new Event('resetViewRequest'));
        });
    });

    // 3. Botones de la barra de navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            if (target) {
                // Disparar evento para que Three.js mueva la cámara
                const event = new CustomEvent('navigateToSection', { detail: { target: target } });
                window.dispatchEvent(event);
            } else if (item.id === 'reset-view-btn') {
                window.dispatchEvent(new Event('resetViewRequest'));
            }
        });
    });

});

// Función auxiliar global para mostrar el contenido HTML (llamada desde Three.js)
window.showHtmlContent = (contentId) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(contentId);
    if(el) el.classList.add('active');
};

window.hideHtmlContent = () => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
};

