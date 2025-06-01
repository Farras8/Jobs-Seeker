import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import ProfilePage from "./components/ProfilePage";
import ResumePage from "./components/ResumePage"; // Import ResumePage
import Jobs from "./components/Jobs";
import JobDetailPage from "./components/JobsComponent/JobDetailPage";
import Bookmarks from "./components/Bookmark"; // Import Bookmarks
import Applications from "./components/Applications";
import AboutUs from "./components/AboutUs";
import RecommendJobs from "./components/RecommendJobs";
import CVScoringPage from "./components/Cv-scoring";
import CompaniesPage from "./components/CompaniesPage";
import CompaniesDetailPage from "./components/CompaniesComp/CompaniesDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile Edit Page */}
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Resume Page */}
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          }
        />

        {/* Jobs Page */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs /> {/* Komponen Jobs.tsx */}
            </ProtectedRoute>
          }
        />

        {/* Job Detail Page */}
        <Route
          path="/jobs/:id" // :id is a dynamic parameter
          element={
            <ProtectedRoute>
              <JobDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Bookmarks Page */}
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks /> {/* Komponen Bookmarks.tsx */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications /> {/* Komponen Bookmarks.tsx */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <AboutUs /> {/* Komponen Bookmarks.tsx */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/Recommend"
          element={
            <ProtectedRoute>
              <RecommendJobs/> {/* Komponen Bookmarks.tsx */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/cv-scoring"
          element={
            <ProtectedRoute>
              <CVScoringPage/> {/* Komponen Bookmarks.tsx */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <CompaniesPage/> {/* Komponen Bookmarks.tsx */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies/:id/detail"
          element={
            <ProtectedRoute>
              <CompaniesDetailPage/> {/* Komponen Bookmarks.tsx */}
            </ProtectedRoute>
          }
        />

        {/* Redirect to login if route doesn't exist */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
