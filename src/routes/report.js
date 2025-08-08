import { Router } from "express";
import Reports from "../models/Reports.js";

const router = Router();

// Create report route
router.post('/create-report', async (req, res) => {
  try {
    // 1. Validate report data
    const { name, description, date, address, user, isActive, ...extraData } = req.body;

    // 2. Create report function
    const report = await Reports.create({
      name,
      description,
      date,
      address,
      user,
      isActive: isActive !== undefined ? isActive : true
    });

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastReportCreated = report.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('report', { 
      error: 'Error al crear el reporte',
      formData: req.body 
    });
  }
});

// Update report route
router.put('/update-report', async (req, res) => {
  try {
    // 1. Validate report data
    const { id, name, description, date, address, user, isActive, ...extraData } = req.body;

    // 2. Update report function
    const report = await Reports.findByIdAndUpdate(id, {
      name,
      description,
      date,
      address,
      user,
      isActive
    }, { new: true });

    if (!report) {
      throw new Error('Reporte no encontrado');
    }

    // 3. Set session data if needed
    if (req.session.user) {
      req.session.user.lastReportUpdated = report.id;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('report', { 
      error: 'Error al actualizar el reporte',
      formData: req.body 
    });
  }
});

// Delete report route
router.delete('/delete-report', async (req, res) => {
  try {
    // 1. Validate report ID
    const { id } = req.body;

    // 2. Delete report function
    const report = await Reports.findByIdAndDelete(id);

    if (!report) {
      throw new Error('Reporte no encontrado');
    }

    // 3. Update session if needed
    if (req.session.user && req.session.user.lastReportCreated === id) {
      delete req.session.user.lastReportCreated;
    }
    
    // 4. Redirect or send response
    const redirectTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    res.render('report', { 
      error: 'Error al eliminar el reporte',
      formData: req.body 
    });
  }
});

// Get all reports route
router.get('/reports', async (req, res) => {
  try {
    // 1. Get all reports
    const reports = await Reports.find({}).populate('user');
    
    // 2. Render reports page
    res.render('reports', { 
      reports,
      user: req.user 
    });
  } catch (error) {
    res.render('reports', { 
      error: 'Error al cargar los reportes',
      reports: [],
      user: req.user 
    });
  }
});

// Get report by ID route
router.get('/report/:id', async (req, res) => {
  try {
    // 1. Get report by ID
    const report = await Reports.findById(req.params.id).populate('user');
    
    if (!report) {
      throw new Error('Reporte no encontrado');
    }
    
    // 2. Render report detail page
    res.render('report-detail', { 
      report,
      user: req.user 
    });
  } catch (error) {
    res.render('report-detail', { 
      error: 'Error al cargar el reporte',
      report: null,
      user: req.user 
    });
  }
});

// Get active reports route
router.get('/active-reports', async (req, res) => {
  try {
    // 1. Get only active reports
    const reports = await Reports.find({ isActive: true }).populate('user');
    
    // 2. Render active reports page
    res.render('active-reports', { 
      reports,
      user: req.user 
    });
  } catch (error) {
    res.render('active-reports', { 
      error: 'Error al cargar los reportes activos',
      reports: [],
      user: req.user 
    });
  }
});

// Get reports by user route
router.get('/user-reports/:userId', async (req, res) => {
  try {
    // 1. Get reports by user ID
    const reports = await Reports.find({ 
      user: req.params.userId,
      isActive: true 
    }).populate('user');
    
    // 2. Render user reports page
    res.render('user-reports', { 
      reports,
      user: req.user 
    });
  } catch (error) {
    res.render('user-reports', { 
      error: 'Error al cargar los reportes del usuario',
      reports: [],
      user: req.user 
    });
  }
});

// Get reports by date range route
router.get('/reports-by-date', async (req, res) => {
  try {
    // 1. Get date range from query parameters
    const { startDate, endDate } = req.query;
    
    let query = { isActive: true };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // 2. Get reports by date range
    const reports = await Reports.find(query).populate('user');
    
    // 3. Render reports by date page
    res.render('reports-by-date', { 
      reports,
      startDate,
      endDate,
      user: req.user 
    });
  } catch (error) {
    res.render('reports-by-date', { 
      error: 'Error al cargar los reportes por fecha',
      reports: [],
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      user: req.user 
    });
  }
});

export default router;
