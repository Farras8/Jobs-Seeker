// src/components/AddForm/AddDocumentsForm.tsx
import React, { useState, ChangeEvent } from "react";
import Swal from "sweetalert2"; // Tidak terpakai di sini jika parent handle Swal
import { Loader2, Check, X as XIcon, UploadCloud, FileText as FileTextIcon, ChevronDown } from "lucide-react";

interface AddDocumentsFormProps {
  // Modifikasi onSubmit untuk menerima documentName
  onSubmit: (base64File: string, type: string, documentName: string) => Promise<void> | void;
  onCancel: () => void;
}

const documentTypes = ["CV", "Surat Lamaran", "Sertifikat", "Portofolio", "Lainnya"];

export default function AddDocumentsForm({ onSubmit, onCancel }: AddDocumentsFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("");
  const [documentName, setDocumentName] = useState(""); // State untuk nama dokumen
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper fileToBase64 tetap sama
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject("Gagal membaca file sebagai string base64");
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  // handleFileChange tetap sama
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError("Ukuran file maksimal 10MB.");
        setSelectedFile(null);
        e.target.value = "";
        return;
      }
      setError(null);
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedFile) {
      setError("Silakan pilih file dokumen.");
      return;
    }
    if (!docType) {
      setError("Silakan pilih tipe dokumen.");
      return;
    }
    // Validasi untuk documentName
    if (!documentName.trim()) {
      setError("Silakan masukkan nama dokumen.");
      return;
    }

    setLoading(true);
    try {
      const base64File = await fileToBase64(selectedFile);
      // Kirim documentName ke fungsi onSubmit
      await onSubmit(base64File, docType, documentName.trim());
    } catch (err: any) {
      const message = err.message || "Terjadi kesalahan saat memproses file.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Judul Form bisa ditambahkan di sini jika tidak ada di modal parent */}
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold text-gray-800">Tambah Dokumen Baru</h3>
        <p className="text-sm text-gray-500">Lengkapi detail dokumen Anda.</p>
      </div>


      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm" role="alert">
          <p className="font-medium">Oops! Terjadi kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Pilih File Dokumen <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="mt-1 flex flex-col items-center">
            <label
            htmlFor="fileInput"
            className="w-full flex flex-col items-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
            {selectedFile ? (
                <>
                    <FileTextIcon className="mx-auto h-12 w-12 text-blue-500" />
                    <span className="mt-2 text-sm font-medium text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="mt-2 text-xs text-blue-600 hover:text-blue-700">Klik untuk ganti file</span>
                </>
            ) : (
                <>
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">Pilih file untuk diupload</span>
                    <span className="text-xs text-gray-500">PDF, DOCX, JPG, PNG (Maks 10MB)</span>
                </>
            )}
            <input
                id="fileInput"
                name="fileInput"
                type="file"
                accept=".pdf,.doc,.docx,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
            />
            </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">Pastikan file tidak melebihi 10MB.</p>
      </div>

      {/* Input untuk Nama Dokumen */}
      <div>
        <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nama Dokumen <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="documentName"
          name="documentName"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-4"
          placeholder="Contoh: CV Terbaru, Sertifikat React, dsb."
          required
          disabled={loading}
        />
         <p className="mt-1 text-xs text-gray-500">Berikan nama yang deskriptif untuk dokumen Anda.</p>
      </div>

      <div>
        <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-1.5">
          Tipe Dokumen <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
            <select
                id="docType"
                name="docType"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-4 appearance-none"
                required
                disabled={loading}
            >
                <option value="">-- Pilih Tipe Dokumen --</option>
                {documentTypes.map((type) => (
                <option key={type} value={type}>
                    {type}
                </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={18} className="text-gray-400" />
            </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-4 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
        >
          <XIcon size={18} className="mr-2" />
          Batal
        </button>
        <button
          type="submit"
          disabled={loading || !selectedFile || !docType || !documentName.trim()}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : <Check size={18} className="mr-2" />}
          {loading ? "Mengupload..." : "Upload Dokumen"}
        </button>
      </div>
    </form>
  );
}