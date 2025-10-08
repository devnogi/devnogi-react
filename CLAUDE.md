# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevNogi Front is a Next.js 15 application using the App Router, built for a Mabinogi information community. The project implements a BFF (Backend for Frontend) pattern to communicate efficiently with microservices.

**Tech Stack:**
- Next.js 15.3.3 (App Router)
- TypeScript 5
- React 19
- Tailwind CSS v4 + Shadcn/UI
- TanStack Query for data fetching
- MSW (Mock Service Worker) for API mocking
- Jest + React Testing Library

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Run all tests
npm test

# Run tests for specific files (used by lint-staged)
npm test -- --bail --findRelatedTests <file-paths>
```

## API Documentation

### Backend Architecture

모든 API는 **게이트웨이 서버**를 통해 호출되며, prefix를 통해 각 백엔드 서비스로 라우팅됩니다.

**게이트웨이 서버 (모든 API 통과):**
```
http://168.107.43.221:8080/
```

**백엔드 서비스:**

1. **OPEN API BATCH 서버** (경매장 관련)
   - Prefix: `/oab`
   - Swagger: http://138.2.126.248:8080/swagger-ui/index.html
   - 담당: 경매장, 거래 내역 등 경매 관련 모든 기능

2. **커뮤니티 서버** (커뮤니티 관련)
   - Prefix: `/dcs/api`
   - Swagger: http://3.39.119.27/swagger-ui/index.html
   - 담당: 게시판, 게시글, 댓글 등 커뮤니티 관련 모든 기능
   - API 응답 구조: `{ success: boolean, code: string, message: string, data: T, timestamp: string }`

### API 호출 예시

**경매장 API:**
```
Client → /api/auction-history
  → Gateway: http://168.107.43.221:8080/oab/auction-history
    → OPEN API BATCH 서버: http://138.2.126.248:8080
```

**커뮤니티 API:**
```
Client → /api/boards
  → Gateway: http://168.107.43.221:8080/dcs/api/boards
    → 커뮤니티 서버: http://3.39.119.27
