import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/context/SettingsContext";
import { MobileMenuProvider } from "@/context/MobileMenuContext";
import GlobalMobileDrawer from "@/components/GlobalMobileDrawer";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
const ProductPage = lazy(() => import("./pages/ProductPage"));
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading para páginas de admin - se cargan solo cuando se necesitan
const Login = lazy(() => import("./pages/admin/Login"));
const ProductCreate = lazy(() => import("./pages/admin/ProductCreate"));
const CategoryCreate = lazy(() => import("./pages/admin/CategoryCreate"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Loading fallback para lazy components
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <MobileMenuProvider>
            <GlobalMobileDrawer />
            <CookieConsent />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/products/create"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ProductCreate />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories/create"
              element={
                <AdminRoute>
                  <Suspense fallback={<PageLoader />}>
                    <CategoryCreate />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="/producto/:slug"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductPage />
                </Suspense>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </MobileMenuProvider>
        </BrowserRouter>
      </TooltipProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
