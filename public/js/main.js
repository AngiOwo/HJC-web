// ===== MENÚ HAMBURGUESA =====
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            menuToggle.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                menuToggle.classList.remove('active');
            });
        });
    }

    // ===== FORMULARIO DE CONTACTO (ENVÍO A WHATSAPP) =====
    const form = document.getElementById('formulario-contacto');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            // Validar que no estén vacíos
            if (!nombre || !correo || !mensaje) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            // Validación básica de correo
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexCorreo.test(correo)) {
                alert('Por favor, ingresa un correo válido.');
                return;
            }

            // Armamos el texto que te llegará a tu WhatsApp
            const texto = `¡Hola HJC! Soy *${nombre}*.\nMi correo es: ${correo}\n\n*Mensaje:*\n${mensaje}`;
            
            // Número de WhatsApp (52 = México, seguido de tus 10 dígitos)
            const telefono = "525554735491";
            
            // Abrimos WhatsApp en una nueva pestaña con el mensaje listo
            window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
            
            // Limpiamos el formulario después de enviar
            form.reset();
        });
    }

    // ===== SCROLL SUAVE PARA ANCLAS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
