import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AlertTriangle, Home } from 'lucide-react'; // Menggunakan ikon yang relevan

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      title: `<div class="flex items-center text-xl font-semibold text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2.5 text-yellow-500 flex-shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                Halaman Belum Tersedia
              </div>`,
      html: `
        <div class="text-gray-600 text-sm sm:text-base py-2">
          <p>Maaf, halaman yang Anda tuju saat ini sedang dalam pengembangan atau tidak ditemukan.</p>
          <p class="mt-1">Kami sedang bekerja keras untuk menyelesaikannya!</p>
        </div>
      `,
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500 animate-pulse"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      confirmButtonText: 'Kembali ke Beranda',
      confirmButtonColor: '#3085d6', // Warna biru
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'rounded-xl shadow-xl',
        title: '!pt-5 !px-5 !pb-0', // Hapus padding bawah default title jika html digunakan
        htmlContainer: '!px-5 !pb-2 !pt-0',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow-md hover:shadow-lg transition-colors',
      }
    }).then((result) => {
      // Arahkan pengguna setelah mereka menutup alert
      // Anda bisa memilih untuk mengarahkan ke halaman utama atau login
      navigate('/'); // Arahkan ke Dashboard (halaman utama setelah login)
      // atau navigate('/login'); // Jika ingin mengarahkan ke login
    });
  }, [navigate]);

  // Komponen ini tidak perlu merender UI apa pun secara langsung,
  // karena SweetAlert akan mengambil alih tampilan.
  // Namun, Anda bisa menambahkan fallback UI jika diperlukan.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="animate-pulse">
            <AlertTriangle size={64} className="text-yellow-500 mb-4" />
        </div>
        <p className="text-gray-700 text-lg">Mengarahkan...</p>
    </div>
  );
};

export default NotFoundPage;