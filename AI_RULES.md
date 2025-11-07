# AI Development Rules for Ouvidoria System

## Tech Stack Overview

- **Frontend Framework**: React 18 with TypeScript for type-safe UI development
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: React Query (TanStack Query) for server state and Supabase realtime subscriptions
- **Routing**: React Router v6 for client-side navigation
- **Backend**: Supabase Platform (PostgreSQL database with built-in auth, storage, and functions)
- **Styling**: Tailwind CSS with a custom design system using CSS variables
- **Authentication**: Supabase Auth with custom role-based access control
- **File Storage**: Supabase Storage for manifestação attachments
- **Email Service**: Resend integration via Supabase Edge Functions

## Component Architecture Rules

### UI Component Guidelines
- Use **shadcn/ui** components whenever possible for consistent design
- Create new components in `src/components/` with dedicated files
- Implement **compound components** for complex UI sections
- Use **forwardRef** for components that need to expose DOM nodes
- Always implement proper **accessibility attributes** (aria-*) and keyboard navigation

### Data Management Rules
- Use **React Query** for all data fetching and mutations
- Implement **custom hooks** for data operations in `src/hooks/`
- Use **Supabase realtime subscriptions** for live data updates
- Implement **pagination** for all list views with proper loading states
- Handle **optimistic updates** for better UX on mutations

### Authentication & Authorization
- Use **Supabase Auth** for user authentication flows
- Implement **role-based access control** using custom `usePermissions` hook
- Protect routes with **ProtectedRoute** component
- Store user profiles in `usuarios` table linked to auth ID
- Implement **session persistence** with Supabase auth listeners

### Form Handling
- Use **React Hook Form** for all form validations
- Implement **Zod** for schema validation
- Create **custom form components** using shadcn/ui form primitives
- Handle **file uploads** through Supabase Storage with progress indicators
- Implement **form error handling** with toast notifications

### File Management
- Store files in **Supabase Storage** buckets with unique naming
- Save file metadata in **anexos** table with signed URLs
- Implement **file type validation** before upload
- Handle **large file uploads** with progress feedback
- Implement **secure file access** with signed URLs

### Notifications & Alerts
- Use **Sonner** for ephemeral toast notifications
- Implement **realtime notifications** with Supabase Postgres changes
- Store notification history in **notificacoes** table
- Implement **notification preferences** per user
- Use **badge indicators** for unread notifications

### Error Handling
- Implement **global error boundaries** for crash protection
- Use **React Query error handling** for data fetching errors
- Display **user-friendly error messages** with recovery options
- Log errors to **console in development** and monitoring service in production
- Implement **retry mechanisms** for network failures

### Performance Optimization
- Use **React.memo** for components with static props
- Implement **virtualized lists** for large datasets
- Use **code splitting** for route-based components
- Implement **image optimization** for uploaded files
- Use **debouncing** for search inputs and filters

### Security Practices
- Never expose **Supabase service role keys** in client code
- Implement **Row Level Security (RLS)** in Supabase for data protection
- Validate all **user inputs** with Zod schemas
- Use **signed URLs** for secure file access
- Implement **rate limiting** for API functions

### Testing Guidelines
- Write **unit tests** for utility functions and custom hooks
- Implement **integration tests** for critical user flows
- Use **Cypress or Playwright** for end-to-end testing
- Test **different user roles** and permissions
- Implement **accessibility testing** for public-facing components

### Deployment & Monitoring
- Use **Supabase Platform** for database and auth hosting
- Deploy frontend to **Vercel, Netlify, or similar static hosting**
- Implement **error monitoring** with Sentry or similar service
- Set up **performance monitoring** for critical user flows
- Use **feature flags** for gradual rollouts