import { Router } from "express";
import Entrepreneurship from "../models/Entrepreneurship.js";
import multer from "multer";
import path from "path";

import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

const router = Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Carpeta donde se guardan las imágenes
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Create entrepreneurship route
router.post(
  "/",
  upload.single("img"),
  async (req, res) => {
    try {
      // 1. Validate entrepreneurship data
      const { name, description, phone, address, type_entrepreneur } =
        req.body;

      // 2. Obtener la ruta de la imagen subida
      const imgPath = req.file ? req.file.path : null;

      // 3. Create entrepreneurship function
      const entrepreneurship = await Entrepreneurship.create({
        name,
        description,
        phone,
        address,
        user: req.session.user.id,
        img: imgPath,
        isActive: false,
      });

      console.log(entrepreneurship)

      // 4. Set session data if needed
      if (req.session.user) {
        req.session.user.lastEntrepreneurshipCreated = entrepreneurship.id;
      }

      // 5. Redirect or send response
      const redirectTo = req.session.returnTo || "/dashboard";
      delete req.session.returnTo;

      res.redirect('http://localhost:8080/entrepreneur');
    } catch (error) {
      res.render("entrepreneurship", {
        error: "Error al crear el emprendimiento",
        formData: req.body,
      });
    }
  },
);

// Update entrepreneurship route
router.post("/update/:id", upload.single("img"), async (req, res) => {
  try {
    const id = req.params.id;
    // 1. Validate entrepreneurship data
    const {
      name,
      description,
      phone,
      address,
      user,
      isActive,
    } = req.body;

    // 2. Prepara los datos a actualizar
    const updateData = {
      name,
      description,
      phone,
      address,
      user,
      isActive,
    };

    // Si se subió una nueva imagen, actualiza la propiedad img
    if (req.file) {
      updateData.img = req.file.path;
    }

    // 3. Update entrepreneurship function
    const entrepreneurship = await Entrepreneurship.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!entrepreneurship) {
      throw new Error("Emprendimiento no encontrado");
    }

    // 4. Set session data if needed
    if (req.session.user) {
      req.session.user.lastEntrepreneurshipUpdated = entrepreneurship.id;
    }

    // 5. Redirect or send response
    const redirectTo = req.session.returnTo || "/dashboard";
    delete req.session.returnTo;

    res.redirect(redirectTo);
  } catch (error) {
    console.log(error);
    res.render("entrepreneurship", {
      error: "Error al actualizar el emprendimiento",
      formData: req.body,
    });
  }
});

// Delete entrepreneurship route
router.delete("/:id", async (req, res) => {
  try {
    // 1. Validate entrepreneurship ID
    console.log('here')
    const id = req.params.id;

    // 2. Delete entrepreneurship function
    const entrepreneurship = await Entrepreneurship.findByIdAndDelete(id);

    if (!entrepreneurship) {
      throw new Error("Emprendimiento no encontrado");
    }

    // 3. Update session if needed
    if (
      req.session.user &&
      req.session.user.lastEntrepreneurshipCreated === id
    ) {
      delete req.session.user.lastEntrepreneurshipCreated;
    }

    // 4. Redirect or send response
    res.redirect("hthttp://localhost:8080/entrepreneur");
  } catch (error) {
    res.render("entrepreneurship", {
      error: "Error al eliminar el emprendimiento",
      formData: req.body,
    });
  }
});

// Get all entrepreneurships route
router.get("/inactive", async (req, res) => {
  try {
    // 1. Get all entrepreneurships
    const entrepreneurships = await Entrepreneurship.find({ isActive: false }).populate("user");

    // 2. Render entrepreneurships page
    res.json(entrepreneurships);
  } catch (error) {
    console.log(error);
  }
});


// Get active entrepreneurships route
router.get("/active", async (req, res) => {
  try {
    // 1. Get only active entrepreneurships
    const entrepreneurships = await Entrepreneurship.find({
      isActive: true,
    }).populate("user");

    res.json(entrepreneurships);
    return;
  } catch (error) {
    console.log(error);
  }
});


// router.post('/activate/:id', async (req, res) => {
//   try {
//     // 1. Get only active entrepreneurships
//     const entrepreneurships = await Entrepreneurship.findByIdAndUpdate(req.params.id,{
//       isActive: req.body.accepted,
//     });

//     res.redirect('http://localhost:8080/entrepreneur')
//     return;
//   } catch (error) {
//     console.log(error);
//   }
// });

router.post('/activate/:id', async (req, res) => {
  try {
    const entrepreneurshipId = req.params.id;
    const newStatus = req.body.accepted;
    
    // Primero obtener el estado actual del entrepreneurship
    const currentEntrepreneurship = await Entrepreneurship.findById(entrepreneurshipId);
    
    if (!currentEntrepreneurship) {
      return res.status(404).json({ success: false, message: 'Emprendimiento no encontrado' });
    }
    
    // Si se envía false y ya está false, eliminar de la DB
    if (newStatus === false && currentEntrepreneurship.isActive === false) {
      await Entrepreneurship.findByIdAndDelete(entrepreneurshipId);
      console.log(`Emprendimiento ${entrepreneurshipId} eliminado de la base de datos`);
    } else {
      // En cualquier otro caso, solo actualizar el estado
      await Entrepreneurship.findByIdAndUpdate(entrepreneurshipId, {
        isActive: newStatus,
      });
      console.log(`Emprendimiento ${entrepreneurshipId} actualizado - isActive: ${newStatus}`);
    }
    
    res.redirect('http://localhost:8080/entrepreneur');
    return;
  } catch (error) {
    console.log('Error en activate entrepreneurship:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// Get active entrepreneurships route
router.get("/my_entrepreneurships", async (req, res) => {
  try {
    const id = req.session.user.id;

    // 1. Get only active entrepreneurships
    const entrepreneurships = await Entrepreneurship.find({
      user: new ObjectId(id), 
    }).populate("user");

    // 2. Render active entrepreneurships page
    res.json(entrepreneurships);
  } catch (error) {
    console.log(error)
  }
});

// Get entrepreneurship by ID route
router.get("/:id", async (req, res) => {
  try {
    // 1. Get entrepreneurship by ID
    const entrepreneurship = await Entrepreneurship.findById(
      req.params.id,
    )

    if (!entrepreneurship) {
      throw new Error("Emprendimiento no encontrado");
    }

    // 2. Render entrepreneurship detail page
    res.render('entrepreneurForm', { entrepreneurship });
  } catch (error) {
    console.log(error);
  }
});




export default router;
