import React, { useState } from "react";
// Pastikan path ini benar untuk struktur proyek Anda
import { auth, googleProvider } from "../firebase"; 
import { signInWithEmailAndPassword, signInWithPopup} from "firebase/auth"; // Asumsikan auth diinisialisasi di tempat lain
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Briefcase, AlertCircle } from 'lucide-react'; // Mengganti ShoppingCart dengan Briefcase

// Mock auth dan googleProvider jika tidak tersedia di lingkungan ini
// Dalam proyek nyata, ini akan diinisialisasi dan diimpor dari firebase.ts/js Anda
 // Ganti dengan instance googleProvider Anda yang sebenarnya

// Ikon Google SVG sederhana
const GoogleIcon = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 mr-2">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
    <path fill="none" d="M0 0h48v48H0z"></path>
  </svg>
);


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Arahkan ke home/dashboard setelah login sukses
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    // Latar belakang diubah menjadi gradien biru yang lebih profesional
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-4 font-sans">
      {/* Lebar maksimum diubah dari max-w-md menjadi max-w-lg, padding disesuaikan */}
      <div className="bg-white p-10 md:p-12 rounded-xl shadow-2xl w-full max-w-lg"> 
        {/* Logo dan Nama Aplikasi diubah */}
        <div className="flex flex-col items-center mb-8"> {/* Margin bawah ditambah */}
          <div className="bg-blue-600 p-4 rounded-full mb-3"> {/* Padding ikon dan margin bawah disesuaikan */}
            <Briefcase size={36} className="text-white" /> {/* Ukuran ikon diperbesar */}
          </div>
          <h1 className="text-4xl font-bold text-gray-800">PortalKarir</h1> {/* Ukuran font nama aplikasi diperbesar */}
        </div>

        <h2 className="text-3xl font-semibold text-gray-700 text-center mb-8">Masuk Akun</h2> {/* Ukuran font dan margin bawah diperbesar */}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center" role="alert">
            <AlertCircle size={20} className="mr-3 text-red-500" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7"> {/* Spasi antar elemen form ditambah */}
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1.5"> {/* Ukuran font label dan margin bawah disesuaikan */}
              Email atau Nomor HP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"> {/* Padding kiri ikon disesuaikan */}
                <Mail size={20} className="text-gray-400" /> {/* Ukuran ikon input disesuaikan */}
              </div>
              <input
                id="email"
                type="email"
                // Warna fokus diubah menjadi biru, padding dan ukuran font disesuaikan
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors" 
                placeholder="anda@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input Kata Sandi */}
          <div>
            <div className="flex justify-between items-center mb-1.5"> {/* Margin bawah disesuaikan */}
              <label htmlFor="password" className="block text-base font-medium text-gray-700"> {/* Ukuran font label disesuaikan */}
                Kata Sandi
              </label>
              <Link to="/forgot-password" // Asumsikan Anda memiliki rute untuk ini
                // Warna link diubah menjadi biru, ukuran font disesuaikan
                className="text-base text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"> {/* Padding kiri ikon disesuaikan */}
                <Lock size={20} className="text-gray-400" /> {/* Ukuran ikon input disesuaikan */}
              </div>
              <input
                id="password"
                type="password"
                // Warna fokus diubah menjadi biru, padding dan ukuran font disesuaikan
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            // Warna tombol diubah menjadi biru, padding dan ukuran font disesuaikan
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Masuk
          </button>
        </form>

        {/* Pemisah ATAU */}
        <div className="my-8 flex items-center"> {/* Margin vertikal ditambah */}
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-base text-gray-500">atau masuk dengan</span> {/* Ukuran font disesuaikan */}
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Tombol Login Google */}
        <button
          type="button"
          onClick={handleGoogle}
          // Padding dan ukuran font disesuaikan
          className="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-lg py-3 font-medium text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-150 ease-in-out shadow-sm hover:shadow-md"
        >
          <GoogleIcon />
          Google
        </button>

        {/* Link Daftar */}
        <p className="text-base text-center text-gray-600 mt-10"> {/* Ukuran font dan margin atas ditambah */}
          Belum punya akun?{" "}
          <Link to="/register" // Asumsikan Anda memiliki rute untuk ini
             // Warna link diubah menjadi biru, ukuran font disesuaikan
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>

      {/* Footer/Atribusi (Opsional) */}
      <p className="text-center text-sm text-sky-100 mt-10"> {/* Ukuran font dan margin atas disesuaikan */}
        &copy; {new Date().getFullYear()} PortalKarir. Hak cipta dilindungi undang-undang.
      </p>
    </div>
  );
}

export default Login;