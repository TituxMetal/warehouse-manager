import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

import { describe, expect, it } from 'bun:test'

// Guard against the mock.module leak described in issue #11.
//
// mock.module() is process-wide and cannot be undone by mock.restore(), so a
// spec that mocks a module also affects every other spec that resolves that
// same module.
//
// A spec is only at risk if it imports a module for real *without* mocking it
// itself: it then receives whichever stub another spec installed. That is
// exactly how user.service.spec.ts broke -- it imported ../api/user.service for
// real while EditProfileContainer.spec.tsx mocked that path.
//
// The rule enforced here is therefore: if a spec imports a module that some
// other spec mocks, that spec must mock it too.
//
// Mocking only, without importing, is safe: the mock is installed before
// anything resolves the module. That is why most authClient specs coexist.
//
// apps/web runs `bun test --isolate`, so this guard is defence in depth: it
// catches the offending pattern at authoring time even if isolation is dropped.

const SRC = join(import.meta.dir, '..')

/** Alias roots from tsconfig paths, resolved to real directories. */
const ALIAS_ROOTS: Record<string, string> = {
  '~/': SRC
}

const collectFiles = (dir: string, pattern: RegExp): string[] =>
  readdirSync(dir).flatMap(entry => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return collectFiles(full, pattern)
    return pattern.test(entry) ? [full] : []
  })

const read = (file: string): string => readFileSync(file, 'utf8')

/**
 * Best-effort resolution of a module specifier used inside a spec file to the
 * absolute path of the file it points at. Returns null when it cannot resolve
 * (bare package, JSON, etc.), in which case the specifier is compared textually.
 */
const resolveSpecifier = (specifier: string, fromFile: string): string | null => {
  const withExtension = (base: string): string | null => {
    for (const candidate of [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      join(base, 'index.ts'),
      join(base, 'index.tsx')
    ]) {
      try {
        if (statSync(candidate).isFile()) return candidate
      } catch {
        // keep trying
      }
    }
    return null
  }

  for (const [alias, root] of Object.entries(ALIAS_ROOTS)) {
    if (specifier.startsWith(alias)) {
      return withExtension(join(root, specifier.slice(alias.length)))
    }
  }

  if (specifier.startsWith('.')) {
    return withExtension(resolve(dirname(fromFile), specifier))
  }

  return null
}

const MOCK_MODULE = /mock\.module\(\s*(['"])([^'"]+)\1/g
const IMPORT_FROM = /from\s+(['"])([^'"]+)\1/g
const BARE_IMPORT = /import\(\s*(['"])([^'"]+)\1\s*\)/g

/** The identity used to compare two specifiers: resolved path, else raw text. */
const identity = (specifier: string, fromFile: string): string =>
  resolveSpecifier(specifier, fromFile) ?? specifier

const collectMatches = (source: string, pattern: RegExp): string[] => {
  const found: string[] = []
  for (const match of source.matchAll(pattern)) found.push(match[2])
  return found
}

describe('test isolation', () => {
  const specFiles = collectFiles(SRC, /\.spec\.tsx?$/)

  it('finds the spec files to inspect', () => {
    expect(specFiles.length).toBeGreaterThan(0)
  })

  it('every spec that imports a module mocked elsewhere also mocks it', () => {
    const mockedSomewhere = new Set<string>()
    const perSpec = new Map<string, { mocked: Set<string>; imported: Set<string> }>()

    for (const specFile of specFiles) {
      const source = read(specFile)

      const mocked = new Set(
        collectMatches(source, MOCK_MODULE).map(specifier => identity(specifier, specFile))
      )
      const imported = new Set(
        [...collectMatches(source, IMPORT_FROM), ...collectMatches(source, BARE_IMPORT)].map(
          specifier => identity(specifier, specFile)
        )
      )

      perSpec.set(specFile, { mocked, imported })
      for (const id of mocked) mockedSomewhere.add(id)
    }

    const leaks: string[] = []
    for (const [specFile, { mocked, imported }] of perSpec) {
      for (const id of imported) {
        // The spec resolves a module that another spec replaces with a stub, and
        // does not install its own stub: it would receive the foreign one.
        if (mockedSomewhere.has(id) && !mocked.has(id)) {
          leaks.push(`${specFile} imports ${id} without mocking it`)
        }
      }
    }

    expect(leaks).toEqual([])
  })
})
