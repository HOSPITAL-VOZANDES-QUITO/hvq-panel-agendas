/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Configuración explícita para navegadores antiguos
      overrideBrowserslist: [
        'last 2 versions',
        '> 0.5%',
        'ie 11',
        'Chrome >= 61',
        'Firefox >= 50',
        'Safari >= 11',
        'Edge >= 16',
        'not dead',
        'not < 0.1%'
      ],
      // Añadir prefijos para propiedades CSS modernas
      grid: 'autoplace',
      flexbox: 'no-2009'
    },
  },
}

export default config
