# API Client - Mini Postman

Cliente API ligero e interactivo construido con Astro y React. Inspirado en Postman, esta aplicación te permite enviar solicitudes HTTP, gestionar colecciones y trabajar con variables de entorno.

## Arquitectura

Este proyecto usa la arquitectura **Astro Islands** para un rendimiento óptimo:

- **Shell Estático**: El diseño principal y estructura se renderizan estáticamente en el servidor
- **Islas React**: Componentes interactivos (RequestEditor, ResponsePanel, Sidebar) se hidratan en el cliente
- **Hidratación Parcial**: Solo los componentes necesarios cargan JavaScript, reduciendo el tamaño inicial

## Tecnologías

- **Framework**: Astro 6.x con soporte SSR
- **UI**: React 19.x para islas interactivas
- **Gestión de Estado**: Zustand 5.x
- **Persistencia**: Dexie (wrapper de IndexedDB)
- **Estilos**: TailwindCSS 3.x
- **Cliente HTTP**: API fetch nativa

## Primeros Pasos

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

### Build de Producción

```bash
npm run build
```

Iniciar el servidor de producción:

```bash
node dist/server/entry.mjs
```

## Características

### Funcionalidad Principal

- Enviar solicitudes HTTP (GET, POST, PUT, PATCH, DELETE)
- Encabezados personalizados y tipos de cuerpo (JSON, Form Data, x-www-form-urlencoded)
- Visualización de respuestas con estado, tiempo y encabezados
- Historial de solicitudes agrupado por fecha

### Colecciones

- Organizar solicitudes en colecciones
- Arrastrar y soltar para mover solicitudes entre colecciones
- Importar/Exportar colecciones como JSON

### Variables de Entorno

- Crear múltiples entornos
- Definir variables como `{{baseUrl}}`, `{{apiKey}}`
- Sustitución automática de variables en solicitudes
- Vista previa de cómo se resuelven las variables

### Utilidades

- Importar/Exportar cURL
- Soporte OpenAPI 3.0
- Importar/Exportar colecciones Postman
- Atajos de teclado (Ctrl+Enter para enviar, Ctrl+S para guardar)

### Opciones de Exportación

- Exportar respuestas como JSON
- Exportar todo el espacio de trabajo
- Importar desde archivos JSON

## ¿Por qué Astro?

### Rendimiento

La hydratación parcial de Astro significa que solo los componentes interactivos cargan JavaScript. El sidebar y elementos estáticos se renderizan como HTML puro, mientras que el editor de solicitudes carga React solo cuando es necesario.

### Experiencia de Desarrollo

- Rutas basadas en archivos
- TypeScript integrado
- Integraciones para React, Tailwind y más

### Flexibilidad

Usa `output: 'server'` para endpoints SSR o `output: 'static'` para builds estáticos puros.

## Ejemplos de Uso

### Enviar una Solicitud

1. Ingresa una URL en la barra de direcciones
2. Selecciona el método HTTP (GET, POST, etc.)
3. Agrega encabezados si es necesario
4. Haz clic en "Send" o presiona Ctrl+Enter
5. Ver la respuesta en el panel inferior

### Usar Variables

1. Crea un entorno en el panel de Envs
2. Agrega variables como `baseUrl: https://api.example.com`
3. Usa en solicitudes como `{{baseUrl}}/endpoint`
4. Las variables se resuelven automáticamente al enviar

### Importar cURL

1. Copia un comando cURL de las herramientas de desarrollo del navegador
2. Haz clic en el botón "cURL" en el editor de encabezados
3. Pega y analiza el comando
4. La solicitud se crea automáticamente

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| Ctrl + Enter | Enviar solicitud |
| Ctrl + S | Guardar solicitud |
| Ctrl + N | Nueva solicitud |
| Ctrl + H | Enfocar búsqueda |
| F1 | Mostrar ayuda de atajos |
| Esc | Cerrar modal |

## Estructura del Proyecto

```
src/
├── components/       # Componentes UI de React
│   ├── request/     # Componentes del editor de solicitudes
│   ├── response/   # Componentes del panel de respuesta
│   ├── sidebar/    # Componentes de la barra lateral
│   └── ui/        # Componentes UI compartidos
├── layouts/        # Layouts de Astro
├── pages/          # Páginas de Astro
│   ├── api/       # Endpoints de API
│   ├── collections.astro
│   ├── environments.astro
│   └── index.astro
├── store/          # Stores de Zustand
├── types/         # Tipos de TypeScript
└── utils/         # Funciones utilitarias
```

## Licencia

MIT - Creado por Ignacio Ledesma © 2026 - Todos los derechos reservados