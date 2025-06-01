// src/components/List/PortfolioList.tsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import { Pencil, Trash2, X, PlusCircle, PackageOpen, AlertCircle, Loader2, ExternalLinkIcon, Link as LinkLucideIcon } from "lucide-react"; // Menambahkan ikon
import AddPortfolioForm from "../AddForm/AddPortfolioForm";
import EditPortfolioForm from "../EditForm/EditPortFolioForm"; // Pastikan nama file ini konsisten
import Swal from "sweetalert2";

interface Portfolio {
  id: string;
  title: string;
  description: string;
  projectUrl: string;
  technologies: string[];
}

export default function PortfolioList() {
  const [portfolioList, setPortfolioList] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Portfolio & { technologies: string } | null>(null); // Untuk form, technologies jadi string

  const modalRef = useRef<HTMLDivElement>(null);

  // Logika fetchPortfolio, handleClickOutside, handleAddSubmit, handleEditSubmit, handleDelete tetap sama
  useEffect(() => {
    fetchPortfolio();
  }, []);

  async function fetchPortfolio() {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not logged in");
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/portfolio",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Gagal mengambil data: ${res.statusText}` }));
        throw new Error(errorData.error || `Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setPortfolioList(Array.isArray(data.projects) ? data.projects : []);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleClickOutside(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowAddModal(false);
      setShowEditModal(false);
      setEditData(null);
    }
  }

  function handleAddSubmit() {
    fetchPortfolio();
    setShowAddModal(false);
  }

  function handleEditSubmit() {
    fetchPortfolio();
    setShowEditModal(false);
    setEditData(null);
  }

  async function handleDelete(id: string, title: string) {
    const result = await Swal.fire({
      title: `Hapus proyek "${title}"?`,
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire("Error", "User tidak terautentikasi.", "error");
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch(
        `https://jobseeker-capstone-705829099986.asia-southeast2.run.app/portfolio/${encodeURIComponent(id)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghapus proyek");
      }
      Swal.fire("Terhapus!", `Proyek "${title}" berhasil dihapus.`, "success");
      fetchPortfolio();
    } catch (err) {
      let message = "Terjadi kesalahan saat menghapus proyek.";
      if (err instanceof Error) message = err.message;
      Swal.fire("Error", message, "error");
    }
  }
  // Akhir dari logika yang tidak diubah

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-sm">Memuat data portfolio...</p>
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
    if (portfolioList.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <PackageOpen size={56} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Portfolio</h3>
          <p className="text-sm text-gray-500 mb-6">Tunjukkan karya terbaik Anda dengan menambahkan proyek ke portfolio.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
          >
            <PlusCircle size={18} className="mr-2" />
            Tambah Portfolio
          </button>
        </div>
      );
    }
    return (
      <ul className="divide-y divide-gray-200">
        {portfolioList.map((item) => (
          <li key={item.id} className="py-5 group">
            <div className="flex items-start justify-between">
              <div className="flex-grow pr-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{item.description || "Tidak ada deskripsi."}</p>
                {item.projectUrl && (
                  <a
                    href={item.projectUrl.startsWith('http') ? item.projectUrl : `https://${item.projectUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline mb-2"
                  >
                    <LinkLucideIcon size={14} className="mr-1.5" />
                    Lihat Proyek
                  </a>
                )}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.technologies.map(tech => (
                      <span key={tech} className="px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-semibold rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                  aria-label={`Edit portfolio ${item.title}`}
                  onClick={() => {
                    setEditData({ ...item, technologies: item.technologies.join(", ") });
                    setShowEditModal(true);
                  }}
                >
                  <Pencil size={18} />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                  aria-label={`Hapus portfolio ${item.title}`}
                  onClick={() => handleDelete(item.id, item.title)}
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
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8"> {/* Konsisten dengan List lainnya */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <PackageOpen size={26} className="mr-3 text-indigo-500" /> {/* Ikon disesuaikan */}
            Portfolio Proyek
          </h2>
          {!loading && portfolioList.length > 0 && (
            <button
              type="button"
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm hover:shadow-md"
              aria-label="Tambah Portfolio Baru"
              onClick={() => setShowAddModal(true)}
            >
              <PlusCircle size={20} />
            </button>
          )}
        </div>

        {renderContent()}
      </div>

      {/* Modal styling konsisten */}
      {(showAddModal || showEditModal) && (
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
                onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditData(null); }}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Tutup modal"
            >
                <X size={20} />
            </button>
            {showAddModal && (
              <AddPortfolioForm onSubmit={handleAddSubmit} onCancel={() => setShowAddModal(false)} />
            )}
            {showEditModal && editData && (
              <EditPortfolioForm
                initialData={editData} // editData sudah memiliki technologies sebagai string
                onSubmit={handleEditSubmit}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditData(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}