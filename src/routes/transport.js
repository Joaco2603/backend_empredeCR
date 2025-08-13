import { Router } from "express";
import Transport from "../models/Transport.js";

const router = Router();

// Crear transporte
router.post('/', async (req, res) => {
  try {
    const transport = await Transport.create({
      name: req.body.name,
      phone: req.body.contact,
      schedules: req.body.schedules,
      address: req.body.address,
      price: req.body.price,
      isActive: true
    });

    res.redirect('http://localhost:8080/transport')
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Actualizar transporte
router.post('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      name: req.body.name !== undefined ? req.body.name : null,
      phone: req.body.contact !== undefined ? req.body.contact : null,
      schedules: req.body.schedules !== undefined ? req.body.schedules : null,
      address: req.body.address !== undefined ? req.body.address : null,
      price: req.body.price !== undefined ? req.body.price : null,
      isActive: req.body.hasOwnProperty('isActive') ? true : false
    };

    const transport = await Transport.findByIdAndUpdate(id, updateData, { new: true });

    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transporte no encontrado'
      });
    }

    res.redirect('http://localhost:8080/transport');
  } catch (error) {
    console.error('Error al actualizar transporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el transporte',
      error: error.message
    });
  }
});

// Eliminar transporte
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transport = await Transport.findByIdAndDelete(id);
    if (!transport) {
      return res.status(404).json({
        success: false,
        message: 'Transporte no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Transporte eliminado con éxito'
    });
  } catch (error) {
    console.error('Error al eliminar transporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el transporte',
      error: error.message
    });
  }
});

// Obtener solo transportes activos
router.get('/active', async (req, res) => {
  try {
    const transports = await Transport.find({ isActive: true });


    res.json(transports);
  } catch (error) {
    console.error('Error al obtener transportes activos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cargar los transportes activos',
      error: error.message
    });
  }
});

// Ruta para editar (CON transport)
router.get('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transport = await Transport.findById(id);
    transport.contact = transport.phone;
    if (!transport) {
      return res.status(404).send('Transporte no encontrado');
    }
    res.render('transportForm', { transport });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});


export default router;