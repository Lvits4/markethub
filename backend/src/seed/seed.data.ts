export const SEED_EMAIL_DOMAIN = 'markethub.test';
export const SEED_PASSWORD = 'Password123!';

export const SEED_CATEGORIES = [
  { name: 'Electrónica', description: 'Dispositivos y accesorios tecnológicos' },
  { name: 'Ropa', description: 'Moda para hombre, mujer y niños' },
  { name: 'Hogar', description: 'Decoración, muebles y utensilios' },
  { name: 'Deportes', description: 'Equipamiento y ropa deportiva' },
  { name: 'Belleza', description: 'Cuidado personal y cosmética' },
  { name: 'Alimentos', description: 'Productos gourmet y orgánicos' },
  { name: 'Libros', description: 'Literatura, cómics y material educativo' },
  { name: 'Juguetes', description: 'Juegos y juguetes para niños' },
  { name: 'Mascotas', description: 'Alimento y accesorios para mascotas' },
  { name: 'Arte', description: 'Materiales de arte y manualidades' },
] as const;

export type SeedProductDef = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
};

export type SeedStoreDef = {
  name: string;
  description: string;
  shippingPolicy: string;
  returnPolicy: string;
  logo: string;
  approved: boolean;
};

/** Imágenes reales (Unsplash CDN) — logos cuadrados por temática de tienda */
export const SEED_STORES: SeedStoreDef[] = [
  {
    name: 'TechNova',
    description: 'Tecnología de última generación a precios accesibles.',
    shippingPolicy: 'Envío gratis en compras mayores a $50. Entrega en 3-5 días hábiles.',
    returnPolicy: 'Devoluciones dentro de los 30 días con empaque original.',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=256&h=256&fit=crop',
    approved: true,
  },
  {
    name: 'Moda Urbana',
    description: 'Tendencias urbanas y streetwear para todos los estilos.',
    shippingPolicy: 'Envío estándar 5-7 días. Express disponible.',
    returnPolicy: 'Cambios y devoluciones hasta 15 días.',
    logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=256&h=256&fit=crop',
    approved: true,
  },
  {
    name: 'Casa & Estilo',
    description: 'Todo para hacer de tu hogar un lugar acogedor.',
    shippingPolicy: 'Envío a todo el país en 7-10 días.',
    returnPolicy: 'Garantía de satisfacción de 20 días.',
    logo: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=256&h=256&fit=crop',
    approved: true,
  },
  {
    name: 'SportMax',
    description: 'Equipamiento deportivo profesional y amateur.',
    shippingPolicy: 'Envío gratis en pedidos superiores a $75.',
    returnPolicy: 'Devoluciones en 14 días si no se ha usado.',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=256&h=256&fit=crop',
    approved: true,
  },
  {
    name: 'Belleza Natural',
    description: 'Productos de belleza orgánicos y cruelty-free.',
    shippingPolicy: 'Entrega en 4-6 días hábiles.',
    returnPolicy: 'No se aceptan devoluciones de productos abiertos.',
    logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=256&h=256&fit=crop',
    approved: true,
  },
  {
    name: 'Gourmet Express',
    description: 'Delicias gourmet y productos artesanales.',
    shippingPolicy: 'Envío refrigerado disponible. 2-4 días.',
    returnPolicy: 'Sin devoluciones en productos perecederos.',
    logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=256&h=256&fit=crop',
    approved: false,
  },
  {
    name: 'Libros & Más',
    description: 'Literatura, cómics y material educativo.',
    shippingPolicy: 'Envío económico en 5-8 días.',
    returnPolicy: 'Devoluciones en 10 días si el libro está en perfecto estado.',
    logo: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=256&h=256&fit=crop',
    approved: false,
  },
  {
    name: 'Juguetes Kids',
    description: 'Juguetes educativos y divertidos para todas las edades.',
    shippingPolicy: 'Envío express disponible para cumpleaños.',
    returnPolicy: 'Cambios hasta 30 días con ticket de compra.',
    logo: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=256&h=256&fit=crop',
    approved: false,
  },
  {
    name: 'Mascotas Felices',
    description: 'Todo lo que tu mascota necesita.',
    shippingPolicy: 'Envío gratis en alimento a granel.',
    returnPolicy: 'Devoluciones en productos sin abrir.',
    logo: 'https://images.unsplash.com/photo-1450778869180-41d060ede206?w=256&h=256&fit=crop',
    approved: false,
  },
  {
    name: 'Arte Creativo',
    description: 'Materiales de arte, manualidades y diseño.',
    shippingPolicy: 'Envío cuidadoso para productos frágiles.',
    returnPolicy: 'Devoluciones en 15 días.',
    logo: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=256&h=256&fit=crop',
    approved: false,
  },
];

