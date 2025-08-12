import { Router } from "express";
import Announcement from "../models/Announcement.js";
import multer from "multer";

const upload = multer({ 
  dest: 'uploads/' // Directorio temporal para archivos subidos
});

const router = new Router();

// Create announcement route
router.post('/', upload.single('img'), async (req, res) => {
  try {
    // 1. Validar datos del anuncio
    const { name, description, address, date, type = 'event' } = req.body;

    // 2. Crear anuncio con la referencia a la imagen
    await Announcement.create({
      name,
      description,
      date,
      address,
      type,
      isActive: true,
      img: req.file ? `/uploads/${req.file.filename}` : null // Guarda la ruta de la imagen
    });

    // ... resto de tu código ...
    res.redirect('http://localhost:8080/event');
  } catch (error) {
    console.error('Error:', error);
    res.render('advertisement', {
      error: 'Error al crear el anuncio',
      formData: req.body
    });
  }
});

// Get active announcements route
router.get('/active', async (req, res) => {
  try {
    // 1. Get only active announcements
    const announcements = await Announcement.find({ isActive: true, type: 'event' });

    res.status(200).json(announcements);
  } catch (error) {
    console.log(error);
    res.render('advertisement', {
      error: 'Error al cargar los anuncios activos',
      announcements: [],
      user: req.user
    });
  }
});

export default router;