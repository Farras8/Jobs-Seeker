// src/components/CompaniesPageComponents/CompaniesDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Navbar from '../Navbar'; // Sesuaikan path jika Navbar ada di level atas components
import Footer from '../Footer';   // Sesuaikan path jika Footer ada di level atas components
import { 
    Building, 
    MapPin as MapPinCompanyDetail, 
    Globe, 
    ArrowLeft as ArrowLeftCompanyDetail, 
    Loader2 as Loader2CompanyDetail, 
    AlertTriangle as AlertTriangleCompanyDetail, 
    ExternalLink as ExternalLinkCompanyDetail,
    Briefcase,
    Mail, 
    Phone 
} from 'lucide-react';

// Interfaces
export interface ApiTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface ApiCompany {
  id: string;
  companyName: string;
  city: string;
  aboutCompany: string;
  createdAt: ApiTimestamp;
  activeJobCount: number;
  companyLogo?: string;
  website?: string;
  industry?: string;
  email?: string; 
  phone?: string; 
  bannerUrl?: string; 
}

export interface Company extends Omit<ApiCompany, 'createdAt'> {
  formattedCreatedAt: string;
  logoPlaceholderUrl: string;
}
// Akhir definisi interface

const API_COMPANY_DETAIL_BASE_URL = "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/companies";

