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

    // ===== FORMULARIO DE CONTACTO =====
    const form = document.getElementById('formulario-contacto');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

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

            // Simulación de envío (aquí se conectaría con backend o servicio de correo)
            alert(`¡Gracias, ${nombre}! Tu mensaje ha sido enviado. Te contactaremos pronto.`);
            form.reset();

            // Opción: redirigir a WhatsApp con el mensaje
            // const texto = `Hola, soy ${nombre}. ${mensaje} Mi correo: ${correo}`;
            // window.open(`https://wa.me/52XXXXXXXXXX?text=${encodeURIComponent(texto)}`, '_blank');
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