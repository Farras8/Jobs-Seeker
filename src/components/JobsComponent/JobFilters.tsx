import React, { useState } from 'react';
import { Search, MapPin, Briefcase as BriefcaseIcon, Filter, RotateCcw } from 'lucide-react'; // Mengganti nama impor Briefcase

interface JobFiltersProps {
  onFilterChange: (filters: { keyword: string; location: string; type: string }) => void;
  initialFilters?: { keyword: string; location: string; type: string };
}

const JobFilters: React.FC<JobFiltersProps> = ({ onFilterChange, initialFilters }) => {
  const [keyword, setKeyword] = useState(initialFilters?.keyword || '');
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [jobType, setJobType] = useState(initialFilters?.type || '');

  const jobTypeOptions = [
    { value: "", label: "Semua Tipe" },
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Kontrak", label: "Kontrak" },
    { value: "Internship", label: "Internship" },
    { value: "Remote", label: "Remote" },
  ];

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    onFilterChange({ keyword, location, type: jobType });
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setJobType('');
    onFilterChange({ keyword: '', location: '', type: '' });
  };

  return (
    <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-lg mb-8 sticky top-24 z-10"> {/* top-24 untuk mengakomodasi navbar sticky, z-10 agar tidak tertimpa elemen lain */}
      <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
        <Filter size={22} className="mr-2 text-blue-600" /> Saring Lowongan
      </h3>
      <div className="grid grid-cols-1 gap-4"> {/* Dibuat 1 kolom agar lebih rapi di sidebar */}
        {/* Keyword Search */}
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
            Kata Kunci
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Jabatan, perusahaan, skill"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
          </div>
        </div>

        {/* Location Search */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Kota atau daerah"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
          </div>
        </div>

        {/* Job Type Select */}
        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
            Tipe Pekerjaan
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BriefcaseIcon size={18} className="text-gray-400" />
            </div>
            <select
              id="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors appearance-none bg-white" // appearance-none untuk custom arrow
            >
              {jobTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={18} className="text-gray-400" /> {/* Custom arrow */}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button 
          type="submit"
          className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <Search size={18} className="mr-2" /> Cari
        </button>
        <button 
          type="button"
          onClick={handleResetFilters}
          className="w-full sm:w-auto text-gray-700 hover:bg-gray-100 border border-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <RotateCcw size={16} className="mr-2" /> Reset
        </button>
      </div>
    </form>
  );
};

// Minimal ChevronDown icon if not imported from lucide-react or for custom styling
const ChevronDown: React.FC<{size: number, className: string}> = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);


export default JobFilters;