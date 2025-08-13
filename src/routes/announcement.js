import { Router } from "express";
import multer from 'multer';
import Announcement from "../models/Announcement.js";

const upload = multer({
  dest: 'uploads/' // Directorio temporal para archivos subidos
});

const router = Router();

// Create announcement route
router.post('/', upload.single('img'), async (req, res) => {
  try {
    // 1. Validar datos del anuncio
    const { name, description, address, date, type = 'announcement' } = req.body;

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

    console.log('creado anuncio')

    // ... resto de tu código ...
    res.redirect('http://localhost:8080/advertisement');
  } catch (error) {
    console.error('Error:', error);
    res.render('advertisement', {
      error: 'Error al crear el anuncio',
      formData: req.body
    });
  }
});


// Update announcement route
router.post('/update/:id', upload.single('img'), async (req, res) => {
  try {
    const id = req.params.id;
    // 1. Validate announcement data
    const { name, description, date, address, organizer, type, isActive, ...extraData } = req.body;

    // 2. Prepara los datos a actualizar
    const updateData = {
      name: name !== undefined ? name : undefined,
      description: description !== undefined ? description : undefined,
      date: date !== undefined ? date : undefined,
      address: address !== undefined ? address : undefined,
      organizer: organizer !== undefined ? address : undefined,
      type: type !== undefined ? type : undefined,
      isActive: true
    };

    // Si se subió una nueva imagen, actualiza la propiedad img
    if (req.file) {
      updateData.img = `/uploads/${req.file.filename}`;
    }

    // 3. Update announcement function
    const announcement = await Announcement.findByIdAndUpdate(id, updateData, { new: true });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    // 4. Set session data if needed
    if (req.session.user) {
      req.session.user.lastAnnouncementUpdated = announcement.id;
    }

    res.redirect('http://localhost:8080/advertisement');
  } catch (error) {
    console.log(error);
  }
});


// Delete announcement route
router.delete('/:id', async (req, res) => {
  try {
    // 1. Validate announcement ID
    const { id } = req.params; // <-- Cambiado de req.body a req.params

    // 2. Delete announcement function
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    // 3. Update session if needed
    if (req.session.user && req.session.user.lastAnnouncementCreated === id) {
      delete req.session.user.lastAnnouncementCreated;
    }

    // 4. Enviar respuesta JSON de éxito
    res.status(200).json({ message: 'Anuncio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error al eliminar el anuncio'
    });
  }
});


// Get all announcements route
router.get('/', async (req, res) => {
  try {
    // 1. Get all announcements
    const announcements = await Announcement.find({});

    // 2. Render announcements page
    res.render('announcements', {
      announcements,
      user: req.user
    });
  } catch (error) {
    res.render('announcements', {
      error: 'Error al cargar los anuncios',
      announcements: [],
      user: req.user
    });
  }
});
// Get active announcements route
router.get('/active', async (req, res) => {
  try {
    // 1. Get only active announcements
    const announcements = await Announcement.find({ isActive: true, type: 'announcement' });

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

// Ruta para editar (CON transport)
router.get('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).send('Anuncio no encontrado');
    }
    res.render('advertisementForm', { announcement });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});


export default router;
