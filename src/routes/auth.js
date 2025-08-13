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
    console.log(user)

    // 2. Establecer sesión
    req.session.user = {
      id: user.id,
      email: user.email,
      last_name: user.last_name,
      phone: user.phone,
      birthdate: user.birthdate,
      rol: user.rol || "CITIZEN_ROLE",
      name: user.name,
    };

    // Construir la URL completa (puedes cambiar localhost:8080 por tu dominio real)
    const fullUrl = `http://localhost:8080/dashboard`;

    delete req.session.returnTo;
    res.redirect(fullUrl);
    return;
  } catch (error) {
    console.log(error);
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
      last_name: user.last_name,
      phone: user.phone,
      birthdate: user.birthdate,
      rol: user.rol || "CITIZEN_ROLE",
      name: user.name,
    };

    // Construir la URL completa (puedes cambiar localhost:8080 por tu dominio real)
    const fullUrl = `http://localhost:8080/dashboard`;

    delete req.session.returnTo;
    res.redirect(fullUrl);
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

router.post('/update', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const userId = req.session.user.id;
    const { name, last_name, phone, birthdate, email, password } = req.body;
    
    console.log(userId);
    console.log(req.body);
    
    // Construir objeto de actualización dinámicamente
    const updateData = {
      name,
      last_name,
      phone,
      birthdate,
      email
    };
    
    // Solo hashear y incluir password si se proporcionó y es válido
    if (password !== undefined && password !== '' && password.trim() !== '') {
      // Validación básica de password (opcional)
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'El password debe tener al menos 6 caracteres' 
        });
      }
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }
    
    // Actualiza el usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Actualiza la sesión con los nuevos datos
    req.session.user = {
      ...req.session.user,
      name: updatedUser.name,
      last_name: updatedUser.last_name,
      phone: updatedUser.phone,
      birthdate: updatedUser.birthdate,
      email: updatedUser.email,
      rol: updatedUser.rol,
      id: updatedUser.id,
    };
    
    res.redirect('http://localhost:8080/profile');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
});


router.get('/session', (req, res) => {
  try {
    // Verificar si existe una sesión activa
    if (!req.session) {
      return res.status(401).json({
        success: false,
        message: 'No hay configuración de sesión',
        authenticated: false
      });
    }

    // Verificar si el usuario está logueado
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'No hay sesión activa de usuario',
        authenticated: false
      });
    }

    // Verificar si la sesión no ha expirado (opcional)
    if (req.session.cookie && req.session.cookie.expires && new Date() > req.session.cookie.expires) {
      return res.status(401).json({
        success: false,
        message: 'Sesión expirada',
        authenticated: false
      });
    }

    // Actualizar último acceso (opcional)
    req.session.lastAccess = new Date();

    // Devolver datos de la sesión (sin información sensible como contraseñas)
    const sessionData = {
      success: true,
      authenticated: true,
      user: {
        id: req.session.user.id,
        name: req.session.user.name,
        last_name: req.session.user.last_name,
        phone: req.session.user.phone,
        birthdate: req.session.user.birthdate,
        email: req.session.user.email,
        rol: req.session.user.rol,
        // Agregar otros campos que necesites, excluyendo datos sensibles
        estado: req.session.user.estado,
        img: req.session.user.img
      },
      session: {
        id: req.sessionID,
        createdAt: req.session.createdAt,
        lastAccess: req.session.lastAccess,
        // Información de la cookie (sin datos sensibles)
        maxAge: req.session.cookie.maxAge,
        expires: req.session.cookie.expires
      }
    };

    res.json(sessionData);

  } catch (error) {
    console.error('Error al obtener datos de sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener sesión',
      authenticated: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Endpoint adicional para verificar solo el estado de autenticación
router.get('/auth/check', (req, res) => {
  const isAuthenticated = !!(req.session && req.session.user);

  res.json({
    authenticated: isAuthenticated,
    role: isAuthenticated ? req.session.user.rol : null
  });
});

// Endpoint para obtener información básica del usuario
router.get('/user/profile', (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    res.json({
      success: true,
      user: {
        id: req.session.user.id,
        name: req.session.user.name || req.session.user.nombre,
        email: req.session.user.email || req.session.user.correo,
        rol: req.session.user.rol,
        img: req.session.user.img,
        estado: req.session.user.estado
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario'
    });
  }
});

// Endpoint para cerrar sesión
router.post('/logout', (req, res) => {
  try {
    if (!req.session) {
      return res.status(400).json({
        success: false,
        message: 'No hay sesión para cerrar'
      });
    }

    const userName = req.session.user ? req.session.user.name : 'Usuario desconocido';

    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
        return res.status(500).json({
          success: false,
          message: 'Error al cerrar sesión'
        });
      }

      // Limpiar cookie de sesión
      res.clearCookie('connect.sid');

      console.log(`Sesión cerrada para usuario: ${userName}`);

      res.json({
        success: true,
        message: 'Sesión cerrada correctamente'
      });
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar cierre de sesión'
    });
  }
});

// Ejemplo de ruta protegida
router.get('dashboard', (req, res) => {
  // req.user está disponible gracias al authMiddleware
  res.render('dashboard');
});

export default router;