import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const validatorPath = fileURLToPath(new URL('./validate-supabase-key.mjs', import.meta.url))

function runValidator(key) {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      VITE_SUPABASE_PUBLISHABLE_KEY: key,
    },
  })
}

test('accepts a publishable key format', () => {
  const result = runValidator('sb_publishable_fake_test_key')

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /format check passed/)
})

test('rejects a secret key format without printing its value', () => {
  const secretKey = 'sb_secret_fake_test_key'
  const result = runValidator(secretKey)

  assert.equal(result.status, 1)
  assert.match(result.stderr, /expected a key starting with "sb_publishable_"/)
  assert.doesNotMatch(result.stderr, new RegExp(secretKey))
})
