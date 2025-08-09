import { signToken } from "../utils/jwt.js";
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

    // 3. Emitir JWT
    const token = signToken({ id: user.id, email: user.email, rol: user.rol, name: user.name });

    // Soporte a clientes API y navegadores
    if (req.accepts('json') && !req.accepts('html')) {
      res.json({ token, user: { id: user.id, email: user.email, rol: user.rol, name: user.name } });
      return;
    }

    // 4. Redirect 
    const redirectTo = req.session.returnTo || 'dashboard';
    delete req.session.returnTo;
    res.cookie('token', token, { httpOnly: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    console.log(redirectTo)
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

    // 2. Establecer sesión
    req.session.user = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      name: user.name
    };

    // 3. Emitir JWT
    const token = signToken({ id: user.id, email: user.email, rol: user.rol, name: user.name });

    if (req.accepts('json') && !req.accepts('html')) {
      return res.status(201).json({ token, user: { id: user.id, email: user.email, rol: user.rol, name: user.name } });
    }

    // 4. Redirigir (opcional: guardar URL previa)
    const redirectTo = 'signUp' || 'dashboard';
    delete req.session.returnTo;
    res.cookie('token', token, { httpOnly: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    res.render(redirectTo, { user: req.user });
    return;
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Contact admin to fix it'
    });
    return;
  }
});


// Ejemplo de ruta protegida
router.get('dashboard', (req, res) => {
  // req.user está disponible gracias al authMiddleware
  res.render('dashboard', { user: req.user });
});

export default router;