// src/components/List/PreferencesList.tsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import { Pencil, X, Check, PlusCircle, SlidersHorizontal, ListChecks, AlertCircle, Loader2, Tag, MapPin as MapPinIcon, Briefcase, DollarSignIcon } from "lucide-react"; // Menambah ikon
import Swal from "sweetalert2";
import AddPreferencesForm from "../AddForm/AddPreferencesForm"; // Asumsi form ini sudah di-style konsisten

interface Preferences {
  jobCategories: string[];
  locations: string[];
  salaryExpectation: number;
  jobTypes: string[];
  createdAt?: { _seconds: number; _nanoseconds: number };
  updatedAt?: { _seconds: number; _nanoseconds: number };
}

export default function PreferencesList() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    jobCategories: "",
    locations: "",
    jobTypes: "",
    salaryExpectation: "",
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Logika fetchPreferences, handleChange, handleEditSubmit, handleAddSubmit, handleClickOutside tetap sama
  useEffect(() => {
    async function fetchPreferences() {
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
          "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/preferences",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.status === 404) {
          setPreferences(null);
        } else if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `Gagal mengambil data: ${res.statusText}` }));
          throw new Error(errorData.error || `Error: ${res.status} ${res.statusText}`);
        } else {
          const data = await res.json();
          if (data && data.preferences) {
            setPreferences(data.preferences);
            setFormData({
              jobCategories: data.preferences.jobCategories.join(", "),
              locations: data.preferences.locations.join(", "),
              jobTypes: data.preferences.jobTypes.join(", "),
              salaryExpectation: data.preferences.salaryExpectation.toString(),
            });
          } else {
             setPreferences(null); // Handle jika 'preferences' tidak ada di response
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load preferences");
      } finally {
        setLoading(false);
      }
    }
    fetchPreferences();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) { // Update type untuk textarea jika ada
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !formData.jobCategories.trim() || !formData.locations.trim() ||
      !formData.jobTypes.trim() || !formData.salaryExpectation.trim() ||
      isNaN(Number(formData.salaryExpectation))
    ) {
      Swal.fire("Error", "Mohon isi semua field dengan benar.", "error");
      return;
    }
    const jobCategoriesArr = formData.jobCategories.split(",").map((s) => s.trim()).filter(s => s);
    const locationsArr = formData.locations.split(",").map((s) => s.trim()).filter(s => s);
    const jobTypesArr = formData.jobTypes.split(",").map((s) => s.trim()).filter(s => s);
    const salary = Number(formData.salaryExpectation);
    const validJobTypes = ["Remote", "On-site", "Hybrid"];
    for (const jt of jobTypesArr) {
      if (!validJobTypes.includes(jt)) {
        Swal.fire("Error", `Tipe Pekerjaan tidak valid: "${jt}". Pilih dari: ${validJobTypes.join(", ")}`, "error");
        return;
      }
    }
    // ... (sisa logika handleEditSubmit tetap sama)
    try {
      const user = auth.currentUser;
      if (!user) { Swal.fire("Error", "User tidak terautentikasi.", "error"); return; }
      const token = await user.getIdToken();
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/preferences",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
          body: JSON.stringify({ jobCategories: jobCategoriesArr, locations: locationsArr, jobTypes: jobTypesArr, salaryExpectation: salary }),
        }
      );
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "Gagal mengupdate preferensi");}
      Swal.fire("Sukses", "Preferensi berhasil diperbarui.", "success");
      setPreferences({ jobCategories: jobCategoriesArr, locations: locationsArr, jobTypes: jobTypesArr, salaryExpectation: salary });
      setEditing(false);
    } catch (err) {
      let message = "Terjadi kesalahan saat memperbarui preferensi.";
      if (err instanceof Error) message = err.message;
      Swal.fire("Error", message, "error");
    }
  }

  async function handleAddSubmit(data: { jobCategories: string; locations: string; jobTypes: string; salaryExpectation: string; }) {
    // ... (logika handleAddSubmit tetap sama, pastikan validasi dan error handling konsisten)
    const jobCategoriesArr = data.jobCategories.split(",").map((s) => s.trim()).filter(s => s);
    const locationsArr = data.locations.split(",").map((s) => s.trim()).filter(s => s);
    const jobTypesArr = data.jobTypes.split(",").map((s) => s.trim()).filter(s => s);
    const salary = Number(data.salaryExpectation);
    const validJobTypes = ["Remote", "On-site", "Hybrid"]; // Pastikan ini ada
    for (const jt of jobTypesArr) { /* ... (validasi jobTypes) ... */ }

    try {
        const user = auth.currentUser;
        if (!user) { Swal.fire("Error", "User tidak terautentikasi.", "error"); return; }
        const token = await user.getIdToken();
        const res = await fetch(
            "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/preferences",
            {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ jobCategories: jobCategoriesArr, locations: locationsArr, jobTypes: jobTypesArr, salaryExpectation: salary }),
            }
        );
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "Gagal menambah preferensi");}
        Swal.fire("Sukses", "Preferensi berhasil ditambahkan.", "success");
        setPreferences({ jobCategories: jobCategoriesArr, locations: locationsArr, jobTypes: jobTypesArr, salaryExpectation: salary });
        setAdding(false);
        // Panggil fetchPreferences() untuk memastikan data createdAt/updatedAt terambil jika backend mengembalikannya
        // Atau, jika API POST mengembalikan data lengkap, gunakan itu untuk setPreferences.
    } catch (err) {
        let message = "Terjadi kesalahan saat menambah preferensi.";
        if (err instanceof Error) message = err.message;
        Swal.fire("Error", message, "error");
    }
  }

  function handleClickOutside(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setEditing(false);
      setAdding(false);
    }
  }
  // Akhir dari logika yang tidak diubah

  const renderDisplayItem = (label: string, values: string[], icon?: React.ReactNode, pillColors?: string) => {
    if (!values || values.length === 0) {
      return <p className="text-sm text-gray-500 italic">Belum diatur.</p>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className={`px-3 py-1.5 text-sm font-medium rounded-full ${pillColors || 'bg-gray-100 text-gray-700'}`}>
            {icon && React.cloneElement(icon as React.ReactElement, { size: 14, className: "inline mr-1.5 opacity-70"})}
            {value}
          </span>
        ))}
      </div>
    );
  };


  const renderContent = () => {
    if (loading) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
            <p className="text-sm">Memuat preferensi...</p>
          </div>
        );
    }
    if (error && !preferences && !adding) { // Tampilkan error hanya jika tidak ada preferensi dan tidak sedang menambah
        return (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-lg text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
            <p className="font-semibold text-lg mb-1">Gagal Memuat Data</p>
            <p className="text-sm">{error}</p>
          </div>
        );
    }
    if (!preferences && !adding) {
      return (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <ListChecks size={56} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Preferensi</h3>
          <p className="text-sm text-gray-500 mb-6">Atur preferensi pekerjaan Anda untuk rekomendasi yang lebih baik.</p>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all"
          >
            <PlusCircle size={18} className="mr-2" />
            Tambah Preferensi
          </button>
        </div>
      );
    }
    if (preferences && !editing) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <Tag size={20} className="mr-2 text-sky-600" />Kategori Pekerjaan
            </h3>
            {renderDisplayItem("Kategori Pekerjaan", preferences.jobCategories, undefined, "bg-sky-100 text-sky-800")}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <MapPinIcon size={20} className="mr-2 text-emerald-600" />Lokasi
            </h3>
            {renderDisplayItem("Lokasi", preferences.locations, undefined, "bg-emerald-100 text-emerald-800")}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <Briefcase size={20} className="mr-2 text-purple-600" />Tipe Pekerjaan
            </h3>
            {renderDisplayItem("Tipe Pekerjaan", preferences.jobTypes, undefined, "bg-purple-100 text-purple-800")}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <DollarSignIcon size={20} className="mr-2 text-amber-600" />Ekspektasi Gaji
            </h3>
            <p className="text-gray-800 font-semibold text-md">
              {preferences.salaryExpectation.toLocaleString("id-ID", {
                style: "currency", currency: "IDR", minimumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      );
    }
    return null; // Jika sedang adding atau editing, form akan muncul di modal
  };

  const formSection = (label: string, name: keyof typeof formData, placeholder: string, type: string = "text") => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        </label>
        <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3"
        placeholder={placeholder}
        autoComplete="off"
        min={type === "number" ? 0 : undefined}
        />
    </div>
  );


  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <SlidersHorizontal size={26} className="mr-3 text-orange-500" />
            Preferensi Pekerjaan
        </h2>
        {!adding && ( // Tampilkan tombol Add atau Edit
            preferences ? (
                !editing && (
                    <button
                        onClick={() => {
                            // Pastikan formData diisi dari preferences saat mulai edit
                            if (preferences) {
                                setFormData({
                                    jobCategories: preferences.jobCategories.join(", "),
                                    locations: preferences.locations.join(", "),
                                    jobTypes: preferences.jobTypes.join(", "),
                                    salaryExpectation: preferences.salaryExpectation.toString(),
                                });
                            }
                            setEditing(true);
                        }}
                        aria-label="Edit Preferensi"
                        className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                    >
                        <Pencil size={20} />
                    </button>
                )
            ) : (
                <button
                    onClick={() => setAdding(true)}
                    aria-label="Tambah Preferensi"
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 shadow-sm hover:shadow-md"
                >
                    <PlusCircle size={20} />
                </button>
            )
        )}
      </div>

      {renderContent()}

      {(editing || adding) && (
        <div
          onClick={handleClickOutside}
          className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    {editing ? "Edit Preferensi Pekerjaan" : "Tambah Preferensi Pekerjaan"}
                </h3>
                <button
                    onClick={() => { setEditing(false); setAdding(false); }}
                    className="p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Tutup modal"
                >
                    <X size={20} />
                </button>
            </div>
            
            {editing && (
              <form onSubmit={handleEditSubmit} className="space-y-5">
                {formSection("Kategori Pekerjaan (pisah dengan koma)", "jobCategories", "Contoh: IT, Marketing, Desain")}
                {formSection("Lokasi (pisah dengan koma)", "locations", "Contoh: Jakarta, Bandung, Remote")}
                {formSection("Tipe Pekerjaan (pisah dengan koma)", "jobTypes", "Pilihan: Remote, On-site, Hybrid")}
                {formSection("Ekspektasi Gaji (angka, misal: 5000000)", "salaryExpectation", "Contoh: 8000000", "number")}
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">Batal</button>
                  <button type="submit" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center"><Check size={18} className="mr-2" /> Simpan Perubahan</button>
                </div>
              </form>
            )}
            {adding && (
              <AddPreferencesForm
                onSubmit={handleAddSubmit}
                onCancel={() => setAdding(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}