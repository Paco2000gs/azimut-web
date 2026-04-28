/**
 * formatBlogContent.js
 * 
 * Utilidad para transformar automáticamente texto plano o HTML básico
 * en contenido editorial bien estructurado con etiquetas semánticas.
 * 
 * Funcionalidades:
 * - Detecta si el contenido ya es HTML o texto plano
 * - Convierte saltos de línea en párrafos
 * - Identifica posibles títulos y subtítulos
 * - Detecta listas (líneas con viñetas o números)
 * - Detecta citas (blockquotes)
 * - Calcula el tiempo de lectura estimado
 */

/**
 * Detecta si una cadena ya contiene HTML significativo
 */
function isHTML(str) {
  const htmlTags = /<\/?(?:p|h[1-6]|ul|ol|li|blockquote|div|section|article|header|figure|figcaption|table|thead|tbody|tr|td|th|dl|dt|dd|pre|code|br|hr)\b[^>]*>/i;
  return htmlTags.test(str);
}

/**
 * Detecta si una línea parece un título/subtítulo
 * Criterios: 
 *   - Línea corta (< 80 caracteres)
 *   - No termina en punto, coma o punto y coma
 *   - Está en mayúsculas o empieza con mayúscula
 *   - No es parte de una lista
 */
function looksLikeHeading(line, prevLine, nextLine) {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > 100) return false;
  
  // No es título si termina en puntuación de continuación
  if (/[,;:]$/.test(trimmed)) return false;
  
  // No es título si parece item de lista
  if (/^[\-•·●○►▸▹–—]\s/.test(trimmed)) return false;
  if (/^\d+[\.\)]\s/.test(trimmed)) return false;
  
  // Es título si está todo en mayúsculas (y tiene al menos 3 caracteres)
  if (trimmed.length >= 3 && trimmed === trimmed.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(trimmed)) {
    return true;
  }
  
  // Es título si es una línea corta rodeada de líneas vacías
  const prevEmpty = !prevLine || prevLine.trim() === '';
  const nextEmpty = !nextLine || nextLine.trim() === '';
  
  if (prevEmpty && trimmed.length < 80 && !trimmed.endsWith('.') && /^[A-ZÁÉÍÓÚÑ¿¡]/.test(trimmed)) {
    // Línea corta que empieza con mayúscula, precedida por línea vacía
    // y no termina en punto -> probablemente un título
    return true;
  }
  
  return false;
}

/**
 * Detecta si una línea es un item de lista no ordenada
 */
function isUnorderedListItem(line) {
  return /^\s*[\-•·●○►▸▹–—✓✔☑]\s+/.test(line);
}

/**
 * Detecta si una línea es un item de lista ordenada
 */
function isOrderedListItem(line) {
  return /^\s*\d+[\.\)]\s+/.test(line);
}

/**
 * Detecta si una línea parece una cita
 */
