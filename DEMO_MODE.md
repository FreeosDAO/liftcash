# Development Mode Configuration

This document explains how to switch between **Static Demo Mode** and **Main Development Mode** for the Lift Cash frontend application.

## Overview

The frontend has been configured with two development modes to support different development scenarios:

- **Static Demo Mode**: Frontend-only development without ICP backend dependencies
- **Main Development Mode**: Full-stack development with ICP backend integration

## Current Configuration

The mode is controlled by a flag in the authentication client file.

### File Location
```
src/Lift_Cash_frontend/src/utils/useAuthClient.jsx
```

### Configuration Variable
```javascript
// Static demo mode flag
const DEMO_MODE = true; // Set to false when backend is available
```

## Switching Between Modes

### 🎨 Static Demo Mode (Current)
**When to use**: Frontend styling, UI development, testing without backend

**Configuration**:
```javascript
const DEMO_MODE = true;
```

**Features**:
- ✅ Simulates authenticated user state
- ✅ Mock backend actors for component functionality
- ✅ No ICP backend dependencies required
- ✅ Faster development iteration
- ✅ Works without `dfx` or canister deployment

**Limitations**:
- ❌ No real data from backend
- ❌ No actual blockchain interactions
- ❌ Mock responses only

### 🔗 Main Development Mode
**When to use**: Full-stack development, backend integration, production builds

**Configuration**:
```javascript
const DEMO_MODE = false;
```

**Requirements**:
1. **ICP Development Environment**:
   ```bash
   # Install dfx if not already installed
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Start Local IC Replica**:
   ```bash
   dfx start --background
   ```

3. **Generate Backend Declarations**:
   ```bash
   dfx generate
   ```

4. **Deploy Canisters** (if needed):
   ```bash
   dfx deploy
   ```

## Step-by-Step: Switching to Main Development Mode

### 1. Update Configuration
```javascript
// In src/Lift_Cash_frontend/src/utils/useAuthClient.jsx
const DEMO_MODE = false; // Change from true to false
```

### 2. Ensure Backend Environment
```bash
# Navigate to project root
cd /path/to/liftcash_main

# Start local IC replica
dfx start --background

# Generate declarations for frontend
dfx generate

# Install missing dependencies (if any)
cd src/Lift_Cash_frontend
npm install
```

### 3. Update Import Statements
When `DEMO_MODE = false`, the application will attempt to import real backend declarations:

```javascript
// These imports will be dynamically loaded
import { createActor as createCommunityActor } from "../../../declarations/Community_Backend";
import { createActor as createEconomyActor } from "../../../declarations/Economy_Backend";
```

### 4. Verify Setup
```bash
# Start the frontend
npm start

# Check that declarations exist
ls -la src/declarations/
# Should show: Community_Backend/ and Economy_Backend/ directories
```

## Troubleshooting

### Common Issues When Switching to Main Development Mode

#### 1. **Missing Declarations Error**
```
Failed to resolve import "../../../declarations/Community_Backend"
```

**Solution**:
```bash
dfx generate
```

#### 2. **Canister Not Found**
```
Error: Canister 'Community_Backend' not found
```

**Solution**:
```bash
dfx deploy Community_Backend
dfx deploy Economy_Backend
```

#### 3. **dfx Not Running**
```
Error: Connection refused
```

**Solution**:
```bash
dfx start --background
```

### Development Workflow

#### For Frontend-Only Development:
1. Keep `DEMO_MODE = true`
2. Use `npm start` directly
3. All UI components work with mock data

#### For Full-Stack Development:
1. Set `DEMO_MODE = false`
2. Start dfx: `dfx start --background`
3. Generate declarations: `dfx generate`
4. Start frontend: `npm start`

## Environment Variables

The application uses these environment variables when in Main Development Mode:

```javascript
// Used in authentication flow
process.env.DFX_NETWORK === "ic" 
  ? "https://identity.ic0.app/"
  : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`

// Used for canister IDs
process.env.CANISTER_ID_COMMUNITY_BACKEND
process.env.CANISTER_ID_ECONOMY_BACKEND
```

## Team Recommendations

### For Styling/UI Work:
- Keep `DEMO_MODE = true`
- No backend setup required
- Faster iteration cycles

### For Feature Development:
- Switch to `DEMO_MODE = false`
- Ensure full ICP environment is running
- Test with real backend interactions

### Before Production:
- Always use `DEMO_MODE = false`
- Deploy to IC mainnet
- Update environment variables for production

## File Changes Summary

When switching modes, you only need to modify:

```diff
// src/Lift_Cash_frontend/src/utils/useAuthClient.jsx
- const DEMO_MODE = true;
+ const DEMO_MODE = false;
```

All other application code remains the same and automatically adapts to the selected mode.

---

## Quick Reference

| Task | Demo Mode | Main Mode |
|------|-----------|-----------|
| UI Development | ✅ Recommended | ⚠️ Overkill |
| Styling Updates | ✅ Recommended | ⚠️ Overkill |
| Backend Integration | ❌ Limited | ✅ Required |
| Production Builds | ❌ Not suitable | ✅ Required |
| Testing Features | ⚠️ Mock data only | ✅ Real data |

**Current Status**: Demo Mode (for frontend styling work)
**Next Step**: Switch to Main Mode when ready for backend integration