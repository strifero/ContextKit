// skills.ts — Skill and agent file content library
// Each entry is a self-contained SKILL.md following the Agent Skills open standard.
// https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

export interface SkillFile {
  path: string;     // relative path inside .claude/
  content: string;
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const SKILL_TYPESCRIPT: SkillFile = {
  path: 'skills/typescript/SKILL.md',
  content: `---
name: typescript
description: TypeScript patterns, type definitions, async conventions, and module structure. Use whenever writing, editing, or reviewing TypeScript code, defining types or interfaces, handling async logic, or structuring modules. Also trigger for strict mode errors, generics, or type inference questions.
---

# TypeScript Conventions

## Compiler Settings
- \`"strict": true\` — non-negotiable
- \`noUncheckedIndexedAccess: true\` — always guard array/object access
- \`exactOptionalPropertyTypes: true\`
- Target \`ES2022\` or later

## Type Definitions
- Prefer \`interface\` for object shapes; \`type\` for unions, intersections, and primitives
- Never use \`any\` — use \`unknown\` and narrow with type guards
- Avoid type assertions (\`as X\`) unless you control both sides
- Export types from a dedicated \`types.ts\` per module

## Async Patterns
- Always \`async/await\` — never raw \`.then()\` chains in application code
- Wrap external calls in try/catch; rethrow with context
- Use \`Promise.all()\` for independent parallel operations

## Error Handling
- API boundaries: return \`{ error: string }\` with the appropriate HTTP status
- Never swallow errors silently — always log at minimum

## Naming
- Files: \`kebab-case.ts\`
- Classes/Interfaces/Types: \`PascalCase\`
- Functions/variables: \`camelCase\`
- Constants: \`SCREAMING_SNAKE_CASE\`
- Booleans: prefix with \`is\`, \`has\`, \`can\`, \`should\`

## Imports
- Use path aliases (\`@/lib/...\`) — no deep relative paths
- Group: external → internal → types → relative
`,
};

export const SKILL_NODEJS: SkillFile = {
  path: 'skills/nodejs/SKILL.md',
  content: `---
name: nodejs
description: Node.js runtime conventions, environment configuration, process management, and server bootstrap patterns. Use whenever writing server entry points, handling env vars, setting up process signals, or debugging Node.js runtime issues.
---

# Node.js Conventions

## Runtime
- Node.js 20+ LTS — use native \`fetch\`, \`crypto\`
- Always specify \`"engines": { "node": ">=20" }\` in package.json

## Environment Variables
- Validate all required env vars at startup — fail fast
\`\`\`typescript
const required = ['DATABASE_URL', 'API_KEY'];
for (const key of required) {
  if (!process.env[key]) throw new Error(\`Missing env var: \${key}\`);
}
\`\`\`
- Never read \`process.env\` deep in business logic — read at startup, pass down

## Process Management
- Handle \`SIGTERM\` and \`SIGINT\` for graceful shutdown
- Register \`process.on('unhandledRejection', ...)\` at startup — log + exit(1)

## Logging
- Structured JSON logging (pino or similar) in production
- Log level via \`LOG_LEVEL\` env var
- Always include: timestamp, level, message, module

## Package Conventions
- Commit \`package-lock.json\`
- Pin exact versions for infrastructure packages
- Scripts: always define \`start\`, \`build\`, \`dev\`, \`typecheck\`, \`lint\`
`,
};

export const SKILL_EXPRESS: SkillFile = {
  path: 'skills/express/SKILL.md',
  content: `---
name: express
description: Express.js route structure, middleware patterns, error handling, and API response conventions. Use whenever creating routes, middleware, request validation, or error handlers. Also trigger for REST API design, auth middleware, or CORS questions.
---

# Express.js Conventions

## Router Structure
- One router per domain (\`routes/users.ts\`, \`routes/orders.ts\`)
- Routers are thin — all logic lives in \`lib/\`
- Mount routers in \`app.ts\`, not \`server.ts\`

\`\`\`typescript
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await getItem(req.params.id);
    if (!item) { res.status(404).json({ error: 'Not found' }); return; }
    res.json(item);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
\`\`\`

## Response Conventions
- Error: \`{ error: string }\` — always the \`error\` key
- 400 — validation failure | 401 — no auth | 403 — forbidden
- 404 — not found | 409 — conflict | 500 — server error

## Auth Middleware
\`\`\`typescript
export async function requireAuth(req: Request): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('Missing authorization header');
}
\`\`\`

## Middleware Order
1. \`express.json()\`  2. CORS  3. Logging  4. Routes  5. 404 handler  6. Error handler
`,
};

export const SKILL_NEXTJS: SkillFile = {
  path: 'skills/nextjs/SKILL.md',
  content: `---
name: nextjs
description: Next.js App Router conventions — Server Components, Client Components, API routes, data fetching, and project structure. Use whenever building or editing Next.js pages, layouts, API routes, or server actions. Also trigger for routing, metadata, or image optimization questions.
---

# Next.js App Router Conventions

## Structure
\`\`\`
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home
├── (marketing)/        # Route group — no URL segment
├── dashboard/
│   ├── layout.tsx
│   └── page.tsx
└── api/
    └── route.ts
\`\`\`

## Server vs Client Components
- Default: Server Component (no \`'use client'\`)
- Add \`'use client'\` only for: hooks, browser APIs, event listeners, real-time state
- Keep Client Components as leaf nodes

## Data Fetching
\`\`\`typescript
export default async function Page() {
  const data = await fetchData(); // direct, no useEffect
  return <UI data={data} />;
}
\`\`\`
- \`cache: 'no-store'\` for dynamic data, \`next: { revalidate: 60 }\` for ISR

## API Routes
\`\`\`typescript
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  return NextResponse.json(await getData(id));
}
\`\`\`

## Environment Variables
- Server-only: \`SOME_KEY\`
- Client-exposed: \`NEXT_PUBLIC_SOME_KEY\`

## Images
- Always \`next/image\` — never raw \`<img>\`
- \`priority\` prop on above-the-fold images only
`,
};

export const SKILL_REACT: SkillFile = {
  path: 'skills/react/SKILL.md',
  content: `---
name: react
description: React component patterns, hooks, state management, and accessibility conventions. Use whenever building React components, managing state, handling forms, writing custom hooks, or composing UI. Also trigger for performance, memoization, or accessibility questions.
---

# React Conventions

## Component Structure
\`\`\`typescript
interface Props { id: string; onDone?: () => void; }

export function MyComponent({ id, onDone }: Props) {
  // 1. Hooks  2. Derived state  3. Handlers  4. Effects  5. Render
}
\`\`\`
- Named exports (except Next.js pages)

## State Management
- Local: \`useState\` / \`useReducer\`
- Server state: React Query / SWR — never \`useEffect\` + \`fetch\`
- Global: Zustand (avoid Context for frequently-updating state)
- URL state: \`useSearchParams\`

## Custom Hooks
- Extract logic used in 2+ components
- Return an object, not a tuple
- Name: \`use<Domain><Action>\`

## Performance
- \`memo()\` only after measuring — not preemptively
- Key prop: stable IDs, never array index

## Accessibility
- Keyboard navigable interactive elements
- Descriptive \`alt\` on all images
- \`<label>\` associated with every form field
- Semantic HTML: \`<button>\`, \`<nav>\`, \`<main>\`

## Error Boundaries
- Wrap each major section in an Error Boundary
`,
};

export const SKILL_TAILWIND: SkillFile = {
  path: 'skills/tailwind/SKILL.md',
  content: `---
name: tailwind
description: Tailwind CSS utility class patterns, responsive design, and component composition. Use whenever writing or reviewing UI styles, building responsive layouts, or extracting reusable patterns. Also trigger for dark mode, animation, or custom theme questions.
---

# Tailwind CSS Conventions

## Core Principles
- Utility-first: compose in JSX, extract to components when reused 3+ times
- Use \`cn()\` (clsx + tailwind-merge) for conditional classes:
\`\`\`typescript
import { cn } from '@/lib/utils';
<div className={cn('base', condition && 'conditional', className)} />
\`\`\`

## Responsive (mobile-first)
\`\`\`
className="flex flex-col md:flex-row gap-4"
\`\`\`
- \`sm:\` 640px | \`md:\` 768px | \`lg:\` 1024px | \`xl:\` 1280px

## Common Patterns
\`\`\`
Card:   rounded-xl border bg-card p-6 shadow-sm
Button: inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors
Input:  flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:ring-2
\`\`\`

## Colors
- Define brand colors in \`tailwind.config.ts\` under \`theme.extend.colors\`
- Semantic names: \`primary\`, \`secondary\`, \`destructive\`, \`muted\`
- Dark mode: \`dark:\` prefix via \`class\` strategy

## Do NOT
- Inline \`style={{}}\` for things Tailwind covers
- Arbitrary values \`[42px]\` — rethink the design
`,
};

export const SKILL_SWIFTUI: SkillFile = {
  path: 'skills/swiftui/SKILL.md',
  content: `---
name: swiftui
description: Swift and SwiftUI patterns — view composition, @Observable state, async/await, navigation, and iOS architecture. Use whenever writing SwiftUI views, managing state, calling APIs, implementing navigation, or preparing for App Store submission.
---

# SwiftUI / Swift Conventions

## Structure
\`\`\`
App/
├── AppEntry.swift
├── Models/         # Codable structs
├── Services/       # API clients, storage
├── ViewModels/     # @Observable
├── Views/
│   ├── Components/
│   └── Screens/
└── Extensions/
\`\`\`

## State — Use @Observable
\`\`\`swift
@Observable
final class ViewModel {
  var items: [Item] = []
  var isLoading = false
  var error: String?

  func load() async {
    isLoading = true
    defer { isLoading = false }
    do { items = try await service.fetchAll() }
    catch { self.error = error.localizedDescription }
  }
}

struct MyView: View {
  @State private var vm = ViewModel()
  var body: some View {
    List(vm.items) { ItemRow(item: $0) }
      .task { await vm.load() }
  }
}
\`\`\`

## Async
- \`.task { }\` for lifecycle-tied work
- \`@MainActor\` on UI-updating classes
- No \`DispatchQueue.main.async\`

## Navigation
\`\`\`swift
NavigationStack(path: $router.path) {
  RootView()
    .navigationDestination(for: Route.self) { route in
      switch route {
      case .detail(let id): DetailView(id: id)
      }
    }
}
\`\`\`

## Quality Bar
- No force unwraps (\`!\`) in production code
- Every async op has loading + error state
- \`[weak self]\` in closures that capture self
`,
};

export const SKILL_STRIPE: SkillFile = {
  path: 'skills/stripe/SKILL.md',
  content: `---
name: stripe
description: Stripe integration — payments, subscriptions, webhooks, and the customer portal. Use whenever implementing checkout, subscriptions, webhook handlers, or billing queries. Also trigger for trial periods, proration, or payment link questions.
---

# Stripe Conventions

## Initialization
\`\`\`typescript
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
\`\`\`

## Webhook Handling — Verify Signature Every Time
\`\`\`typescript
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    res.status(400).json({ error: 'Invalid signature' }); return;
  }
  switch (event.type) {
    case 'customer.subscription.updated': await handleUpdate(event.data.object); break;
    case 'customer.subscription.deleted': await handleCancel(event.data.object); break;
    case 'invoice.payment_failed':        await handleFailed(event.data.object);  break;
  }
  res.json({ received: true });
});
\`\`\`
- \`express.raw()\` must come before \`express.json()\` for this route

## Checkout Session
\`\`\`typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: customerId,
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: \`\${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
  cancel_url: \`\${BASE_URL}/pricing\`,
});
\`\`\`

## Check Active Status
\`\`\`typescript
const isActive = ['active', 'trialing'].includes(subscription.status);
\`\`\`

## Testing
- Test card: \`4242 4242 4242 4242\`, any future date, any CVC
- Local webhooks: \`stripe listen --forward-to localhost:3000/webhooks/stripe\`
`,
};

export const SKILL_PRISMA: SkillFile = {
  path: 'skills/prisma/SKILL.md',
  content: `---
name: prisma
description: Prisma ORM patterns — schema design, migrations, typed queries, and connection pooling. Use whenever defining models, writing queries, running migrations, or troubleshooting Prisma Client. Also trigger for N+1 problems or connection pool questions.
---

# Prisma Conventions

## Client Singleton
\`\`\`typescript
import { PrismaClient } from '@prisma/client';
const g = globalThis as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ log: ['error'] });
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
\`\`\`

## Schema
\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([email])
}
\`\`\`
- \`cuid()\` or \`uuid()\` for IDs — no auto-increment integers for external IDs
- \`@updatedAt\` on every mutable model

## Queries
\`\`\`typescript
// Fetch with relation
const user = await prisma.user.findUnique({
  where: { id },
  include: { posts: { take: 10, orderBy: { createdAt: 'desc' } } },
});

// Transaction
await prisma.$transaction(async (tx) => {
  await tx.order.create({ data: orderData });
  await tx.stock.update({ where: { id }, data: { qty: { decrement: 1 } } });
});
\`\`\`

## Avoiding N+1
- Use \`include\` / \`select\` — never loop + query
- \`findMany\` with \`where: { id: { in: ids } }\`

## Migrations
\`\`\`bash
npx prisma migrate dev --name describe_change   # dev
npx prisma migrate deploy                        # production
\`\`\`
`,
};

export const SKILL_POSTGRESQL: SkillFile = {
  path: 'skills/postgresql/SKILL.md',
  content: `---
name: postgresql
description: PostgreSQL patterns — schema design, indexes, parameterized queries, and connection pooling with node-postgres or Drizzle. Use whenever writing raw SQL, designing tables, adding indexes, or optimizing queries. Also trigger for JSONB, full-text search, or transactions.
---

# PostgreSQL Conventions

## Connection Pool
\`\`\`typescript
import { Pool } from 'pg';
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
\`\`\`
- One Pool per process — never per-request

## Schema
- Primary keys: \`gen_random_uuid()\`
- Always \`created_at TIMESTAMPTZ DEFAULT NOW()\` and \`updated_at TIMESTAMPTZ\`
- \`TIMESTAMPTZ\` not \`TIMESTAMP\` — always UTC
- Soft deletes: \`deleted_at TIMESTAMPTZ\`

## Queries — Always Parameterized
\`\`\`typescript
const { rows } = await pool.query<User>(
  'SELECT id, email FROM users WHERE id = $1 AND deleted_at IS NULL',
  [userId]
);
\`\`\`

## Indexes
\`\`\`sql
CREATE INDEX CONCURRENTLY idx_orders_user ON orders(user_id);
CREATE INDEX CONCURRENTLY idx_orders_user_date ON orders(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_active ON users(email) WHERE deleted_at IS NULL;
\`\`\`
- \`CONCURRENTLY\` in production to avoid locks

## Transactions
\`\`\`typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  // ... operations
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK'); throw e;
} finally { client.release(); }
\`\`\`
`,
};

export const SKILL_AZURE: SkillFile = {
  path: 'skills/azure/SKILL.md',
  content: `---
name: azure
description: Azure infrastructure conventions — Container Apps, Key Vault, Azure CLI, and deployment patterns. Use whenever provisioning Azure resources, configuring Container Apps, managing secrets, or writing deployment scripts. Also trigger for cost estimation or CI/CD questions.
---

# Azure Conventions

## Resource Naming (recommended pattern)
\`\`\`
Container App:  ca-<appname>-<env>
Cosmos account: cosmos-<appname>-<env>
Key Vault:      kv-<appname>-<env>
Container Reg:  cr<appname><env>   (alphanumeric only)
\`\`\`

## Container Apps Best Practices
- Scale to zero (min 0) for cost efficiency on new apps
- Always configure liveness probe on \`/health\`
- Secrets from Key Vault — never hardcode in environment
- Start with \`0.5 vCPU / 1Gi\` — scale up only under measured load

## Key Vault
- All secrets in Key Vault — not plain env vars
- Managed identity for app → Key Vault access (no SP credentials in app code)
- Naming: \`<service>-<key>\` e.g., \`db-connection-string\`, \`stripe-secret-key\`

## Deployment
1. Build + push Docker image to Azure Container Registry
2. \`az containerapp update --image <new-image>\`
3. Verify \`/health\` before marking deploy complete

## Cost Tips
- Cosmos serverless: ~$0.25/million RU — best for low/unpredictable traffic
- Container App at scale-to-zero: ~$0/mo baseline
`,
};

export const SKILL_DOCKER: SkillFile = {
  path: 'skills/docker/SKILL.md',
  content: `---
name: docker
description: Docker and container conventions — multi-stage builds, .dockerignore, health checks, and docker-compose patterns. Use whenever writing Dockerfiles, docker-compose files, or configuring container environments.
---

# Docker Conventions

## Multi-Stage Builds
\`\`\`dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

## .dockerignore
\`\`\`
node_modules
dist
.env
.git
*.log
\`\`\`

## Health Check
\`\`\`dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \\
  CMD wget -qO- http://localhost:3000/health || exit 1
\`\`\`

## Best Practices
- Pin base image tags — never \`node:latest\`
- Non-root user in production image
- One process per container
- Environment variables via runtime injection, not baked into image
`,
};

export const SKILL_GO: SkillFile = {
  path: 'skills/go/SKILL.md',
  content: `---
name: go
description: Go conventions — project structure, error handling, HTTP handlers, and concurrency patterns. Use whenever writing Go code, structuring packages, handling errors, or implementing HTTP APIs.
---

# Go Conventions

## Project Structure
\`\`\`
cmd/server/main.go    # Entry point
internal/
  handler/            # HTTP handlers
  service/            # Business logic
  store/              # Database layer
  model/              # Shared types
pkg/                  # Exportable utilities
\`\`\`

## Error Handling
\`\`\`go
// Wrap errors with context
if err != nil {
    return fmt.Errorf("getUserByID %s: %w", id, err)
}

// Sentinel errors for callers to check
var ErrNotFound = errors.New("not found")
\`\`\`
- Always handle errors — never \`_\`
- Return errors, don't panic in library code

## HTTP Handlers
\`\`\`go
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    user, err := h.svc.GetUser(r.Context(), id)
    if errors.Is(err, ErrNotFound) {
        http.Error(w, "not found", http.StatusNotFound); return
    }
    if err != nil {
        http.Error(w, "internal error", http.StatusInternalServerError); return
    }
    json.NewEncoder(w).Encode(user)
}
\`\`\`

## Concurrency
- Use \`context.Context\` for cancellation — always the first parameter
- \`sync.WaitGroup\` for goroutine coordination
- Channels for communication, mutexes for shared state protection
`,
};

export const SKILL_PYTHON: SkillFile = {
  path: 'skills/python/SKILL.md',
  content: `---
name: python
description: Python conventions — project structure, type hints, async patterns, and error handling. Use whenever writing Python code, structuring modules, adding type annotations, or implementing async logic.
---

# Python Conventions

## Project Structure
\`\`\`
src/
  myapp/
    __init__.py
    main.py           # Entry point
    api/              # Route handlers
    services/         # Business logic
    models/           # Data models (Pydantic)
    db/               # Database layer
pyproject.toml
\`\`\`

## Type Hints — Always
\`\`\`python
from typing import Optional

def get_user(user_id: str) -> Optional[User]:
    ...
\`\`\`

## Async (FastAPI / aiohttp)
\`\`\`python
@app.get("/users/{user_id}")
async def get_user(user_id: str) -> User:
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Not found")
    return user
\`\`\`

## Error Handling
- Raise specific exceptions, not generic \`Exception\`
- Use Pydantic for data validation — never trust raw input
- Log errors with context: module, function, relevant IDs

## Tooling
- \`uv\` or \`pip\` with \`pyproject.toml\`
- \`ruff\` for linting and formatting
- \`mypy\` for type checking in CI
`,
};

export const SKILL_RUST: SkillFile = {
  path: 'skills/rust/SKILL.md',
  content: `---
name: rust
description: Rust conventions — error handling with Result/Option, project structure, async with Tokio, and common patterns. Use whenever writing Rust code, handling errors, structuring crates, or implementing async logic.
---

# Rust Conventions

## Error Handling
\`\`\`rust
// Use thiserror for library errors
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
}

// anyhow for application-level errors
fn main() -> anyhow::Result<()> { ... }
\`\`\`
- Never \`unwrap()\` in production paths — use \`?\` operator
- Propagate errors, don't panic

## Project Structure
\`\`\`
src/
  main.rs
  lib.rs
  handlers/   # HTTP route handlers
  services/   # Business logic
  models/     # Data structures
  db/         # Database access
\`\`\`

## Async — Tokio
\`\`\`rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // ...
}

// Async functions return Result — not panic on error
async fn get_user(id: &str) -> Result<User, AppError> { ... }
\`\`\`

## Ownership
- Prefer borrowing (\`&T\`) over cloning
- Clone explicitly only when ownership is truly needed
- Use \`Arc<T>\` for shared state across threads
`,
};

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export const AGENT_BACKEND: SkillFile = {
  path: 'agents/backend-engineer.md',
  content: `---
name: backend-engineer
description: Specialized agent for API development, database design, and server-side logic. Invoke for building REST endpoints, designing data models, writing business logic, or reviewing backend code.
---

# Backend Engineer Agent

You are a senior backend engineer. Focus on correctness, performance, and maintainability.

## Responsibilities
- Design and implement REST API endpoints
- Design data models and database schemas
- Write business logic in service/lib modules (not in route handlers)
- Handle authentication and authorization middleware
- Ensure all external calls have timeouts and error handling

## Approach
1. Read existing code before writing — match conventions exactly
2. Check for existing utilities before creating new ones
3. Write the simplest code that solves the problem
4. Every route handler has try/catch
5. Error messages are specific, not generic

## Code Quality Bar
- Every DB call is typed
- Auth checked before data access
- No secrets in code or logs
- Input validated before any DB operation
`,
};

export const AGENT_FRONTEND: SkillFile = {
  path: 'agents/frontend-engineer.md',
  content: `---
name: frontend-engineer
description: Specialized agent for UI development — React components, styling, and client-side state. Invoke for building screens, fixing UI bugs, implementing responsive layouts, or improving UX.
---

# Frontend Engineer Agent

You are a senior frontend engineer. Focus on user experience, accessibility, and performance.

## Responsibilities
- Build React components and Next.js pages
- Implement responsive layouts
- Handle loading, error, and empty states in every component
- Ensure keyboard navigation and screen reader accessibility
- Optimize for Core Web Vitals

## Approach
1. Check existing components before building new ones — reuse, don't duplicate
2. Mobile-first — test narrow screens before wide
3. Every interactive element needs hover, focus, and active states
4. Every async operation needs a loading state
5. Always test the error state

## Component Quality Bar
- TypeScript props interface
- Loading, error, empty states handled
- Responsive across breakpoints
- Keyboard navigable
`,
};

export const AGENT_IOS: SkillFile = {
  path: 'agents/ios-engineer.md',
  content: `---
name: ios-engineer
description: Specialized agent for SwiftUI and iOS development. Invoke for building iOS screens, implementing Swift concurrency, integrating APIs, or debugging Xcode issues.
---

# iOS Engineer Agent

You are a senior iOS engineer specializing in Swift and SwiftUI.

## Responsibilities
- Build SwiftUI views and navigation flows
- Implement @Observable view models
- Integrate REST APIs with async/await
- Handle iOS lifecycle and error states
- Prepare for App Store submission

## Approach
1. Use @Observable — not ObservableObject/Combine
2. Keep views declarative — logic in view models
3. Handle all network error states
4. No force unwraps (\`!\`) in production code

## Quality Bar
- Every async operation has loading and error state
- \`[weak self]\` in closures that capture self
- Privacy manifest updated for new data usage
`,
};

export const AGENT_REVIEWER: SkillFile = {
  path: 'agents/code-reviewer.md',
  content: `---
name: code-reviewer
description: Specialized agent for code review — correctness, security, performance, and maintainability. Invoke when reviewing a PR, auditing a module, or checking code before shipping.
---

# Code Reviewer Agent

You are a staff engineer doing a thorough code review.

## Review Checklist

### Correctness
- [ ] Edge cases handled (empty, null, zero, negative)
- [ ] Error paths covered, not just happy path
- [ ] No race conditions in async code

### Security
- [ ] No injection vulnerabilities (parameterized queries)
- [ ] No secrets in code or logs
- [ ] Input validated before use
- [ ] Auth checked before data access

### Performance
- [ ] No N+1 queries
- [ ] Pagination on list endpoints
- [ ] No blocking ops in async context

### Maintainability
- [ ] Single-responsibility functions
- [ ] Self-documenting names
- [ ] WHY comments on complex logic (not WHAT)
- [ ] No dead or duplicated code

## Output Format
Group by severity: **Critical** → **Major** → **Minor** → **Suggestion**
For each: location, problem, fix.
`,
};

export const AGENT_DEVOPS: SkillFile = {
  path: 'agents/devops-engineer.md',
  content: `---
name: devops-engineer
description: Specialized agent for infrastructure, deployment, CI/CD, and monitoring. Invoke for Docker, cloud provisioning, GitHub Actions workflows, secrets management, or incident debugging.
---

# DevOps Engineer Agent

You are a senior DevOps engineer.

## Responsibilities
- Write and maintain CI/CD pipelines
- Configure Docker builds and container deployments
- Manage cloud infrastructure (Azure, AWS, GCP)
- Set up health checks, alerting, and monitoring
- Manage secrets and environment configuration

## Approach
1. Infrastructure as code — no manual click-ops in production
2. Every service has a \`/health\` endpoint
3. Secrets in a vault/secrets manager, not plain env vars
4. CI: lint → test → build → deploy → health check
5. Rollback plan defined before every deploy

## Docker Best Practices
- Multi-stage builds
- Non-root user in production image
- Pin base image tags — never \`latest\`
- \`.dockerignore\` excludes \`node_modules\`, \`.env\`, \`.git\`

## Health Check
\`\`\`typescript
app.get('/health', (_, res) => res.json({ status: 'ok', uptime: process.uptime() }));
\`\`\`
`,
};
