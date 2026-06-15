export const SEED_EMAIL_DOMAIN = 'markethub.test';
export const SEED_PASSWORD = 'Password123!';

export const SEED_CATEGORIES = [
  { name: 'Electrónica', description: 'Dispositivos y accesorios tecnológicos' },
  { name: 'Ropa', description: 'Moda para hombre, mujer y niños' },
  { name: 'Hogar', description: 'Decoración, muebles y utensilios' },
  { name: 'Deportes', description: 'Equipamiento y ropa deportiva' },
  { name: 'Belleza', description: 'Cuidado personal y cosmética' },
  { name: 'Alimentos', description: 'Productos gourmet y orgánicos' },
] as const;

export const SEED_STORES: Array<{
  name: string;
  description: string;
  shippingPolicy: string;
  returnPolicy: string;
  approved: boolean;
}> = [
  {
    name: 'TechNova',
    description: 'Tecnología de última generación a precios accesibles.',
    shippingPolicy: 'Envío gratis en compras mayores a $50. Entrega en 3-5 días hábiles.',
    returnPolicy: 'Devoluciones dentro de los 30 días con empaque original.',
    approved: true,
  },
  {
    name: 'Moda Urbana',
    description: 'Tendencias urbanas y streetwear para todos los estilos.',
    shippingPolicy: 'Envío estándar 5-7 días. Express disponible.',
    returnPolicy: 'Cambios y devoluciones hasta 15 días.',
    approved: true,
  },
  {
    name: 'Casa & Estilo',
    description: 'Todo para hacer de tu hogar un lugar acogedor.',
    shippingPolicy: 'Envío a todo el país en 7-10 días.',
    returnPolicy: 'Garantía de satisfacción de 20 días.',
    approved: true,
  },
  {
    name: 'SportMax',
    description: 'Equipamiento deportivo profesional y amateur.',
    shippingPolicy: 'Envío gratis en pedidos superiores a $75.',
    returnPolicy: 'Devoluciones en 14 días si no se ha usado.',
    approved: true,
  },
  {
    name: 'Belleza Natural',
    description: 'Productos de belleza orgánicos y cruelty-free.',
    shippingPolicy: 'Entrega en 4-6 días hábiles.',
    returnPolicy: 'No se aceptan devoluciones de productos abiertos.',
    approved: true,
  },
  {
    name: 'Gourmet Express',
    description: 'Delicias gourmet y productos artesanales.',
    shippingPolicy: 'Envío refrigerado disponible. 2-4 días.',
    returnPolicy: 'Sin devoluciones en productos perecederos.',
    approved: false,
  },
  {
    name: 'Libros & Más',
    description: 'Literatura, cómics y material educativo.',
    shippingPolicy: 'Envío económico en 5-8 días.',
    returnPolicy: 'Devoluciones en 10 días si el libro está en perfecto estado.',
    approved: false,
  },
  {
    name: 'Juguetes Kids',
    description: 'Juguetes educativos y divertidos para todas las edades.',
    shippingPolicy: 'Envío express disponible para cumpleaños.',
    returnPolicy: 'Cambios hasta 30 días con ticket de compra.',
    approved: false,
  },
  {
    name: 'Mascotas Felices',
    description: 'Todo lo que tu mascota necesita.',
    shippingPolicy: 'Envío gratis en alimento a granel.',
    returnPolicy: 'Devoluciones en productos sin abrir.',
    approved: false,
  },
  {
    name: 'Arte Creativo',
    description: 'Materiales de arte, manualidades y diseño.',
    shippingPolicy: 'Envío cuidadoso para productos frágiles.',
    returnPolicy: 'Devoluciones en 15 días.',
    approved: false,
  },
];

export const SEED_PRODUCTS_BY_STORE: Record<
  string,
  Array<{ name: string; description: string; price: number; stock: number; category: string }>
