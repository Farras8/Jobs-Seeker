import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Sesuaikan path jika perlu
import { auth, db } from "../firebase"; 
import { doc, getDoc, collection, getDocs } from "firebase/firestore"; 
import { Briefcase, UserCheck, FileText, Bell, Search, ArrowRight, UserCircle, MapPin, Award, Building as BuildingIcon, Clock } from 'lucide-react'; // Mengganti nama Building
import Footer from "../components/Footer"; // Sesuaikan path jika perlu
import { Link as RouterLink } from 'react-router-dom'; // Menggunakan RouterLink untuk navigasi internal

// --- Interface untuk data API recent jobs ---
interface ApiJobSalary {
  min: number;
  max: number;
  currency: string;
}

interface ApiJobPostedAt {
  _seconds: number;
  _nanoseconds: number;
}

interface RecentApiJob {
  id: string;
  jobTitle: string;
  jobDescription: string; // Bisa digunakan untuk deskripsi singkat
  cleanedDescription?: string;
  companyName: string;
  city: string; // Digunakan sebagai location
  aboutCompany?: string;
  category?: string;
  jobType: string;
  skillsRequired: string[];
  salary?: ApiJobSalary | null;
  isActive?: boolean;
  postedAt: ApiJobPostedAt;
  // companyLogo bisa ditambahkan jika API menyediakannya, atau kita buat placeholder
}

// --- Interface untuk props JobCard yang sudah diformat ---
interface FormattedJobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string; // Sudah diformat
  logoUrl: string; // Bisa jadi placeholder
  tags?: string[];
  postedDate: string; // Sudah diformat
  // Tambahkan link ke detail pekerjaan
  detailLink: string;
}


type UserData = {
  displayName: string | null;
  fullName?: string | null;
};

// --- Fungsi Utilitas (bisa dipisah ke file utils.ts) ---
const formatSalaryForCard = (salaryObj?: ApiJobSalary | null): string => {
  if (!salaryObj || salaryObj.min == null || salaryObj.max == null) {
    return 'Nego';
  }
  const { min, max, currency } = salaryObj;
  const minFormatted = (min / 1000000); // Dalam juta
  const maxFormatted = (max / 1000000); // Dalam juta

  if (min === 0 && max === 0) return 'Nego';
  if (min > 0 && max > 0 && min !== max) {
    return `${currency} ${minFormatted}jt - ${maxFormatted}jt`;
  }
  if (min > 0 && (max === 0 || max === min)) {
    return `${currency} ${minFormatted}jt`;
  }
  if (min === 0 && max > 0) {
    return `${currency} Hingga ${maxFormatted}jt`;
  }
  return 'Gaji Tidak Disebutkan';
};

const formatPostedDateForCard = (postedAtObj: ApiJobPostedAt): string => {
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
  
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};
// --- Akhir Fungsi Utilitas ---


