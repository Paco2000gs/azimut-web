import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LeadsProvider } from './context/LeadsContext';
import { ShortlistProvider } from './context/ShortlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertiesProvider } from './context/PropertiesContext';
import { isSupabaseConfigured } from './utils/supabaseClient';
import { BlogProvider } from './context/BlogContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import GTMTracker from './components/GTMTracker';

import Catalog from './pages/Catalog';
import PropertyDetail from './pages/PropertyDetail';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Shortlist from './pages/Shortlist';
import BuyingGuide from './pages/BuyingGuide';
import ExitIntentPopup from './components/ExitIntentPopup';

// Split out of the public bundle: none of these are reachable from a visitor's
// first paint, and together they carry the heaviest markup and CSS in the app.
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DossierView = lazy(() => import('./pages/DossierView'));

// Shown only while a lazy route's chunk is in flight. Deliberately quiet: a
// spinner here would flash on fast connections and read as an error on slow ones.
const RouteFallback = () => (
  <div className="route-fallback" role="status" aria-live="polite">
    <span className="visual-hidden">Loading</span>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

function App() {
  if (!isSupabaseConfigured()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Configuration Error</h1>
        <p>Supabase is not configured correctly.</p>
        <p>Please check your <code>.env</code> file and ensure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are set.</p>
        <p>After updating the .env file, restart the development server.</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <PropertiesProvider>
        <BlogProvider>
          <LeadsProvider>
            <ShortlistProvider>
            <GTMTracker />
            <ExitIntentPopup />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="catalog" element={<Navigate to="/venta" replace />} />
                  <Route path="venta" element={<Catalog />} />
                  <Route path="venta/:city" element={<Catalog />} />
                  <Route path="venta/:city/:area" element={<Catalog />} />
                  <Route path="property/:id" element={<PropertyDetail />} />
                  <Route path="properties/:id" element={<PropertyDetail />} />
                  <Route path="about" element={<About />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:id" element={<BlogPost />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="shortlist" element={<Shortlist />} />
                  <Route path="buying-guide" element={<BuyingGuide />} />
                  <Route path="privacy" element={<PrivacyPolicy />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Dossier Route (Public but Standalone) */}
                <Route path="/dossier/:id" element={<DossierView />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
            </ShortlistProvider>
          </LeadsProvider>
        </BlogProvider>
      </PropertiesProvider>
    </AuthProvider>
  );
}

export default App;
