// src/components/AddForm/AddPreferencesForm.tsx
import React, { useState, ChangeEvent } from "react";
import Swal from "sweetalert2";
import { auth } from "../../firebase"; // Pastikan path ini benar
import { Loader2, Check, X as XIcon, Tag, MapPin, Briefcase, DollarSign } from "lucide-react"; // Menambahkan ikon

interface AddPreferencesFormProps {
  onSubmit: (data: {
    jobCategories: string;
    locations: string;
    jobTypes: string;
    salaryExpectation: string;
  }) => void;
  onCancel: () => void;
}

export default function AddPreferencesForm({ onSubmit, onCancel }: AddPreferencesFormProps) {
  const [formData, setFormData] = useState({
    jobCategories: "",
    locations: "",
    jobTypes: "",
    salaryExpectation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State untuk error form

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); // Reset error setiap submit

    if (
      !formData.jobCategories.trim() ||
      !formData.locations.trim() ||
      !formData.jobTypes.trim() ||
      !formData.salaryExpectation.trim() ||
      isNaN(Number(formData.salaryExpectation)) ||
      Number(formData.salaryExpectation) < 0
    ) {
      // Swal.fire("Error", "Mohon isi semua field dengan benar dan ekspektasi gaji tidak boleh negatif.", "error");
      setError("Mohon isi semua field dengan benar. Ekspektasi gaji tidak boleh negatif.");
      return;
    }

    const jobCategoriesArr = formData.jobCategories.split(",").map((s) => s.trim()).filter(s => s);
    const locationsArr = formData.locations.split(",").map((s) => s.trim()).filter(s => s);
    const jobTypesArr = formData.jobTypes.split(",").map((s) => s.trim()).filter(s => s);
    const salary = Number(formData.salaryExpectation);

    const validJobTypes = ["Remote", "On-site", "Hybrid"];
    for (const jt of jobTypesArr) {
      if (!validJobTypes.includes(jt)) {
        // Swal.fire("Error", `Tipe Pekerjaan tidak valid: "${jt}". Pilih dari: ${validJobTypes.join(", ")}`, "error");
        setError(`Tipe Pekerjaan tidak valid: "${jt}". Pilihan yang valid: ${validJobTypes.join(", ")}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        // Swal.fire("Error", "User tidak terautentikasi.", "error");
        setError("User tidak terautentikasi. Silakan login kembali.");
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();

      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobCategories: jobCategoriesArr,
            locations: locationsArr,
            jobTypes: jobTypesArr,
            salaryExpectation: salary,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menambah preferensi");
      }

      Swal.fire({
        title: "Sukses!",
        text: "Preferensi berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3085d6",
      });
      onSubmit(formData); // Panggil onSubmit dari parent setelah sukses
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menambah preferensi.";
      // Swal.fire("Error", message, "error");
      setError(message); // Tampilkan error di form
    } finally {
      setLoading(false);
    }
  }

  const formField = (
    label: string,
    name: keyof typeof formData,
    value: string,
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    placeholder: string,
    type: string = "text",
    required: boolean = false,
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
          min={type === "number" ? "0" : undefined}
          disabled={loading}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Judul form biasanya ada di kontainer modal, bisa diaktifkan jika form ini berdiri sendiri */}
      {/* <h3 className="text-xl font-semibold text-gray-800 mb-6">Tambah Preferensi Pekerjaan</h3> */}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm" role="alert">
          <p className="font-medium">Oops! Terjadi kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      {formField("Kategori Pekerjaan (pisah dengan koma)", "jobCategories", formData.jobCategories, handleChange, "Contoh: IT, Marketing, Desain", "text", true, <Tag />)}
      {formField("Lokasi yang Diinginkan (pisah dengan koma)", "locations", formData.locations, handleChange, "Contoh: Jakarta, Bandung, Remote", "text", true, <MapPin />)}
      {formField("Tipe Pekerjaan (pisah dengan koma)", "jobTypes", formData.jobTypes, handleChange, "Pilihan: Remote, On-site, Hybrid", "text", true, <Briefcase />)}
      {formField("Ekspektasi Gaji Bulanan (angka, misal: 5000000)", "salaryExpectation", formData.salaryExpectation, handleChange, "Contoh: 8000000", "number", true, <DollarSign />)}
      
      <p className="text-xs text-gray-500">
        Untuk kategori, lokasi, dan tipe pekerjaan, pisahkan beberapa pilihan dengan koma. Contoh Tipe Pekerjaan: Remote, On-site, Hybrid.
      </p>

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
          {loading ? "Menyimpan..." : "Simpan Preferensi"}
        </button>
      </div>
    </form>
  );
}
