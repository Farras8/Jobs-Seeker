import React, { useState, useEffect, useMemo } from 'react';
import { auth } from "../firebase";
import Navbar from '../components/Navbar'; // Sesuaikan path jika perlu
import Footer from '../components/Footer'; // Sesuaikan path jika perlu
import JobFilters from '../components/JobsComponent/JobFilters'; // Sesuaikan path jika perlu
import JobListItem from '../components/JobsComponent/JobListItem'; // Sesuaikan path jika perlu
import Pagination from '../components/JobsComponent/Pagination'; // Sesuaikan path jika perlu
import { Briefcase, AlertTriangle, SearchSlash } from 'lucide-react';
import Swal from "sweetalert2";

// --- Interface untuk data API ---
interface ApiJobSalary {
  min: number;
  max: number;
  currency: string;
}

interface ApiJobPostedAt {
  _seconds: number;
  _nanoseconds: number;
}

interface ApiJob {
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
}

// --- Interface internal yang digunakan oleh komponen ---
export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  city: string;
  type: string;
  salary?: string;
  postedDate: string;
  description?: string;
  tags?: string[];
  isNew?: boolean;
  category?: string;
  apiJobData?: ApiJob;
}

// --- Fungsi Utilitas ---
const formatSalary = (salaryObj?: ApiJobSalary | null): string | undefined => {
  if (!salaryObj || salaryObj.min == null || salaryObj.max == null) {
    return 'Gaji Nego';
  }
  const { min, max, currency } = salaryObj;
  const minFormatted = (min / 1000000).toLocaleString('id-ID');
  const maxFormatted = (max / 1000000).toLocaleString('id-ID');

  if (min === 0 && max === 0) return 'Gaji Nego';
  if (min > 0 && max > 0 && min !== max) {
    return `${currency} ${minFormatted}jt - ${maxFormatted}jt`;
  }
  if (min > 0 && max === 0) {
    return `${currency} Mulai dari ${minFormatted}jt`;
  }
  if (min === 0 && max > 0) {
    return `${currency} Hingga ${maxFormatted}jt`;
  }
  if (min > 0 && min === max) {
    return `${currency} ${minFormatted}jt`;
  }
  return 'Informasi Gaji Tidak Tersedia';
};

