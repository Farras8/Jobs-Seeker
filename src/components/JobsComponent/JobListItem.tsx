import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Building, Clock, Bookmark, Zap, CheckCircle } from 'lucide-react';
import Swal from "sweetalert2";
import { auth } from "../../firebase"; // Pastikan path ini benar

export interface JobListItemProps {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  city: string;
  type: string;
  salary?: string;
  postedDate: string;
  tags?: string[];
  isNew?: boolean;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  isBookmarked?: boolean;
  onRemoveBookmark?: (jobId: string) => void;
  isApplied?: boolean;
}

const JobListItem: React.FC<JobListItemProps> = ({
  id,
  title,
  company,
  companyLogo,
  city,
  type,
  salary,
  postedDate,
  tags,
  isNew,
  isBookmarked,
  onRemoveBookmark,
  onApply,
  onSave,
  isApplied,
}) => {
  const handleDeleteBookmark = async (jobId: string) => {
    // ... (kode handleDeleteBookmark tetap sama)
    const confirmed = await Swal.fire({
      title: "Yakin ingin menghapus bookmark ini?",
      text: "Data yang sudah dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire("Error", "User tidak terautentikasi.", "error");
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(
        `https://jobseeker-capstone-705829099986.asia-southeast2.run.app/bookmarked/${jobId}`, // Pastikan URL API benar
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus bookmark");
      }
      if (onRemoveBookmark) {
        onRemoveBookmark(jobId);
      }
      Swal.fire("Terhapus!", "Bookmark berhasil dihapus.", "success");
    } catch (error) {
      Swal.fire("Gagal!", (error as Error).message || "Terjadi kesalahan", "error");
    }
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-500 relative overflow-hidden ${isApplied ? 'opacity-85' : ''}`}>
      {/* Kontainer untuk elemen di pojok kanan atas - SUSUNAN VERTIKAL */}
      <div className="absolute top-3 right-3 flex flex-col items-end space-y-1.5 z-10"> {/* Diubah ke flex-col dan space-y */}
        {isApplied && (
          <div className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center order-1"> {/* Order 1 untuk tampil di atas */}
            <CheckCircle size={13} className="inline mr-1" /> Sudah Dilamar
          </div>
        )}
        {onSave && (
          <button
            onClick={() => {
              if (isBookmarked) {
                handleDeleteBookmark(id);
              } else {
                onSave(id);
              }
            }}
            className={`p-1.5 rounded-full transition-colors order-2 ${ // Order 2 untuk tampil di bawah
              isBookmarked 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
            } ${isApplied && !isBookmarked ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isBookmarked ? "Hapus bookmark" : "Simpan lowongan"}
            disabled={isApplied && !isBookmarked}
          >
            <Bookmark size={26} /> {/* Ukuran ikon bookmark diperbesar */}
          </button>
        )}
      </div>

      {isNew && !isApplied && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-800 text-xs font-semibold px-3 py-1 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-32 text-center z-20">
          <Zap size={12} className="inline mr-1" />Baru
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Link to={`/jobs/${id}`} className="flex-shrink-0">
          <img
            src={companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.substring(0, 2))}&background=random&color=fff&bold=true&size=128`}
            alt={`${company} logo`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-contain border border-gray-200 p-1 bg-white"
            onError={(e) => {
              (e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.substring(0, 2))}&background=EBF4FF&color=0D8ABC&bold=true&size=128`);
            }}
          />
        </Link>

        <div className="flex-grow">
          {/* Judul pekerjaan, beri padding kanan yang cukup */}
          <div className="mb-0.5 pr-20 md:pr-24"> {/* Sesuaikan padding-right ini jika perlu */}
            <Link to={`/jobs/${id}`} className="block">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors leading-tight">
                {title}
              </h3>
            </Link>
          </div>
          
          <span className="text-sm text-gray-600 hover:underline flex items-center">
            <Building size={14} className="inline mr-1.5 text-gray-500" /> {company}
          </span>

          <div className="mt-2 space-y-1.5 text-xs text-gray-500">
            <p className="flex items-center">
              <MapPin size={14} className="inline mr-1.5 text-gray-500 flex-shrink-0" /> {city}
            </p>
            <p className="flex items-center">
              <Briefcase size={14} className="inline mr-1.5 text-gray-500 flex-shrink-0" /> {type}
            </p>
            {salary && (
              <p className="flex items-center">
                <span className="font-bold text-green-600 text-sm mr-1.5">Rp</span> {salary}
              </p>
            )}
            <p className="flex items-center">
              <Clock size={14} className="inline mr-1.5 text-gray-500 flex-shrink-0" /> {postedDate}
            </p>
          </div>

          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {(onApply || id) && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <Link
            to={`/jobs/${id}`}
            className={`w-full sm:w-auto text-center text-sm font-medium py-2 px-4 rounded-lg border transition-colors ${
              isApplied 
                ? 'text-gray-500 bg-gray-100 border-gray-300 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-800 border-blue-600 hover:bg-blue-50'
            }`}
            onClick={(e) => { if (isApplied) e.preventDefault(); }}
          >
            Lihat Detail
          </Link>
          {onApply && (
            <button
              onClick={() => { if (!isApplied && onApply) onApply(id); }}
              className={`w-full sm:w-auto font-medium py-2.5 px-5 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg flex items-center justify-center ${
                isApplied
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={isApplied}
            >
              {isApplied ? (
                <>
                  <CheckCircle size={18} className="inline mr-2" /> Sudah Dilamar
                </>
              ) : (
                'Lamar Cepat'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default JobListItem;