export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [bookmarksCount, setBookmarksCount] = useState<number>(0);
  const [applicationsCount, setApplicationCount] = useState<number>(0); // Nama state konsisten
  const [loading, setLoading] = useState(true);

  // State untuk recent jobs
  const [recentJobs, setRecentJobs] = useState<FormattedJobCardProps[]>([]);
  const [loadingRecentJobs, setLoadingRecentJobs] = useState(true);
  const [errorRecentJobs, setErrorRecentJobs] = useState<string | null>(null);

  // Fetch user data, bookmarks, applications
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true); // Set loading true saat mulai fetch
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid, "user_personal", "info");
          const docSnap = await getDoc(userDocRef);
          let fetchedFullName: string | null = null;
          if (docSnap.exists()) {
            fetchedFullName = docSnap.data().fullName;
          }
          setUserData({
            displayName: firebaseUser.displayName || firebaseUser.email,
            fullName: fetchedFullName
          });

          const bookmarksRef = collection(db, "users", firebaseUser.uid, "bookmarks");
          const bookmarksSnapshot = await getDocs(bookmarksRef);
          setBookmarksCount(bookmarksSnapshot.size);

          const applicationsRef = collection(db, "users", firebaseUser.uid, "applications");
          const applicationsSnapshot = await getDocs(applicationsRef);
          setApplicationCount(applicationsSnapshot.size);

        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUserData({ displayName: firebaseUser.displayName || firebaseUser.email, fullName: null });
          // Set count ke 0 jika error
          setBookmarksCount(0);
          setApplicationCount(0);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
        setBookmarksCount(0);
        setApplicationCount(0);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch recent jobs
  useEffect(() => {
    const fetchRecentJobs = async () => {
      setLoadingRecentJobs(true);
      setErrorRecentJobs(null);
      try {
        const response = await fetch("https://jobseeker-capstone-705829099986.asia-southeast2.run.app/jobs/recent");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Tangkap error parsing JSON
          throw new Error(errorData.message || `Gagal mengambil data pekerjaan terbaru: ${response.statusText}`);
        }
        const data: { jobs: RecentApiJob[] } = await response.json();
        
        const formattedJobs = (data.jobs || []).slice(0, 3).map((job: RecentApiJob) => ({ // Ambil 3 teratas
          id: job.id,
          title: job.jobTitle,
          company: job.companyName,
          location: job.city, // Menggunakan city sebagai location
          type: job.jobType,
          salary: formatSalaryForCard(job.salary),
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName.substring(0, 2))}&background=random&color=fff&bold=true&size=100`, // Placeholder logo
          tags: job.skillsRequired?.slice(0, 3) || [], // Ambil 3 skill pertama
          postedDate: formatPostedDateForCard(job.postedAt),
          detailLink: `/jobs/${job.id}`, // Link ke halaman detail
        }));
        setRecentJobs(formattedJobs);
      } catch (err: any) {
        console.error("Error fetching recent jobs:", err);
        setErrorRecentJobs(err.message || "Tidak dapat memuat rekomendasi pekerjaan.");
      } finally {
        setLoadingRecentJobs(false);
      }
    };

    fetchRecentJobs();
  }, []);


  if (loading) { // Loading utama untuk data user
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-5rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="ml-4 text-lg text-gray-700 mt-4">Memuat data Anda...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = userData?.fullName || userData?.displayName || "Pencari Kerja";

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <header className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white pt-12 pb-16 md:pt-16 md:pb-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Selamat Datang, {displayName}!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Temukan peluang karir impian Anda. PortalKarir siap membantu Anda meraih kesuksesan.
          </p>
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Cari lowongan (misal: Web Developer, Jakarta)"
              className="w-full py-3.5 pl-12 pr-28 sm:pr-32 rounded-lg text-gray-800 bg-white placeholder-stone-500 focus:ring-2 focus:ring-sky-400 focus:outline-none shadow-sm border border-transparent focus:border-sky-400"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
              Cari
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8 sm:mb-10">
          <DashboardCard
            icon={<FileText size={28} className="text-blue-500" />}
            title="Lamaran Terkirim"
            value={applicationsCount.toString()}
            description="Pantau status lamaran Anda."
            link="/applications"
            borderColor="border-blue-500"
          />
          <DashboardCard
            icon={<Briefcase size={28} className="text-green-500" />}
            title="Lowongan Disimpan"
            value={bookmarksCount.toString()}
            description="Akses lowongan favorit Anda."
            link="/bookmarks"
            borderColor="border-green-500"
          />
        </section>

        <section className="mb-8 sm:mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Lowongan Terbaru</h2>
            <RouterLink to="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group text-sm">
              Lihat Semua <ArrowRight size={18} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
            </RouterLink>
          </div>
          {loadingRecentJobs ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="ml-3 text-gray-600">Memuat rekomendasi...</p>
            </div>
          ) : errorRecentJobs ? (
            <div className="text-center py-10 px-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3"/>
                <p className="text-red-600">{errorRecentJobs}</p>
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs.map(job => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
                <SearchSlash className="w-12 h-12 mx-auto text-gray-400 mb-3"/>
                <p className="text-gray-600">Tidak ada rekomendasi pekerjaan untuk Anda saat ini.</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tingkatkan Peluang Anda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              title="Lengkapi Profil Anda"
              description="Profil yang 100% lengkap meningkatkan kesempatan Anda hingga 5x lipat."
              buttonText="Perbarui Profil"
              buttonLink="/profile/edit"
              icon={<UserCircle size={28} className="text-white" />}
              bgColor="bg-blue-600 hover:bg-blue-700"
            />
            <ActionCard
              title="Unggah CV & Portofolio"
              description="Pastikan perusahaan melihat CV dan karya terbaik Anda yang paling mutakhir."
              buttonText="Kelola Dokumen"
              buttonLink="/profile/edit" // Asumsi manajemen dokumen ada di edit profil
              icon={<FileText size={28} className="text-white" />}
              bgColor="bg-green-600 hover:bg-green-700"
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// --- Sub-Komponen (bisa dipisah ke file sendiri) ---
interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  link: string;
  borderColor?: string;
}
const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, description, link, borderColor }) => (
  <RouterLink to={link} className={`block bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${borderColor || 'border-transparent'}`}>
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2.5 rounded-full bg-gray-100`}>
        {icon}
      </div>
      <span className="text-3xl font-bold text-gray-800">{value}</span>
    </div>
    <h3 className="text-md font-semibold text-gray-700 mb-1 truncate">{title}</h3>
    <p className="text-xs text-gray-500">{description}</p>
  </RouterLink>
);

// Job Card Component (Styled and Updated)
const JobCard: React.FC<FormattedJobCardProps> = ({ id, title, company, location, type, salary, logoUrl, tags, postedDate, detailLink }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
    <div>
      <div className="flex items-start space-x-4 mb-3">
        <img
          src={logoUrl}
          alt={`${company} logo`}
          className="w-14 h-14 rounded-lg object-contain border border-gray-200 p-0.5 bg-white"
          onError={(e) => {
            (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.substring(0, 2))}&background=E0E0E0&color=757575&bold=true&size=100`);
            (e.currentTarget.alt = `${company} placeholder logo`);
          }}
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
            <RouterLink to={detailLink}>{title}</RouterLink>
          </h3>
          <p className="text-sm text-gray-600 flex items-center">
            <BuildingIcon size={14} className="inline mr-1.5 text-gray-500" /> {company}
          </p>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-gray-500 mb-3">
        <p className="flex items-center"><MapPin size={14} className="inline mr-1.5 text-gray-500" /> {location}</p>
        <p className="flex items-center"><Briefcase size={14} className="inline mr-1.5 text-gray-500" /> {type}</p>
        <p className="flex items-center"><Award size={14} className="inline mr-1.5 text-green-500" /> Gaji: <span className="font-medium text-gray-700 ml-1">{salary}</span></p>
        <p className="flex items-center"><Clock size={14} className="inline mr-1.5 text-gray-500" /> {postedDate}</p>
      </div>
      {tags && tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">{tag}</span>
          ))}
        </div>
      )}
    </div>
    <RouterLink to={detailLink} className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm mt-auto">
      Lihat Detail & Lamar
    </RouterLink>
  </div>
);

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ReactNode;
  bgColor?: string;
}
const ActionCard: React.FC<ActionCardProps> = ({ title, description, buttonText, buttonLink, icon, bgColor = "bg-blue-600 hover:bg-blue-700" }) => (
  <div className={`p-6 rounded-xl shadow-lg text-white ${bgColor} transition-all duration-300 flex flex-col`}>
    <div className="flex items-center space-x-3 mb-3">
      {icon}
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-sm opacity-90 mb-5 flex-grow">{description}</p>
    <RouterLink to={buttonLink} className="self-start mt-auto inline-block bg-white text-gray-800 font-semibold py-2 px-5 rounded-lg hover:bg-gray-100 transition-colors text-sm shadow hover:shadow-md">
      {buttonText}
    </RouterLink>
  </div>
);
