import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebase";
import { collection, getDocs, query, orderBy, Timestamp, doc, getDoc, where } from "firebase/firestore";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Loader2, Search, ThumbsUp, Bookmark, Zap, CheckCircle, UserCheck, AlertCircle, Edit3 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import Swal from "sweetalert2";

// Interface yang sudah ada...
interface UserSkill {
  id: string;
  name: string;
  level: string;
}

interface JobData {
  id: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  jobDescription?: string;
  skillsRequired?: string[];
  category?: string;
  jobType?: string;
  postedAt?: Date;
}

interface RecommendedJob extends JobData {
  similarityScore?: number;
}

const API_BASE_URL = "https://jobseeker-capstone-705829099986.asia-southeast2.run.app";

function dotProduct(vecA: number[], vecB: number[]): number {
    return vecA.reduce((sum, val, i) => sum + val * (vecB[i] || 0), 0);
}

function magnitude(vec: number[]): number {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const magA = magnitude(vecA);
    const magB = magnitude(vecB);
    if (magA === 0 || magB === 0) return 0;
    return dotProduct(vecA, vecB) / (magA * magB);
}

const RecommendJobs: React.FC = () => {
  const [userHardSkills, setUserHardSkills] = useState<UserSkill[]>([]);
  const [userSoftSkills, setUserSoftSkills] = useState<UserSkill[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(true);

  const [allJobs, setAllJobs] = useState<JobData[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);

  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<RecommendedJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchInitialUserData = async (userId: string, token: string) => {
      setIsLoadingSkills(true);
      setError(null);
      try {
        // Fetch Skills
        const [resHard, resSoft] = await Promise.all([
          fetch(`${API_BASE_URL}/hard-skills`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/soft-skills`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!resHard.ok) throw new Error(`Gagal mengambil hard skills: ${resHard.statusText}`);
        if (!resSoft.ok) throw new Error(`Gagal mengambil soft skills: ${resSoft.statusText}`);
        const hardData = await resHard.json();
        const softData = await resSoft.json();
        setUserHardSkills(Array.isArray(hardData.skills) ? hardData.skills : (Array.isArray(hardData) ? hardData : []));
        setUserSoftSkills(Array.isArray(softData.skills) ? softData.skills : (Array.isArray(softData) ? softData : []));

        // Fetch Existing Bookmarks
        const bookmarksResponse = await fetch(`${API_BASE_URL}/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bookmarksResponse.ok) {
          const bookmarksData = await bookmarksResponse.json();
          const ids = (bookmarksData.bookmarks || bookmarksData || []).map((b: { jobId: string }) => b.jobId);
          setBookmarkedJobIds(new Set(ids));
        } else {
          console.warn("Gagal memuat data bookmark pengguna yang sudah ada.");
        }

      } catch (err: any) {
        console.error("Error fetching user skills or bookmarks:", err);
        setError(prevError => prevError || `Gagal memuat data awal pengguna: ${err.message}`);
        setUserHardSkills([]);
        setUserSoftSkills([]);
        setBookmarkedJobIds(new Set());
      } finally {
        setIsLoadingSkills(false);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        fetchInitialUserData(user.uid, token);
      } else {
        setUserHardSkills([]);
        setUserSoftSkills([]);
        setBookmarkedJobIds(new Set());
        setError("Silakan login untuk mendapatkan rekomendasi pekerjaan dan menggunakan fitur bookmark.");
        setIsLoadingSkills(false);
        setIsLoadingJobs(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchAllJobsForMatching = async () => {
        if (!auth.currentUser) { setIsLoadingJobs(false); return; }
        setIsLoadingJobs(true);
        try {
            const jobsCollectionRef = collection(db, "jobs");
            const q = query(jobsCollectionRef, where("isActive", "==", true), orderBy("postedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedJobs = querySnapshot.docs.map(docSnap => {
                const data = docSnap.data();
                const postedAtTimestamp = data.postedAt as Timestamp;
                return {
                    id: docSnap.id,
                    jobTitle: data.jobTitle || "Judul Tidak Tersedia",
                    companyName: data.companyName || "Perusahaan Tidak Diketahui",
                    location: data.location || "Lokasi Tidak Diketahui",
                    skillsRequired: (Array.isArray(data.skillsRequired) ? data.skillsRequired : []).map((s: any) => String(s).toLowerCase()),
                    jobDescription: data.jobDescription || "Deskripsi tidak tersedia.",
                    category: data.category,
                    jobType: data.jobType,
                    postedAt: postedAtTimestamp ? postedAtTimestamp.toDate() : undefined,
                } as JobData;
            });
            setAllJobs(fetchedJobs);
        } catch (err: any) {
            console.error("Error fetching all jobs for matching:", err);
            setError(prevError => prevError || `Gagal memuat data pekerjaan: ${err.message}`);
            setAllJobs([]);
        } finally {
            setIsLoadingJobs(false);
        }
    };
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) { fetchAllJobsForMatching(); }
        else { setAllJobs([]); setIsLoadingJobs(false); }
    });
    return () => unsubscribe();
  }, []);

  const handleGetRecommendations = async () => {
    // ... (Logika handleGetRecommendations tetap sama seperti sebelumnya)
    if (isLoadingSkills || isLoadingJobs) {
        Swal.fire("Mohon Tunggu", "Data dasar untuk rekomendasi sedang dimuat.", "info");
        return;
    }
    if (userHardSkills.length === 0 && userSoftSkills.length === 0) {
      Swal.fire({
        title: "Tidak Ada Keahlian", text: "Anda belum menambahkan keahlian pada profil Anda. Silakan tambahkan keahlian terlebih dahulu.",
        icon: "warning", confirmButtonText: "Tambah Keahlian", showCancelButton: true, cancelButtonText: "Nanti Saja"
      }).then((result) => { if (result.isConfirmed) { navigate('/profile/edit'); } });
      return;
    }
    if (allJobs.length === 0) {
        Swal.fire("Data Pekerjaan Kosong", "Tidak ada data pekerjaan yang tersedia untuk dicocokkan saat ini.", "info");
        return;
    }
    setIsLoadingRecommendations(true);
    setError(null);
    setRecommendations([]);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
        const userProfileSkills = [
            ...userHardSkills.map(s => s.name.toLowerCase().trim()),
            ...userSoftSkills.map(s => s.name.toLowerCase().trim())
        ].filter(Boolean);
        if (userProfileSkills.length === 0) {
             Swal.fire("Info", "Tidak ada keahlian valid di profil Anda untuk dicocokkan.", "info");
             setIsLoadingRecommendations(false); return;
        }
        const allSkillNames = new Set<string>(userProfileSkills);
        allJobs.forEach(job => { (job.skillsRequired || []).forEach(skill => allSkillNames.add(skill.toLowerCase().trim())); });
        const vocabulary = Array.from(allSkillNames).sort();
        if (vocabulary.length === 0) {
            Swal.fire("Info", "Tidak ada keahlian yang bisa dicocokkan dengan lowongan.", "info");
            setIsLoadingRecommendations(false); return;
        }
        const userVector = vocabulary.map(vocabSkill => userProfileSkills.includes(vocabSkill) ? 1 : 0);
        let jobRecommendationsProcessing: RecommendedJob[] = allJobs.map(job => {
            const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase().trim());
            const jobVector = vocabulary.map(vocabSkill => jobSkills.includes(vocabSkill) ? 1 : 0);
            const score = cosineSimilarity(userVector, jobVector);
            return {
                ...job,
                jobDescription: job.jobDescription ? job.jobDescription.substring(0,180) + "..." : "Deskripsi tidak tersedia.",
                similarityScore: score,
            };
        }).filter(job => (job.similarityScore || 0) > 0.01);
        jobRecommendationsProcessing.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
        const topRecommendations = jobRecommendationsProcessing.slice(0, 10);
        if (topRecommendations.length === 0 ) {
            Swal.fire("Info", "Tidak ada rekomendasi pekerjaan yang ditemukan berdasarkan keahlian Anda saat ini.", "info");
        }
        setRecommendations(topRecommendations);
    } catch (err: any) {
        console.error("Error calculating recommendations:", err);
        setError(`Gagal menghitung rekomendasi: ${err.message}`);
        setRecommendations([]);
        Swal.fire("Error", `Gagal menghitung rekomendasi: ${err.message}`, "error");
    } finally {
        setIsLoadingRecommendations(false);
    }
  };
  
  const handleToggleBookmark = async (jobId: string) => {
    const user = auth.currentUser;
    if (!user) {
        Swal.fire("Login Dibutuhkan", "Anda harus login untuk mengubah status bookmark.", "warning").then(result => {
            if(result.isConfirmed || result.isDismissed) navigate('/login');
        });
        return;
    }

    const token = await user.getIdToken();
    const isCurrentlyBookmarked = bookmarkedJobIds.has(jobId);

    if (isCurrentlyBookmarked) {
        // Logika untuk MENGHAPUS bookmark
        try {
            const response = await fetch(`${API_BASE_URL}/bookmarked/${jobId}`, { // Menggunakan endpoint delete dengan jobId
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const responseData = await response.json(); // Coba parse JSON meskipun untuk DELETE
            if (response.ok) {
                setBookmarkedJobIds(prevIds => {
                    const newIds = new Set(prevIds);
                    newIds.delete(jobId);
                    return newIds;
                });
                Swal.fire("Dihapus!", responseData.message || "Bookmark berhasil dihapus.", "success");
            } else {
                throw new Error(responseData.error || "Gagal menghapus bookmark.");
            }
        } catch (err: any) {
            console.error("Error removing bookmark:", err);
            Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menghapus bookmark.", "error");
        }
    } else {
        // Logika untuk MENAMBAH bookmark (yang sudah ada)
        try {
            const response = await fetch(`${API_BASE_URL}/bookmarks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ jobId }),
            });

            const responseData = await response.json();
            if (response.ok) {
                setBookmarkedJobIds(prevIds => new Set(prevIds).add(jobId));
                Swal.fire("Disimpan!", responseData.message || "Pekerjaan berhasil disimpan.", "success");
            } else {
                throw new Error(responseData.error || "Gagal menyimpan pekerjaan.");
            }
        } catch (err: any) {
            console.error("Error adding bookmark:", err);
            Swal.fire("Gagal", err.message || "Terjadi kesalahan saat menyimpan pekerjaan.", "error");
        }
    }
  };

  const renderSkillPills = (skills: UserSkill[], color: string) => (
    <div className="flex flex-wrap gap-2 mt-1">
        {skills.length > 0 ? skills.map(skill => (
            <span key={skill.id || skill.name} className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${color}-100 text-${color}-700`}>
                {skill.name} <span className="text-xs opacity-75">({skill.level})</span>
            </span>
        )) : <p className="text-xs text-gray-500 italic">Belum ada.</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          {/* Header Halaman dan Dasar Rekomendasi */}
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
            <ThumbsUp size={32} className="mr-3 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Rekomendasi Pekerjaan Untuk Anda</h1>
          </div>
          <div className="mb-8 p-6 bg-sky-50 border border-sky-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-sky-700 flex items-center">
                    <UserCheck size={22} className="mr-2" />
                    Dasar Rekomendasi: Keahlian Anda
                </h2>
                <RouterLink 
                    to="/profile/edit"
                    className="text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center"
                    title="Edit Keahlian Anda"
                >
                    <Edit3 size={14} className="mr-1"/> Edit Keahlian
                </RouterLink>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Sistem akan mencarikan lowongan yang paling cocok dengan daftar hard skills dan soft skills yang telah Anda tambahkan di profil.
            </p>
            {isLoadingSkills || isLoadingJobs ? (
              <div className="flex items-center text-gray-500 py-4">
                <Loader2 className="animate-spin mr-2" size={20} /> 
                {isLoadingSkills ? "Memuat daftar keahlian Anda..." : "Memuat data pekerjaan..."}
              </div>
            ) : error && userHardSkills.length === 0 && userSoftSkills.length === 0 && allJobs.length === 0 ? (
              <div className="text-center py-4 px-3 bg-red-50 border border-red-300 rounded-md">
                <AlertCircle size={20} className="text-red-600 mx-auto mb-2"/>
                <p className="text-sm text-red-700">{error || "Gagal memuat data."}</p>
                {error && error.includes("login") && (
                    <RouterLink 
                        to="/login" 
                        className="mt-3 inline-flex items-center px-4 py-2 bg-blue-500 text-white text-xs font-semibold rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Login Sekarang
                    </RouterLink>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center"><Zap size={16} className="mr-1.5 text-blue-500"/>Hard Skills:</h4>
                    {renderSkillPills(userHardSkills, 'blue')}
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1 flex items-center"><CheckCircle size={16} className="mr-1.5 text-green-500"/>Soft Skills:</h4>
                    {renderSkillPills(userSoftSkills, 'green')}
                </div>
                {(userHardSkills.length === 0 && userSoftSkills.length === 0 && !isLoadingSkills) && (
                     <div className="text-center py-4 px-3 bg-yellow-50 border border-yellow-300 rounded-md mt-4">
                        <p className="text-sm text-yellow-700 mb-2">
                        Anda belum menambahkan keahlian apapun. Rekomendasi mungkin kurang akurat.
                        </p>
                        <RouterLink
                        to="/profile/edit" 
                        className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white text-xs font-semibold rounded-md hover:bg-yellow-600 transition-colors"
                        >
                        <Edit3 size={16} className="mr-2" /> Tambah/Edit Keahlian Anda
                        </RouterLink>
                    </div>
                )}
              </div>
            )}
          </div>
          <div className="text-center mb-8">
            <button
              onClick={handleGetRecommendations}
              disabled={isLoadingRecommendations || isLoadingSkills || isLoadingJobs }
              className={`inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white 
                ${(isLoadingRecommendations || isLoadingSkills || isLoadingJobs)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                } transition-colors duration-150`}
            >
              {isLoadingRecommendations ? (
                <><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Mencari Rekomendasi...</>
              ) : (
                <><Search size={20} className="mr-2" /> Dapatkan Rekomendasi</>
              )}
            </button>
          </div>
        
            {error && !isLoadingSkills && !isLoadingJobs && !isLoadingRecommendations && (userHardSkills.length > 0 || userSoftSkills.length > 0) && (
                <div className="my-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-center">
                    <p>{error}</p>
                </div>
            )}

            {/* Area Hasil Rekomendasi */}
            {recommendations.length > 0 && !isLoadingRecommendations && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-1 mt-10 flex items-center">
                <Briefcase size={26} className="mr-2 text-gray-600" /> Pekerjaan yang Direkomendasikan
              </h2>
              <p className="text-sm text-gray-500 mb-6">Berikut adalah pekerjaan yang paling sesuai berdasarkan keahlian Anda.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((job) => (
                  <div key={job.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col justify-between">
                    <div> {/* Konten utama kartu */}
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                            <div className="mb-2 sm:mb-0 flex-grow">
                                <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                                <RouterLink to={`/jobs/${job.id}`}>{job.jobTitle}</RouterLink>
                                </h3>
                                <p className="text-sm text-gray-700">{job.companyName}</p>
                                <p className="text-xs text-gray-500">{job.location}</p>
                            </div>
                            <div className="flex-shrink-0 text-left sm:text-right">
                                {job.similarityScore !== undefined && (
                                <span 
                                className={`text-xs font-bold px-2.5 py-1 rounded-full
                                    ${job.similarityScore >= 0.75 ? 'bg-green-100 text-green-700' : 
                                    job.similarityScore >= 0.50 ? 'bg-yellow-100 text-yellow-700' :
                                    job.similarityScore > 0.01 ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'}`}> 
                                    Kecocokan: {(job.similarityScore * 100).toFixed(0)}%
                                </span>
                                )}
                            </div>
                        </div>
                        {job.jobDescription && (
                            <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
                                {job.jobDescription}
                            </p>
                        )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
                        <button 
                            title={bookmarkedJobIds.has(job.id) ? "Hapus dari Bookmark" : "Simpan Pekerjaan"}
                            onClick={() => handleToggleBookmark(job.id)}
                            className={`p-2 rounded-full transition-colors ${
                                bookmarkedJobIds.has(job.id)
                                ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                            }`}
                        >
                            <Bookmark size={18} fill={bookmarkedJobIds.has(job.id) ? "currentColor" : "none"} />
                        </button>
                        <RouterLink 
                            to={`/jobs/${job.id}`}
                            className="text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            Lihat Detail
                        </RouterLink>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
            
          {!isLoadingRecommendations && recommendations.length === 0 && (userHardSkills.length > 0 || userSoftSkills.length > 0) && !error && !isLoadingJobs && !isLoadingSkills && (
            <div className="text-center py-10 mt-6 bg-gray-50 rounded-lg">
                <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak Ada Rekomendasi Ditemukan</h3>
                <p className="text-sm text-gray-500">Kami tidak menemukan pekerjaan yang sangat cocok dengan keahlian Anda saat ini. Coba perbarui daftar keahlian Anda.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecommendJobs;