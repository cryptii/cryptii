import { defineConfig } from 'vite'

export default defineConfig({
  base: '',
  build: {
    outDir: 'dist',
    manifest: 'manifest.json'
  },
  plugins: [
    {
      name: 'remove-attributes',
      transformIndexHtml: (html) =>
        html.replaceAll(/( type="module")? crossorigin/g, '')
    }
  ]
})
