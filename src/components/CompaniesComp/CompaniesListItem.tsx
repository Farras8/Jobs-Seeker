// src/components/CompaniesPageComponents/CompaniesListItem.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { MapPin, Briefcase, Building as BuildingIconListItem } from 'lucide-react';

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
// Akhir definisi interface

interface CompaniesListItemProps {
  company: Company;
}

const CompaniesListItem: React.FC<CompaniesListItemProps> = ({ company }) => {
  const shortAbout = company.aboutCompany && company.aboutCompany.length > 150 
    ? company.aboutCompany.substring(0, 150) + "..." 
    : company.aboutCompany || 'Informasi tentang perusahaan ini belum tersedia.';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-500">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <RouterLink to={`/companies/${company.id}/detail`} className="flex-shrink-0">
          <img
            src={company.companyLogo || company.logoPlaceholderUrl}
            alt={`${company.companyName} logo`}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain border border-gray-200 p-1 bg-white"
            onError={(e) => { (e.currentTarget.src = company.logoPlaceholderUrl); }}
          />
        </RouterLink>
        <div className="flex-grow">
          <RouterLink to={`/companies/${company.id}/detail`}>
            <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
              {company.companyName || 'Nama Perusahaan Tidak Tersedia'}
            </h2>
          </RouterLink>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <MapPin size={16} className="mr-1.5 flex-shrink-0" />
            <span>{company.city || 'Lokasi tidak diketahui'}</span>
          </div>
          {company.industry && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
                <BuildingIconListItem size={16} className="mr-1.5 flex-shrink-0" />
                <span>Industri: {company.industry}</span>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
            {shortAbout}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm text-blue-600 font-semibold">
          <Briefcase size={16} className="inline mr-1.5" />
          {company.activeJobCount > 0 
            ? `${company.activeJobCount} lowongan aktif` 
            : 'Tidak ada lowongan aktif'}
        </div>
        <RouterLink
          to={`/companies/${company.id}/detail`}
          className="mt-3 sm:mt-0 text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
          Lihat Profil Perusahaan
        </RouterLink>
      </div>
    </div>
  );
};

export default CompaniesListItem;
