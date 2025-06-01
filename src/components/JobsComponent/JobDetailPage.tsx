// src/components/CompaniesPageComponents/CompaniesDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar'; // Sesuaikan path jika Navbar ada di level atas components
import Footer from '../Footer';   // Sesuaikan path jika Footer ada di level atas components
import { auth, db } from '../../firebase'; // Firebase auth & db
import { collection, getDocs, query, orderBy } from "firebase/firestore"; // Firestore functions
import Swal from 'sweetalert2'; 
import {
  Briefcase,
  MapPin,
  Building,
  Clock,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  ExternalLink,
  Share2,
  Bookmark as BookmarkIcon,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  FileText as FileTextIcon // Untuk ikon di modal lamaran
} from 'lucide-react';

// Interfaces
export interface ApiTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface ApiJobSalary {
  min: number;
  max: number;
  currency: string;
}

export interface ApiJobPostedAt extends ApiTimestamp {}

export interface ApiJob {
  id: string;
  jobTitle: string;
  jobDescription: string;
  cleanedDescription?: string;
  companyName: string;
  city: string;
  category?: string;
  jobType: string;
  skillsRequired: string[];
  salary?: ApiJobSalary | null;
  isActive?: boolean;
  postedAt: ApiJobPostedAt;
  companyWebsite?: string;
  applicationUrl?: string;
  aboutCompany?: string; 
  bannerUrl?: string; 
}

export interface JobDetail {
  id: string;
  title: string;
  company: string;
  city: string; 
  type: string;
  formattedSalary?: string;
  formattedPostedDate: string;
  skills: string[];
  description: string;
  category?: string;
  isActive?: boolean;
  companyLogo: string;
  companyWebsite?: string;
  applicationUrl?: string;
  aboutCompany?: string; 
  apiJobData?: ApiJob;
  bannerUrl?: string; // Ditambahkan dari ApiCompany
}

// Interface untuk dokumen resume pengguna
interface UserApplicationDocument {
  id: string; 
  fileName: string;
  fileUrl: string; 
}

const API_BASE_URL = "https://jobseeker-capstone-705829099986.asia-southeast2.run.app";

const formatSalaryDetail = (salaryObj?: ApiJobSalary | null): string | undefined => {
  if (!salaryObj || salaryObj.min == null || salaryObj.max == null) return 'Gaji tidak disebutkan';
  const { min, max, currency } = salaryObj;
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const minFormatted = formatter.format(min).replace('Rp', '').trim();
  const maxFormatted = formatter.format(max).replace('Rp', '').trim();
  if (min === 0 && max === 0) return 'Gaji Nego';
  if (min > 0 && max > 0 && min !== max) return `${currency} ${minFormatted} - ${maxFormatted}`;
  if (min > 0 && (max === 0 || max === min)) return `${currency} ${minFormatted}`;
  if (min === 0 && max > 0) return `${currency} Hingga ${maxFormatted}`;
  return 'Informasi Gaji Tidak Tersedia';
};

