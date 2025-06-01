// src/components/CompaniesPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Asumsi path ini benar: src/components/Navbar.tsx
import Footer from './Footer';   // Asumsi path ini benar: src/components/Footer.tsx
import CompaniesListItem from './CompaniesComp/CompaniesListItem'; 
import CompaniesFilters from './CompaniesComp/CompaniesFilters';   
import Pagination from './CompaniesComp/Pagination';       
import { Building as BuildingPageIcon, SearchSlash, Loader2 as Loader2Page, AlertTriangle as AlertTrianglePage } from 'lucide-react';

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
}

export interface Company extends Omit<ApiCompany, 'createdAt'> {
  formattedCreatedAt: string;
  logoPlaceholderUrl: string;
}

// Tipe untuk filter didefinisikan langsung di sini
interface FiltersType {
  city: string;
  minActiveJobCount: string;
}
// Akhir definisi interface

const API_BASE_URL = "https://jobseeker-capstone-705829099986.asia-southeast2.run.app";
const ITEMS_PER_PAGE_CLIENT = 10;

const formatFirestoreTimestampPage = (timestamp: ApiTimestamp): string => {
  if (!timestamp || typeof timestamp._seconds !== 'number') return 'Tanggal tidak diketahui';
  return new Date(timestamp._seconds * 1000).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const CompaniesPage: React.FC = () => {
  const [allFetchedCompanies, setAllFetchedCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const getQueryParams = () => new URLSearchParams(location.search);

  const [currentFilters, setCurrentFilters] = useState<FiltersType>(() => {
    const params = getQueryParams();
    return {
        city: params.get('city') || '',
        minActiveJobCount: params.get('minActiveJobCount') || '',
    };
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const params = getQueryParams();
    return Number(params.get('page')) || 1;
  });
  
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      
      let url = `${API_BASE_URL}/companies`; 
      const paramsToApi = new URLSearchParams();
      let useFilterEndpoint = false;

      if (currentFilters.city) {
        paramsToApi.append('city', currentFilters.city);
        useFilterEndpoint = true;
      }
      if (currentFilters.minActiveJobCount && Number(currentFilters.minActiveJobCount) >= 0) {
        paramsToApi.append('minActiveJobCount', currentFilters.minActiveJobCount);
        useFilterEndpoint = true;
      }

      if (useFilterEndpoint) {
        url = `${API_BASE_URL}/companiesFilter?${paramsToApi.toString()}`;
      }
      
      const browserSearchParams = new URLSearchParams();
      if (currentFilters.city) browserSearchParams.set('city', currentFilters.city);
      if (currentFilters.minActiveJobCount) browserSearchParams.set('minActiveJobCount', currentFilters.minActiveJobCount);
      if (currentPage > 1) browserSearchParams.set('page', currentPage.toString());

      if (location.search.substring(1) !== browserSearchParams.toString()) {
        navigate(`${location.pathname}?${browserSearchParams.toString()}`, { replace: true });
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errData = await response.json().catch(()=> ({error: "Gagal mengambil data perusahaan."}));
          throw new Error(errData.error || `Error: ${response.statusText}`);
        }
        const data = await response.json();
        
        const transformedCompanies: Company[] = (data.companies || []).map((apiCompany: ApiCompany) => ({
          ...apiCompany,
          formattedCreatedAt: formatFirestoreTimestampPage(apiCompany.createdAt),
          logoPlaceholderUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiCompany.companyName?.substring(0, 2) || 'CO')}&background=random&color=fff&bold=true&size=128`,
        }));
        
        setAllFetchedCompanies(transformedCompanies);
      } catch (err: any) {
        setError(err.message);
        setAllFetchedCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, [currentFilters, currentPage, navigate, location.pathname, location.search]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_CLIENT;
    return allFetchedCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE_CLIENT);
  }, [allFetchedCompanies, currentPage]);

  const totalPages = Math.ceil(allFetchedCompanies.length / ITEMS_PER_PAGE_CLIENT);

  const handleFilterChange = (filters: FiltersType) => {
    setCurrentFilters(filters);
    setCurrentPage(1); 
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <header className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white py-12 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BuildingPageIcon size={48} className="mx-auto mb-4 text-sky-300" />
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Temukan Perusahaan Impian Anda</h1>
          <p className="text-lg md:text-xl text-sky-100 max-w-2xl mx-auto">
            Jelajahi berbagai perusahaan dan temukan tempat terbaik untuk berkarir.
          </p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="lg:flex lg:gap-8">
          <aside className="lg:w-1/4 xl:w-1/5 mb-8 lg:mb-0 lg:sticky lg:top-8 self-start">
            <CompaniesFilters 
                initialFilters={currentFilters} 
                onFilterChange={handleFilterChange} 
            />
          </aside>

          <section className="lg:w-3/4 xl:w-4/5">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
                    Menampilkan <span className="text-blue-600">{paginatedCompanies.length}</span> dari <span className="text-blue-600">{allFetchedCompanies.length}</span> Perusahaan
                </h2>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-white rounded-xl shadow-md">
                <Loader2Page className="w-16 h-16 animate-spin text-blue-600 mb-6" />
                <p className="text-lg font-medium">Memuat daftar perusahaan...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-red-50 rounded-xl shadow-md border border-red-200">
                <AlertTrianglePage size={64} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-red-700 mb-2">Gagal Memuat Data</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button  
                  onClick={() => { 
                     setCurrentFilters({ city: '', minActiveJobCount: ''}); 
                     setCurrentPage(1); 
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : paginatedCompanies.length > 0 ? (
              <div className="space-y-6">
                {paginatedCompanies.map(company => (
                  <CompaniesListItem key={company.id} company={company} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <SearchSlash size={64} className="mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">Tidak Ada Perusahaan Ditemukan</h3>
                <p className="text-gray-500 max-w-md mx-auto">Filter Anda tidak menghasilkan perusahaan apapun. Coba ubah kriteria filter Anda.</p>
              </div>
            )}

            {!isLoading && !error && allFetchedCompanies.length > 0 && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={ITEMS_PER_PAGE_CLIENT}
                totalItems={allFetchedCompanies.length}
              />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompaniesPage;
