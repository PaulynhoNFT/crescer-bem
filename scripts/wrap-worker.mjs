import { rename, writeFile } from 'node:fs/promises'

await rename('dist/server/index.js', 'dist/server/app.js')
await writeFile(
  'dist/server/index.js',
  "import handler from './app.js';\nexport default { fetch(request, env, ctx) { return handler(request, env, ctx); } };\n"
)
