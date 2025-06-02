// src/components/List/ProfileList.tsx
import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "../../firebase"; // Impor db
import { Pencil, X, UserCircle, MapPin, Phone, Github, Linkedin, Instagram, Link as LinkIcon, AtSign } from "lucide-react";
import EditProfileForm from "../EditForm/EditProfileForm";
import Swal from "sweetalert2";
import { doc, getDoc } from "firebase/firestore"; // Untuk getDoc

// ProfileData sekarang menyertakan username sebagai string (bisa string kosong jika belum diisi)
interface ProfileData {
  username: string; 
  fullName: string;
  city: string;
  phoneNumber: string;
  github: string;
  instagram: string;
  linkedin: string;
  portfolioSite: string;
  photoUrl?: string;
  photoFile?: File | null;
  photoPreviewUrl?: string;
}

// Tipe data yang dikirim dari EditProfileForm
interface EditFormData {
  username: string;
  fullName: string;
  city: string;
  phoneNumber: string;
  github: string;
  instagram: string;
  linkedin: string;
  portfolioSite: string;
  photoFile?: File | null;
  // photoPreviewUrl tidak perlu dikirim ke backend
}


export default function ProfileList() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
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
        
        // 1. Ambil data dari endpoint /profile
        const profileApiRes = await fetch(
          "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!profileApiRes.ok) {
          const errorData = await profileApiRes.json().catch(() => ({ error: `Gagal mengambil data profil: ${profileApiRes.statusText}` }));
          throw new Error(errorData.error || `Error: ${profileApiRes.status} ${profileApiRes.statusText}`);
        }
        const apiData = await profileApiRes.json();

        // 2. Ambil data username langsung dari Firestore user_personal/info untuk kepastian
        let usernameFromDb = apiData.username; // Gunakan dari API jika ada
        const userPersonalInfoRef = doc(db, "users", user.uid, "user_personal", "info");
        const personalInfoSnap = await getDoc(userPersonalInfoRef);
        
        if (personalInfoSnap.exists() && personalInfoSnap.data().username) {
          usernameFromDb = personalInfoSnap.data().username;
        }

        setProfile({
          username: usernameFromDb || "", // Prioritaskan dari DB, fallback ke API, lalu string kosong
          fullName: apiData.fullName || "",
          city: apiData.city || "",
          phoneNumber: apiData.phoneNumber || "",
          github: apiData.github || "",
          instagram: apiData.instagram || "",
          linkedin: apiData.linkedin || "",
          portfolioSite: apiData.portfolioSite || "",
          photoUrl: apiData.photoUrl || "",
        });

      } catch (err: any) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const modalRef = useRef<HTMLDivElement>(null);

  function handleClickOutside(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowEditModal(false);
    }
  }

  async function handleEditSubmit(updatedData: EditFormData) { // Menggunakan EditFormData
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User belum login");
      const token = await user.getIdToken();
      let photoUrlBase64: string | undefined = undefined;
      if (updatedData.photoFile) {
        photoUrlBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(updatedData.photoFile as Blob);
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject("Gagal konversi foto ke base64");
          };
          reader.onerror = () => reject("Gagal membaca file foto");
        });
      }
      const bodyPayload = {
        username: updatedData.username, // Kirim username dari form
        fullName: updatedData.fullName, 
        city: updatedData.city, 
        phoneNumber: updatedData.phoneNumber,
        github: updatedData.github, 
        instagram: updatedData.instagram, 
        linkedin: updatedData.linkedin,
        portfolioSite: updatedData.portfolioSite, 
        ...(photoUrlBase64 ? { photoUrl: photoUrlBase64 } : {}),
      };
      const res = await fetch(
        "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/profile",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`},
          body: JSON.stringify(bodyPayload),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal update profil");
      }
      const result = await res.json();
      Swal.fire("Berhasil", "Profil berhasil diperbarui!", "success");
      
      setProfile((prev) => ({
        ...(prev as ProfileData), // Pastikan prev tidak null
        username: updatedData.username, // Update username
        fullName: updatedData.fullName,
        city: updatedData.city,
        phoneNumber: updatedData.phoneNumber,
        github: updatedData.github,
        instagram: updatedData.instagram,
        linkedin: updatedData.linkedin,
        portfolioSite: updatedData.portfolioSite,
        photoUrl: result.photoUrl || prev?.photoUrl || "",
        photoFile: undefined, 
      }));
      setShowEditModal(false);
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Gagal update profil", "error");
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">Memuat profil...</div>;
  if (error) return <div className="max-w-3xl mx-auto p-8 text-center text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;
  if (!profile) return <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">Tidak ada data profil. <button onClick={() => setShowEditModal(true)} className="text-blue-600 hover:underline font-medium">Lengkapi sekarang?</button></div>;

  const socialLinks = [
    { platform: 'linkedin', url: profile.linkedin, icon: <Linkedin size={20} />, label: 'LinkedIn' },
    { platform: 'github', url: profile.github, icon: <Github size={20} />, label: 'GitHub' },
    { platform: 'instagram', url: profile.instagram, icon: <Instagram size={20} />, label: 'Instagram' },
    { platform: 'portfolio', url: profile.portfolioSite, icon: <LinkIcon size={20} />, label: 'Situs Portfolio' },
  ].filter(link => link.url && link.url.trim() !== '');


  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8 relative">
        <button
          type="button"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
          aria-label="Edit Profil"
          onClick={() => setShowEditModal(true)}
        >
          <Pencil size={20} />
        </button>

        <div className="flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left">
          <div className="flex-shrink-0 mb-6 sm:mb-0 sm:mr-8">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt="Foto Profil"
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-gray-100 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-gray-100 shadow-md">
                <UserCircle size={72} />
              </div>
            )}
          </div>

          <div className="flex-grow">
            {/* Menampilkan Username sebagai judul utama */}
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center sm:justify-start">
              <AtSign size={24} className="mr-2 text-blue-600 opacity-80" /> 
              {profile.username || "Username Belum Diatur"}
            </h2>
            {/* Menampilkan Nama Lengkap di bawah username */}
            <p className="text-lg text-gray-600 mb-2 sm:mb-3 text-center sm:text-left ml-0 sm:ml-1">
              {profile.fullName || "Nama Lengkap Belum Diatur"}
            </p>
            
            <div className="space-y-1.5 text-gray-600 mb-4">
              {profile.city && (
                <div className="flex items-center justify-center sm:justify-start text-sm">
                  <MapPin size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>{profile.city}</span>
                </div>
              )}
              {profile.phoneNumber && (
                <div className="flex items-center justify-center sm:justify-start text-sm">
                  <Phone size={16} className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>

            {socialLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xs text-gray-500 uppercase font-semibold mb-3 tracking-wider text-center sm:text-left">Terhubung</h4>
                    <div className="flex justify-center sm:justify-start space-x-4">
                    {socialLinks.map(link => (
                        <a
                        key={link.platform}
                        href={link.url?.startsWith('http') ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.label}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                        {link.icon}
                        <span className="sr-only">{link.label}</span>
                        </a>
                    ))}
                    </div>
                </div>
            )}
            {socialLinks.length === 0 && !profile.city && !profile.phoneNumber && !profile.username && (
                 <p className="text-sm text-gray-400 italic mt-3 text-center sm:text-left">Lengkapi informasi kontak dan sosial media Anda.</p>
            )}
          </div>
        </div>
      </div>

      {showEditModal && profile && (
        <div
          onClick={handleClickOutside}
          className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-lg shadow-xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                aria-label="Tutup modal"
            >
                <X size={20} />
            </button>
            <EditProfileForm
              initialData={{
                  username: profile.username || "", 
                  fullName: profile.fullName || "",
                  city: profile.city || "",
                  phoneNumber: profile.phoneNumber || "",
                  github: profile.github || "",
                  instagram: profile.instagram || "",
                  linkedin: profile.linkedin || "",
                  portfolioSite: profile.portfolioSite || "",
                  photoUrl: profile.photoUrl || "",
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
