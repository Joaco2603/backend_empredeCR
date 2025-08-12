import { Router } from "express";
import Announcement from "../models/Announcement.js";

const router = Router();

// Create announcement route
router.post('/', async (req, res) => {
  try {
    // 1. Validate announcement data
    const { name, description, address, date, type = 'annoucement', ...extraData } = req.body;

    // 2. Create announcement function
    const announcement = await Announcement.create({
      name,
      description,
      date,
      address,
      type,
      isActive: true
    });

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastAnnouncementCreated = announcement.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    console.log(error)
    res.render('announcement', { 
      error: 'Error al crear el anuncio',
      formData: req.body 
    });
  }
});

// Update announcement route
router.put('/', async (req, res) => {
  try {
    // 1. Validate announcement data
    const { id, name, description, date, address, organizer, type, isActive, ...extraData } = req.body;

    // 2. Update announcement function
    const announcement = await Announcement.findByIdAndUpdate(id, {
      name,
      description,
      date,
      address,
      organizer,
      type,
      isActive
    }, { new: true });

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastAnnouncementUpdated = announcement.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('announcement', { 
      error: 'Error al actualizar el anuncio',
      formData: req.body 
    });
  }
});

// Delete announcement route
router.delete('/', async (req, res) => {
  try {
    // 1. Validate announcement ID
    const { id } = req.body;

    // 2. Delete announcement function
    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      throw new Error('Anuncio no encontrado');
    }

    // 3. Update session if needed
    if (req.session.user && req.session.user.lastAnnouncementCreated === id) {
      delete req.session.user.lastAnnouncementCreated;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('announcement', { 
      error: 'Error al eliminar el anuncio',
      formData: req.body 
    });
  }
});

// Get all announcements route
router.get('/', async (req, res) => {
  try {
    // 1. Get all announcements
    const announcements = await Announcement.find({}).populate('organizer');
    
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
    const announcements = await Announcement.find({ isActive: true });
    
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


// Get announcements by organizer route
router.get('/organizer-announcements/:organizerId', async (req, res) => {
  try {
    // 1. Get announcements by organizer ID
    const announcements = await Announcement.find({ 
      organizer: req.params.organizerId,
      isActive: true 
    }).populate('organizer');
    
    // 2. Render organizer announcements page
    res.render('organizer-announcements', { 
      announcements,
      user: req.user 
    });
  } catch (error) {
    res.render('organizer-announcements', { 
      error: 'Error al cargar los anuncios del organizador',
      announcements: [],
      user: req.user 
    });
  }
});

// Get announcements by type route
router.get('/announcements-by-type/:type', async (req, res) => {
  try {
    // 1. Get announcements by type
    const announcements = await Announcement.find({ 
      type: req.params.type,
      isActive: true 
    }).populate('organizer');
    
    // 2. Render announcements by type page
    res.render('announcements-by-type', { 
      announcements,
      type: req.params.type,
      user: req.user 
    });
  } catch (error) {
    res.render('announcements-by-type', { 
      error: 'Error al cargar los anuncios por tipo',
      announcements: [],
      type: req.params.type,
      user: req.user 
    });
  }
});

export default router;
