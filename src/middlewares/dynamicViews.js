import { promises as fs } from 'fs';
import path from 'path';

export const dynamicViewsMiddleware = (viewsPath) => {
  return async (req, res, next) => {
    try {
      let viewName = req.path.slice(1) || 'index';
      const ejsPath = path.join(viewsPath, `${viewName}.ejs`);
      
      await fs.access(ejsPath);
      res.render(viewName);
    } catch (error) {
      console.error(`[DynamicViews] Error al renderizar ${req.path}:`, error.message);
      next();
    }
  };
};