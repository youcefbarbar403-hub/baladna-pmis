import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import EDMS from "@/pages/EDMS";
import Risks from "@/pages/Risks";
import Actions from "@/pages/Actions";
import Schedule from "@/pages/Schedule";
import DigitalMap from "@/pages/DigitalMap";
import Contracts from "@/pages/Contracts";
import Cost from "@/pages/Cost";
import Authorities from "@/pages/Authorities";
import Payments from "@/pages/Payments";
import Contractors from "@/pages/Contractors";
import Workstreams from "@/pages/Workstreams";
import Phases from "@/pages/Phases";
import Registers from "@/pages/Registers";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Transmittals from "@/pages/Transmittals";
import RFIs from "@/pages/RFIs";
import AdminImport from "@/pages/AdminImport";
import Users from "@/pages/Users";

import { useEffect, useState, createContext, useContext } from "react";
import { authStore, authService } from "@/lib/auth";

// ============================================================================
// Auth Context
// ============================================================================

interface AuthContextType {
  user: ReturnType<typeof authStore.getState>["user"];
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isInitialized: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(authStore.getState());

  useEffect(() => {
    // Initialize auth state
    authStore.init();

    // Subscribe to auth state changes
    const unsubscribe = authStore.subscribe(setAuthState);

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Auth Guard Component
// ============================================================================

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isLoading && !user && location !== "/login") {
      setLocation("/login");
    }
  }, [user, isLoading, isInitialized, location, setLocation]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-green-500 flex items-center justify-center text-white font-display font-bold text-xl animate-pulse">
            B
          </div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user && location !== "/login") return null;
  return <>{children}</>;
}

// ============================================================================
// Router Component
// ============================================================================

function Router() {
  const [location] = useLocation();

  if (location === "/login") {
    return <Route path="/login" component={Login} />;
  }

  return (
    <AuthGuard>
      <AppShell>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/edms" component={EDMS} />
          <Route path="/risks" component={Risks} />
          <Route path="/actions" component={Actions} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/cost" component={Cost} />
          <Route path="/authorities" component={Authorities} />
          <Route path="/digital-map" component={DigitalMap} />
          <Route path="/payments" component={Payments} />
          <Route path="/contractors" component={Contractors} />
          <Route path="/workstreams" component={Workstreams} />
          <Route path="/phases" component={Phases} />
          <Route path="/registers" component={Registers} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route path="/transmittals" component={Transmittals} />
          <Route path="/rfis" component={RFIs} />
          <Route path="/admin/import" component={AdminImport} />
          <Route path="/admin/users" component={Users} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </AuthGuard>
  );
}

// ============================================================================
// App Component
// ============================================================================

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;