export const SEED_PRODUCTS_BY_STORE: Record<string, SeedProductDef[]> = {
  TechNova: [
    {
      name: 'Auriculares Bluetooth Pro',
      description: 'Cancelación de ruido activa, 30h de batería.',
      price: 79.99,
      stock: 45,
      category: 'Electrónica',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
    },
    {
      name: 'Smartwatch Fitness',
      description: 'Monitor cardíaco, GPS y resistencia al agua.',
      price: 149.99,
      stock: 30,
      category: 'Electrónica',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    },
    {
      name: 'Altavoz Portátil',
      description: 'Sonido estéreo 360°, resistencia al agua IPX7.',
      price: 54.99,
      stock: 38,
      category: 'Electrónica',
      imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
    },
    {
      name: 'Tablet 10" WiFi',
      description: 'Pantalla Full HD, ideal para trabajo y ocio.',
      price: 199.99,
      stock: 18,
      category: 'Electrónica',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
    },
  ],
  'Moda Urbana': [
    {
      name: 'Hoodie Oversize Negro',
      description: 'Algodón premium, corte relajado.',
      price: 49.99,
      stock: 60,
      category: 'Ropa',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop',
    },
    {
      name: 'Jeans Slim Fit',
      description: 'Denim elástico, lavado medio.',
      price: 59.99,
      stock: 40,
      category: 'Ropa',
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop',
    },
    {
      name: 'Gorra Snapback',
      description: 'Bordado logo, ajustable.',
      price: 19.99,
      stock: 80,
      category: 'Ropa',
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop',
    },
    {
      name: 'Zapatillas Street',
      description: 'Suela de goma, diseño urbano.',
      price: 89.99,
      stock: 35,
      category: 'Ropa',
      imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
    },
    {
      name: 'Chaqueta Bomber',
      description: 'Estilo urbano, forro interior suave.',
      price: 74.99,
      stock: 28,
      category: 'Ropa',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop',
    },
    {
      name: 'Camiseta Gráfica',
      description: 'Algodón peinado, estampado exclusivo.',
      price: 29.99,
      stock: 55,
      category: 'Ropa',
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    },
  ],
  'Casa & Estilo': [
    {
      name: 'Lámpara de Mesa LED',
      description: 'Luz cálida regulable, diseño minimalista.',
      price: 34.99,
      stock: 50,
      category: 'Hogar',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop',
    },
    {
      name: 'Set de Cojines Decorativos',
      description: 'Pack de 4, varios patrones.',
      price: 29.99,
      stock: 70,
      category: 'Hogar',
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&h=600&fit=crop',
    },
    {
      name: 'Organizador de Escritorio',
      description: 'Bambú natural, 5 compartimentos.',
      price: 22.99,
      stock: 90,
      category: 'Hogar',
      imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop',
    },
    {
      name: 'Maceta Cerámica',
      description: 'Diseño escandinavo, incluye plato.',
      price: 18.99,
      stock: 65,
      category: 'Hogar',
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop',
    },
    {
      name: 'Manta Tejida',
      description: 'Algodón suave, ideal para sofá.',
      price: 39.99,
      stock: 42,
      category: 'Hogar',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
    },
  ],
  SportMax: [
    {
      name: 'Pelota de Fútbol Profesional',
      description: 'FIFA Quality Pro, tamaño 5.',
      price: 39.99,
      stock: 55,
      category: 'Deportes',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop',
    },
    {
      name: 'Mancuernas Ajustables 20kg',
      description: 'Set par, agarre antideslizante.',
      price: 129.99,
      stock: 20,
      category: 'Deportes',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
    },
    {
      name: 'Camiseta Deportiva Dry-Fit',
      description: 'Transpirable, secado rápido.',
      price: 24.99,
      stock: 100,
      category: 'Deportes',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=600&fit=crop',
    },
    {
      name: 'Mat de Yoga Premium',
      description: '6mm grosor, antideslizante.',
      price: 34.99,
      stock: 45,
      category: 'Deportes',
      imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop',
    },
    {
      name: 'Botella Deportiva 750ml',
      description: 'Acero inoxidable, mantiene temperatura.',
      price: 16.99,
      stock: 88,
      category: 'Deportes',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop',
    },
  ],
  'Belleza Natural': [
    {
      name: 'Crema Hidratante Facial',
      description: 'Ácido hialurónico y aloe vera.',
      price: 22.99,
      stock: 80,
      category: 'Belleza',
      imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop',
    },
    {
      name: 'Kit Maquillaje Natural',
      description: '5 piezas, ingredientes orgánicos.',
      price: 45.99,
      stock: 30,
      category: 'Belleza',
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop',
    },
    {
      name: 'Aceite Corporal',
      description: 'Argán y rosa mosqueta, 200ml.',
      price: 19.99,
      stock: 52,
      category: 'Belleza',
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop',
    },
  ],
  'Gourmet Express': [
    {
      name: 'Aceite de Oliva Extra Virgen',
      description: '500ml, cosecha temprana.',
      price: 18.99,
      stock: 75,
      category: 'Alimentos',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop',
    },
    {
      name: 'Caja de Chocolates Artesanales',
      description: '12 piezas, sabores variados.',
      price: 32.99,
      stock: 40,
      category: 'Alimentos',
      imageUrl: 'https://images.unsplash.com/photo-1549007953-2f2dc0ce0def?w=600&h=600&fit=crop',
    },
    {
      name: 'Mermelada Casera de Fresa',
      description: 'Sin conservantes, frasco 350g.',
      price: 8.99,
      stock: 100,
      category: 'Alimentos',
      imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop',
    },
    {
      name: 'Café de Origen Premium',
      description: 'Grano entero, tueste medio, 250g.',
      price: 14.99,
      stock: 60,
      category: 'Alimentos',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop',
    },
  ],
  'Libros & Más': [
    {
      name: 'Novela Bestseller 2025',
      description: 'Edición tapa dura, 420 páginas.',
      price: 24.99,
      stock: 50,
      category: 'Libros',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop',
    },
    {
      name: 'Cómic Colección Vol. 1',
      description: 'Edición limitada con arte exclusivo.',
      price: 19.99,
      stock: 35,
      category: 'Libros',
      imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=600&fit=crop',
    },
    {
      name: 'Cuaderno Bullet Journal',
      description: 'Puntos, 160 páginas, tapa dura.',
      price: 12.99,
      stock: 90,
      category: 'Libros',
      imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&h=600&fit=crop',
    },
  ],
  'Juguetes Kids': [
    {
      name: 'Set de Bloques Educativos',
      description: '100 piezas, colores vibrantes.',
      price: 29.99,
      stock: 55,
      category: 'Juguetes',
      imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop',
    },
    {
      name: 'Peluche Osito Grande',
      description: 'Suave y lavable, 40cm.',
      price: 19.99,
      stock: 70,
      category: 'Juguetes',
      imageUrl: 'https://images.unsplash.com/photo-1530325552611-64f770008c5d?w=600&h=600&fit=crop',
    },
    {
      name: 'Juego de Mesa Familiar',
      description: 'Para 2-6 jugadores, +8 años.',
      price: 34.99,
      stock: 40,
      category: 'Juguetes',
      imageUrl: 'https://images.unsplash.com/photo-1610894238941-7f1dad8e3d91?w=600&h=600&fit=crop',
    },
  ],
  'Mascotas Felices': [
    {
      name: 'Alimento Premium para Perro',
      description: '15kg, pollo y arroz.',
      price: 49.99,
      stock: 30,
      category: 'Mascotas',
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=600&fit=crop',
    },
    {
      name: 'Rascador para Gatos',
      description: 'Sisal natural, 60cm de altura.',
      price: 27.99,
      stock: 45,
      category: 'Mascotas',
      imageUrl: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&h=600&fit=crop',
    },
    {
      name: 'Correa Retráctil',
      description: 'Hasta 5m, para perros medianos.',
      price: 15.99,
      stock: 80,
      category: 'Mascotas',
      imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop',
    },
  ],
  'Arte Creativo': [
    {
      name: 'Set de Acuarelas 24 colores',
      description: 'Incluye pincel y paleta.',
      price: 18.99,
      stock: 60,
      category: 'Arte',
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop',
    },
    {
      name: 'Lienzo Pack x3',
      description: '30x40cm, listo para pintar.',
      price: 14.99,
      stock: 75,
      category: 'Arte',
      imageUrl: 'https://images.unsplash.com/photo-1460661419341-fd204867eaf3?w=600&h=600&fit=crop',
    },
    {
      name: 'Marcadores Brush Pen',
      description: 'Set de 36 colores, punta flexible.',
      price: 26.99,
      stock: 50,
      category: 'Arte',
      imageUrl: 'https://images.unsplash.com/photo-1452860606248-bfeaaef7d67d?w=600&h=600&fit=crop',
    },
    {
      name: 'Arcilla Polimérica Kit',
      description: '12 colores + herramientas.',
      price: 21.99,
      stock: 40,
      category: 'Arte',
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop',
    },
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
