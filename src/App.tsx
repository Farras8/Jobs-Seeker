import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard"; // Asumsi path komponen sudah benar
import ProfilePage from "./components/ProfilePage";
import ResumePage from "./components/ResumePage";
import Jobs from "./components/Jobs";
import JobDetailPage from "./components/JobsComponent/JobDetailPage";
import Bookmarks from "./components/Bookmark";
import Applications from "./components/Applications";
import AboutUs from "./components/AboutUs";
import RecommendJobs from "./components/RecommendJobs";
import CVScoringPage from "./components/Cv-scoring"; // Pastikan nama file dan path benar
import CompaniesPage from "./components/CompaniesPage"; // Path sesuai permintaan Anda
import CompaniesDetailPage from "./components/CompaniesComp/CompaniesDetailPage";
import NotFoundPage from "./components/NotFoundPage"; // BARU: Impor NotFoundPage

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailPage /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
        <Route path="/Recommend" element={<ProtectedRoute><RecommendJobs/></ProtectedRoute>} /> {/* Path "Recommend" disesuaikan */}
        <Route path="/cv-scoring" element={<ProtectedRoute><CVScoringPage/></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><CompaniesPage/></ProtectedRoute>} />
        <Route path="/companies/:id/detail" element={<ProtectedRoute><CompaniesDetailPage/></ProtectedRoute>} />

        {/* Catch-all route untuk halaman tidak ditemukan */}
        <Route path="*" element={<NotFoundPage />} /> {/* DIPERBARUI */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
