import fs from 'fs/promises';
import path from 'path';

// Configuración
const config = {
  sourceDir: './src/views',          // Directorio a procesar
  fileExtensions: ['.html', '.ejs'], // Extensiones de archivo a procesar
  verbose: true                      // Mostrar logs detallados
};

async function processDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(directoryPath, file.name);
      
      if (file.isDirectory()) {
        // Procesar subdirectorios recursivamente
        await processDirectory(fullPath);
      } else if (file.isFile() && 
                 config.fileExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        // Procesar archivos HTML/EJS
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error procesando directorio ${directoryPath}:`, error);
  }
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let modified = false;
    let newContent = content;
    
    // Expresión regular mejorada para etiquetas <a>
    newContent = newContent.replace(
      /(<a\b[^>]*\bhref=["'])([^"']*?)(\.html)?(["'][^>]*>)/gi,
      (match, start, pathValue, ext, end) => {
        // Conservar anchors (#) y enlaces vacíos
        if (pathValue === '' || pathValue.startsWith('#')) {
          return match;
        }
        
        // Ignorar URLs externas
        if (pathValue.startsWith('http') || pathValue.startsWith('//')) {
          return match;
        }
        
        // Limpiar la ruta
        const cleanPath = pathValue
          .replace(/^\.?\//, '')      // Quitar ./ o /
          .replace(/\.html$/i, '')     // Quitar .html
          .replace(/\/index$/i, '');   // Quitar /index
        
        if (cleanPath !== pathValue) {
          modified = true;
          return `${start}${cleanPath}${end}`;
        }
        return match;
      }
    );

    if (modified) {
      await fs.writeFile(filePath, newContent);
      if (config.verbose) {
        console.log(`✓ Actualizado: ${filePath}`);
      }
    } else if (config.verbose) {
      console.log(`⏭️ Sin cambios: ${filePath}`);
    }
  } catch (error) {
    console.error(`⚠️ Error procesando archivo ${filePath}:`, error);
  }
}

// Ejecución principal
(async () => {
  console.log('🔄 Iniciando procesamiento de archivos...');
  await processDirectory(config.sourceDir);
  console.log('✅ Proceso completado');
})();