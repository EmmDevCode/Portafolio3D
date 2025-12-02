// --- SCRIPT PARA LÓGICA DE INTERFAZ (UI) ---

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ANIMACIÓN DE INTRODUCCIÓN (GSAP) ---
    const tl = gsap.timeline();

    tl.to(".loader-text", {
        duration: 1.5,
        opacity: 1,
        y: 0,
        ease: "power3.out" // Entrada suave
    })
    .to(".loader-text", {
        duration: 0.5,
        opacity: 0,
        y: -20, 
        ease: "power2.in",
        delay: 0.8 
    })
    .to("#loading-screen", {
        duration: 1.2,
        yPercent: -100, 
        ease: "expo.inOut", 
        onComplete: () => {
            
            const loader = document.getElementById('loading-screen');
            if(loader) loader.style.display = 'none';
        }
    }, "-=0.1");
    
    
    // --- 2. (Auto-Theme) ---
    const themeBtn = document.getElementById('theme-btn');
    const icon = themeBtn.querySelector('i');

    // Función Centralizada para aplicar temas
    function setTheme(isLightMode) {
        if (isLightMode) {
            document.body.classList.add('light-mode');
            icon.classList.replace('fa-sun', 'fa-moon'); // Icono Luna
        } else {
            document.body.classList.remove('light-mode');
            icon.classList.replace('fa-moon', 'fa-sun'); // Icono Sol
        }

        // Avisar a Three.js del cambio
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { isLightMode: isLightMode } 
        }));
    }

    
    const hour = new Date().getHours();
    // "Día" entre las 6:00 AM y las 6:00 PM
    const isDayTime = hour >= 6 && hour < 18;
    
    // Aplicar el tema inicial inmediatamente
    setTheme(isDayTime);

    // Listener del botón (Toggle manual)
    themeBtn.addEventListener('click', () => {
        const currentIsLight = document.body.classList.contains('light-mode');
        setTheme(!currentIsLight);
    });


    // --- 3. BOTONES DE CIERRE (MODALES) ---
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
            window.dispatchEvent(new Event('resetViewRequest'));
        });
    });


    // --- 4. BARRA DE NAVEGACIÓN ---
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            if (target) {
                window.dispatchEvent(new CustomEvent('navigateToSection', { detail: { target: target } }));
            } else if (item.id === 'reset-view-btn') {
                window.dispatchEvent(new Event('resetViewRequest'));
            }
        });
    });

}); 



window.showHtmlContent = (contentId) => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(contentId);
    if(el) el.classList.add('active');
};

window.hideHtmlContent = () => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.remove('active'));
};