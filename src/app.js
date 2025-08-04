import { configureServer, startServer } from './config/server.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { dynamicViewsMiddleware } from './middlewares/dynamicViews.js';

// Configuración inicial
const app = configureServer();
const port = process.env.PORT || 3000;

// Middlewares
app.use(authMiddleware({
  // Puedes sobrescribir configs aquí
  debug: true
}));

app.use(dynamicViewsMiddleware(app.get('views')));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('[App Error]', err.stack);
  res.status(500).render('error', { error: err });
});

app.use((req, res) => {
  res.status(404).render('404');
});

// Inicio
startServer(app, port);