```

### Slash Commands

Use the following slash commands to access API specifications:
- `/api-spec` - Fetch and display all available API endpoints
- `/api-endpoint` - Get details for a specific API endpoint (replace {{ENDPOINT_PATH}} with actual path)

## Architecture

### Route Group Structure

The app uses Next.js route groups for layout organization:
- `(auth)/` - Authentication pages (sign-in)
- `(main)/` - Main application pages with NavBar (auction, auction-history, community)

### BFF Pattern with Next.js API Routes

The app implements BFF using Next.js API routes in `src/app/api/`:
- Client-side code calls `/api/*` endpoints
- API routes use `createServerAxios()` to forward requests to the gateway
- Gateway server routes to appropriate backend service based on prefix

**서비스별 API 라우팅:**
- **경매장 뷰** → OPEN API BATCH 서버 (prefix: `/oab`)
- **커뮤니티 뷰** → 커뮤니티 서버 (prefix: `/dcs`)

**Example flow (Community):**
1. Client component calls `clientAxios.get("/posts")`
2. Request → Next.js API route (`src/app/api/posts/route.ts`)
3. API route forwards to Gateway using `createServerAxios(request)`
4. Gateway routes to **커뮤니티 서버** via `http://168.107.43.221:8080/dcs/posts`
5. 커뮤니티 서버 (http://3.39.119.27) processes request
6. Response returns to client

**Example flow (Auction):**
1. Client component calls `clientAxios.get("/auction-history")`
2. Request → Next.js API route (`src/app/api/auction-history/route.ts`)
3. API route forwards to Gateway using `createServerAxios(request)`
4. Gateway routes to **OPEN API BATCH 서버** via `http://168.107.43.221:8080/oab/auction-history`
5. OPEN API BATCH 서버 (http://138.2.126.248:8080) processes request
6. Response returns to client

### API Layer (`src/lib/api/`)

**Client-side:** `clientAxios` in `clients.ts`
- Base URL: `/api` (routes through Next.js API routes)
- Used in client components
- Timeout: 5000ms

**Server-side:** `createServerAxios()` in `server.ts`
- Base URL: `process.env.GATEWAY_BASE_URL`
- Used in API route handlers
- Forwards Authorization and Cookie headers
- Initializes MSW server for mocking

**TanStack Query:** Configured in `clients.ts` with:
- `staleTime: 200ms`
- Refetch disabled on window focus, reconnect, and mount

### API Mocking with MSW

The project uses MSW for API mocking in development/preview environments:

**Configuration:**
- `initMockServer()` in `src/mocks/initServer.ts` starts MSW server
- Called automatically by `createServerAxios()`
- Only runs when `VERCEL_ENV=development|preview` AND `API_MOCKING=enabled`
- Mock handlers defined in `src/mocks/server.ts`
- Mock data stored in `src/mocks/data/*.json`

**Testing:**
- `jest.setup.ts` configures MSW for all tests
- MSW server starts before all tests, resets after each test

### Component Organization

- `src/components/page/` - Page-specific components (auction, auction-history, community)
- `src/components/ui/` - Shadcn UI components
- Components in `page/` subdirectories correspond to route pages

### Environment Variables

Create `.env` from `.sample_env`:
- `NODE_ENV` - Runtime environment
- `VERCEL_ENV` - Vercel environment (development/preview/production)
- `API_MOCKING` - Enable/disable MSW (`enabled` | `disabled`)
- `GATEWAY_BASE_URL` - Backend gateway URL

### Path Aliases

TypeScript and Jest both use `@/` to reference `src/`:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- etc.

## Code Quality

### Pre-commit Hooks (Husky + lint-staged)

On commit, the following runs automatically on staged files:
1. Prettier formatting
2. ESLint fixes
3. Jest tests for changed files

### ESLint

- `eslint.config.mjs` uses Next.js config
- Builds succeed even with ESLint errors (see `next.config.ts`)

### Testing

- Uses `jest-fixed-jsdom` environment for Next.js 15 compatibility
- Test files colocated with source: `*.test.tsx` next to `*.tsx`
- MSW automatically available in all tests

## Git Workflow

- Main branch: `main`
- Uses GitHub Flow: create feature branch → PR → merge to main
- Branch naming: `feat/`, `fix/`, `docs/`, etc.
- Commit convention: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

## Font Copyright

The Mabinogi Classic OTF font (`src/app/Mabinogi_Classic_OTF.otf`) has copyright restrictions:
- Do NOT convert to WOFF or other formats
- Must use original file as-is

---

## Development Principles

### TypeScript Principles

**Type Safety First:**
- Explicit type definitions for all variables, functions, and components
- Avoid `any`, prefer `unknown`
- Leverage generics for reusable type definitions

**Interface Segregation:**
- Small, specific interfaces over large ones
- Component props should only include necessary attributes
- Use union types and generics for flexible type design

**Type Inference:**
- Leverage TypeScript's type inference
- Avoid unnecessary type annotations
- Use `const assertions` and `as const`

### React Principles

**Single Responsibility:**
- Each component has one clear responsibility
- Keep components under 200 lines
- Extract complex logic to custom hooks

**Immutability:**
- Always create new objects/arrays when updating state
- Never mutate state directly
- Use spread operator and destructuring

**Pure Function Components:**
- Write components as pure functions without side effects
- Rendering should depend only on props
- Use `React.memo` to prevent unnecessary re-renders

**Hook Rules:**
- Call hooks only at top level of components
- Never use hooks inside conditionals or loops
- Custom hooks must start with `use` prefix

### Next.js Principles

**File-based Routing:**
- Organize pages and layouts in appropriate directory structure
- Use `[param]` folders for dynamic routing
- Place API routes in `app/api` directory

**Server Components First:**
- Use server components by default
- Only use `'use client'` directive when necessary
- Handle data fetching in server components

**Metadata Management:**
- Set appropriate metadata for each page
- Use `generateMetadata` function for dynamic metadata
- Include structured data for SEO optimization

### State Management

**Local State First:**
- Avoid global state when component state suffices
- Consider global state only when props drilling exceeds 3 levels
- Limit Context API to appropriate scope

**State Normalization:**
- Use flat state structure instead of nested objects
- Manage data relationships with ID-based references
- Eliminate duplicate data

### Performance Optimization

**Code Splitting:**
- Leverage automatic route-based code splitting
- Split large components with dynamic imports
- Monitor bundle size

**Memoization Strategy:**
- Appropriate use of `useMemo` and `useCallback`
- Minimize dependency arrays
- Avoid unnecessary memoization

**Image Optimization:**
- Use Next.js Image component
- Choose appropriate image format and size
- Apply lazy loading

### Error Handling

**Type-safe Error Handling:**
- Explicitly define error types
- Use Error Boundary components
- Provide user-friendly error messages

**Form Validation:**
- Validate on both client and server
- Provide real-time feedback
- Display errors with accessibility in mind

### Testing

**Component Testing:**
- Test key functionality of each component
- Test user interaction scenarios
- Include accessibility tests

**Integration Testing:**
- Page-level integration tests
- API route tests
- Data flow tests

### Accessibility

**Semantic HTML:**
- Use appropriate HTML tags
- Utilize ARIA attributes
- Support keyboard navigation

**Color Contrast:**
- Comply with WCAG 2.1 AA standards
- Never convey information with color alone
- Support high contrast mode

### Security

**Input Validation:**
- Validate all user input
- Prevent XSS attacks
- Use CSRF tokens

**Environment Variables:**
- Manage sensitive information via environment variables
- Never expose to client-side
- Separate configurations per environment

### Code Quality

**Consistent Coding Style:**
- Follow ESLint and Prettier rules
- Consistent naming conventions
- Comments and documentation

**Continuous Refactoring:**
- Detect and fix code smells early
- Minimize technical debt
- Regular code reviews

## Git Commit Convention

### Commit Message Structure

```
<type>: <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add user login functionality` |
| `fix` | Bug fix | `fix: improve error handling on login` |
| `docs` | Documentation | `docs: update README` |
| `style` | Code formatting (no functionality change) | `style: fix code formatting` |
| `refactor` | Code refactoring (no functionality change) | `refactor: improve component structure` |
| `test` | Add or modify test code | `test: add login component tests` |
| `chore` | Build process or auxiliary tool changes | `chore: update package dependencies` |
| `perf` | Performance improvement | `perf: optimize image loading` |
| `ci` | CI/CD configuration changes | `ci: add GitHub Actions workflow` |
| `build` | Build system or external dependency changes | `build: update webpack config` |
| `revert` | Revert previous commit | `revert: feat: add user login functionality` |
| `infra` | Infrastructure changes | `infra: add Docker configuration` |
| `design` | UI/UX design changes | `design: improve button styles` |
| `security` | Security-related changes | `security: add XSS prevention logic` |

### Subject Rules

- Max 50 characters
- Start with lowercase
- No period at the end
- Use imperative present tense (add, fix, update, remove)
- No past or future tense

### Body (Optional)

- Line break at 72 characters
- Explain what and why changed
- How it changed can be seen in code (omit)

### Footer (Optional)

**Issue References:**
```
Closes: #123
Fixes: #456
Resolves: #789
```

**Breaking Changes:**
```
BREAKING CHANGE: API response format changed.

Before: { user: { name: string } }
After: { user: { firstName: string, lastName: string } }
```

### Commit Message Checklist

- [ ] Type is clear and appropriate?
- [ ] Subject is within 50 characters?
- [ ] Subject uses imperative present tense?
- [ ] Subject starts with lowercase?
- [ ] Subject doesn't end with period?
- [ ] Body line breaks at 72 characters (if applicable)?
- [ ] Issue number referenced (if applicable)?
- [ ] Breaking Changes specified (if applicable)?
