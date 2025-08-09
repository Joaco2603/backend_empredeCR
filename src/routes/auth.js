import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = Router();

// En tu archivo de rutas
router.post('/login', async (req, res) => {
  try {
    // 1. Validate credentials
    const { email, password, ...extraData } = req.body;

    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        error: 'Invalid credentials email or password incorrect',
      });
    }

    // 3. Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(404).json({
        error: 'Invalid credentials email or password incorrect',
      });
    }

    // 2. Establecer sesión
    req.session.user = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      name: user.name
    };

    // 4. Redirect 
    const redirectTo = req.session.returnTo || 'dashboard';
    delete req.session.returnTo;
    res.redirect(redirectTo);
    return;
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Contact admin to fix it'
    });
    return;
  }
});


router.post('/signup', async (req, res) => {
  try {
    const { email, password, rol, name, last_name } = req.body;
    console.log(req.body)

    // 1. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Create user with hashed password
    const user = await User.create({
      name,
      last_name,
      email,
      password: hashedPassword,
      rol: rol || "CITIZEN_ROLE",
      birthdate: "2025-08-08T13:04:14.000Z" || new Date()
    });


    // 2. Establecer sesión
    req.session.user = {
      id: user.id,
      email: user.email,
      rol: user.rol || "CITIZEN_ROLE",
      name: user.name,
    };

    // 4. Redirect
    const redirectTo = req.session.returnTo || 'dashboard';
    delete req.session.returnTo;
    res.redirect(redirectTo);
    return;
  } catch (error) {
    console.log(error);
    res.status(500).render({
      error: 'Internal server error',
      message: 'Contact admin to fix it'
    });
    return;
  }
});


// Ejemplo de ruta protegida
router.get('dashboard', (req, res) => {
  // req.user está disponible gracias al authMiddleware
  res.render('dashboard');
});

export default router;