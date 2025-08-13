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
router.put('/:id', async (req, res) => {
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

    res.json({
      success: true,
      data: report,
      message: 'Reporte actualizado exitosamente'
    });

  } catch (error) {
    console.log(error);
  }
});

// Eliminé la ruta duplicada de update-report

// Ruta para eliminar reportes (borrado lógico) - Versión consolidada
router.delete('/:id', async (req, res) => {
  try {
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

// Eliminé la ruta duplicada de delete-report

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
      isActive: true
    }).populate('user', 'name email');  // Datos específicos

    res.json({ success: true, data: reports });

  } catch (error) {
    console.error("Error en /my_reports:", error);
    res.status(500).json({ error: "Error al cargar reportes" });
  }
});

// Ruta para obtener un reporte específico
router.get('/:id', async (req, res) => {
  try {
    const report = await Reports.findById(req.params.id).populate('user');
    
    if (!report) {
      return handleError(res, new Error('Reporte no encontrado'), 404);
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.log(error)
  }
});

export default router;