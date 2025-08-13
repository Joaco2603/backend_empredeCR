import { Router } from "express";
import Reports from "../models/Reports.js";

import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

const router = Router();

// Ruta para crear reportes - Versión optimizada y corregida
router.post('/', async (req, res) => {
  try {
    const { name, description, date, address, type = 'others' } = req.body;

    const reportData = {
      name,
      description,
      date: date,
      address,
      user: new ObjectId(req.session.user.id),
      type,
      isActive: false,
      createdAt: new Date(),
    };

    const report = await Reports.create(reportData);

    res.redirect('http://localhost:8080/complaint');
    return
  } catch (error) {
    console.log(error);
  }
});

// Ruta para actualizar reportes - Versión consolidada
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updatedAt: new Date()
    };

    // Validar y formatear fecha si existe
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const report = await Reports.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!report) {
      return handleError(res, new Error('Reporte no encontrado'), 404);
    }

    res.redirect('http://localhost:8080/complaint');

  } catch (error) {
    console.log(error);
  }
});


// Ruta para eliminar reportes (borrado lógico) - Versión consolidada
router.delete('/:id', async (req, res) => {
  try {
    console.log("dhafjkdshaf")
    const { id } = req.params;
    const report = await Reports.findByIdAndUpdate(id, {
      isActive: false,
      updatedAt: new Date()
    }, { new: true });

    if (!report) {
      return handleError(res, new Error('Reporte no encontrado'), 404);
    }

    res.json({
      success: true,
      message: 'Reporte desactivado exitosamente',
      deactivatedAt: new Date()
    });

  } catch (error) {
    console.log(error);
  }
});


// Ruta para obtener reportes con paginación - Versión optimizada
router.get('/active', async (req, res) => {
  try {
    // Busca todos los reportes activos sin paginación
    const report = await Reports.find({isActive: true});

    res.json(report);

  } catch (error) {
    console.log(error)
  }
});


router.get("/active", async (req, res) => {
  try {
    // 1. Get only active entrepreneurships
    const report = await Entrepreneurship.find({
      isActive: true,
    }).populate("user");

    res.json(report);
    return;
  } catch (error) {
    console.log(error);
  }
});


// router.post('/activate/:id', async (req, res) => {
//   try {



//     // 1. Get only active entrepreneurships
//     const entrepreneurships = await Reports.findByIdAndUpdate(req.params.id,{
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
    const reportId = req.params.id;
    const newStatus = req.body.accepted;
    
    // Primero obtener el estado actual del reporte
    const currentReport = await Reports.findById(reportId);
    
    if (!currentReport) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    
    // Si se envía false y ya está false, eliminar de la DB
    if (newStatus === false && currentReport.isActive === false) {
      await Reports.findByIdAndDelete(reportId);
      console.log(`Reporte ${reportId} eliminado de la base de datos`);
    } else {
      // En cualquier otro caso, solo actualizar el estado
      await Reports.findByIdAndUpdate(reportId, {
        isActive: newStatus,
      });
      console.log(`Reporte ${reportId} actualizado - isActive: ${newStatus}`);
    }
    
    res.redirect('http://localhost:8080/entrepreneur');
    return;
  } catch (error) {
    console.log('Error en activate:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


router.get('/my_reports', async (req, res) => {
  try {
    console.log(req.session.user.id)
    // 1. Verifica autenticación
    if (!req.session?.user?.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // 2. Valida que el ID de usuario sea un ObjectId válido
    if (!ObjectId.isValid(req.session.user.id)) {
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    // 3. Busca reportes del usuario (CORRECCIÓN: usa 'user', no '_id')
    const reports = await Reports.find({
      user: new ObjectId(req.session.user.id),  // ✅ Filtra por ID de usuario
    }).populate('user', 'name email');  // Datos específicos


    res.json(reports);

  } catch (error) {
    console.error("Error en /my_reports:", error);
    res.status(500).json({ error: "Error al cargar reportes" });
  }
});

// Ruta para obtener un reporte específico
router.get("/inactive", async (req, res) => {
  try {
    // 1. Get all entrepreneurships
    const report = await Reports.find({ isActive: false }).populate("user");

    // 2. Render entrepreneurships page
    res.json(report);
  } catch (error) {
    console.log(error);
  }
});

// Ruta para editar (CON transport)
router.get('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Reports.findById(id);

    if (!report) {
      return res.status(404).send('Transporte no encontrado');
    }
    res.render('complaintForm', { report });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});

export default router;