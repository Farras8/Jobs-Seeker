// src/pages/ResumePage.tsx (atau src/components/ResumePage.tsx sesuai struktur Anda)
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../firebase"; // Pastikan path ini benar
import ResumeTemplate from "./ResumeTemplate"; // Pastikan path ini benar
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar"; // Asumsi path Navbar
import Footer from "../components/Footer";   // Asumsi path Footer
import { Loader2, AlertCircle, FileText as FileTextIcon, DownloadCloud, ArrowLeft } from "lucide-react"; // FileTextIcon untuk judul, DownloadCloud untuk tombol
import { Link } from "react-router-dom"; // Untuk tombol kembali

// Interface ProfileResumeData (tidak diubah)
interface ProfileResumeData {
  fullName: string | null;
  phoneNumber: string | null;
  city: string | null;
  linkedin: string | null;
  github: string | null;
  instagram: string | null;
  portfolioSite: string | null;
  photoUrl: string | null;
  education: Array<{
    schoolName: string; // atau institution
    degree: string;
    fieldOfStudy: string; // atau program/major
    startDate: string;
    endDate: string | null;
    description?: string;
  }>;
  experience: Array<{
    companyName: string; // atau company
    position: string;
    startDate: string;
    endDate: string | null;
    description?: string;
  }>;
  hardSkills: Array<{ name: string; level?: string }>;
  softSkills: Array<{ name: string; level?: string }>;
  portfolio: Array<{
    title: string;
    description: string;
    projectUrl: string;
    technologies: string[];
  }>;
}

