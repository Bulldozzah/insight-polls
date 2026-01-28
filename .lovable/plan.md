

## Fix: Create Centralized AuthContext

### Step 1: Create `src/contexts/AuthContext.tsx`
Create a new AuthContext provider that:
- Manages auth state (user, session, isAdmin, loading) in ONE place
- Has ONE `onAuthStateChange` listener for the entire app
- Provides signIn, signUp, signOut functions
- Uses `setTimeout(0)` pattern for admin role check to avoid deadlocks

### Step 2: Update `src/App.tsx`
- Import and wrap the app with `<AuthProvider>`
- Place it inside QueryClientProvider but outside BrowserRouter

### Step 3: Update `src/hooks/useAuth.ts`
- Convert to a simple hook that **consumes** the AuthContext
- Remove all `useEffect`, `useState`, and listener code
- Just return the context values

### Step 4: Verify Components
All existing components (Header, Home, Auth, Profile, Admin, Poll) will continue to work because they already use `useAuth()` - they'll just get values from context now instead of creating new listeners.

### Expected Result
- ✅ Only ONE auth listener in the entire app
- ✅ No more rate limiting (429 errors gone)
- ✅ User stays logged in properly
- ✅ Admin role checked once per session change

