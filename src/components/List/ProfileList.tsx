// src/components/List/ProfileList.tsx
import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../firebase";
import { Pencil, X, UserCircle, MapPin, Phone, Github, Linkedin, Instagram, Link as LinkIcon } from "lucide-react";
import EditProfileForm from "../EditForm/EditProfileForm";
import Swal from "sweetalert2";

interface ProfileData {
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

export default function ProfileList() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Logika fetchProfile tetap sama
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
        const res = await fetch(
          "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `Gagal mengambil data: ${res.statusText}` }));
          throw new Error(errorData.error || `Error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const modalRef = useRef<HTMLDivElement>(null);

  // Logika handleClickOutside dan handleEditSubmit tetap sama
  function handleClickOutside(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowEditModal(false);
    }
  }

  async function handleEditSubmit(updatedData: ProfileData) {
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
        fullName: updatedData.fullName, city: updatedData.city, phoneNumber: updatedData.phoneNumber,
        github: updatedData.github, instagram: updatedData.instagram, linkedin: updatedData.linkedin,
        portfolioSite: updatedData.portfolioSite, ...(photoUrlBase64 ? { photoUrl: photoUrlBase64 } : {}),
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
        ...prev!, ...updatedData, photoUrl: result.photoUrl || prev?.photoUrl || "",
        photoFile: undefined, photoPreviewUrl: result.photoUrl || prev?.photoUrl || "",
      }));
      setShowEditModal(false);
    } catch (err: any) {
      Swal.fire("Gagal", err.message || "Gagal update profil", "error");
    }
  }
  // Akhir dari logika yang tidak diubah

  if (loading) return <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">Memuat profil...</div>;
  if (error) return <div className="max-w-3xl mx-auto p-8 text-center text-red-600 bg-red-50 rounded-lg">Error: {error}</div>;
  if (!profile) return <div className="max-w-3xl mx-auto p-8 text-center text-gray-500">Tidak ada data profil yang dapat ditampilkan. Silakan lengkapi profil Anda.</div>;

  const socialLinks = [
    { platform: 'linkedin', url: profile.linkedin, icon: <Linkedin size={20} />, label: 'LinkedIn' },
    { platform: 'github', url: profile.github, icon: <Github size={20} />, label: 'GitHub' },
    { platform: 'instagram', url: profile.instagram, icon: <Instagram size={20} />, label: 'Instagram' },
    { platform: 'portfolio', url: profile.portfolioSite, icon: <LinkIcon size={20} />, label: 'Situs Portfolio' },
  ].filter(link => link.url && link.url.trim() !== '');


  return (
    <>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8 relative"> {/* Konsisten dengan EducationList */}
        {/* Tombol Edit */}
        <button
          type="button"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
          aria-label="Edit Profil"
          onClick={() => setShowEditModal(true)}
        >
          <Pencil size={20} />
        </button>

        <div className="flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left">
          {/* Foto Profil */}
          <div className="flex-shrink-0 mb-6 sm:mb-0 sm:mr-8">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt="Foto Profil"
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-gray-100 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-gray-100 shadow-md">
                <UserCircle size={64} />
              </div>
            )}
          </div>

          {/* Info Profil */}
          <div className="flex-grow">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {profile.fullName || "Nama Belum Diatur"}
            </h2>
            
            <div className="space-y-2 text-gray-600 mb-4">
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

            {/* Social Links */}
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
            {socialLinks.length === 0 && !profile.city && !profile.phoneNumber && (
                 <p className="text-sm text-gray-400 italic mt-3 text-center sm:text-left">Lengkapi informasi kontak dan sosial media Anda.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Edit Profile (Styling Modal dan Form di dalamnya tidak diubah) */}
      {showEditModal && (
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
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Tutup modal"
            >
              <X size={20} />
            </button>
            <EditProfileForm
              initialData={profile} // initialData sekarang sesuai dengan ProfileData tanpa photoFile/photoPreviewUrl
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}