# bible ia for all of us

App web en español: cuentas un problema del día y recibes un versículo real de la **Reina-Valera 1909** (dominio público), elegido según palabras clave.

## Cómo correrla en tu computadora

Necesitas [Node.js](https://nodejs.org/) 18 o superior.

```bash
cd bible-ia-for-all-of-us
npm install
npm run dev
```

Abre la dirección que muestre la terminal (normalmente `http://localhost:5173`).

Para una versión lista para subir a un hosting estático:

```bash
npm run build
```

Los archivos quedan en la carpeta `dist/`.

## Qué incluye

- Interfaz en español con logo (cruz blanca sobre azul claro)
- Biblioteca de versículos RV1909
- Búsqueda local por temas (ansiedad, soledad, trabajo, etc.)
- Historial en este aparato (`localStorage`)
- Botones para copiar y pedir otro versículo

## Nota

Esta copia funciona **sin servidor ni clave de IA**: elige el pasaje con la biblioteca local. En el constructor de apps de Grok la versión original podía usar la API de xAI para la reflexión; aquí la nota es generada de forma local y transparente.
