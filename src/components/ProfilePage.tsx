// src/pages/ProfilePage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer"; // Pastikan path ini benar
import Navbar from "../components/Navbar"; // Pastikan path ini benar
import EducationList from "../components/List/EducationList";
import ExperienceList from "../components/List/ExperienceList";
import SkillsList from "../components/List/SkillsList";
import PortfolioList from "../components/List/PortfolioList";
import DocumentsList from "../components/List/DocumentsList";
import PreferencesList from "../components/List/PreferencesList";
import ProfileList from "../components/List/ProfileList";
import { FileText, UserCircle as UserCircleIcon, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      
      {/* Header Halaman yang Ditingkatkan - Mirip AboutUs.tsx */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white py-16 sm:py-20"> {/* Padding disesuaikan sedikit */}
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Edit3 // Atau UserCircleIcon, ikon bisa disesuaikan
            size={60} // Ukuran ikon disesuaikan
            className="mx-auto mb-6 text-sky-300" 
          />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white"> {/* Warna teks diubah ke putih */}
            Profil Saya
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-sky-100 max-w-3xl mx-auto">
            Kelola dan perbarui semua informasi profesional Anda di satu tempat untuk kemudahan melamar kerja.
          </p>
        </div>
      </div>

      <main className="flex-grow py-10 sm:py-12"> {/* Padding atas dikurangi karena header sudah punya padding */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Konten Profil (List Components) */}
          <div className="space-y-10">
            <ProfileList />
            <EducationList />
            <ExperienceList />
            <SkillsList />
            <PortfolioList />
            <DocumentsList />
            <PreferencesList />
          </div>

          {/* Tombol Create Resume */}
          <div className="mt-12 sm:mt-16 text-center mb-10 sm:mb-12">
            <button
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold text-base rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ease-in-out transform hover:-translate-y-0.5"
              onClick={() => navigate("/resume")}
            >
              <FileText size={20} className="mr-2.5" />
              Buat atau Lihat Resume
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}