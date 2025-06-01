// src/components/AddForm/AddExperienceForm.tsx
import React, { useState, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { Loader2, Check, X as XIcon, Briefcase, Building, CalendarDays, AlignLeft, ChevronDown } from "lucide-react"; // Ditambahkan ikon

interface AddExperienceFormProps {
  onSubmitSuccess?: () => void;
  onCancel: () => void;
}

const employmentTypes = ["Full-time", "Part-time", "Freelance", "Internship", "Contract"]; // Kapitalisasi untuk tampilan

export default function AddExperienceForm({ onSubmitSuccess, onCancel }: AddExperienceFormProps) {
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!position.trim() || !company.trim() || !employmentType || !startDate) {
      setError("Posisi, Perusahaan, Jenis Pekerjaan, dan Tanggal Mulai wajib diisi.");
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      setError("Format Tanggal Mulai harus YYYY-MM-DD.");
      return;
    }
    if (endDate && endDate.trim() !== "" && !dateRegex.test(endDate)) {
      setError("Format Tanggal Selesai harus YYYY-MM-DD atau kosongkan jika masih berlangsung.");
      return;
    }
    // Validasi employmentType dengan nilai yang ada di array (case-insensitive jika perlu, tapi di sini case-sensitive)
    if (!employmentTypes.map(type => type.toLowerCase()).includes(employmentType.toLowerCase()) && employmentType !== "") {
        setError("Jenis pekerjaan tidak valid. Pilih dari daftar.");
        return;
    }


    setLoading(true);

    try {
      const user = (await import("../../firebase")).auth.currentUser;
      if (!user) {
        setError("User belum login");
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const payload = {
        position,
        company,
        description: description.trim(), // Trim deskripsi juga
        employmentType, // Kirim nilai yang dipilih pengguna
        startDate,
        endDate: endDate && endDate.trim() !== "" ? endDate : null,
      };
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/experience",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menambah pengalaman");
      }
      Swal.fire({
        title: "Sukses!",
        text: "Pengalaman berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3085d6",
      });
      if (onSubmitSuccess) onSubmitSuccess();
      onCancel();
    } catch (err) {
      if (err instanceof Error) {
        Swal.fire({ title: "Gagal!", text: err.message, icon: "error", confirmButtonColor: "#3085d6" });
      } else {
        Swal.fire({ title: "Gagal!", text: "Terjadi kesalahan saat mengirim data.", icon: "error", confirmButtonColor: "#3085d6" });
      }
    } finally {
      setLoading(false);
    }
  }

  const formField = (
    label: string,
    name: string,
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
    placeholder: string,
    type: string = "text",
    required: boolean = false,
    options?: string[],
    icon?: React.ReactNode,
    isTextArea: boolean = false
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && !isTextArea && ( // Ikon tidak untuk textarea
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
                rows={4}
            />
        ) : type === "select" && options ? (
          <>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 ${icon ? 'pl-10 pr-4' : 'px-4'} appearance-none`}
                required={required}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={18} className="text-gray-400" />
            </div>
          </>
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
      {/* <h3 className="text-xl font-semibold text-gray-800 mb-6">Tambah Pengalaman Baru</h3> */}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm" role="alert">
          <p className="font-medium">Oops! Terjadi kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      {formField("Posisi", "position", position, (e) => setPosition(e.target.value), "Contoh: Software Engineer", "text", true, undefined, <Briefcase />)}
      {formField("Nama Perusahaan", "company", company, (e) => setCompany(e.target.value), "Contoh: PT Teknologi Maju", "text", true, undefined, <Building />)}
      {formField("Deskripsi Pekerjaan", "description", description, (e) => setDescription(e.target.value), "Jelaskan tanggung jawab dan pencapaian Anda...", "text", false, undefined, <AlignLeft />, true)}
      {formField("Jenis Pekerjaan", "employmentType", employmentType, (e) => setEmploymentType(e.target.value), "-- Pilih Jenis --", "select", true, employmentTypes, <Briefcase />)}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        {formField("Tanggal Mulai", "startDate", startDate, (e) => setStartDate(e.target.value), "", "date", true, undefined, <CalendarDays/>)}
        {formField("Tanggal Selesai (Kosongkan jika masih berlangsung)", "endDate", endDate, (e) => setEndDate(e.target.value), "", "date", false, undefined, <CalendarDays/>)}
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
          disabled={loading}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : <Check size={18} className="mr-2" />}
          {loading ? "Menyimpan..." : "Simpan Pengalaman"}
        </button>
      </div>
    </form>
  );
}
