// src/components/List/EducationList.tsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import { Pencil, Trash2, PlusCircle, BookOpen, AlertCircle, Loader2, X } from "lucide-react";
import AddEducationForm from "../AddForm/AddEducationForm";
import EditEducationForm from "../EditForm/EditEducationForm";
import Swal from "sweetalert2";

interface Education {
  id: string;
  institution: string;
  major: string;
  startDate: string;
  endDate: string | null;
  gpa: number | null;
  level: string;
}

export default function EducationList() {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState<Education | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEducation();
  }, []);

  // Logika fetchEducation, handleDelete, handleClickOutside tetap sama
  async function fetchEducation() {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User belum login.");
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/education",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Gagal mengambil data: ${res.statusText}` }));
        throw new Error(errorData.error || `Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setEducation(data.education || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = await Swal.fire({
      title: "Yakin ingin menghapus pendidikan ini?",
      text: "Data yang sudah dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6", // Warna biru konsisten
      cancelButtonColor: "#d33",   // Warna merah untuk cancel
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User belum login");
      const token = await user.getIdToken();
      const res = await fetch(
        `https://jobseeker-capstone-705829099986.asia-southeast2.run.app/education/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghapus pendidikan");
      }
      Swal.fire("Terhapus!", "Data pendidikan berhasil dihapus.", "success");
      fetchEducation();
    } catch (err) {
      Swal.fire("Gagal!", (err as Error).message || "Terjadi kesalahan.", "error");
    }
  }

  function handleClickOutside(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowAddModal(false);
      setEditData(null);
    }
  }
  // Akhir dari logika yang tidak diubah

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-sm">Memuat riwayat pendidikan...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
          <p className="font-semibold text-lg mb-1">Gagal Memuat Data</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }
    if (education.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen size={56} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Riwayat Pendidikan</h3>
          <p className="text-sm text-gray-500 mb-6">Tambahkan riwayat pendidikan Anda untuk melengkapi profil.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
          >
            <PlusCircle size={18} className="mr-2" />
            Tambah Pendidikan
          </button>
        </div>
      );
    }
    return (
      <ul className="divide-y divide-gray-200"> {/* Garis pemisah lebih halus */}
        {education.map((edu) => (
          <li key={edu.id} className="py-5 group"> {/* group untuk hover pada tombol aksi */}
            <div className="flex items-start justify-between">
              <div className="flex-grow pr-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-1">
                  <h3 className="text-md sm:text-lg font-semibold text-gray-800 leading-tight">
                    {edu.level} - {edu.institution}
                  </h3>
                  <span className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0">
                    {edu.startDate.substring(0,7).replace('-', '/')} - {edu.endDate ? edu.endDate.substring(0,7).replace('-', '/') : "Sekarang"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-0.5">{edu.major}</p>
                {edu.gpa !== null && typeof edu.gpa === 'number' && (
                  <p className="text-xs text-gray-500">IPK: {edu.gpa.toFixed(2)}</p>
                )}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-200"> {/* Tombol selalu terlihat di layar besar */}
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  aria-label={`Edit pendidikan ${edu.institution}`}
                  onClick={() => setEditData(edu)}
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                  aria-label={`Hapus pendidikan ${edu.institution}`}
                  onClick={() => handleDelete(edu.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    // STYLING CARD UTAMA KONSISTEN DENGAN DASHBOARD
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8"> {/* Menggunakan mb-8 seperti space-y-8 di ProfilePage */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200"> {/* Judul dengan border bawah */}
        <h2 className="text-2xl font-semibold text-gray-800"> {/* Ukuran konsisten dengan Dashboard */}
          Riwayat Pendidikan
        </h2>
        {/* Tombol tambah tetap di kanan atas judul jika ada data */}
        {!loading && education.length > 0 && (
             <button
                type="button"
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm hover:shadow-md"
                aria-label="Tambah Pendidikan Baru"
                onClick={() => setShowAddModal(true)}
            >
                <PlusCircle size={20} />
            </button>
        )}
      </div>

      {renderContent()}

      {/* Modal styling dijaga konsisten dengan modal lain (padding, backdrop, close button) */}
      {(showAddModal || editData) && (
        <div
          onClick={handleClickOutside}
          className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
                onClick={() => { setShowAddModal(false); setEditData(null); }}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Tutup modal"
            >
                <X size={20} />
            </button>
            {showAddModal && (
                <AddEducationForm
                onCancel={() => setShowAddModal(false)}
                onSubmitSuccess={() => {
                    setShowAddModal(false);
                    fetchEducation();
                }}
                />
            )}
            {editData && (
                <EditEducationForm
                initialData={editData}
                onCancel={() => setEditData(null)}
                onSubmitSuccess={() => {
                    setEditData(null);
                    fetchEducation();
                }}
                />
            )}
          </div>
        </div>
      )}
    </div>
  );
}