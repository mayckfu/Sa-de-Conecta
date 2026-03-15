import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

// Layout and Core (Keep static for fast shell)
import { Layout } from './components/layout/Layout';

// Lazy Loaded Pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const EventDetail = lazy(() => import('./pages/EventDetail').then(m => ({ default: m.EventDetail })));
const NewEvent = lazy(() => import('./pages/NewEvent').then(m => ({ default: m.NewEvent })));
const EditEvent = lazy(() => import('./pages/EditEvent').then(m => ({ default: m.EditEvent })));
const Documents = lazy(() => import('./pages/Documents').then(m => ({ default: m.Documents })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
const Insights = lazy(() => import('./pages/Insights').then(m => ({ default: m.Insights })));

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="relative">
      <div className="w-12 h-12 rounded-xl border-4 border-violet-100 border-t-violet-600 animate-spin" />
      <div className="absolute inset-0 bg-violet-400/20 blur-xl animate-pulse rounded-full" />
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/gestao" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="eventos" element={<Events />} />
              <Route path="eventos/:id" element={<EventDetail />} />
              <Route path="novo-evento" element={<NewEvent />} />
              <Route path="editar-evento/:id" element={<EditEvent />} />
              <Route path="documentos" element={<Documents />} />
              <Route path="ideias" element={<Insights />} />
              <Route path="usuarios" element={<AdminUsers />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
