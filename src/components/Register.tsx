// src/components/Register.tsx
import React, { useState } from "react";
import { auth, db, serverTimestamp } from "../firebase"; // Pastikan path ini benar
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Briefcase, AlertCircle, User, Phone, MapPin, HomeIcon, AtSign } from "lucide-react"; // Ditambahkan AtSign untuk username

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // State baru untuk username
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validasi username (opsional, bisa lebih kompleks)
    if (username.length < 3) {
        setError("Username minimal harus 3 karakter.");
        setLoading(false);
        return;
    }
    if (/\s/.test(username)) {
        setError("Username tidak boleh mengandung spasi.");
        setLoading(false);
        return;
    }
    // Anda mungkin ingin menambahkan validasi lain, seperti mengecek ketersediaan username (memerlukan query ke Firestore)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userPersonalInfoRef = doc(userDocRef, "user_personal", "info");

      await setDoc(userPersonalInfoRef, {
        username, // Tambahkan username
        fullName,
        email,
        phoneNumber,
        city,
        address,
        photoUrl: "",
        github: "",
        instagram: "",
        linkedin: "",
        portfolioSite: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      navigate("/");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Email sudah terdaftar. Silakan gunakan email lain atau masuk.");
      } else if (err.code === 'auth/weak-password') {
        setError("Kata sandi terlalu lemah. Gunakan minimal 6 karakter.");
      } else {
        setError(err.message || "Gagal mendaftar. Silakan coba lagi.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-4 font-sans">
      <div className="bg-white p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full mb-3">
            <Briefcase size={36} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">PortalKarir</h1>
        </div>

        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 text-center mb-8">Buat Akun Baru</h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center" role="alert">
            <AlertCircle size={20} className="mr-3 text-red-500 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                id="fullName"
                type="text"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Masukkan nama lengkap Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Input Username BARU */}
          <div>
            <label htmlFor="username" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <AtSign size={20} className="text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Pilih username (min. 3 karakter, tanpa spasi)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                minLength={3}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="anda@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone size={20} className="text-gray-400" />
              </div>
              <input
                id="phoneNumber"
                type="tel"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="08123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
              Kota <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin size={20} className="text-gray-400" />
              </div>
              <input
                id="city"
                type="text"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Contoh: Jakarta"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none pt-3"> {/* Disesuaikan agar ikon tidak tertutup */}
                <HomeIcon size={20} className="text-gray-400" />
              </div>
              <textarea
                id="address"
                rows={3}
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors resize-none"
                placeholder="Masukkan alamat lengkap Anda"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                placeholder="Buat kata sandi minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-75"
          >
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="text-base text-center text-gray-600 mt-8">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>

      <p className="text-center text-sm text-sky-100 mt-10">
        &copy; {new Date().getFullYear()} PortalKarir. Hak cipta dilindungi undang-undang.
      </p>
    </div>
  );
}

export default Register;
