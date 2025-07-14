import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// Configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  projectRoot: path.join(__dirname, '..'), // Directorio raíz del proyecto
  fileExtensions: ['.html', '.ejs'], // Archivos a procesar
  assetFolders: ['css', 'js', 'imgs'], // Carpetas de assets
  fixOptions: {
    normalizePaths: true, // Convertir ./ruta a /ruta
    absolutePaths: false // Usar rutas absolutas desde la raíz (/)
  }
};

async function fixAssetReferences() {
  console.log('Iniciando corrección de rutas CSS/JS...');
  
  try {
    // 1. Encontrar todos los archivos HTML/EJS
    const filesToProcess = [];
    for (const ext of config.fileExtensions) {
      filesToProcess.push(...await findFilesByExtension(config.projectRoot, ext));
    }
    
    // 2. Procesar cada archivo
    for (const filePath of filesToProcess) {
      await processFile(filePath);
    }
    
    console.log('✅ Corrección completada con éxito!');
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  }
}

async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  let newContent = content;
  
  // Corregir etiquetas link (CSS)
  newContent = newContent.replace(
    /(<link\s[^>]*?(href)=["'])([^"']*?)(["'][^>]*>)/gi,
    (match, start, attr, pathValue, end) => {
      const fixedPath = fixAssetPath(pathValue, filePath);
      if (fixedPath !== pathValue) {
        modified = true;
        return `${start}${fixedPath}${end}`;
      }
      return match;
    }
  );
  
  // Corregir etiquetas script (JS)
  newContent = newContent.replace(
    /(<script\s[^>]*?(src)=["'])([^"']*?)(["'][^>]*>)/gi,
    (match, start, attr, pathValue, end) => {
      const fixedPath = fixAssetPath(pathValue, filePath);
      if (fixedPath !== pathValue) {
        modified = true;
        return `${start}${fixedPath}${end}`;
      }
      return match;
    }
  );
  
  // Corregir etiquetas img (opcional)
  newContent = newContent.replace(
    /(<img\s[^>]*?(src)=["'])([^"']*?)(["'][^>]*>)/gi,
    (match, start, attr, pathValue, end) => {
      const fixedPath = fixAssetPath(pathValue, filePath);
      if (fixedPath !== pathValue) {
        modified = true;
        return `${start}${fixedPath}${end}`;
      }
      return match;
    }
  );
  
  if (modified) {
    await fs.writeFile(filePath, newContent);
    console.log(`✓ Actualizado: ${path.relative(config.projectRoot, filePath)}`);
  }
}

function fixAssetPath(originalPath, filePath) {
  // Ignorar rutas que ya son absolutas o URLs externas
  if (originalPath.startsWith('http') || originalPath.startsWith('//') || originalPath.startsWith('/')) {
    return originalPath;
  }
  
  const fileDir = path.dirname(filePath);
  const absolutePath = path.resolve(fileDir, originalPath);
  const relativeToRoot = path.relative(config.projectRoot, absolutePath);
  
  // Normalizar rutas y reemplazar barras invertidas
  let fixedPath = relativeToRoot.replace(/\\/g, '/');
  
  if (config.fixOptions.normalizePaths) {
    fixedPath = fixedPath.replace(/^\.?\//, '');
  }
  
  return `/${fixedPath}`;
}

async function findFilesByExtension(dir, ext) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !config.assetFolders.includes(entry.name)) {
      files.push(...await findFilesByExtension(fullPath, ext));
    } else if (entry.isFile() && path.extname(entry.name) === ext) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Ejecutar
fixAssetReferences();