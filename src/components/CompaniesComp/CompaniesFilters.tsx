// src/components/CompaniesPageComponents/CompaniesFilters.tsx
import React, { useState, useEffect } from 'react';
import { Filter, Search, X } from 'lucide-react';

// Interface ini tidak lagi di-export secara eksplisit, karena tipe props didefinisikan inline oleh parent
// Namun, struktur ini tetap menjadi acuan untuk props
interface CompanyFiltersData { 
  city: string;
  minActiveJobCount: string; 
}

interface CompaniesFiltersProps {
  // initialFilters akan menggunakan tipe yang sama dengan yang didefinisikan di CompaniesPage
  initialFilters: CompanyFiltersData; // Menggunakan CompanyFiltersData yang didefinisikan di atas
  onFilterChange: (filters: CompanyFiltersData) => void; // Menggunakan CompanyFiltersData
  // availableCities?: string[]; // Opsional untuk dropdown kota
}

const CompaniesFilters: React.FC<CompaniesFiltersProps> = ({ 
    initialFilters, 
    onFilterChange, 
    // availableCities 
}) => {
  const [city, setCity] = useState(initialFilters.city);
  const [minJobs, setMinJobs] = useState(initialFilters.minActiveJobCount);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ city: city.trim(), minActiveJobCount: minJobs });
  };

  const handleResetFilters = () => {
    setCity('');
    setMinJobs('');
    onFilterChange({ city: '', minActiveJobCount: '' });
  };
  
  useEffect(() => {
    setCity(initialFilters.city);
    setMinJobs(initialFilters.minActiveJobCount);
  }, [initialFilters]);

  return (
    <div className="bg-white p-7 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Filter size={20} className="mr-2 text-blue-600" /> Filter Perusahaan
      </h3>
      <form onSubmit={handleApplyFilters} className="space-y-4">
        <div>
          <label htmlFor="cityFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Kota
          </label>
          <input
            type="text"
            id="cityFilter"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Jakarta, Bogor"
            className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="minJobsFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Minimal Lowongan Aktif
          </label>
          <input
            type="number"
            id="minJobsFilter"
            value={minJobs}
            onChange={(e) => setMinJobs(e.target.value)}
            placeholder="e.g. 1, 5"
            min="0"
            className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex flex-col  gap-3 pt-5">
          <button
            type="submit"
            className="w-full sm:w-auto flex-grow bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors shadow-sm hover:shadow-md flex items-center justify-center"
          >
            <Search size={18} className="mr-2" /> Terapkan Filter
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-md transition-colors border border-gray-300 flex items-center justify-center"
          >
            <X size={18} className="mr-2" /> Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompaniesFilters;
