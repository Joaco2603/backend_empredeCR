import { Router } from "express";
import User from "../models/User.js";


const router = Router();

// En tu archivo de rutas
router.post('/login', async (req, res) => {
  try {
    // 1. Valite credentials
    const {email, password, ...extraData }= req.body;

    // 2. Login function
    User.findOne({
        email,
        password
    })


    // 2. Establecer sesión
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    // 3. Redirigir (opcional: guardar URL previa)
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('login', { 
      error: 'Credenciales inválidas',
      email: req.body.email 
    });
  }
});


router.post('/signup', async (req, res) => {
  try {
    // 1. Validar credenciales
    const user = await User.signup(req.body.email, req.body.password);
    
    // 2. Establecer sesión
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    // 3. Redirigir (opcional: guardar URL previa)
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('login', { 
      error: 'Credenciales inválidas',
      email: req.body.email 
    });
  }
});


// Ejemplo de ruta protegida
router.get('/dashboard', (req, res) => {
  // req.user está disponible gracias al authMiddleware
  res.render('dashboard', { user: req.user });
});

export default router;