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
      role: user.role,
      name: user.name
    };


    // 3. Redirigir (opcional: guardar URL previa)
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;

    res.render(redirectTo);
  } catch (error) {
    if (error.status === 404) {
      res.status(404).json({
        error: 'Invalid credentials email or password incorrect',
      });
      return;
    }
    res.status(500).json({
      error: 'Internal server error',
      message: "Contact admin to fix it"
    })
  }
});


router.post('/signup', async (req, res) => {
  try {
    const { email, password, rol, name, last_name, birthdate } = req.body;

    // 1. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Create user with hashed password
    const user = await User.create({
      name: name.toLowerCase(),
      last_name: last_name.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      rol: rol,
      birthdate,
    });

    console.log(user);

    // 2. Establecer sesión
    req.session.user = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      name: user.name
    };

    // 3. Redirigir (opcional: guardar URL previa)
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;

    res.redirect(redirectTo);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Contact admin to fix it'
    });
    return;
  }
});


// Ejemplo de ruta protegida
router.get('/dashboard', (req, res) => {
  // req.user está disponible gracias al authMiddleware
  res.render('dashboard', { user: req.user });
});

export default router;