> = {
  TechNova: [
    { name: 'Auriculares Bluetooth Pro', description: 'Cancelación de ruido activa, 30h de batería.', price: 79.99, stock: 45, category: 'Electrónica' },
    { name: 'Cargador Inalámbrico 15W', description: 'Carga rápida compatible con Qi.', price: 24.99, stock: 120, category: 'Electrónica' },
    { name: 'Smartwatch Fitness', description: 'Monitor cardíaco, GPS y resistencia al agua.', price: 149.99, stock: 30, category: 'Electrónica' },
    { name: 'Teclado Mecánico RGB', description: 'Switches blue, retroiluminación personalizable.', price: 89.99, stock: 25, category: 'Electrónica' },
  ],
  'Moda Urbana': [
    { name: 'Hoodie Oversize Negro', description: 'Algodón premium, corte relajado.', price: 49.99, stock: 60, category: 'Ropa' },
    { name: 'Jeans Slim Fit', description: 'Denim elástico, lavado medio.', price: 59.99, stock: 40, category: 'Ropa' },
    { name: 'Gorra Snapback', description: 'Bordado logo, ajustable.', price: 19.99, stock: 80, category: 'Ropa' },
    { name: 'Zapatillas Street', description: 'Suela de goma, diseño urbano.', price: 89.99, stock: 35, category: 'Ropa' },
  ],
  'Casa & Estilo': [
    { name: 'Lámpara de Mesa LED', description: 'Luz cálida regulable, diseño minimalista.', price: 34.99, stock: 50, category: 'Hogar' },
    { name: 'Set de Cojines Decorativos', description: 'Pack de 4, varios patrones.', price: 29.99, stock: 70, category: 'Hogar' },
    { name: 'Organizador de Escritorio', description: 'Bambú natural, 5 compartimentos.', price: 22.99, stock: 90, category: 'Hogar' },
  ],
  SportMax: [
    { name: 'Pelota de Fútbol Profesional', description: 'FIFA Quality Pro, tamaño 5.', price: 39.99, stock: 55, category: 'Deportes' },
    { name: 'Mancuernas Ajustables 20kg', description: 'Set par, agarre antideslizante.', price: 129.99, stock: 20, category: 'Deportes' },
    { name: 'Camiseta Deportiva Dry-Fit', description: 'Transpirable, secado rápido.', price: 24.99, stock: 100, category: 'Deportes' },
    { name: 'Mat de Yoga Premium', description: '6mm grosor, antideslizante.', price: 34.99, stock: 45, category: 'Deportes' },
  ],
  'Belleza Natural': [
    { name: 'Serum Vitamina C', description: 'Ilumina y unifica el tono de piel.', price: 28.99, stock: 65, category: 'Belleza' },
    { name: 'Crema Hidratante Facial', description: 'Ácido hialurónico y aloe vera.', price: 22.99, stock: 80, category: 'Belleza' },
    { name: 'Kit Maquillaje Natural', description: '5 piezas, ingredientes orgánicos.', price: 45.99, stock: 30, category: 'Belleza' },
  ],
  'Gourmet Express': [
    { name: 'Aceite de Oliva Extra Virgen', description: '500ml, cosecha temprana.', price: 18.99, stock: 75, category: 'Alimentos' },
    { name: 'Caja de Chocolates Artesanales', description: '12 piezas, sabores variados.', price: 32.99, stock: 40, category: 'Alimentos' },
    { name: 'Mermelada Casera de Fresa', description: 'Sin conservantes, frasco 350g.', price: 8.99, stock: 100, category: 'Alimentos' },
    { name: 'Café de Origen Premium', description: 'Grano entero, tueste medio, 250g.', price: 14.99, stock: 60, category: 'Alimentos' },
  ],
  'Libros & Más': [
    { name: 'Novela Bestseller 2025', description: 'Edición tapa dura, 420 páginas.', price: 24.99, stock: 50, category: 'Hogar' },
    { name: 'Cómic Colección Vol. 1', description: 'Edición limitada con arte exclusivo.', price: 19.99, stock: 35, category: 'Hogar' },
    { name: 'Cuaderno Bullet Journal', description: 'Puntos, 160 páginas, tapa dura.', price: 12.99, stock: 90, category: 'Hogar' },
  ],
  'Juguetes Kids': [
    { name: 'Set de Bloques Educativos', description: '100 piezas, colores vibrantes.', price: 29.99, stock: 55, category: 'Hogar' },
    { name: 'Peluche Osito Grande', description: 'Suave y lavable, 40cm.', price: 19.99, stock: 70, category: 'Hogar' },
    { name: 'Juego de Mesa Familiar', description: 'Para 2-6 jugadores, +8 años.', price: 34.99, stock: 40, category: 'Hogar' },
  ],
  'Mascotas Felices': [
    { name: 'Alimento Premium para Perro', description: '15kg, pollo y arroz.', price: 49.99, stock: 30, category: 'Alimentos' },
    { name: 'Rascador para Gatos', description: 'Sisal natural, 60cm de altura.', price: 27.99, stock: 45, category: 'Hogar' },
    { name: 'Correa Retráctil', description: 'Hasta 5m, para perros medianos.', price: 15.99, stock: 80, category: 'Deportes' },
  ],
  'Arte Creativo': [
    { name: 'Set de Acuarelas 24 colores', description: 'Incluye pincel y paleta.', price: 18.99, stock: 60, category: 'Hogar' },
    { name: 'Lienzo Pack x3', description: '30x40cm, listo para pintar.', price: 14.99, stock: 75, category: 'Hogar' },
    { name: 'Marcadores Brush Pen', description: 'Set de 36 colores, punta flexible.', price: 26.99, stock: 50, category: 'Hogar' },
    { name: 'Arcilla Polimérica Kit', description: '12 colores + herramientas.', price: 21.99, stock: 40, category: 'Hogar' },
  ],
};

export const CUSTOMER_FIRST_NAMES = [
  'Ana', 'Carlos', 'María', 'Luis', 'Sofía',
  'Diego', 'Laura', 'Pablo', 'Elena', 'Miguel',
];

export const CUSTOMER_LAST_NAMES = [
  'García', 'Rodríguez', 'Martínez', 'López', 'Hernández',
  'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres',
];

export const SELLER_FIRST_NAMES = [
  'Roberto', 'Patricia', 'Fernando', 'Carmen', 'Javier',
  'Isabel', 'Ricardo', 'Lucía', 'Andrés', 'Valentina',
];

export const SELLER_LAST_NAMES = [
  'Morales', 'Castro', 'Vargas', 'Ruiz', 'Mendoza',
  'Silva', 'Ortega', 'Navarro', 'Delgado', 'Ríos',
];