const formatFirestoreTimestampCompanyDetail = (timestamp?: ApiTimestamp): string => {
  if (!timestamp || typeof timestamp._seconds !== 'number') return 'Tanggal tidak diketahui';
  return new Date(timestamp._seconds * 1000).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const CompaniesDetailPage: React.FC = () => {
  const { id: companyId } = useParams<{ id: string }>();
  const [companyDetail, setCompanyDetail] = useState<Company | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      const errMsg = "ID perusahaan tidak valid atau tidak ada di URL.";
      console.error("CompaniesDetailPage: useEffect - " + errMsg);
      setErrorDetail(errMsg);
      setIsLoadingDetail(false);
      return;
    }

    const fetchCompanyDetail = async () => {
      setIsLoadingDetail(true);
      setErrorDetail(null);
      console.log(`CompaniesDetailPage: Memulai fetch untuk companyId: ${companyId}`);
      try {
        const response = await fetch(`${API_COMPANY_DETAIL_BASE_URL}/${companyId}/detail`);
        console.log(`CompaniesDetailPage: Status respons API detail perusahaan (${companyId}): ${response.status}`);
        if (!response.ok) {
          let errorJsonMessage = "Gagal mengambil detail perusahaan.";
          try {
            const errData = await response.json();
            errorJsonMessage = errData.error || errData.message || errorJsonMessage;
          } catch (parseError) {
            console.error("CompaniesDetailPage: Gagal parse JSON dari respons error API", parseError);
          }
          const err = new Error(response.status === 404 ? "Perusahaan tidak ditemukan." : `${errorJsonMessage} (Status: ${response.status})`);
          console.error(`CompaniesDetailPage: Error API (${companyId}) - Status: ${response.status}`, err);
          throw err;
        }
        const apiData: ApiCompany = await response.json();
        console.log(`CompaniesDetailPage: Data API diterima untuk companyId: ${companyId}`, apiData);

        if (!apiData || !apiData.id) {
            const errMsg = "Data perusahaan dari API tidak valid atau tidak lengkap.";
            console.error("CompaniesDetailPage: " + errMsg, apiData);
            throw new Error(errMsg);
        }

        const transformedData: Company = {
          ...apiData,
          formattedCreatedAt: formatFirestoreTimestampCompanyDetail(apiData.createdAt),
          logoPlaceholderUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiData.companyName?.substring(0, 2) || 'CO')}&background=EBF4FF&color=0D8ABC&bold=true&size=128`,
        };
        setCompanyDetail(transformedData);
        console.log(`CompaniesDetailPage: Data perusahaan berhasil ditransformasi untuk companyId: ${companyId}`, transformedData);
      } catch (err: any) {
        console.error(`CompaniesDetailPage: Exception saat fetch detail perusahaan (${companyId}):`, err);
        setErrorDetail(err.message || "Terjadi kesalahan yang tidak diketahui.");
      } finally {
        setIsLoadingDetail(false);
        console.log(`CompaniesDetailPage: Selesai fetch (atau gagal) untuk companyId: ${companyId}`);
      }
    };

    fetchCompanyDetail();
  }, [companyId]);

  if (isLoadingDetail) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-gray-600">
          <Loader2CompanyDetail className="w-16 h-16 animate-spin text-blue-600 mb-4" />
          <p className="text-xl font-medium">Memuat detail perusahaan...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (errorDetail) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-red-600 px-4 text-center">
          <AlertTriangleCompanyDetail className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-xl font-semibold mb-2">Oops! Terjadi Kesalahan</p>
          <p className="text-center mb-6">{errorDetail}</p>
          <RouterLink
            to="/companies"
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center"
          >
            <ArrowLeftCompanyDetail size={18} className="mr-2"/> Kembali ke Daftar Perusahaan
          </RouterLink>
        </div>
        <Footer />
      </>
    );
  }

  if (!companyDetail) {
    return (
      <>
        <Navbar />
        <div className="text-center py-20 text-gray-600">Perusahaan tidak ditemukan atau data tidak lengkap.</div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <RouterLink 
                    to="/companies" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 group text-sm font-medium"
                >
                    <ArrowLeftCompanyDetail size={18} className="mr-1.5 transition-transform group-hover:-translate-x-1" />
                    Kembali ke Daftar Perusahaan
                </RouterLink>
            </div>

          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            {/* Company Header - Banner */}
            <div className={`relative h-48 sm:h-60 md:h-72 flex items-center justify-center ${!companyDetail.bannerUrl ? 'bg-gradient-to-r from-sky-500 to-indigo-600' : ''}`}>
                {companyDetail.bannerUrl ? (
                    <img src={companyDetail.bannerUrl} alt={`${companyDetail.companyName} banner`} className="w-full h-full object-cover absolute inset-0"/>
                ) : (
                    <h1 className="text-4xl sm:text-5xl font-bold text-white z-10 text-center px-4 break-words select-none">
                        {/* Nama perusahaan di banner dihapus, akan diletakkan di bawah */}
                    </h1>
                )}
                <div className="absolute inset-0 bg-black/30"></div>
            </div>
            
            {/* Company Info Section - Di bawah banner */}
            <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-8 text-center"> {/* pt-8 untuk memberi jarak dari banner */}
                {/* Logo Perusahaan */}
                <img 
                    src={companyDetail.companyLogo || companyDetail.logoPlaceholderUrl} 
                    alt={`${companyDetail.companyName} logo`}
                    className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-contain border-4 border-white bg-gray-100 p-1 shadow-lg mx-auto -mt-20 sm:-mt-24 md:-mt-28 z-10 relative" // -mt untuk overlap sedikit jika diinginkan, atau hilangkan untuk benar-benar di bawah
                    onError={(e) => { (e.currentTarget.src = companyDetail.logoPlaceholderUrl); }}
                />
                {/* Info Teks Perusahaan */}
                <div className="mt-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{companyDetail.companyName}</h1>
                    {companyDetail.industry && (
                        <p className="text-sm text-gray-600 mt-1">Industri: {companyDetail.industry}</p>
                    )}
                    <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                        <MapPinCompanyDetail size={16} className="mr-1.5 flex-shrink-0" />
                        <span>{companyDetail.city || 'Lokasi tidak diketahui'}</span>
                    </div>
                </div>
                {/* Tombol Website */}
                {companyDetail.website && (
                    <div className="mt-6">
                        <a 
                            href={companyDetail.website.startsWith('http') ? companyDetail.website : `https://${companyDetail.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow-md hover:shadow-lg text-sm"
                        >
                            <Globe size={16} className="mr-2" /> Kunjungi Website
                        </a>
                    </div>
                )}
            </div>
            
            {/* Garis Pemisah */}
            <hr className="mx-4 sm:mx-6 lg:mx-8 border-gray-200" />

            {/* Konten Detail dalam satu kolom utama */}
            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <section>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">Tentang Perusahaan</h2>
                    <div 
                        className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: companyDetail.aboutCompany.replace(/\n/g, '<br />') || '<p>Informasi tentang perusahaan belum tersedia.</p>' }} 
                    />
                </section>

                {(companyDetail.email || companyDetail.phone) && (
                    <section>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 border-b pb-2">Informasi Kontak</h2>
                        <div className="space-y-2 text-sm">
                            {companyDetail.email && (
                                <div className="flex items-center">
                                    <Mail size={16} className="mr-2 text-gray-500 flex-shrink-0"/> 
                                    <a href={`mailto:${companyDetail.email}`} className="text-blue-600 hover:underline break-all">{companyDetail.email}</a>
                                </div>
                            )}
                            {companyDetail.phone && (
                                <div className="flex items-center">
                                    <Phone size={16} className="mr-2 text-gray-500 flex-shrink-0"/> 
                                    <span className="text-gray-700">{companyDetail.phone}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <section>
                    <div className="bg-slate-50 p-5 rounded-lg border">
                         <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                            <Briefcase size={18} className="mr-2 text-blue-600"/>
                            Lowongan Aktif
                        </h3>
                        <p className="text-2xl font-bold text-blue-600 mb-1">{companyDetail.activeJobCount}</p>
                        {companyDetail.activeJobCount > 0 ? (
                            <RouterLink 
                                to={`/jobs?company=${encodeURIComponent(companyDetail.companyName)}`}
                                className="text-sm text-blue-600 hover:underline font-medium flex items-center"
                            >
                                Lihat semua lowongan <ExternalLinkCompanyDetail size={14} className="inline ml-1"/>
                            </RouterLink>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Tidak ada lowongan aktif.</p>
                        )}
                    </div>
                </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompaniesDetailPage;
