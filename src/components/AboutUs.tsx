// src/components/AboutUs.tsx
import React from 'react';
import { Building, Users, Target, BookOpen, Phone, Mail, MapPin, Linkedin, Twitter, Facebook } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const teamMembers = [
  {
    name: "Nama CEO",
    role: "Chief Executive Officer",
    imageUrl: "https://via.placeholder.com/150/0D8ABC/FFFFFF?text=CEO", // Ganti dengan URL gambar asli
    bio: "Pengalaman luas dalam memimpin dan mengembangkan solusi inovatif di industri teknologi dan rekrutmen.",
  },
  {
    name: "Nama CTO",
    role: "Chief Technology Officer",
    imageUrl: "https://via.placeholder.com/150/4A5568/FFFFFF?text=CTO", // Ganti dengan URL gambar asli
    bio: "Ahli teknologi dengan fokus pada pengembangan platform yang scalable dan aman untuk pengguna.",
  },
  {
    name: "Nama COO",
    role: "Chief Operating Officer",
    imageUrl: "https://via.placeholder.com/150/38A169/FFFFFF?text=COO", // Ganti dengan URL gambar asli
    bio: "Berdedikasi untuk memastikan operasional PortalKarir berjalan lancar dan efisien bagi semua pihak.",
  },
];

const AboutUs: React.FC = () => {
  return (
    <div className="bg-slate-50">
        <Navbar/> {/* Latar belakang abu-abu muda untuk seluruh halaman/section */}
      {/* Bagian Hero / Header */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white py-16 sm:py-24">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building size={64} className="mx-auto mb-6 text-sky-300" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Tentang PortalKarir
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-sky-100 max-w-3xl mx-auto">
            Kami adalah jembatan yang menghubungkan para pencari kerja berbakat dengan perusahaan-perusahaan inovatif untuk menciptakan peluang karir yang tak terbatas.
          </p>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-12 lg:space-y-16">

          {/* Seksi: Visi & Misi */}
          <section id="misi-kami" className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:space-x-8">
              <div className="md:w-1/3 text-center md:text-left mb-6 md:mb-0">
                <Target size={56} className="mx-auto md:mx-0 text-blue-600 mb-3" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Visi & Misi Kami</h2>
              </div>
              <div className="md:w-2/3 space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                <p>
                  <strong className="font-semibold text-gray-800">Visi:</strong> Menjadi platform karir terdepan di Indonesia yang memberdayakan setiap individu untuk mencapai potensi penuh mereka dan membantu perusahaan menemukan talenta terbaik.
                </p>
                <p>
                  <strong className="font-semibold text-gray-800">Misi:</strong> Menyediakan teknologi inovatif, wawasan pasar kerja yang mendalam, dan pengalaman pengguna yang superior untuk mempermudah proses pencarian kerja dan rekrutmen. Kami berkomitmen untuk transparansi, integritas, dan pertumbuhan bersama.
                </p>
              </div>
            </div>
          </section>

          {/* Seksi: Cerita Kami */}
          <section id="cerita-kami" className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row items-center md:space-x-8">
              <div className="md:w-1/3 text-center md:text-left mb-6 md:mb-0 md:order-last">
                <BookOpen size={56} className="mx-auto md:mx-0 text-green-600 mb-3" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Cerita Kami</h2>
              </div>
              <div className="md:w-2/3 space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed md:order-first">
                <p>
                  PortalKarir didirikan pada tahun [Tahun Berdiri] dengan satu tujuan sederhana: menjembatani kesenjangan antara pencari kerja berkualitas dan perusahaan yang membutuhkan talenta. Kami melihat banyak potensi luar biasa yang belum tersalurkan dan perusahaan yang kesulitan menemukan kandidat yang tepat.
                </p>
                <p>
                  Berawal dari tim kecil yang bersemangat, kami terus berinovasi dan bertumbuh menjadi salah satu portal karir tepercaya. Perjalanan kami dipenuhi dengan pembelajaran, adaptasi terhadap dinamika pasar kerja, dan komitmen yang tak tergoyahkan untuk memberikan dampak positif bagi ekosistem karir di Indonesia.
                </p>
              </div>
            </div>
          </section>

          {/* Seksi: Tim Kami */}
          <section id="tim-kami" className="bg-white p-6 sm:p-10 rounded-xl shadow-lg">
            <div className="text-center mb-10">
              <Users size={56} className="mx-auto text-purple-600 mb-3" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Tim Profesional Kami</h2>
              <p className="mt-2 text-gray-600 max-w-xl mx-auto">
                Di balik PortalKarir, ada tim yang berdedikasi dan berpengalaman, siap membantu Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div key={member.name} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <img
                    className="w-28 h-28 rounded-full mx-auto mb-4 object-cover"
                    src={member.imageUrl}
                    alt={member.name}
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Seksi: Hubungi Kami */}


        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default AboutUs;