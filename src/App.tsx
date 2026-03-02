import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { HomePage } from './pages/HomePage';
import { AddBrewPage } from './pages/AddBrewPage';
import { EditBrewPage } from './pages/EditBrewPage';
import { DetailPage } from './pages/DetailPage';
import { SharedBrewPage } from './pages/SharedBrewPage';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<AddBrewPage />} />
        <Route path="/brew/:id" element={<DetailPage />} />
        <Route path="/brew/:id/edit" element={<EditBrewPage />} />
        <Route path="/shared/:id" element={<SharedBrewPage />} />
      </Routes>
      <PWAInstallPrompt />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}