export default function ResumePage() {
  const [data, setData] = useState<ProfileResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Logika fetchResume dan generatePDF tetap sama
  useEffect(() => {
    async function fetchResume() {
      setLoading(true);
      setError(null);
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("User not logged in. Please login to view your resume.");
          setLoading(false);
          return;
        }
        const token = await user.getIdToken();
        const res = await fetch(
          "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/profile-resume",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({})); // Tangkap error jika parsing json gagal
            throw new Error(errorData.error || `Error fetching resume: ${res.status} ${res.statusText}`);
        }
        const profileData = await res.json();
        
        // Mapping data (logika Anda sudah baik di sini)
        const mappedData: ProfileResumeData = {
            fullName: profileData.fullName || "Nama Tidak Tersedia",
            phoneNumber: profileData.phoneNumber || null,
            city: profileData.city || null,
            linkedin: profileData.linkedin || null,
            github: profileData.github || null,
            instagram: profileData.instagram || null,
            portfolioSite: profileData.portfolioSite || null,
            photoUrl: profileData.photoUrl || null,
            education: Array.isArray(profileData.education) ? profileData.education.map((edu: any) => ({
                ...edu,
                schoolName: edu.schoolName || edu.school || edu.institution || "Nama Institusi Tidak Ada",
                degree: edu.degree || edu.level || "Gelar Tidak Ada",
                fieldOfStudy: edu.fieldOfStudy || edu.program || edu.major || "Jurusan Tidak Ada",
                startDate: edu.startDate || "YYYY-MM-DD",
                endDate: edu.endDate || null,
            })) : [],
            experience: Array.isArray(profileData.experience) ? profileData.experience.map((exp: any) => ({
                ...exp,
                companyName: exp.companyName || exp.company || "Nama Perusahaan Tidak Ada",
                position: exp.position || "Posisi Tidak Ada",
                startDate: exp.startDate || "YYYY-MM-DD",
                endDate: exp.endDate || null,
            })) : [],
            hardSkills: Array.isArray(profileData.hardSkills)
                ? profileData.hardSkills.map((skill: any) => typeof skill === 'string' ? { name: skill } : skill)
                : [],
            softSkills: Array.isArray(profileData.softSkills)
                ? profileData.softSkills.map((skill: any) => typeof skill === 'string' ? { name: skill } : skill)
                : [],
            portfolio: Array.isArray(profileData.portfolio) ? profileData.portfolio.map((port: any) => ({
                title: port.title || "Judul Proyek Tidak Ada",
                description: port.description || "",
                projectUrl: port.projectUrl || "",
                technologies: Array.isArray(port.technologies) ? port.technologies : [],
            })) : [],
        };
        setData(mappedData);

      } catch (err) {
        let message = "Gagal memuat data resume.";
        if (err instanceof Error) message = err.message;
        setError(message);
        console.error("Fetch Resume Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, []);

  async function generatePDF() {
    if (!data) { /* ... (logika Swal error) ... */ return; }
    const input = document.getElementById("resume-content");
    if (!input) { /* ... (logika Swal error) ... */ return; }
    setPdfLoading(true);
    const originalStyles = { /* ... (menyimpan style asli) ... */ };
    input.style.paddingBottom = "100px"; input.style.height = "auto"; input.style.overflow = "visible";
    try {
      const canvas = await html2canvas(input, { /* ... (opsi html2canvas) ... */ });
      input.style.paddingBottom = originalStyles.paddingBottom;
      input.style.height = originalStyles.height;
      input.style.overflow = originalStyles.overflow;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ /* ... (opsi jsPDF) ... */ });
      // ... (logika addImage dan multi-page jsPDF tetap sama) ...
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidthInPdf = pdfWidth - 2 * margin;
      const imgHeightInPdf = (imgProps.height * imgWidthInPdf) / imgProps.width;
      const pageEffectiveHeight = pdfHeight - 2 * margin;
      let currentPositionOnPage = margin;
      let heightRemaining = imgHeightInPdf;
      pdf.addImage(imgData, "PNG", margin, currentPositionOnPage, imgWidthInPdf, imgHeightInPdf);
      heightRemaining -= pageEffectiveHeight;
      while (heightRemaining > 0.1) {
        currentPositionOnPage -= pageEffectiveHeight; // Ini adalah posisi Y dari gambar pada halaman baru
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, currentPositionOnPage, imgWidthInPdf, imgHeightInPdf);
        heightRemaining -= pageEffectiveHeight;
      }
      pdf.save(`${(data.fullName || "resume").replace(/\s+/g, '_')}_resume.pdf`);
    } catch (err) { /* ... (logika Swal error PDF) ... */ } 
    finally {
      input.style.paddingBottom = originalStyles.paddingBottom;
      input.style.height = originalStyles.height;
      input.style.overflow = originalStyles.overflow;
      setPdfLoading(false);
    }
  }
  // Akhir dari logika yang tidak diubah

  const renderPageContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-lg">Memuat data resume...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-10 rounded-lg text-center my-8">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <p className="font-semibold text-xl mb-2">Oops! Terjadi Kesalahan</p>
          <p className="text-md mb-6">{error}</p>
          <Link
            to="/profile/edit" // Arahkan ke halaman edit profil
            className="inline-flex items-center px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Lengkapi Profil Anda
          </Link>
        </div>
      );
    }
    if (!data) {
      return (
        <div className="text-center py-20 text-gray-500">
          <FileTextIcon size={64} className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold text-gray-700 mb-2">Data Resume Tidak Ditemukan</p>
          <p className="text-md text-gray-500 mb-6">Pastikan profil Anda sudah lengkap untuk membuat resume.</p>
           <Link
            to="/profile/edit"
            className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Lengkapi Profil Sekarang
          </Link>
        </div>
      );
    }
    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <Link 
                to="/profile/edit" 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 group order-last sm:order-first"
            >
                <ArrowLeft size={18} className="mr-1.5 transition-transform group-hover:-translate-x-1" />
                Kembali ke Edit Profil
            </Link>
            <button
                onClick={generatePDF}
                disabled={pdfLoading || !data}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md hover:shadow-lg disabled:opacity-70"
            >
                <DownloadCloud size={20} className="mr-2" />
                {pdfLoading ? "Membuat PDF..." : "Download PDF Resume"}
            </button>
        </div>
        {/* Kontainer untuk pratinjau resume di layar */}
        <div 
            id="resume-content-wrapper" 
            className="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-lg shadow-inner overflow-x-auto"
        >
            <div
                id="resume-content"
                className="bg-white shadow-lg mx-auto" // Styling dasar untuk tampilan seperti kertas
                style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }} // Ukuran A4 dengan padding
            >
                <ResumeTemplate profileData={data} />
            </div>
        </div>
      </>
    );
  };


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center">
                <FileTextIcon size={32} className="mr-3 text-blue-600" />
                Pratinjau & Download Resume
            </h1>
            <p className="mt-2 text-gray-600">
                Berikut adalah pratinjau resume Anda berdasarkan data profil. Anda dapat mengunduhnya dalam format PDF.
            </p>
        </div>
        
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            {renderPageContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}