import { Router } from "express";
import Rol from "../models/Rol.js";

const router = Router();

// Create role route
router.post('/create-rol', async (req, res) => {
  try {
    // 1. Validate role data
    const { name, description, permissions, ...extraData } = req.body;

    // 2. Create role function
    const role = await Rol.create({
      name,
      description,
      permissions
    });

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.role = role.name;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('rol', { 
      error: 'Error al crear el rol',
      formData: req.body 
    });
  }
});

// Update role route
router.put('/update-rol', async (req, res) => {
  try {
    // 1. Validate role data
    const { id, name, description, permissions, ...extraData } = req.body;

    // 2. Update role function
    const role = await Rol.findByIdAndUpdate(id, {
      name,
      description,
      permissions
    }, { new: true });

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.role = role.name;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('rol', { 
      error: 'Error al actualizar el rol',
      formData: req.body 
    });
  }
});

// Delete role route
router.delete('/delete-rol', async (req, res) => {
  try {
    // 1. Validate role ID
    const { id } = req.body;

    // 2. Delete role function
    const role = await Rol.findByIdAndDelete(id);

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // 3. Update session if needed
    if (req.session.user && req.session.user.role === role.name) {
      // Handle user role update if their role was deleted
      const defaultRole = await Rol.findOne({ name: 'user' });
      req.session.user.role = defaultRole ? defaultRole.name : 'user';
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('rol', { 
      error: 'Error al eliminar el rol',
      formData: req.body 
    });
  }
});

// Get all roles route
router.get('/roles', async (req, res) => {
  try {
    // 1. Get all roles
    const roles = await Rol.find({});
    
    // 2. Render roles page
    res.render('roles', { 
      roles,
      user: req.user 
    });
  } catch (error) {
    res.render('roles', { 
      error: 'Error al cargar los roles',
      roles: [],
      user: req.user 
    });
  }
});

// Get role by ID route
router.get('/role/:id', async (req, res) => {
  try {
    // 1. Get role by ID
    const role = await Rol.findById(req.params.id);
    
    if (!role) {
      throw new Error('Rol no encontrado');
    }
    
    // 2. Render role detail page
    res.render('role-detail', { 
      role,
      user: req.user 
    });
  } catch (error) {
    res.render('role-detail', { 
      error: 'Error al cargar el rol',
      role: null,
      user: req.user 
    });
  }
});

export default router;