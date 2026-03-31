# MarketHub — Frontend

SPA con **React**, **Vite**, **TypeScript** y **Tailwind CSS v4**. Enrutamiento con **HashRouter**, datos con **TanStack Query**, HTTP centralizado con **`fetchDefault`**.

## Requisitos

- Node.js 20+
- Backend MarketHub en ejecución (por defecto `http://localhost:3000/api`)

## Configuración

```bash
cp .env.example .env
```

Ajusta `VITE_API_BASE_URL` si tu API no corre en ese origen.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Estructura

Carpetas principales bajo `src/`: `app/`, `components/`, `views/`, `layouts/`, `context/`, `hooks/`, `queries/`, `requests/`, `validations/`, `helpers/`, `types/`, `config/`, `data/`, `styles/`.

Los componentes y vistas usan **PascalCase** con una carpeta homónima. El resto de archivos sigue **camelCase**.
