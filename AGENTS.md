# CLAUDE.md — Project Summary & Instructions

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** TanStack Router (File-based)
- **Data Fetching:** TanStack Query (v5+)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Database:** Supabase

## Development Standards

- **Strict Typing:** Use strict TypeScript. Avoid `any`. Define interfaces for all data structures.
- **Explicit Patterns:** Prefer explicit code over implicit "magic."
- **Routing:** Use TanStack Router's type-safe routing. Keep routes in the `src/routes` directory.
- **State Management:** Use TanStack Query for all server-state. Minimize global client-state; use URL state or TanStack Store if needed.
- **Components:** Follow the shadcn/ui pattern. Keep primitive UI components in `src/components/ui`.
- **Validation:** Use Zod for schema validation (forms, API responses, etc.).
