# MasahaDesk — Surveying Department Management System (SDMS)

MasahaDesk is a desktop application designed for the Surveying Department (قسم المساحة) of engineering consulting offices. It manages projects, clients, survey transfers, reports, sketches, Baladi platform transactions, and survey decisions, with complete support for offline-first operations and Arabic/English localization.

## Repository Structure

This project is configured as a monorepo using npm workspaces:

- `apps/desktop`: Electron + React + TypeScript + Vite desktop application.
- `apps/backend`: NestJS backend API.
- `packages/shared-types`: Shared TypeScript interfaces and DTOs.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

## Getting Started

1. **Install Dependencies**
   Run the following command at the root of the repository to install dependencies for all workspaces:
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy the `.env.example` in both `apps/desktop` and `apps/backend` to `.env` files and customize the variables.

3. **Running the Application**
   - Start the NestJS backend in development mode:
     ```bash
     npm run dev:backend
     ```
   - Start the Electron desktop app in development mode:
     ```bash
     npm run dev:desktop
     ```

4. **Linting and Formatting**
   - Run linter across all workspaces:
     ```bash
     npm run lint
     ```
   - Run Prettier formatter:
     ```bash
     npm run format
     ```
