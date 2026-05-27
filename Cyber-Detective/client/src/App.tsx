import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CasesPage from "./pages/CasesPage";
import CasePage from "./pages/CasePage";
import VerdictPage from "./pages/VerdictPage";
import ProfilePage from "./pages/ProfilePage";
import ProceduralCasePage from "./pages/ProceduralCasePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cases" component={CasesPage} />
      <Route path="/case/:id" component={CasePage} />
      <Route path="/case/:id/verdict" component={VerdictPage} />
      <Route path="/play" component={ProceduralCasePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider delayDuration={150}>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              classNames: {
                toast:
                  "font-mono border border-cyan-500/30 bg-card/95 backdrop-blur",
              },
            }}
          />
          <WouterRouter hook={useHashLocation}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
