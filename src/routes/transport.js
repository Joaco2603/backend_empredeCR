import { Router } from "express";
import Transport from "../models/Transport.js";

const router = Router();

// Create transport route
router.post('/create-transport', async (req, res) => {
  try {
    // 1. Validate transport data
    const { name, description, price, address, isActive, ...extraData } = req.body;

    // 2. Create transport function
    const transport = await Transport.create({
      name,
      description,
      price,
      address,
      isActive: isActive !== undefined ? isActive : true
    });

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastTransportCreated = transport.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('transport', { 
      error: 'Error al crear el transporte',
      formData: req.body 
    });
  }
});

// Update transport route
router.put('/update-transport', async (req, res) => {
  try {
    // 1. Validate transport data
    const { id, name, description, price, address, isActive, ...extraData } = req.body;

    // 2. Update transport function
    const transport = await Transport.findByIdAndUpdate(id, {
      name,
      description,
      price,
      address,
      isActive
    }, { new: true });

    if (!transport) {
      throw new Error('Transporte no encontrado');
    }

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastTransportUpdated = transport.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('transport', { 
      error: 'Error al actualizar el transporte',
      formData: req.body 
    });
  }
});

// Delete transport route
router.delete('/delete-transport', async (req, res) => {
  try {
    // 1. Validate transport ID
    const { id } = req.body;

    // 2. Delete transport function
    const transport = await Transport.findByIdAndDelete(id);

    if (!transport) {
      throw new Error('Transporte no encontrado');
    }

    // 3. Update session if needed
    if (req.session.user && req.session.user.lastTransportCreated === id) {
      delete req.session.user.lastTransportCreated;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('transport', { 
      error: 'Error al eliminar el transporte',
      formData: req.body 
    });
  }
});

// Get all transports route
router.get('/transports', async (req, res) => {
  try {
    // 1. Get all transports
    const transports = await Transport.find({});
    
    // 2. Render transports page
    res.render('transports', { 
      transports,
      user: req.user 
    });
  } catch (error) {
    res.render('transports', { 
      error: 'Error al cargar los transportes',
      transports: [],
      user: req.user 
    });
  }
});

// Get transport by ID route
router.get('/transport/:id', async (req, res) => {
  try {
    // 1. Get transport by ID
    const transport = await Transport.findById(req.params.id);
    
    if (!transport) {
      throw new Error('Transporte no encontrado');
    }
    
    // 2. Render transport detail page
    res.render('transport-detail', { 
      transport,
      user: req.user 
    });
  } catch (error) {
    res.render('transport-detail', { 
      error: 'Error al cargar el transporte',
      transport: null,
      user: req.user 
    });
  }
});

// Get active transports route
router.get('/active-transports', async (req, res) => {
  try {
    // 1. Get only active transports
    const transports = await Transport.find({ isActive: true });
    
    // 2. Render active transports page
    res.render('active-transports', { 
      transports,
      user: req.user 
    });
  } catch (error) {
    res.render('active-transports', { 
      error: 'Error al cargar los transportes activos',
      transports: [],
      user: req.user 
    });
  }
});

export default router;