const formatPostedDateDetail = (postedAtObj: ApiJobPostedAt): string => {
  if (!postedAtObj || typeof postedAtObj._seconds !== 'number') return 'Tanggal tidak valid';
  const date = new Date(postedAtObj._seconds * 1000);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

async function urlContentToBase64(url: string): Promise<string> {
    const response = await fetch(url); 
    if (!response.ok) {
        throw new Error(`Gagal mengambil file dari URL: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    if (blob.type !== 'application/pdf') {
        console.warn("Tipe file yang diambil bukan PDF, ini mungkin menyebabkan masalah di backend:", blob.type);
        // throw new Error("Hanya file PDF yang diizinkan untuk resume."); // Uncomment jika ingin validasi ketat
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve((reader.result as string).split(',')[1]); 
            } else {
                reject(new Error("Gagal membaca file sebagai Base64."));
            }
        };
        reader.onerror = (error) => reject(new Error(`FileReader error: ${error}`));
        reader.readAsDataURL(blob);
    });
}


const JobDetailPage: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkProcessing, setIsBookmarkProcessing] = useState(false);
  const [isInitialBookmarkStatusLoading, setIsInitialBookmarkStatusLoading] = useState(true);

  const [userApplicationDocuments, setUserApplicationDocuments] = useState<UserApplicationDocument[]>([]);
  const [isLoadingUserDocuments, setIsLoadingUserDocuments] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState(false); 


  useEffect(() => {
    if (!jobId) {
      setError("ID lowongan tidak ditemukan."); setIsLoading(false); setIsInitialBookmarkStatusLoading(false); return;
    }
    const fetchJobDetailData = async () => {
      setIsLoading(true); setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        if (!response.ok) {
          if (response.status === 404) throw new Error("Lowongan tidak ditemukan atau sudah tidak aktif.");
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Gagal mengambil data: ${response.status}`);
        }
        const apiData: ApiJob = await response.json();
        if (!apiData || !apiData.id) throw new Error("Data lowongan tidak valid atau tidak ditemukan.");
        const transformedData: JobDetail = {
          id: apiData.id, title: apiData.jobTitle, company: apiData.companyName, city: apiData.city,
          type: apiData.jobType, formattedSalary: formatSalaryDetail(apiData.salary),
          formattedPostedDate: formatPostedDateDetail(apiData.postedAt), skills: apiData.skillsRequired || [],
          description: apiData.cleanedDescription || apiData.jobDescription, category: apiData.category,
          isActive: apiData.isActive,
          companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiData.companyName?.substring(0, 2) || 'CO')}&background=random&color=fff&bold=true&size=128`,
          companyWebsite: apiData.companyWebsite, applicationUrl: apiData.applicationUrl,
          aboutCompany: apiData.aboutCompany, apiJobData: apiData, bannerUrl: apiData.bannerUrl
        };
        setJobDetail(transformedData);
      } catch (err: any) { setError(err.message || "Terjadi kesalahan."); }
      finally { setIsLoading(false); }
    };
    fetchJobDetailData();
  }, [jobId]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!jobId || !user) {
      setIsInitialBookmarkStatusLoading(false); setIsBookmarked(false);
      setUserApplicationDocuments([]); setIsLoadingUserDocuments(false);
      return;
    }

    const fetchInitialData = async () => {
        setIsInitialBookmarkStatusLoading(true);
        setIsLoadingUserDocuments(true);
        try {
            const token = await user.getIdToken();
            const bookmarksResponse = await fetch(`${API_BASE_URL}/bookmarks`, { headers: { Authorization: `Bearer ${token}` } });
            if (bookmarksResponse.ok) {
                const bookmarksData = await bookmarksResponse.json();
                const userBookmarks: Array<{ jobId: string }> = bookmarksData.bookmarks || bookmarksData || [];
                setIsBookmarked(userBookmarks.some(b => b.jobId === jobId));
            } else { console.warn("Gagal memeriksa status bookmark."); setIsBookmarked(false); }
        } catch (err) { console.error("Error fetching bookmark status:", err); setIsBookmarked(false); }
        finally { setIsInitialBookmarkStatusLoading(false); }

        try {
            const documentsPath = `users/${user.uid}/documents`;
            const documentsCollectionRef = collection(db, documentsPath);
            const q = query(documentsCollectionRef, orderBy("uploadedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedDocs = querySnapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    fileName: data.fileName || data.documentName || 'Dokumen Tanpa Nama',
                    fileUrl: data.fileUrl,
                } as UserApplicationDocument;
            }).filter(doc => doc.fileUrl && (doc.fileName.toLowerCase().includes('cv') || doc.fileName.toLowerCase().includes('resume')));
            setUserApplicationDocuments(fetchedDocs);
        } catch (error) { console.error("Error fetching user documents:", error); setUserApplicationDocuments([]); }
        finally { setIsLoadingUserDocuments(false); }
    };
    
    fetchInitialData();

  }, [jobId, auth.currentUser]); 


  const handleToggleBookmark = async () => {
    if (!jobDetail) return;
    const user = auth.currentUser;
    if (!user) {
      Swal.fire({ title: "Login Dibutuhkan", text: "Anda harus login.", icon: "warning", showCancelButton: true, confirmButtonText: "Login", cancelButtonText: "Nanti" })
      .then((r) => { if (r.isConfirmed) navigate('/login'); });
      return;
    }
    setIsBookmarkProcessing(true);
    const token = await user.getIdToken();
    if (isBookmarked) {
      try {
        const res = await fetch(`${API_BASE_URL}/bookmarked/${jobDetail.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json(); if (res.ok) { setIsBookmarked(false); Swal.fire("Dihapus!", d.message || "Bookmark dihapus.", "success"); }
        else { throw new Error(d.error || "Gagal hapus bookmark."); }
      } catch (e:any) { Swal.fire("Gagal", e.message || "Error.", "error");}
    } else {
      try {
        const res = await fetch(`${API_BASE_URL}/bookmarks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ jobId: jobDetail.id }) });
        const d = await res.json(); if (res.ok) { setIsBookmarked(true); Swal.fire("Disimpan!", d.message || "Pekerjaan disimpan.", "success"); }
        else { throw new Error(d.error || "Gagal simpan pekerjaan."); }
      } catch (e:any) { Swal.fire("Gagal", e.message || "Error.", "error");}
    }
    setIsBookmarkProcessing(false);
  };

  const handleApplyNow = async () => {
    if (!jobDetail) return;
    const user = auth.currentUser;
    if (!user) {
        Swal.fire({ title: "Login Dibutuhkan", text: "Anda harus login untuk melamar.", icon: "warning", showCancelButton: true, confirmButtonText: "Login", cancelButtonText: "Nanti" })
        .then((r) => { if (r.isConfirmed) navigate('/login'); });
        return;
    }

    if (isLoadingUserDocuments) {
        Swal.fire("Mohon Tunggu", "Sedang memuat daftar dokumen Anda...", "info");
        return;
    }

    if (userApplicationDocuments.length === 0) {
        Swal.fire({
            title: "Resume Belum Ada",
            text: "Anda belum mengunggah resume. Silakan unggah resume terlebih dahulu di halaman profil Anda.",
            icon: "info", confirmButtonText: "Ke Profil", showCancelButton: true, cancelButtonText: "Nanti Saja"
        }).then(result => { if (result.isConfirmed) navigate('/profile/edit'); });
        return;
    }

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: `<div class="flex items-center text-xl font-semibold text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-blue-600"><path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"/><polyline points="14 2 14 8 20 8"/><path d="M5 17v-5h8v5"/><path d="M2 22h12v-7H2v7Z"/></svg>
                    Lamar Posisi: ${jobDetail.title}
                </div>`,
        html: `
             <div class="space-y-9 text-left p-2">

              <div>
                <label for="swal-resume-upload" class="block text-sm font-medium text-gray-700 mb-1.5">
                  Unggah Resume Anda (PDF, maks 2MB) <span class="text-red-500 ml-1">*</span>
                </label>
                <input id="swal-resume-upload" type="file" accept="application/pdf" class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3" />
                <p id="swal-file-error" class="text-sm text-red-600 mt-1 hidden">File harus PDF dan maksimal 2MB.</p>
              </div>

              <div>
                <label for="swal-coverletter" class="block text-sm font-medium text-gray-700 mb-1.5">Surat Lamaran (Opsional)</label>
                <textarea id="swal-coverletter" class="swal2-textarea w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-4 placeholder-gray-400 min-h-[100px]" placeholder="Tuliskan surat lamaran Anda di sini..." rows="4"></textarea>
              </div>

              <div>
                <label for="swal-notes" class="block text-sm font-medium text-gray-700 mb-1.5">Catatan Tambahan (Opsional)</label>
                <textarea id="swal-notes" class="swal2-textarea w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-4 placeholder-gray-400 min-h-[80px]" placeholder="Catatan untuk perekrut..." rows="3"></textarea>
              </div>

            </div>
        `,
        focusConfirm: false,
        confirmButtonText: 'Kirim Lamaran',
        confirmButtonColor: '#2563EB', // biru
        showCancelButton: true,
        cancelButtonText: 'Batal',
        showLoaderOnConfirm: true,
        customClass: {
            popup: 'rounded-xl', // Rounded corner untuk popup Swal
            title: 'text-left !text-xl !font-semibold !pt-5 !px-5', // Custom class untuk title
            htmlContainer: '!pb-0', // Mengurangi padding bawah container html
            actions: 'sm:!justify-end !pt-2 !pb-4 !px-5', // Styling untuk tombol
            confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-colors',
            cancelButton: 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-5 rounded-lg text-sm border border-gray-300 transition-colors'
        },
        width: '600px',
        preConfirm: async () => {
          return new Promise((resolve, reject) => {
            const fileInput = document.getElementById('swal-resume-upload') as HTMLInputElement;
            const coverLetter = (document.getElementById('swal-coverletter') as HTMLTextAreaElement).value;
            const notes = (document.getElementById('swal-notes') as HTMLTextAreaElement).value;

            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
              reject('Silakan unggah resume Anda (PDF, maks 2MB).');
              return;
            }

            const file = fileInput.files[0];
            if (file.type !== 'application/pdf') {
              reject('File harus berformat PDF.');
              return;
            }
            if (file.size > 2 * 1024 * 1024) {
              reject('Ukuran file maksimal 2MB.');
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              const base64String = (reader.result as string).split(',')[1];
              resolve({
                jobId: jobDetail.id,
                resumeFile: base64String,
                coverLetter: coverLetter.trim(),
                notes: notes.trim(),
              });
            };
            reader.onerror = () => {
              reject('Gagal membaca file.');
            };

            reader.readAsDataURL(file);
          });
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

    if (isConfirmed && formValues) {
        setIsApplying(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_BASE_URL}/applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formValues),
            });
            const responseData = await response.json();
            if (response.ok) {
                Swal.fire('Berhasil!', responseData.message || 'Lamaran Anda telah berhasil dikirim.', 'success');
            } else {
                throw new Error(responseData.error || 'Gagal mengirim lamaran.');
            }
        } catch (err: any) {
            Swal.fire('Gagal!', err.message || 'Terjadi kesalahan saat mengirim lamaran.', 'error');
        } finally {
            setIsApplying(false);
        }
    }
  };

  const handleShareJob = () => {
    if (navigator.share && jobDetail) {
      navigator.share({
        title: `Lowongan: ${jobDetail.title} di ${jobDetail.company}`,
        text: `Cek lowongan menarik sebagai ${jobDetail.title} di ${jobDetail.company}. Info lebih lanjut:`,
        url: window.location.href,
      }).catch((error) => console.log('Error saat membagikan:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => Swal.fire("Tersalin!", 'Link lowongan telah disalin ke clipboard.', "success"))
        .catch(() => Swal.fire("Gagal", 'Tidak dapat menyalin link.', "error"));
    }
  };

  if (isLoading) { 
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-gray-600">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
          <p className="text-xl font-medium">Memuat detail lowongan...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) { 
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-red-600 px-4 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-xl font-semibold mb-2">Oops! Terjadi Kesalahan</p>
          <p className="text-center mb-6">{error}</p>
          <RouterLink
            to="/jobs"
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
          >
            <ArrowLeft size={18} className="mr-2"/> Kembali ke Daftar Lowongan
          </RouterLink>
        </div>
        <Footer />
      </>
    );
  }

  if (!jobDetail) { 
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-gray-600">Lowongan yang Anda cari tidak ditemukan atau sudah tidak tersedia.</div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <RouterLink 
                    to="/jobs" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 group text-sm font-medium"
                >
                    <ArrowLeft size={18} className="mr-1.5 transition-transform group-hover:-translate-x-1" />
                    Kembali ke Daftar Lowongan
                </RouterLink>
            </div>

          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">{jobDetail.title}</h1>
                  <div className="flex items-center text-sky-200 text-sm mb-1">
                    <Building size={16} className="mr-2 flex-shrink-0" />
                    <RouterLink to={`/companies/${jobDetail.company.toLowerCase().replace(/\s+/g, '-')}/detail`} className="hover:underline">{jobDetail.company}</RouterLink>
                  </div>
                  <div className="flex items-center text-sky-200 text-sm">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span>{jobDetail.city}</span>
                  </div>
                </div>
                <img 
                    src={jobDetail.companyLogo} 
                    alt={`${jobDetail.company} logo`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain border-2 border-sky-200 bg-white p-1 flex-shrink-0 order-first sm:order-last"
                />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 text-sm flex-wrap">
                <span className="inline-flex items-center bg-sky-500/80 text-white px-3 py-1 rounded-full">
                  <Briefcase size={14} className="mr-1.5" /> {jobDetail.type}
                </span>
                {jobDetail.category && (
                  <span className="inline-flex items-center bg-sky-500/80 text-white px-3 py-1 rounded-full">
                    Kategori: {jobDetail.category}
                  </span>
                )}
                <span className="inline-flex items-center text-sky-200">
                  <Clock size={14} className="mr-1.5" /> Diposting: {jobDetail.formattedPostedDate}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Deskripsi Pekerjaan</h2>
                        <div 
                            className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: jobDetail.description.replace(/\n/g, '<br />') || '<p>Deskripsi tidak tersedia.</p>' }} 
                        />
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Keahlian yang Dibutuhkan</h2>
                        {jobDetail.skills && jobDetail.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {jobDetail.skills.map((skill, index) => (
                            <span key={index} className="bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                {skill}
                            </span>
                            ))}
                        </div>
                        ) : (
                        <p className="text-gray-600 italic">Informasi keahlian tidak tersedia.</p>
                        )}
                    </section>
                </div>

                <aside className="md:col-span-1 space-y-6">
                    <div className="bg-slate-50 p-5 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Ringkasan Lowongan</h3>
                        <div className="space-y-2.5 text-sm">
                        <div className="flex items-start">
                            <DollarSign size={18} className="mr-2.5 mt-0.5 text-green-600 flex-shrink-0" />
                            <div>
                            <span className="font-medium text-gray-600">Gaji:</span>
                            <p className="text-gray-800 font-semibold">{jobDetail.formattedSalary || 'Tidak disebutkan'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Briefcase size={18} className="mr-2.5 mt-0.5 text-blue-600 flex-shrink-0" />
                            <div>
                            <span className="font-medium text-gray-600">Tipe Pekerjaan:</span>
                            <p className="text-gray-800">{jobDetail.type}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <MapPin size={18} className="mr-2.5 mt-0.5 text-blue-600 flex-shrink-0" />
                            <div>
                            <span className="font-medium text-gray-600">Lokasi:</span>
                            <p className="text-gray-800">{jobDetail.city}</p>
                            </div>
                        </div>
                        {jobDetail.category && (
                            <div className="flex items-start">
                                <CheckSquare size={18} className="mr-2.5 mt-0.5 text-blue-600 flex-shrink-0" />
                                <div>
                                <span className="font-medium text-gray-600">Kategori:</span>
                                <p className="text-gray-800">{jobDetail.category}</p>
                                </div>
                            </div>
                        )}
                        </div>
                    </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleApplyNow} 
                      disabled={isApplying || isLoadingUserDocuments}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isApplying ? (
                        <Loader2 size={18} className="mr-2 animate-spin"/>
                      ) : (
                        <ExternalLink size={18} className="mr-2" />
                      )}
                      {isApplying ? 'Mengirim Lamaran...' : 'Lamar Sekarang'}
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={handleToggleBookmark}
                        disabled={isInitialBookmarkStatusLoading || isBookmarkProcessing}
                        className={`w-full font-medium py-2.5 px-4 rounded-lg transition-colors border flex items-center justify-center ${
                            isBookmarked
                            ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                        }`}
                      >
                        {isBookmarkProcessing ? (
                            <Loader2 size={18} className="mr-2 animate-spin"/>
                        ) : (
                            <BookmarkIcon size={18} className="mr-2" fill={isBookmarked ? "currentColor" : "none"}/>
                        )}
                        {isBookmarked ? 'Disimpan' : 'Simpan'}
                      </button>
                      <button
                        onClick={handleShareJob}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-colors border border-slate-300 flex items-center justify-center"
                      >
                        <Share2 size={18} className="mr-2" /> Bagikan
                      </button>
                    </div>
                  </div>
                  
                  {jobDetail.aboutCompany || jobDetail.companyWebsite ? (
                    <div className="bg-slate-50 p-5 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Tentang Perusahaan</h3>
                        <div className="flex items-center space-x-3 mb-3">
                            <img 
                                src={jobDetail.companyLogo} 
                                alt={`${jobDetail.company} logo`}
                                className="w-12 h-12 rounded-md object-contain border bg-white p-0.5"
                            />
                            <p className="font-semibold text-gray-700">{jobDetail.company}</p>
                        </div>
                        {jobDetail.aboutCompany && (
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {jobDetail.aboutCompany}
                            </p>
                        )}
                        {jobDetail.companyWebsite && (
                            <a 
                                href={jobDetail.companyWebsite.startsWith('http') ? jobDetail.companyWebsite : `https://${jobDetail.companyWebsite}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center font-medium"
                            >
                                Kunjungi Website Perusahaan <ExternalLink size={14} className="ml-1" />
                            </a>
                        )}
                    </div>
                  ): (
                    <div className="bg-slate-50 p-5 rounded-lg border">
                         <h3 className="text-lg font-semibold text-gray-800 mb-2">Tentang Perusahaan</h3>
                         <p className="text-sm text-gray-500 italic">{jobDetail.aboutCompany /* Menampilkan aboutCompany jika ada, atau string kosong */}</p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetailPage;
