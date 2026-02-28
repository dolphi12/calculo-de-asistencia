# Cálculo de Asistencia

Aplicación web construida con **React** y **Vite** que permite cargar archivos Excel con registros de asistencia, calcular métricas (jornada, alertas, etc.) y exportar los resultados a Excel.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (se incluye con Node.js)

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/dolphi12/calculo-de-asistencia.git
   cd calculo-de-asistencia
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

## Ejecución en modo desarrollo

Inicia el servidor de desarrollo con recarga en caliente:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique la terminal).

## Compilar para producción

Genera los archivos optimizados en la carpeta `dist/`:

```bash
npm run build
```

Para previsualizar la versión de producción localmente:

```bash
npm run preview
```

## Lint

Para ejecutar el linter (ESLint):

```bash
npm run lint
```

## Uso

1. Abre la aplicación en el navegador.
2. Haz clic en **Cargar archivo** y selecciona un archivo Excel (.xlsx) con los registros de asistencia.
3. Ajusta la **jornada base** (en minutos) desde el panel de configuración.
4. Usa la barra de búsqueda y el filtro de alertas para explorar los registros.
5. Haz clic en **Exportar a Excel** para descargar los resultados calculados.
