// src/components/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase"; // Firebase import - DO NOT EDIT
import { signOut } from "firebase/auth"; // Firebase import - DO NOT EDIT
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, LogOut, UserCircle, ChevronDown, Menu, X, Bookmark as BookmarkIcon } from 'lucide-react'; // Menambahkan Building icon
import Swal from 'sweetalert2';
// import 'sweetalert2/dist/sweetalert2.min.css';

type User = {
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
};

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('#mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Konfirmasi Keluar',
      text: "Apakah Anda yakin ingin keluar dari akun ini?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      customClass: {
        popup: 'rounded-lg shadow-xl',
        title: 'text-xl font-semibold text-gray-700',
        confirmButton: 'px-4 py-2 text-sm',
        cancelButton: 'px-4 py-2 text-sm'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await signOut(auth);
          navigate("/login");
        } catch (error) {
          console.error("Error signing out: ", error);
          Swal.fire('Oops...', 'Gagal untuk keluar. Silakan coba lagi.', 'error');
        }
      }
    });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: "Lowongan", href: "/jobs" },
    { name: "Perusahaan", href: "/companies" },
    { name: "Rekomendasi", href: "/Recommend" },
    { name: "CV Scoring", href: "/cv-scoring" }, // BARU: Link Perusahaan
    { name: "Tentang Kami", href: "/about" },
  ];

  return (
    <nav className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and App Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity">
              <Briefcase size={32} />
              <span className="font-bold text-2xl">PortalKarir</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4 xl:space-x-6"> {/* Mengurangi space-x jika terlalu lebar */}
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sky-100 hover:bg-sky-500 hover:text-white px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-colors whitespace-nowrap" // text-sm untuk ukuran default, lg:text-base untuk layar lebih besar
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:block">
            {user ? (
              <div className="relative ml-3 lg:ml-4" ref={dropdownRef}> {/* Mengurangi ml jika perlu */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-sky-600 focus:ring-white transition-colors"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&background=0D8ABC&color=fff&bold=true&size=128`}
                    alt="Profil"
                    className="w-10 h-10 rounded-full object-cover border-2 border-sky-200"
                  />
                  <span className="text-white font-medium hidden lg:block max-w-[100px] truncate" title={user.displayName || "Pengguna"}>{user.displayName || "Pengguna"}</span> {/* max-w dan truncate */}
                  <ChevronDown size={20} className={`text-sky-100 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : "rotate-0"}`} />
                </button>

                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-60 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-700">Masuk sebagai:</p>
                      <p className="text-sm font-medium text-gray-900 truncate" title={user.email || ''}>{user.email}</p>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    <Link
                      to="/profile/edit"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors group"
                    >
                      <UserCircle size={18} className="mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      Edit Profil
                    </Link>
                    <Link
                      to="/saved-jobs" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors group"
                    >
                      <BookmarkIcon size={18} className="mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      Lowongan Tersimpan
                    </Link>
                    <button
                      onClick={() => { 
                        setDropdownOpen(false);
                        handleLogout();        
                      }}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors group"
                    >
                      <LogOut size={18} className="mr-3 text-gray-400 group-hover:text-red-600 transition-colors" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2 sm:space-x-3"> {/* Mengurangi space-x jika perlu */}
                <Link to="/login" className="text-sky-100 bg-sky-500 hover:bg-sky-400 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors shadow-sm hover:shadow-md">
                  Masuk
                </Link>
                <Link to="/register" className="text-sky-700 bg-white hover:bg-gray-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-colors shadow-sm hover:shadow-md">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              id="mobile-menu-button"
              onClick={toggleMobileMenu}
              className="bg-sky-600 inline-flex items-center justify-center p-2 rounded-md text-sky-100 hover:text-white hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Buka menu utama</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-20 inset-x-0 z-40 transform origin-top shadow-lg transition-all duration-300 ease-out
                  ${mobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}`}
        id="mobile-menu"
      >
        <div className="rounded-b-lg bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 pt-2 pb-3 space-y-1 px-2 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sky-100 hover:bg-sky-500 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
        {user ? (
          <div className="pt-4 pb-3 border-t border-sky-500 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 rounded-b-lg">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full object-cover border-2 border-sky-200"
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&background=0D8ABC&color=fff&bold=true&size=128`}
                  alt="Profil"
                />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user.displayName || "Pengguna"}</div>
                <div className="text-sm font-medium text-sky-200 truncate" title={user.email || ''}>{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <Link
                to="/profile/edit"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-sky-100 hover:text-white hover:bg-sky-500 transition-colors group"
              >
                <UserCircle size={20} className="mr-3 text-sky-200 group-hover:text-white transition-colors" />
                Edit Profil
              </Link>
              <Link
                to="/saved-jobs" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-sky-100 hover:text-white hover:bg-sky-500 transition-colors group"
              >
                <BookmarkIcon size={20} className="mr-3 text-sky-200 group-hover:text-white transition-colors" />
                Lowongan Tersimpan
              </Link>
              <button
                onClick={() => { 
                  setMobileMenuOpen(false); 
                  handleLogout();           
                }}
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-sky-100 hover:text-white hover:bg-sky-500 transition-colors group"
              >
                <LogOut size={20} className="mr-3 text-sky-200 group-hover:text-white transition-colors" />
                Keluar
              </button>
            </div>
          </div>
        ) : (
           <div className="py-3 px-2 space-y-2 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 rounded-b-lg">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-sky-700 bg-white hover:bg-gray-100 px-4 py-2.5 rounded-md text-base font-semibold transition-colors shadow-sm hover:shadow-md">
                Masuk
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center text-sky-100 bg-sky-500 hover:bg-sky-400 px-4 py-2.5 rounded-md text-base font-semibold transition-colors shadow-sm hover:shadow-md">
                Daftar
              </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
