# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lift Cash is a self-governed, cooperative economic system built on the Internet Computer Protocol (ICP) blockchain. The system allows participants to democratically manage fiscal policy and earn crypto income through governance participation including voting, surveys, and ratification processes.

## Architecture

### Multi-Canister System
- **Community_Backend** (Rust): Handles governance phases (Survey → Vote → Ratify → Results), user participation tracking, and phase transitions
- **Economy_Backend** (Rust): Manages user financial records, PROMO token economics, reward distribution, and ICP/LIFT token balances
- **Lift_Cash_frontend** (React/Vite): SPA with Redux state management, Tailwind CSS styling, and Internet Identity authentication

### Frontend Architecture
- **State Management**: Redux Toolkit with actorsSlice (canister connections) and themeSlice (UI theme)
- **Authentication**: Internet Identity integration via `useAuthClient.jsx` hook with demo mode support
- **Routing**: React Router with protected routes requiring authentication
- **Styling**: Tailwind CSS with custom CSS variables for dark theme, Inter/Montserrat fonts
- **Components**: Page-based organization with shared components for governance activities

### Phase-Based Governance Flow
1. **Survey Phase**: Collect community input on economic parameters
2. **Vote Phase**: Democratic voting on survey proposals  
3. **Ratify Phase**: Final confirmation of voted proposals
4. **Results Phase**: Display outcomes and distribute rewards

## Development Modes

The frontend supports two development modes controlled by `DEMO_MODE` flag in `src/Lift_Cash_frontend/src/utils/useAuthClient.jsx`:

**Static Demo Mode** (`DEMO_MODE = true`):
- Frontend-only development without ICP backend dependencies
- Mock authentication and canister actors
- Faster iteration for UI/styling work
- Currently active for styling development

**Main Development Mode** (`DEMO_MODE = false`):
- Full ICP integration with real canisters
- Requires dfx, canister deployment, and backend setup
- Used for production and backend integration testing

## Common Development Commands

### Frontend Development
```bash
# Navigate to frontend workspace
cd src/Lift_Cash_frontend

# Install dependencies
npm install

# Start development server (Demo Mode)
npm start

# Build frontend
npm run build

# Format code
npm run format
```

### ICP/Backend Development  
```bash
# Start local IC replica
dfx start --background --clean

# Pull and deploy external dependencies
dfx deps pull
dfx deps init  
dfx deps deploy

# Deploy all canisters using script
cd scripts
chmod +x deploy.sh
./deploy.sh

# Deploy to IC mainnet
./deploy.sh ic

# Generate frontend declarations
dfx generate
```

### Testing
```bash
# Run comprehensive tests
cd scripts
chmod +x Test.sh
./Test.sh

# Test on IC mainnet
./Test.sh ic
```

### Root Level Commands
```bash
# Install all workspace dependencies
npm install

# Build all workspaces
npm run build

# Start all workspaces
npm start
```

## Key File Locations

- **Demo Mode Toggle**: `src/Lift_Cash_frontend/src/utils/useAuthClient.jsx` (line 8)
- **Theme Configuration**: `src/Lift_Cash_frontend/src/index.css` (CSS variables), `src/Lift_Cash_frontend/tailwind.config.js`
- **Redux Store**: `src/Lift_Cash_frontend/src/utils/redux/store.js`
- **Canister Interfaces**: `src/Community_Backend/Community_Backend.did`, `src/Economy_Backend/Economy_Backend.did`
- **Deployment Scripts**: `scripts/deploy.sh`, `scripts/Test.sh`

## Development Workflow Patterns

### Switching Development Modes
See `DEMO_MODE.md` for detailed instructions on switching between demo and full ICP development modes.

### Styling Updates
- CSS variables defined in `index.css` for consistent theming
- Component-specific CSS files alongside JSX components
- Tailwind classes reference CSS variables for dark theme consistency
- Orange accent color (#EB5528) used throughout for primary actions

### Adding New Governance Features
1. Update Rust canister interfaces (.did files) if needed
2. Add Redux state management for new data
3. Create page components following existing patterns
4. Update navigation and routing
5. Test in both demo and full modes

### Canister Integration
- Frontend connects to canisters via generated declarations in `src/declarations/`
- Authentication handled through `useAuthClient` hook
- Canister calls managed through Redux actorsSlice
- Error handling and loading states managed per component

## Repository-Specific Notes

- Uses npm workspaces with frontend as the primary workspace
- Internet Identity canister pulled as external dependency  
- Phase transitions are time-based and managed by Community_Backend
- PROMO tokens have locked/unlocked mechanics managed by Economy_Backend
- Three.js used for background animations (can be toggled off)
- Mobile-first responsive design with 768px breakpoint