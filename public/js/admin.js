document.addEventListener('DOMContentLoaded', async () => {

    // ===== VERIFICAR SESIÓN =====
    const sesion = await fetch('/api/session').then(r => r.json());
    if (!sesion.ok) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('user-info').textContent =
        `👤 ${sesion.user.user} (${sesion.user.rol})`;

    // ===== LOGOUT =====
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = 'login.html';
    });

    // ===== REFERENCIAS =====
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const previewImg = document.getElementById('preview-img');
    const previewName = document.getElementById('preview-name');
    const btnUpload = document.getElementById('btn-upload');
    const btnCancel = document.getElementById('btn-cancel');
    const uploadStatus = document.getElementById('upload-status');
    const galeriaAdmin = document.getElementById('galeria-admin');

    let archivosActuales = [];

    // ===== SELECCIÓN DE ARCHIVOS =====
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            mostrarPreview(Array.from(e.target.files)); 
        }
    });

    // ===== DRAG & DROP =====
    ['dragenter', 'dragover'].forEach(ev =>
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        })
    );

    ['dragleave', 'drop'].forEach(ev =>
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        })
    );

    dropZone.addEventListener('drop', (e) => {
        const archivos = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (archivos.length > 0) mostrarPreview(archivos);
        else alert('Solo se permiten imágenes');
    });

    // ===== MOSTRAR VISTA PREVIA =====
    function mostrarPreview(archivos) {
        if (!Array.isArray(archivos)) {
            archivos = Array.from(archivos);
        }

        // Validar límite de 10 imágenes
        if (archivos.length > 10) {
            alert('⚠️ Por seguridad del servidor, solo puedes subir un máximo de 10 imágenes a la vez.\n\nSe seleccionarán las primeras 10.');
            archivos = archivos.slice(0, 10);
        }

        archivosActuales = archivos.filter(archivo => archivo.size <= 5 * 1024 * 1024);
        
        if (archivosActuales.length === 0) {
            alert('Ninguna imagen es válida o superan los 5 MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => { previewImg.src = e.target.result; };
        reader.readAsDataURL(archivosActuales[0]);

        if (archivosActuales.length === 1) {
            previewName.textContent = archivosActuales[0].name;
        } else {
            previewName.textContent = `${archivosActuales.length} imágenes seleccionadas (Vista previa: ${archivosActuales[0].name})`;
        }

        previewContainer.hidden = false;
        dropZone.hidden = true;
        uploadStatus.textContent = '';
    }

    // ===== CANCELAR =====
    btnCancel.addEventListener('click', () => {
        archivosActuales = [];
        previewContainer.hidden = true;
        dropZone.hidden = false;
        fileInput.value = '';
    });

    // ===== SUBIR MÚLTIPLES IMÁGENES =====
    btnUpload.addEventListener('click', async () => {
        if (archivosActuales.length === 0) return;

        const formData = new FormData();
        archivosActuales.forEach(archivo => {
            formData.append('imagenes', archivo);
        });

        uploadStatus.textContent = `Subiendo ${archivosActuales.length} imagen(es)...`;
        uploadStatus.className = 'upload-status';

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.ok) {
                uploadStatus.textContent = `✅ ${data.imagenes.length} imagen(es) subida(s) con éxito.`;
                uploadStatus.className = 'upload-status ok';
                archivosActuales = [];
                previewContainer.hidden = true;
                dropZone.hidden = false;
                fileInput.value = '';
                cargarGaleria();
            } else {
                uploadStatus.textContent = `❌ ${data.error}`;
                uploadStatus.className = 'upload-status error';
            }
        } catch (err) {
            uploadStatus.textContent = '❌ Error de conexión con el servidor';
            uploadStatus.className = 'upload-status error';
        }
    });

    // ===== CARGAR GALERÍA =====
    async function cargarGaleria() {
        try {
            const res = await fetch('/api/imagenes');
            const data = await res.json();

            if (!data.imagenes.length) {
                galeriaAdmin.innerHTML = '<p class="vacio">Aún no hay imágenes subidas.</p>';
                return;
            }

            galeriaAdmin.innerHTML = data.imagenes.map(img => `
                <div class="admin-img-card">
                    <button class="btn-eliminar" data-id="${img.id}" title="Eliminar">✕</button>
                    <img src="${img.url}" alt="${img.nombreOriginal}">
                    <div class="admin-img-info">
                        <p class="nombre" data-url="${img.url}" title="Clic para copiar URL">${img.nombreArchivo}</p>
                        <p class="fecha">${new Date(img.fecha).toLocaleString('es-MX')}</p>
                    </div>
                </div>
            `).join('');

            galeriaAdmin.querySelectorAll('.nombre').forEach(el => {
                el.addEventListener('click', () => {
                    navigator.clipboard.writeText(location.origin + el.dataset.url);
                    const original = el.textContent;
                    el.textContent = '✅ URL copiada';
                    setTimeout(() => el.textContent = original, 1500);
                });
            });

            galeriaAdmin.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('¿Eliminar esta imagen?')) return;
                    const res = await fetch(`/api/imagenes/${btn.dataset.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.ok) cargarGaleria();
                    else alert(data.error);
                });
            });

        } catch (err) {
            galeriaAdmin.innerHTML = '<p class="vacio">Error cargando imágenes.</p>';
        }
    }

    cargarGaleria();
});