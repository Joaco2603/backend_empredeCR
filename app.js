import { fileURLToPath } from 'url';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Archivos estáticos
app.use('/css', express.static(path.join(__dirname, 'src', 'views', 'css')));
app.use('/js', express.static(path.join(__dirname, 'src', 'views', 'js')));
app.use('/imgs', express.static(path.join(__dirname, 'src', 'views', 'imgs')));

// Middleware para rutas dinámicas
app.use(async (req, res, next) => {
  try {
    // Obtener el nombre del archivo desde la URL
    let viewName = req.path.slice(1); // Elimina la barra inicial

    // Si es la raíz, usar 'index'
    if (viewName === '') viewName = 'index';

    // Construir la ruta completa del archivo EJS
    const ejsPath = path.join(app.get('views'), `${viewName}.html`);

    // Verificar si existe el archivo EJS
    await fs.access(ejsPath, fs.constants.F_OK); // Use fs.constants.F_OK to check for existence

    // Renderizar la vista si existe
    res.render(viewName);
  } catch (error) {
    console.error(`Error in dynamic view middleware for path ${req.path}:`, error);
    // Si no encuentra el archivo o hay otro error, pasar al siguiente middleware
    next();
  }
});

// Manejo de errores (404)
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página no encontrada' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});