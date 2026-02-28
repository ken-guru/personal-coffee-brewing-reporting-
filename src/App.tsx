import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AddBrewPage } from './pages/AddBrewPage';
import { EditBrewPage } from './pages/EditBrewPage';
import { DetailPage } from './pages/DetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new" element={<AddBrewPage />} />
        <Route path="/brew/:id" element={<DetailPage />} />
        <Route path="/brew/:id/edit" element={<EditBrewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
