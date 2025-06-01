// src/components/AddForm/AddEducationForm.tsx
import React, { useState, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { Loader2, Check, X as XIcon, AwardIcon, BookOpen, CalendarDays, ChevronDown } from "lucide-react"; // Ditambahkan ikon

interface AddEducationFormProps {
  onSubmitSuccess?: () => void;
  onCancel: () => void;
}

const levels = ["SD", "SMP", "SMA", "Diploma", "S1", "S2", "S3", "Lainnya"];

export default function AddEducationForm({ onSubmitSuccess, onCancel }: AddEducationFormProps) {
  const [level, setLevel] = useState("");
  const [customLevel, setCustomLevel] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gpa, setGpa] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedLevel = level === "Lainnya" ? customLevel : level;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedLevel.trim() || !institution.trim() || !major.trim() || !startDate) {
      setError("Level, Institusi, Jurusan, dan Tanggal Mulai wajib diisi.");
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
    if (gpa && (isNaN(parseFloat(gpa)) || parseFloat(gpa) < 0 || parseFloat(gpa) > 4)) {
        setError("IPK harus berupa angka antara 0.00 dan 4.00.");
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
        level: selectedLevel,
        institution,
        major,
        startDate,
        endDate: endDate && endDate.trim() !== "" ? endDate : null,
        gpa: gpa && gpa.trim() !== "" ? parseFloat(gpa) : null,
      };
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/education",
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
        throw new Error(errData.error || "Gagal menambah pendidikan");
      }
      Swal.fire({
        title: "Sukses!",
        text: "Pendidikan berhasil ditambahkan.",
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
        Swal.fire({ title: "Gagal!", text: "Terjadi kesalahan tak terduga.", icon: "error", confirmButtonColor: "#3085d6" });
      }
    } finally {
      setLoading(false);
    }
  }

  const formField = (
    label: string,
    name: string,
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
    placeholder: string,
    type: string = "text",
    required: boolean = false,
    options?: string[],
    icon?: React.ReactNode
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { size: 18, className: "text-gray-400" })}
          </div>
        )}
        {type === "select" && options ? (
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
            onChange={onChange}
            className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 ${icon ? 'pl-10' : 'px-4'} placeholder-gray-400`}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
            step={type === "number" ? "0.01" : undefined}
            min={type === "number" ? "0" : undefined}
            max={type === "number" && name === "gpa" ? "4" : undefined}
          />
        )}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* <h3 className="text-xl font-semibold text-gray-800 mb-6">Tambah Pendidikan Baru</h3> */}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm" role="alert">
          <p className="font-medium">Oops! Terjadi kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      {formField("Jenjang Pendidikan", "level", level, (e) => setLevel(e.target.value), "-- Pilih Jenjang --", "select", true, levels, <AwardIcon />)}
        
      {level === "Lainnya" && 
          formField("Nama Jenjang Pendidikan", "customLevel", customLevel, (e) => setCustomLevel(e.target.value), "Masukkan nama jenjang", "text", true)
      }

      {formField("Nama Institusi/Sekolah", "institution", institution, (e) => setInstitution(e.target.value), "Contoh: Universitas Indonesia", "text", true, undefined, <BookOpen />)}
      {formField("Jurusan/Program Studi", "major", major, (e) => setMajor(e.target.value), "Contoh: Teknik Informatika", "text", true)}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          {formField("Tanggal Mulai", "startDate", startDate, (e) => setStartDate(e.target.value), "", "date", true, undefined, <CalendarDays/>)}
          {formField("Tanggal Selesai (Kosongkan jika masih berlangsung)", "endDate", endDate, (e) => setEndDate(e.target.value), "", "date", false, undefined, <CalendarDays/>)}
      </div>
      
      {formField("IPK/Nilai Akhir (Opsional)", "gpa", gpa, (e) => setGpa(e.target.value), "Contoh: 3.75 (skala 4.00)", "number")}

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
          {loading ? "Menyimpan..." : "Simpan Pendidikan"}
        </button>
      </div>
    </form>
  );
}