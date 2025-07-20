// api/vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Permite usar describe, it, expect, etc. sem importar
    environment: 'node',
  },
})