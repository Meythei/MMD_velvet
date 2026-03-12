import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    {
      name: 'lang-as-json',
      transform(code, id) {
        if (id.split('?')[0].endsWith('.lang')) {
          return {
            code: `export default ${code};`,
            map: null,
          };
        }
      },
    },
  ],
});
