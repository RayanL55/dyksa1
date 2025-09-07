# Overview

This is a subscription management web application called "Dyksa" built with modern full-stack technologies. The application helps users track their recurring subscriptions, set payment reminders, and manage their subscription expenses. It features a mobile-first design with a clean, modern interface optimized for subscription tracking and management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Mobile-First Design**: Responsive layout with bottom navigation and floating action buttons

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging
- **Development**: Hot reload with tsx for development server

## Database and ORM
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Authentication System
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: Database-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/update on authentication

## Data Models
- **Users**: Core user profile with OIDC integration (required for Replit Auth)
- **Subscriptions**: Recurring payment tracking with billing periods, amounts, and notification preferences
- **User Settings**: Customizable notification and preference settings
- **Sessions**: Authentication session storage (required for Replit Auth)

## Project Structure
- **Monorepo Layout**: Client, server, and shared code in single repository
- **Shared Types**: Common TypeScript definitions and Zod schemas
- **Path Aliases**: Configured import paths for cleaner imports (@/, @shared/)
- **Build Process**: Separate client (Vite) and server (esbuild) build processes

# External Dependencies

## Authentication Services
- **Replit OIDC**: Primary authentication provider using OpenID Connect
- **Environment Variables**: REPLIT_DOMAINS, ISSUER_URL, REPL_ID, SESSION_SECRET

## Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Environment Variables**: DATABASE_URL

## Development Tools
- **Replit Integration**: Vite plugins for Replit development environment
- **Error Monitoring**: Runtime error overlay for development

## UI and Styling
- **Google Fonts**: Multiple font families (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system

## Build and Development
- **Vite**: Frontend build tool with React and TypeScript support
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **ESBuild**: Server-side bundling for production builds