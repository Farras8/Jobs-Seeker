// src/components/Login.tsx
import React, { useState } from "react";
import { auth, googleProvider, db, serverTimestamp } from "../firebase"; // Ditambahkan db dan serverTimestamp
// User type dari firebase/auth tidak lagi diimpor secara eksplisit di sini
// karena tidak digunakan untuk anotasi tipe secara langsung dalam file ini.
// Tipe untuk `result.user` akan diinferensikan oleh TypeScript.
// Jika Anda memerlukan tipe User secara eksplisit di tempat lain dan mengalami masalah serupa,
// pertimbangkan untuk memeriksa konfigurasi Vite Anda (optimizeDeps.include).
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"; 
import { doc, setDoc, getDoc } from "firebase/firestore"; // Ditambahkan doc, setDoc, getDoc
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Briefcase, AlertCircle } from 'lucide-react';

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
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); 
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user; // Tipe 'user' di sini akan diinferensikan oleh TypeScript

      const userDocRef = doc(db, "users", user.uid);
      const userPersonalInfoRef = doc(userDocRef, "user_personal", "info");

      const docSnap = await getDoc(userPersonalInfoRef);

      if (!docSnap.exists()) {
        await setDoc(userPersonalInfoRef, {
          fullName: user.displayName || "", 
          email: user.email || "",         
          phoneNumber: "",                 
          city: "",                        
          address: "",                     
          photoUrl: user.photoURL || "",   
          github: "",
          instagram: "",
          linkedin: "",
          portfolioSite: "",
          createdAt: serverTimestamp(),    
          updatedAt: serverTimestamp(),
        });
      } else {
        const existingData = docSnap.data();
        await setDoc(userPersonalInfoRef, {
          fullName: user.displayName || existingData.fullName || "", 
          email: user.email || existingData.email || "",
          photoUrl: user.photoURL || existingData.photoUrl || "",
          updatedAt: serverTimestamp(),
        }, { merge: true }); 
      }

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Gagal masuk dengan Google. Silakan coba lagi.");
      console.error("Google Sign-In Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-4 font-sans">
      <div className="bg-white p-10 md:p-12 rounded-xl shadow-2xl w-full max-w-lg"> 
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full mb-3">
            <Briefcase size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">PortalKarir</h1>
        </div>

        <h2 className="text-3xl font-semibold text-gray-700 text-center mb-8">Masuk Akun</h2>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center" role="alert">
            <AlertCircle size={20} className="mr-3 text-red-500" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1.5">
              Email atau Nomor HP
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail size={20} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors" 
                placeholder="anda@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-base font-medium text-gray-700">
                Kata Sandi
              </label>
              <Link to="/forgot-password"
                className="text-base text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-base transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {loading && !error ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-base text-gray-500">atau masuk dengan</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-lg py-3 font-medium text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-150 ease-in-out shadow-sm hover:shadow-md disabled:opacity-70"
        >
          <GoogleIcon />
          Google
        </button>

        <p className="text-base text-center text-gray-600 mt-10">
          Belum punya akun?{" "}
          <Link to="/register"
            className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>

      <p className="text-center text-sm text-sky-100 mt-10">
        &copy; {new Date().getFullYear()} PortalKarir. Hak cipta dilindungi undang-undang.
      </p>
    </div>
  );
}

export default Login;