function isBlockquote(line) {
  return /^\s*[">»]\s*/.test(line) || /^"[^"]+"\s*$/.test(line.trim());
}

/**
 * Limpia el texto de un item de lista
 */
function cleanListItem(line) {
  return line.replace(/^\s*[\-•·●○►▸▹–—✓✔☑]\s+/, '').trim();
}

function cleanOrderedListItem(line) {
  return line.replace(/^\s*\d+[\.\)]\s+/, '').trim();
}

function cleanBlockquote(line) {
  return line.replace(/^\s*[">»]\s*/, '').replace(/^"(.*)"$/, '$1').trim();
}

/**
 * Escapa caracteres HTML especiales
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Procesa inline formatting: **negrita**, *cursiva*, [links](url)
 */
function processInlineFormatting(text) {
  let result = text;
  
  // Negrita: **texto** o __texto__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Cursiva: *texto* o _texto_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');
  
  // Links: [texto](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return result;
}

/**
 * Función principal: transforma texto plano en HTML estructurado
 */
export function formatBlogContent(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') {
    return '';
  }
  
  const trimmed = rawContent.trim();
  
  // Si ya es HTML con estructura, mejorarlo pero no transformarlo
  if (isHTML(trimmed)) {
    return enhanceExistingHTML(trimmed);
  }
  
  // Procesar como texto plano
  return convertPlainTextToHTML(trimmed);
}

/**
 * Mejora HTML existente que ya tiene estructura básica
 */
function enhanceExistingHTML(html) {
  let enhanced = html;
  
  // Asegurar que los párrafos de texto suelto estén envueltos en <p>
  // Buscar texto que no está dentro de ninguna etiqueta de bloque
  enhanced = enhanced.replace(/(?<=>)\s*([^<]+?)(?=<(?:h[1-6]|p|ul|ol|blockquote|div|section|figure|table|hr))/gi, (match, text) => {
    const trimmedText = text.trim();
    if (trimmedText.length > 0 && !/^\s+$/.test(text)) {
      return `<p>${trimmedText}</p>`;
    }
    return match;
  });
  
  return enhanced;
}

/**
 * Convierte texto plano en HTML estructurado
 */
function convertPlainTextToHTML(text) {
  // Normalizar saltos de línea
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Dividir en líneas
  const lines = normalized.split('\n');
  
  const htmlParts = [];
  let i = 0;
  let headingCount = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    
    // Línea vacía: skip
    if (trimmedLine === '') {
      i++;
      continue;
    }
    
    // Separador horizontal
    if (/^[-=_*]{3,}$/.test(trimmedLine)) {
      htmlParts.push('<hr>');
      i++;
      continue;
    }
    
    // Markdown headings (# ## ###)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length + 1, 6); // # -> h2, ## -> h3, etc.
      const headingText = processInlineFormatting(escapeHtml(headingMatch[2]));
      htmlParts.push(`<h${level}>${headingText}</h${level}>`);
      headingCount++;
      i++;
      continue;
    }
    
    // Detección de título/subtítulo (texto plano)
    if (looksLikeHeading(trimmedLine, prevLine, nextLine)) {
      headingCount++;
      const level = headingCount <= 1 ? 2 : 3; // Primer título -> h2, siguientes -> h3
      const headingText = processInlineFormatting(escapeHtml(trimmedLine));
      htmlParts.push(`<h${level}>${headingText}</h${level}>`);
      i++;
      continue;
    }
    
    // Blockquote
    if (isBlockquote(trimmedLine)) {
      const quoteLines = [];
      while (i < lines.length && isBlockquote(lines[i].trim())) {
        quoteLines.push(cleanBlockquote(lines[i]));
        i++;
      }
      const quoteText = quoteLines.map(l => processInlineFormatting(escapeHtml(l))).join(' ');
      htmlParts.push(`<blockquote><p>${quoteText}</p></blockquote>`);
      continue;
    }
    
    // Lista no ordenada
    if (isUnorderedListItem(trimmedLine)) {
      const listItems = [];
      while (i < lines.length && isUnorderedListItem(lines[i].trim())) {
        const itemText = processInlineFormatting(escapeHtml(cleanListItem(lines[i])));
        listItems.push(`<li>${itemText}</li>`);
        i++;
      }
      htmlParts.push(`<ul>${listItems.join('')}</ul>`);
      continue;
    }
    
    // Lista ordenada
    if (isOrderedListItem(trimmedLine)) {
      const listItems = [];
      while (i < lines.length && isOrderedListItem(lines[i].trim())) {
        const itemText = processInlineFormatting(escapeHtml(cleanOrderedListItem(lines[i])));
        listItems.push(`<li>${itemText}</li>`);
        i++;
      }
      htmlParts.push(`<ol>${listItems.join('')}</ol>`);
      continue;
    }
    
    // Párrafo normal: acumular líneas consecutivas no vacías
    const paragraphLines = [];
    while (i < lines.length) {
      const currentLine = lines[i].trim();
      if (
        currentLine === '' ||
        looksLikeHeading(currentLine, i > 0 ? lines[i - 1] : '', i < lines.length - 1 ? lines[i + 1] : '') ||
        isUnorderedListItem(currentLine) ||
        isOrderedListItem(currentLine) ||
        isBlockquote(currentLine) ||
        /^[-=_*]{3,}$/.test(currentLine) ||
        /^#{1,6}\s+/.test(currentLine)
      ) {
        break;
      }
      paragraphLines.push(currentLine);
      i++;
    }
    
    if (paragraphLines.length > 0) {
      const paragraphText = processInlineFormatting(
        escapeHtml(paragraphLines.join(' '))
      );
      htmlParts.push(`<p>${paragraphText}</p>`);
    }
  }
  
  return htmlParts.join('\n');
}

/**
 * Calcula el tiempo de lectura estimado en minutos
 * Basado en una velocidad media de 200 palabras por minuto
 */
export function calculateReadingTime(content) {
  if (!content) return 1;
  
  // Limpiar HTML tags para contar solo texto
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.ceil(wordCount / 200);
  
  return Math.max(1, minutes);
}
