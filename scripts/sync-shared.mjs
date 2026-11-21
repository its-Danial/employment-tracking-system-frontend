/**
 * Copies the API contract (types + constants) from the backend's `shared/` folder into
 * `src/shared/`, so the frontend never re-defines backend types by hand.
 *
 * The copy is committed, so the frontend still builds on its own (CI, hosting).
 *
 *   npm run sync:shared              backend checked out next to this repo (../backend)
 *   BACKEND_DIR=/path/to/backend npm run sync:shared
 *   npm run sync:shared -- --check   exit 1 if src/shared is out of date (skips if no backend)
 */
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const frontendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const backendDir = path.resolve(frontendDir, process.env.BACKEND_DIR ?? '../backend')
const sourceDir = path.join(backendDir, 'shared')
const targetDir = path.join(frontendDir, 'src', 'shared')
const checkOnly = process.argv.includes('--check')

const HEADER =
  '// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend\n' +
  '// and run `npm run sync:shared`.\n\n'

if (!existsSync(sourceDir)) {
  const message = `Backend shared folder not found at ${sourceDir} (set BACKEND_DIR)`
  if (checkOnly) {
    console.warn(`${message}, skipping check.`)
    process.exit(0)
  }
  console.error(message)
  process.exit(1)
}

const sourceFiles = (await readdir(sourceDir)).filter((file) => file.endsWith('.ts'))
const expected = new Map(
  await Promise.all(
    sourceFiles.map(async (file) => [
      file,
      HEADER + (await readFile(path.join(sourceDir, file), 'utf8')),
    ])
  )
)

const currentFiles = existsSync(targetDir)
  ? (await readdir(targetDir)).filter((file) => file.endsWith('.ts'))
  : []

if (checkOnly) {
  const outdated = [...expected].filter(([file, content]) => {
    const target = path.join(targetDir, file)
    return !existsSync(target) || readFileSync(target, 'utf8') !== content
  })
  const removed = currentFiles.filter((file) => !expected.has(file))
  if (outdated.length || removed.length) {
    console.error('src/shared is out of date, run `npm run sync:shared`')
    process.exit(1)
  }
  console.log('src/shared is up to date')
  process.exit(0)
}

await mkdir(targetDir, { recursive: true })
for (const file of currentFiles) {
  if (!expected.has(file)) await rm(path.join(targetDir, file))
}
for (const [file, content] of expected) await writeFile(path.join(targetDir, file), content)
console.log(`Synced ${expected.size} files from ${path.relative(frontendDir, sourceDir)}`)