const formatPostedDate = (postedAtObj: ApiJobPostedAt): string => {
  const date = new Date(postedAtObj._seconds * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays <= 7) return `${diffInDays} hari lalu`;

  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const isJobNew = (postedAtObj: ApiJobPostedAt, daysConsideredNew = 7): boolean => {
  const date = new Date(postedAtObj._seconds * 1000);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= daysConsideredNew;
};

// Helper function to convert file to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};


const JOBS_PER_PAGE = 8;
const API_BASE_URL = "https://jobseeker-capstone-705829099986.asia-southeast2.run.app";


const Jobs: React.FC = () => {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [currentFilters, setCurrentFilters] = useState({ keyword: '', city: '', type: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());


  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (!response.ok) {
          throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (data && Array.isArray(data.jobs)) {
          const transformedJobs: Job[] = data.jobs.map((apiJob: ApiJob) => ({
            id: apiJob.id,
            title: apiJob.jobTitle,
            company: apiJob.companyName,
            companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiJob.companyName.substring(0, 2))}&background=random&color=fff&bold=true&size=128`,
            city: apiJob.city,
            type: apiJob.jobType,
            salary: formatSalary(apiJob.salary),
            postedDate: formatPostedDate(apiJob.postedAt),
            description: apiJob.cleanedDescription || apiJob.jobDescription,
            tags: apiJob.skillsRequired || [],
            isNew: isJobNew(apiJob.postedAt),
            category: apiJob.category,
            apiJobData: apiJob,
          }));
          setAllJobs(transformedJobs);
          setFilteredJobs(transformedJobs);
        } else {
          throw new Error("Format data API tidak sesuai atau tidak ada array 'jobs'.");
        }
      } catch (error: any) {
        console.error("Error fetching jobs:", error);
        setFetchError(error.message || "Terjadi kesalahan saat memuat lowongan.");
        setAllJobs([]);
        setFilteredJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchUserSpecificData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setBookmarkedJobs(new Set());
        setAppliedJobIds(new Set());
        return;
      }

      try {
        const token = await user.getIdToken();

        // Fetch Bookmarked Jobs
        const bookmarksResponse = await fetch(`${API_BASE_URL}/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bookmarksResponse.ok) {
          const bookmarksData = await bookmarksResponse.json();
          if (bookmarksData.bookmarks) {
            const bookmarkedJobIdsSet = new Set(bookmarksData.bookmarks.map((bookmark: { jobId: string }) => bookmark.jobId));
            setBookmarkedJobs(bookmarkedJobIdsSet);
          }
        } else {
          console.error("Gagal memuat data bookmarks:", await bookmarksResponse.text());
        }

        // Fetch Applied Jobs from user's applications
        // Anda perlu endpoint yang mengembalikan daftar aplikasi pengguna, misalnya:
        // GET /users/{userId}/applications atau GET /applications?userId={userId}
        // Untuk contoh ini, kita asumsikan endpointnya `/applications` dan API bisa memfilter by user via token
        const applicationsResponse = await fetch(`${API_BASE_URL}/applications`, { // Sesuaikan endpoint jika perlu
             headers: { Authorization: `Bearer ${token}` },
        });
        if (applicationsResponse.ok) {
            const appData = await applicationsResponse.json();
            // Pastikan struktur respons API sesuai. Contoh: { applications: [{ jobId: 'xyz', ... }] }
            if (appData && Array.isArray(appData.applications)) {
                 const appliedIds = new Set(appData.applications.map((app: { jobId: string }) => app.jobId));
                 setAppliedJobIds(appliedIds);
            } else if (appData && appData.applications === null) { // Jika user belum pernah apply
                setAppliedJobIds(new Set());
            }
        } else {
            console.warn("Gagal mengambil data lamaran sebelumnya atau user belum pernah melamar.");
            setAppliedJobIds(new Set()); // Atau tangani error dengan cara lain
        }


      } catch (error) {
        console.error("Error fetching user-specific data:", error);
      }
    };

    // Panggil saat komponen dimuat dan saat status auth berubah
    const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            fetchUserSpecificData();
        } else {
            // User logged out, clear specific data
            setBookmarkedJobs(new Set());
            setAppliedJobIds(new Set());
        }
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (isLoading) return;

    let jobsToDisplay = [...allJobs];

    if (currentFilters.keyword) {
      const keywordLower = currentFilters.keyword.toLowerCase();
      jobsToDisplay = jobsToDisplay.filter(job =>
        job.title.toLowerCase().includes(keywordLower) ||
        job.company.toLowerCase().includes(keywordLower) ||
        (job.tags && job.tags.some(tag => tag.toLowerCase().includes(keywordLower))) ||
        (job.description && job.description.toLowerCase().includes(keywordLower))
      );
    }
    if (currentFilters.city) {
      const cityLower = currentFilters.city.toLowerCase();
      jobsToDisplay = jobsToDisplay.filter(job =>
        job.city.toLowerCase().includes(cityLower)
      );
    }
    if (currentFilters.type) {
      jobsToDisplay = jobsToDisplay.filter(job => job.type === currentFilters.type);
    }
    setFilteredJobs(jobsToDisplay);
    setCurrentPage(1);
  }, [currentFilters, allJobs, isLoading]);

  const handleFilterChange = (filters: { keyword: string; city: string; type: string }) => {
    setCurrentFilters(filters);
  };

  const handleApplyJob = async (jobId: string) => {
    const user = auth.currentUser;
    if (!user) {
      Swal.fire("Autentikasi Diperlukan", "Anda harus login terlebih dahulu untuk melamar pekerjaan.", "warning");
      return;
    }

    // Mengambil detail pekerjaan untuk ditampilkan di modal (opsional)
    const jobToApply = allJobs.find(job => job.id === jobId);

    const { value: formValues } = await Swal.fire({
      title: `Lamar Posisi: ${jobToApply?.title || 'Pekerjaan Ini'}`,
      html: `
        <p class="text-left text-sm text-gray-600 mb-2">Unggah resume Anda (PDF, maks 2MB):</p>
        <input id="swal-resume" type="file" accept="application/pdf" class="swal2-file mb-4 p-2 border rounded w-full">
        
        <p class="text-left text-sm text-gray-600 mb-2">Cover Letter (Opsional):</p>
        <textarea id="swal-coverletter" class="swal2-textarea mb-4 p-2 border rounded w-full" placeholder="Tuliskan surat lamaran Anda di sini..." rows="5"></textarea>
        
        <p class="text-left text-sm text-gray-600 mb-2">Catatan Tambahan (Opsional):</p>
        <textarea id="swal-notes" class="swal2-textarea p-2 border rounded w-full" placeholder="Catatan atau informasi tambahan untuk perekrut..." rows="3"></textarea>
      `,
      focusConfirm: false,
      confirmButtonText: "Kirim Lamaran",
      showCancelButton: true,
      cancelButtonText: "Batal",
      width: '600px', // Lebar modal bisa disesuaikan
      preConfirm: async () => {
        const resumeFileElement = document.getElementById('swal-resume') as HTMLInputElement;
        const resumeFile = resumeFileElement?.files?.[0];
        const coverLetter = (document.getElementById('swal-coverletter') as HTMLTextAreaElement)?.value || "";
        const notes = (document.getElementById('swal-notes') as HTMLTextAreaElement)?.value || "";

        if (!resumeFile) {
          Swal.showValidationMessage(`Resume (PDF) wajib diisi`);
          return false;
        }
        if (resumeFile.type !== "application/pdf") {
          Swal.showValidationMessage(`Format resume harus PDF`);
          return false;
        }
        if (resumeFile.size > 2 * 1024 * 1024) { // 2MB limit
           Swal.showValidationMessage(`Ukuran file resume maksimal 2MB`);
           return false;
        }

        try {
            const resumeFileBase64 = await fileToBase64(resumeFile);
            return { resumeFileBase64, coverLetter, notes };
        } catch (error) {
            Swal.showValidationMessage(`Gagal memproses file resume: ${(error as Error).message}`);
            return false;
        }
      }
    });

    if (!formValues) { // User cancelled or preConfirm returned false
      return;
    }

    Swal.fire({
      title: "Mengirim Lamaran...",
      text: "Mohon tunggu sebentar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const token = await user.getIdToken();
      const { resumeFileBase64, coverLetter, notes } = formValues;

      const applicationPayload = {
        jobId,
        resumeFile: resumeFileBase64,
        coverLetter: coverLetter.trim(), // Kirim string kosong jika tidak diisi
        notes: notes.trim(),           // Kirim string kosong jika tidak diisi
      };

      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Gagal mengirim lamaran: ${response.status}`);
      }

      Swal.fire("Sukses!", "Lamaran Anda berhasil dikirim.", "success");
      setAppliedJobIds(prev => new Set(prev.add(jobId)));

    } catch (error: any) {
      console.error("Error submitting application:", error);
      Swal.fire("Gagal!", error.message || "Terjadi kesalahan saat mengirim lamaran.", "error");
    }
  };


  const handleSaveJob = async (jobId: string) => {
    const user = auth.currentUser;
    if (!user) {
      Swal.fire("Error", "Anda harus login terlebih dahulu.", "error");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/bookmarks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();
      if (response.ok) {
        setBookmarkedJobs((prev) => new Set(prev.add(jobId)));
        Swal.fire("Sukses!", `Pekerjaan berhasil disimpan!`, "success");
      } else {
        throw new Error(data.error || "Gagal menyimpan pekerjaan.");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      Swal.fire("Gagal!", (error as Error).message || "Terjadi kesalahan", "error");
    }
  };

  const handleRemoveBookmark = (jobId: string) => {
    setBookmarkedJobs(prev => {
      const updatedBookmarks = new Set(prev);
      updatedBookmarks.delete(jobId);
      return updatedBookmarks;
    });
  };


  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [currentPage, filteredJobs]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <header className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white py-12 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-sky-300" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Temukan Lowongan Impian Anda</h1>
          <p className="text-lg md:text-xl text-sky-100 max-w-2xl mx-auto">
            Jelajahi ribuan peluang karir dari perusahaan-perusahaan terbaik.
          </p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="lg:flex lg:gap-8">
          <aside className="lg:w-1/4 xl:w-1/5 mb-8 lg:mb-0">
            <JobFilters onFilterChange={handleFilterChange} initialFilters={currentFilters} />
          </aside>

          <section className="lg:w-3/4 xl:w-4/5">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
                Menampilkan <span className="text-blue-600">{filteredJobs.length}</span> dari <span className="text-blue-600">{allJobs.length}</span> Lowongan
              </h2>
              <div>
                <label htmlFor="sortOptions" className="text-sm text-gray-600 mr-2">Urutkan:</label>
                <select id="sortOptions" className="text-sm border border-gray-300 rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="relevance">Relevansi</option>
                  <option value="newest">Terbaru</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-white rounded-xl shadow-md">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
                <p className="text-lg font-medium">Memuat lowongan pekerjaan...</p>
                <p className="text-sm">Mohon tunggu sebentar.</p>
              </div>
            ) : fetchError ? (
              <div className="text-center py-12 bg-red-50 rounded-xl shadow-md border border-red-200">
                <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-red-700 mb-2">Gagal Memuat Lowongan</h3>
                <p className="text-red-600 mb-4">{fetchError}</p>
                <button
                  onClick={() => {
                      setIsLoading(true); // Set loading true
                      // Re-fetch jobs (atau user-specific data jika errornya di sana)
                      const user = auth.currentUser;
                      if (user) fetchUserSpecificData(); else fetchJobs();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : paginatedJobs.length > 0 ? (
              <div className="space-y-6">
                {paginatedJobs.map(job => (
                  <JobListItem
                    key={job.id}
                    {...job} // Spread operator untuk semua properti job
                    onApply={handleApplyJob}
                    onSave={handleSaveJob}
                    isBookmarked={bookmarkedJobs.has(job.id)}
                    onRemoveBookmark={handleRemoveBookmark}
                    isApplied={appliedJobIds.has(job.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <SearchSlash size={64} className="mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">Tidak Ada Lowongan yang Sesuai</h3>
                <p className="text-gray-500 max-w-md mx-auto">Filter Anda tidak menghasilkan lowongan apapun. Coba ubah kata kunci atau kriteria filter Anda, atau periksa kembali nanti untuk lowongan baru.</p>
              </div>
            )}

            {!isLoading && !fetchError && filteredJobs.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;