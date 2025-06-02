// src/components/EditForm/EditProfileForm.tsx
import React, { useState, ChangeEvent, useEffect } from "react";
import { UserCircle, UploadCloud, Loader2, Check, X as XIcon, AtSign } from "lucide-react";

// Interface ProfileData di sini harus konsisten dengan yang diharapkan oleh ProfileList
interface ProfileData {
  username: string; 
  fullName: string;
  city: string;
  phoneNumber: string;
  github: string;
  instagram: string;
  linkedin: string;
  portfolioSite: string;
  photoFile?: File | null;
  photoPreviewUrl?: string; 
}

interface EditProfileFormProps {
  initialData: Omit<ProfileData, "photoFile" | "photoPreviewUrl"> & { photoUrl?: string }; // username sudah termasuk di sini
  onSubmit: (data: ProfileData) => void; 
  onCancel: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function EditProfileForm({ initialData, onSubmit, onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    username: initialData.username || "", 
    fullName: initialData.fullName || "",
    city: initialData.city || "",
    phoneNumber: initialData.phoneNumber || "",
    github: initialData.github || "",
    instagram: initialData.instagram || "",
    linkedin: initialData.linkedin || "",
    portfolioSite: initialData.portfolioSite || "",
    photoFile: null,
    photoPreviewUrl: initialData.photoUrl || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentPreviewUrl = formData.photoPreviewUrl;
    if (currentPreviewUrl && currentPreviewUrl.startsWith("blob:")) {
      return () => {
        URL.revokeObjectURL(currentPreviewUrl);
      };
    }
  }, [formData.photoPreviewUrl]);

  function handleInputChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === "username" && /\s/.test(value)) {
        setError("Username tidak boleh mengandung spasi.");
        return; 
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "username" && error === "Username tidak boleh mengandung spasi.") {
        setError(null); 
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Format file tidak didukung. Pilih: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}.`);
        setFormData(prev => ({ ...prev, photoFile: null, photoPreviewUrl: initialData.photoUrl || "" }));
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`Ukuran file maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        setFormData(prev => ({ ...prev, photoFile: null, photoPreviewUrl: initialData.photoUrl || "" }));
        e.target.value = "";
        return;
      }
      setError(null);
      if (formData.photoPreviewUrl && formData.photoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(formData.photoPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        photoFile: file,
        photoPreviewUrl: previewUrl,
      }));
    } else {
      setFormData(prev => ({ ...prev, photoFile: null, photoPreviewUrl: initialData.photoUrl || "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!formData.username.trim()) {
      setError("Username wajib diisi.");
      return;
    }
    if (formData.username.trim().length < 3) {
        setError("Username minimal harus 3 karakter.");
        return;
    }
    if (/\s/.test(formData.username)) {
        setError("Username tidak boleh mengandung spasi.");
        return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (submitError: any) {
        setError(submitError.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const formField = (
    label: string,
    name: keyof Omit<ProfileData, 'photoFile' | 'photoPreviewUrl'>,
    placeholder: string,
    type: string = "text",
    required: boolean = false,
    icon?: React.ReactNode,
    minLength?: number
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
          value={formData[name] as string}
          onChange={handleInputChange}
          className={`w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 ${icon ? 'pl-10' : 'px-4'} placeholder-gray-400`}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          minLength={minLength}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm" role="alert">
          <p className="font-medium">Oops! Terjadi kesalahan</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col items-center space-y-4">
        {formData.photoPreviewUrl ? (
          <img
            src={formData.photoPreviewUrl}
            alt="Preview Foto Profil"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-md"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-gray-100 shadow-md">
            <UserCircle size={72} />
          </div>
        )}
        <label
          htmlFor="photoFile"
          className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors"
          title="Upload foto profil (JPG, PNG, WEBP maks 5MB)"
        >
          <UploadCloud size={18} className="mr-2.5 text-gray-500" />
          Ganti Foto Profil
        </label>
        <input
          type="file"
          id="photoFile"
          name="photoFile"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
         <p className="text-xs text-gray-500">Format: JPG, PNG, WEBP. Ukuran maks: 5MB.</p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
            {formField("Nama Lengkap", "fullName", "Masukkan nama lengkap Anda", "text", true)}
        </div>
        {formField("Username", "username", "Pilih username (min. 3, tanpa spasi)", "text", true, <AtSign />, 3)}
        {formField("Kota", "city", "Contoh: Jakarta Pusat", "text")}
        {formField("Nomor Telepon", "phoneNumber", "Contoh: 081234567890", "tel")}
      </div>
      
      <div className="pt-3">
        <p className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">Tautan Sosial & Profesional <span className="text-xs font-normal text-gray-500">(Opsional)</span></p>
        <div className="space-y-5">
            {formField("LinkedIn URL", "linkedin", "https://linkedin.com/in/usernameanda", "url")}
            {formField("GitHub URL", "github", "https://github.com/usernameanda", "url")}
            {formField("Instagram URL", "instagram", "https://instagram.com/usernameanda", "url")}
            {formField("Situs Portfolio URL", "portfolioSite", "https://proyekanda.com", "url")}
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-5 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
        >
          <XIcon size={18} className="mr-2" />
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : <Check size={18} className="mr-2" />}
          {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
