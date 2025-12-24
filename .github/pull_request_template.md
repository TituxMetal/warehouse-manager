# Pull Request

## Summary

Brief description of the changes and their purpose.

- Change 1: Brief description
- Change 2: Brief description
- Change 3: Brief description

## Type of Change

- [ ] 🚀 New feature (non-breaking change that adds functionality)
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as
      expected)
- [ ] 📚 Documentation update (changes to documentation only)
- [ ] 🎨 Style/formatting changes (code formatting, whitespace, etc.)
- [ ] ♻️ Refactoring (code change that neither fixes a bug nor adds a feature)
- [ ] 🧪 Test updates (adding missing tests or correcting existing tests)
- [ ] 🔧 Chore (changes to build process, auxiliary tools, etc.)

## Affected Areas

- [ ] 🔐 Authentication (`apps/api/src/users/`, `apps/web/src/stores/auth.ts`)
- [ ] 🏗️ Backend API (`apps/api/`)
- [ ] 🌐 Frontend Web (`apps/web/`)
- [ ] 🎨 UI Components (`apps/web/src/components/`)
- [ ] 📊 Database Schema (`apps/api/prisma/`)
- [ ] 📦 Shared Packages (`packages/`)
- [ ] 🐳 Docker/Deployment (`docker/`, CI/CD)
- [ ] 📖 Documentation (`docs/`, README)

## Testing Checklist

### Backend (API) Testing

- [ ] Unit tests pass (`bun run --cwd apps/api test`)
- [ ] Integration tests pass (if applicable)
- [ ] Database migrations work correctly
- [ ] API endpoints return expected responses

### Frontend (Web) Testing

- [ ] Component tests pass (`bun run --cwd apps/web test`)
- [ ] Pages load correctly in browser
- [ ] User interactions work as expected
- [ ] Responsive design tested on different screen sizes

### End-to-End Testing

- [ ] Manual testing completed
- [ ] Critical user flows tested
- [ ] Authentication flows tested (if applicable)

## Code Quality Checklist

- [ ] ✅ Linting passes (`bun run lint:check`)
- [ ] 🔍 TypeScript type checking passes (`bun run typecheck`)
- [ ] 🎨 Code is formatted with Prettier (`bun run format:check`)
- [ ] 🏗️ Build succeeds (`bun run build`)
- [ ] 📝 All tests pass (`bun run test`)

## Deployment Considerations

- [ ] Environment variables updated (if needed)
- [ ] Database migrations included (if needed)
- [ ] Docker build tested (`bun run docker:build:all`)
- [ ] No breaking changes to existing APIs
- [ ] Backwards compatibility maintained

## Breaking Changes

If this PR introduces breaking changes, describe them here:

- Breaking change 1: Description and migration steps
- Breaking change 2: Description and migration steps

## Additional Notes

Any additional context, screenshots, or information that would be helpful for reviewers:

## Related Issues

Closes #123 Refs #456  
Fixes #789

---

**Reviewer Guidelines:**

- Verify all checklist items are completed
- Test the changes locally when possible
- Check for code quality and adherence to project conventions
- Ensure proper error handling and edge cases are covered
