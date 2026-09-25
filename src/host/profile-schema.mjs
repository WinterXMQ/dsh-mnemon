import * as cosmokit from '@deepseek-ai/cosmokit'
import { createRequire } from 'node:module'
import LegacySchema from 'schemastery'

// Desktop generations share the host's framework packages. Older hosts own
// Cosmokit 1.8.3, which cannot even link the live schema's named imports.
// Inspect the public capability before importing that optional runtime path.
const predicate = Reflect.get(cosmokit, 'isVolatile')
export const supportsLiveConfig = typeof predicate === 'function'
  && typeof Reflect.get(cosmokit, 'createVolatile') === 'function'
export const isVolatile = value => supportsLiveConfig && predicate(value)

// Keep the public ESM runtime while isolating its incompatible global types.
// Resolve the live schema through createRequire instead of a top-level await:
// Electron's require(esm) rejects TLA modules (ERR_REQUIRE_ASYNC_MODULE), which
// failed the host import and cascaded into a missing client-graph row.
const requireLiveSchema = createRequire(import.meta.url)
export default supportsLiveConfig
  ? (() => { const live = requireLiveSchema('schemastery-live'); return live.default ?? live })()
  : LegacySchema
