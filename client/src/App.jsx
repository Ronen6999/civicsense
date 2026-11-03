import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import HomePage from './pages/public/HomePage.jsx';
import SubmitComplaintPage from './pages/public/SubmitComplaintPage.jsx';
import TrackComplaintPage from './pages/public/TrackComplaintPage.jsx';
import NotFoundPage from './pages/public/NotFoundPage.jsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminComplaintDetailPage from './pages/admin/AdminComplaintDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="report" element={<SubmitComplaintPage />} />
        <Route path="track" element={<TrackComplaintPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="complaints/:complaintId" element={<AdminComplaintDetailPage />} />
      </Route>
    </Routes>
  );
}
