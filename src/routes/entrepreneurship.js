import { Router } from "express";
import Entrepreneurship from "../models/Entrepreneurship.js";

const router = Router();

// Create entrepreneurship route
router.post('/create-entrepreneurship', async (req, res) => {
  try {
    // 1. Validate entrepreneurship data
    const { name, description, phone, address, user, isActive, ...extraData } = req.body;

    // 2. Create entrepreneurship function
    const entrepreneurship = await Entrepreneurship.create({
      name,
      description,
      phone,
      address,
      user,
      isActive: isActive !== undefined ? isActive : true
    });

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastEntrepreneurshipCreated = entrepreneurship.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('entrepreneurship', { 
      error: 'Error al crear el emprendimiento',
      formData: req.body 
    });
  }
});

// Update entrepreneurship route
router.put('/update-entrepreneurship', async (req, res) => {
  try {
    // 1. Validate entrepreneurship data
    const { id, name, description, phone, address, user, isActive, ...extraData } = req.body;

    // 2. Update entrepreneurship function
    const entrepreneurship = await Entrepreneurship.findByIdAndUpdate(id, {
      name,
      description,
      phone,
      address,
      user,
      isActive
    }, { new: true });

    if (!entrepreneurship) {
      throw new Error('Emprendimiento no encontrado');
    }

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastEntrepreneurshipUpdated = entrepreneurship.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('entrepreneurship', { 
      error: 'Error al actualizar el emprendimiento',
      formData: req.body 
    });
  }
});

// Delete entrepreneurship route
router.delete('/delete-entrepreneurship', async (req, res) => {
  try {
    // 1. Validate entrepreneurship ID
    const { id } = req.body;

    // 2. Delete entrepreneurship function
    const entrepreneurship = await Entrepreneurship.findByIdAndDelete(id);

    if (!entrepreneurship) {
      throw new Error('Emprendimiento no encontrado');
    }

    // 3. Update session if needed
    if (req.session.user && req.session.user.lastEntrepreneurshipCreated === id) {
      delete req.session.user.lastEntrepreneurshipCreated;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('entrepreneurship', { 
      error: 'Error al eliminar el emprendimiento',
      formData: req.body 
    });
  }
});

// Get all entrepreneurships route
router.get('/entrepreneurships', async (req, res) => {
  try {
    // 1. Get all entrepreneurships
    const entrepreneurships = await Entrepreneurship.find({}).populate('user');
    
    // 2. Render entrepreneurships page
    res.render('entrepreneurships', { 
      entrepreneurships,
      user: req.user 
    });
  } catch (error) {
    res.render('entrepreneurships', { 
      error: 'Error al cargar los emprendimientos',
      entrepreneurships: [],
      user: req.user 
    });
  }
});

// Get entrepreneurship by ID route
router.get('/entrepreneurship/:id', async (req, res) => {
  try {
    // 1. Get entrepreneurship by ID
    const entrepreneurship = await Entrepreneurship.findById(req.params.id).populate('user');
    
    if (!entrepreneurship) {
      throw new Error('Emprendimiento no encontrado');
    }
    
    // 2. Render entrepreneurship detail page
    res.render('entrepreneurship-detail', { 
      entrepreneurship,
      user: req.user 
    });
  } catch (error) {
    res.render('entrepreneurship-detail', { 
      error: 'Error al cargar el emprendimiento',
      entrepreneurship: null,
      user: req.user 
    });
  }
});

// Get active entrepreneurships route
router.get('/active-entrepreneurships', async (req, res) => {
  try {
    // 1. Get only active entrepreneurships
    const entrepreneurships = await Entrepreneurship.find({ isActive: true }).populate('user');
    
    // 2. Render active entrepreneurships page
    res.render('active-entrepreneurships', { 
      entrepreneurships,
      user: req.user 
    });
  } catch (error) {
    res.render('active-entrepreneurships', { 
      error: 'Error al cargar los emprendimientos activos',
      entrepreneurships: [],
      user: req.user 
    });
  }
});

// Get entrepreneurships by user route
router.get('/user-entrepreneurships/:userId', async (req, res) => {
  try {
    // 1. Get entrepreneurships by user ID
    const entrepreneurships = await Entrepreneurship.find({ 
      user: req.params.userId,
      isActive: true 
    }).populate('user');
    
    // 2. Render user entrepreneurships page
    res.render('user-entrepreneurships', { 
      entrepreneurships,
      user: req.user 
    });
  } catch (error) {
    res.render('user-entrepreneurships', { 
      error: 'Error al cargar los emprendimientos del usuario',
      entrepreneurships: [],
      user: req.user 
    });
  }
});

export default router;
