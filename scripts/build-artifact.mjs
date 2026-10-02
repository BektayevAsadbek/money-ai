// Bundles the app into one self-contained HTML page (inline CSS + JS) for claude.ai Artifacts.
// Usage: npm run build:artifact  →  dist-artifact/hamyon.html
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

execSync('npx vite build --outDir dist-artifact/tmp --emptyOutDir', { stdio: 'inherit', env: { ...process.env, VITE_ROUTER: 'memory' } })

const dir = 'dist-artifact/tmp/assets'
const files = readdirSync(dir)
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n')
const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(`${dir}/${f}`, 'utf8')).join('\n')
  .replace(/<\/script/gi, '<\\/script')

const html = `<title>Hamyon</title>
<meta name="theme-color" content="#0E0F0C">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=Unbounded:wght@500;600;700&display=swap">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`
mkdirSync('dist-artifact', { recursive: true })
writeFileSync('dist-artifact/hamyon.html', html)
console.log(`dist-artifact/hamyon.html — ${(html.length / 1024).toFixed(0)} KB`)
