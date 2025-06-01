// src/components/List/DocumentsList.tsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import { X, Trash2, PlusCircle, FileText, Paperclip, AlertCircle, Loader2, ImageIcon, DownloadCloud, Eye } from "lucide-react";
import AddDocumentsForm from "../AddForm/AddDocumentsForm";
import Swal from "sweetalert2";

interface Document {
  id: string;
  documentName: string; // Ditambahkan
  type: string;
  fileUrl: string;
  uploadedAt: { _seconds: number; _nanoseconds: number };
}

// Helper formatUploadedDate tetap sama
const formatUploadedDate = (timestamp: { _seconds: number; _nanoseconds: number }): string => {
  if (!timestamp || typeof timestamp._seconds !== 'number') {
    return 'Tanggal tidak valid';
  }
  try {
    const date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Tanggal error';
  }
};

// Helper getFileExtension tetap sama
const getFileExtension = (url: string): string => {
  if (!url) return '';
  try {
    return new URL(url).pathname.split('.').pop()?.toLowerCase() || '';
  } catch (e) {
    const parts = url.split('?')[0].split('/');
    return parts[parts.length - 1].split('.').pop()?.toLowerCase() || '';
  }
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const PDF_EXTENSION = 'pdf';

export default function DocumentsList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    setError(null);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User belum login");
      const token = await user.getIdToken();
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/upload-document",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Gagal mengambil data: ${res.statusText}` }));
        throw new Error(errorData.error || `Error: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  function handleClickOutside(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowAddModal(false);
    }
  }

  // Modifikasi handleAddSubmit untuk menerima documentName
  async function handleAddSubmit(base64File: string, type: string, documentName: string) {
    setShowAddModal(false);
    Swal.fire({
        title: 'Mengupload Dokumen...',
        text: 'Mohon tunggu sebentar.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
      const user = auth.currentUser;
      if (!user) {
        Swal.close();
        Swal.fire("Error", "User tidak terautentikasi.", "error");
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/upload-document",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
          // Tambahkan documentName ke body request
          body: JSON.stringify({ file: base64File, type, documentName }),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal mengupload dokumen");
      }
      Swal.fire("Sukses", "Dokumen berhasil diupload!", "success");
      fetchDocuments();
    } catch (err: any) {
      Swal.fire("Error", `Error upload dokumen: ${err.message || err}`, "error");
    }
  }

  // handleDelete tetap sama, namun title bisa diperbarui jika ingin menampilkan documentName
  async function handleDelete(documentId: string, documentNameOrType: string) {
    const result = await Swal.fire({
      title: `Hapus dokumen "${documentNameOrType}"?`, // Bisa gunakan documentName di sini
      text: "Dokumen yang dihapus tidak dapat dikembalikan!",
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
        `https://jobseeker-capstone-705829099986.asia-southeast2.run.app/upload-document/${documentId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghapus dokumen");
      }
      Swal.fire("Terhapus!", "Dokumen berhasil dihapus.", "success");
      fetchDocuments();
    } catch (err: any) {
      Swal.fire("Error", `Gagal menghapus dokumen: ${err.message || err}`, "error");
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-sm">Memuat daftar dokumen...</p>
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
    if (documents.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <Paperclip size={56} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Dokumen</h3>
          <p className="text-sm text-gray-500 mb-6">Unggah CV, surat lamaran, atau sertifikat Anda.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
          >
            <PlusCircle size={18} className="mr-2" />
            Tambah Dokumen
          </button>
        </div>
      );
    }
    return (
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => {
          const extension = getFileExtension(doc.fileUrl);
          const isImage = IMAGE_EXTENSIONS.includes(extension);
          const isPdf = extension === PDF_EXTENSION;

          return (
            <li key={doc.id} className="py-4 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {isImage ? (
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title={`Lihat ${doc.documentName || doc.type}`}>
                      <img
                        src={doc.fileUrl}
                        alt={`Preview ${doc.documentName || doc.type}`}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md border border-gray-200 bg-gray-50"
                      />
                    </a>
                  ) : isPdf ? (
                    <FileText size={36} className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 flex-shrink-0" />
                  ) : (
                    <Paperclip size={36} className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="flex-grow">
                    {/* Tampilkan documentName */}
                    <p className="text-md font-semibold text-gray-800">{doc.documentName || `Dokumen (${doc.type})`}</p>
                    <p className="text-xs text-gray-500">
                      Tipe: {doc.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      Diupload: {formatUploadedDate(doc.uploadedAt)}
                    </p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        <DownloadCloud size={14} className="mr-1" /> Lihat / Download
                    </a>
                  </div>
                </div>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                    aria-label={`Hapus dokumen ${doc.documentName || doc.type}`}
                    // Kirim doc.documentName atau doc.type ke handleDelete
                    onClick={() => handleDelete(doc.id, doc.documentName || doc.type)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Paperclip size={26} className="mr-3 text-teal-500" />
            Manajemen Dokumen
          </h2>
          {!loading && documents.length > 0 && (
            <button
              type="button"
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm hover:shadow-md"
              aria-label="Tambah Dokumen Baru"
              onClick={() => setShowAddModal(true)}
            >
              <PlusCircle size={20} />
            </button>
          )}
        </div>

        {renderContent()}
      </div>

      {showAddModal && (
        <div
          onClick={handleClickOutside}
          className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md shadow-xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Tutup modal"
            >
                <X size={20} />
            </button>
            <AddDocumentsForm
              onSubmit={handleAddSubmit} // handleAddSubmit sekarang menerima documentName
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}