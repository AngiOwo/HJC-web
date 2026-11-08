// ===== FILTROS DEL CATÁLOGO =====
document.addEventListener('DOMContentLoaded', () => {
    const filtros = document.querySelectorAll('.filtro-btn');
    const productos = document.querySelectorAll('#grid-productos .card-producto');

    if (filtros.length === 0 || productos.length === 0) return;

    filtros.forEach(boton => {
        boton.addEventListener('click', () => {
            // Activar botón
            filtros.forEach(b => b.classList.remove('active'));
            boton.classList.add('active');

            const categoria = boton.dataset.categoria;

            // Mostrar / ocultar productos
            productos.forEach(producto => {
                if (categoria === 'todos' || producto.dataset.categoria === categoria) {
                    producto.style.display = 'block';
                    producto.style.animation = 'fadeIn 0.4s ease';
                } else {
                    producto.style.display = 'none';
                }
            });
        });
    });
});

// Animación fadeIn (se puede agregar en CSS)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);