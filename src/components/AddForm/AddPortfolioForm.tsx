// src/components/AddForm/AddPortfolioForm.tsx
import React, { useState, ChangeEvent } from "react";
import { auth } from "../../firebase";
import Swal from "sweetalert2";
import { Loader2, Check, X as XIcon, Type, FileText as FileTextIcon, Link as LinkIcon, Cpu } from "lucide-react"; // Ditambahkan ikon

interface AddPortfolioFormProps {
  onSubmit: () => void; // Dipanggil setelah submit sukses
  onCancel: () => void;
}

export default function AddPortfolioForm({ onSubmit, onCancel }: AddPortfolioFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [technologies, setTechnologies] = useState(""); // Tetap string, diparsing saat submit
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Judul proyek wajib diisi.");
      // Swal.fire("Error", "Judul proyek wajib diisi.", "error"); // Bisa diganti dengan setError
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User tidak terautentikasi.");
        // Swal.fire("Error", "User tidak terautentikasi.", "error");
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();

      const payload = {
        title: title.trim(),
        description: description.trim(),
        projectUrl: projectUrl.trim(),
        technologies: technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter((tech) => tech.length > 0),
      };

      const res = await fetch("https://jobseeker-capstone-705829099986.asia-southeast2.run.app/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menambahkan proyek portfolio");
      }

      Swal.fire({
        title: "Sukses!",
        text: "Proyek portfolio berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3085d6",
      });
      onSubmit(); // Panggil callback onSubmit dari parent
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menambahkan proyek.";
      setError(message); // Tampilkan error di form
      // Swal.fire("Error", message, "error"); // Bisa juga tetap menggunakan Swal jika prefer
    } finally {
      setLoading(false);
    }
  };
  
  const formField = (
    label: string,
    name: string,
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    placeholder: string,
    type: string = "text",
    required: boolean = false,
    icon?: React.ReactNode,
    isTextArea: boolean = false,
    rows?: number
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && !isTextArea && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { size: 18, className: "text-gray-400" })}
          </div>
        )}
        {isTextArea ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange as (e: ChangeEvent<HTMLTextAreaElement>) => void}
                className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-4 placeholder-gray-400 min-h-[100px]`}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
                rows={rows || 3}
            />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
            className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 ${icon ? 'pl-10' : 'px-4'} placeholder-gray-400`}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
          />
        )}
      </div>
    </div>
  );


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Judul form biasanya ada di kontainer modal */}
      {/* <h3 className="text-xl font-semibold text-gray-800 mb-6">Tambah Portfolio Baru</h3> */}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm" role="alert">
          <p className="font-medium">Oops! Terjadi kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      {formField("Judul Proyek", "title", title, (e) => setTitle(e.target.value), "Nama proyek Anda", "text", true, <Type />)}
      {formField("Deskripsi Proyek", "description", description, (e) => setDescription(e.target.value), "Jelaskan tentang proyek ini...", "text", false, <FileTextIcon />, true, 4)}
      {formField("URL Proyek (Jika ada)", "projectUrl", projectUrl, (e) => setProjectUrl(e.target.value), "https://contohproyek.com", "url", false, <LinkIcon />)}
      {formField("Teknologi yang Digunakan (Pisahkan dengan koma)", "technologies", technologies, (e) => setTechnologies(e.target.value), "Contoh: React, Node.js, Firebase", "text", false, <Cpu />)}

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
          disabled={loading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : <Check size={18} className="mr-2" />}
          {loading ? "Menyimpan..." : "Simpan Portfolio"}
        </button>
      </div>
    </form>
  );
}