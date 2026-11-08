// ===== SERVIDOR HJC =====
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Aumentar el tiempo de espera del servidor a 5 minutos (para subidas pesadas)
app.timeout = 300000; 

// ===== ASEGURAR CARPETAS =====
const uploadsDir = path.join(__dirname, 'public', 'img', 'uploads');
const dataDir = path.join(__dirname, 'data');
const imagenesJson = path.join(dataDir, 'imagenes.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(imagenesJson)) fs.writeFileSync(imagenesJson, '[]');

// ===== MIDDLEWARES =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'hjc_secreto',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 horas
}));

// ===== USUARIOS =====
const usuarios = [
    {
        user: process.env.ADMIN_USER || 'julio',
        passHash: bcrypt.hashSync(process.env.ADMIN_PASS || 'HJC2026admin', 10),
        rol: 'admin'
    },
    {
        user: process.env.TEAM_USER || 'equipo',
        passHash: bcrypt.hashSync(process.env.TEAM_PASS || 'HJCequipo2026', 10),
        rol: 'equipo'
    }
];

// ===== MULTER: CONFIGURACIÓN DE SUBIDA =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const nombreLimpio = file.originalname
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9.\-]/g, '');
        
        let nombreFinal = nombreLimpio;
        let contador = 1;
        while (fs.existsSync(path.join(uploadsDir, nombreFinal))) {
            const ext = path.extname(nombreLimpio);
            const base = path.basename(nombreLimpio, ext);
            nombreFinal = `${base}-${contador}${ext}`;
            contador++;
        }
        cb(null, nombreFinal);
    }
});

const fileFilter = (req, file, cb) => {
    const tiposPermitidos = /jpeg|jpg|png|webp|gif/;
    const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeValido = tiposPermitidos.test(file.mimetype);
    if (extValida && mimeValido) return cb(null, true);
    cb(new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5 MB por archivo
        files: 10 // LÍMITE: Máximo 10 imágenes por lote para no colapsar el servidor
    } 
});

// ===== MIDDLEWARE: PROTEGER RUTAS =====
function requiereLogin(req, res, next) {
    if (req.session && req.session.user) return next();
    res.status(401).json({ ok: false, error: 'No autorizado. Inicia sesión.' });
}

// ===== RUTA RAÍZ PRINCIPAL =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ===== RUTAS DE AUTENTICACIÓN =====
app.post('/api/login', (req, res) => {
    const { user, pass } = req.body;
    const encontrado = usuarios.find(u => u.user === user);

    if (!encontrado || !bcrypt.compareSync(pass, encontrado.passHash)) {
        return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }

    req.session.user = { user: encontrado.user, rol: encontrado.rol };
    res.json({ ok: true, user: encontrado.user, rol: encontrado.rol });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
    if (req.session && req.session.user) return res.json({ ok: true, user: req.session.user });
    res.json({ ok: false });
});

// ===== RUTAS DE IMÁGENES =====
app.get('/api/imagenes', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(imagenesJson, 'utf8'));
        res.json({ ok: true, imagenes: data });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error leyendo imágenes' });
    }
});

app.post('/api/upload', requiereLogin, upload.array('imagenes', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ ok: false, error: 'No se recibieron imágenes' });
    }

    let data = JSON.parse(fs.readFileSync(imagenesJson, 'utf8'));
    let nuevasImagenes = [];

    req.files.forEach(file => {
        const registro = {
            id: Date.now().toString() + Math.floor(Math.random() * 1000),
            nombreOriginal: file.originalname,
            nombreArchivo: file.filename,
            url: `/img/uploads/${file.filename}`,
            tamaño: file.size,
            fecha: new Date().toISOString(),
            subidoPor: req.session.user.user
        };
        data.unshift(registro);
        nuevasImagenes.push(registro);
    });

    fs.writeFileSync(imagenesJson, JSON.stringify(data, null, 2));
    res.json({ ok: true, imagenes: nuevasImagenes });
});

app.delete('/api/imagenes/:id', requiereLogin, (req, res) => {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(imagenesJson, 'utf8'));
    const indice = data.findIndex(img => img.id === id);

    if (indice === -1) return res.status(404).json({ ok: false, error: 'Imagen no encontrada' });

    const imagen = data[indice];
    const rutaArchivo = path.join(uploadsDir, imagen.nombreArchivo);

    if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);

    data.splice(indice, 1);
    fs.writeFileSync(imagenesJson, JSON.stringify(data, null, 2));

    res.json({ ok: true });
});

// ===== MANEJO DE ERRORES =====
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ ok: false, error: 'Una imagen supera los 5 MB' });
        if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ ok: false, error: 'Máximo 10 imágenes por lote' });
        return res.status(400).json({ ok: false, error: err.message });
    }
    if (err) return res.status(400).json({ ok: false, error: err.message });
    next();
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
    console.log(`🚀 Servidor HJC corriendo en el puerto ${PORT}`);
});
