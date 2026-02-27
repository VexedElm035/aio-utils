export interface Route {
  path: string;
  name: string;
}

export const Routes: Route[] = [
  {
    path: '/',
    name: 'Inicio'
  },
  {
    path: '/documents',
    name: 'Documentos'
  },
  {
    path: '/documents/pdf',
    name: 'Herramientas para PDF'
  },
  {
    path: '/documents/pdf/compress',
    name: 'Comprimir PDF'
  },
  {
    path: '/documents/pdf/convert',
    name: 'Convertir PDF'
  },
  {
    path: '/documents/pdf/ocr',
    name: 'Agregar OCR PDF'
  },
  {
    path: '/documents/pdf/split',
    name: 'Dividir PDF'
  },
  {
    path: '/images',
    name: 'Imágenes'
  },
  {
    path: '/images/options',
    name: 'Opciones de Imágenes'
  },
  { path: '/settings',
    name: 'Ajustes' 
  },
];
