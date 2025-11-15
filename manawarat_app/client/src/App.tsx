import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ManageTasks from "./pages/ManageTasks";
import ManageUsers from "./pages/ManageUsers";
import ManageWallets from "./pages/ManageWallets";
import ManageLevels from "./pages/ManageLevels";
import ManageProofs from "./pages/ManageProofs";
import ReferralTree from "./pages/ReferralTree";
import TaskDetail from "./pages/TaskDetail";
import UserWallet from "./pages/UserWallet";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/"} component={Home} />
      <Route path={"/task/:id"} component={TaskDetail} />
      <Route path={"/wallet"} component={UserWallet} />
      <Route path={"/referrals"} component={ReferralTree} />
      {user && ['super_admin', 'finance_admin', 'support_admin', 'content_admin'].includes(user.role) && (
        <>
          <Route path={"/admin/dashboard"} component={AdminDashboard} />
          <Route path={"/admin/tasks"} component={ManageTasks} />
          <Route path={"/admin/users"} component={ManageUsers} />
          <Route path={"/admin/wallets"} component={ManageWallets} />
          <Route path={"/admin/levels"} component={ManageLevels} />
          {(user.role === 'super_admin' || user.role === 'support_admin') && (
            <Route path={"/admin/proofs"} component={ManageProofs} />
          )}
        </>
      )}
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
