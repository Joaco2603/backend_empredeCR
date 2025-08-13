import { Router } from "express";
import Announcement from "../models/Announcement.js";
import multer from "multer";

const upload = multer({
  dest: 'uploads/'
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
      img: req.file ? `/uploads/${req.file.filename}` : undefined // Guarda la ruta de la imagen
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: 'No announcement found with that ID.' });
    }

    res.status(200).json({ message: 'Announcement deleted successfully.', deletedAnnouncement });
  } catch (error) {
    console.error(error); // It's good practice to log the error
    res.status(500).json({ message: 'An error occurred while trying to delete the announcement.', error });
  }
});

// Create announcement route
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

    res.redirect('http://localhost:8080/event');
  } catch (error) {
    console.log(error);
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

router.get('/update/:id', async(req, res) => {
  try {
    const { id } = req.params;
    const event = await Announcement.findById(id);
    event.contact = event.phone;
    if (!event) {
      return res.status(404).send('announcement no encontrado');
    }
    res.render('eventForm', { event });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});

export default router;