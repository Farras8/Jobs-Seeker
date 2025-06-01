import React from 'react';
import { Link } from 'react-router-dom'; // Jika Anda menggunakan React Router untuk navigasi
import { Briefcase, Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook size={20} />, href: 'https://facebook.com/portalkarir' },
    { name: 'Twitter', icon: <Twitter size={20} />, href: 'https://twitter.com/portalkarir' },
    { name: 'LinkedIn', icon: <Linkedin size={20} />, href: 'https://linkedin.com/company/portalkarir' },
    { name: 'Instagram', icon: <Instagram size={20} />, href: 'https://instagram.com/portalkarir' },
    { name: 'YouTube', icon: <Youtube size={20} />, href: 'https://youtube.com/portalkarir' },
  ];

  const footerSections = [
    {
      title: 'PortalKarir',
      links: [
        { name: 'Tentang Kami', href: '/about' },
        { name: 'Karir di PortalKarir', href: '/careers-at-portalkarir' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press Kit', href: '/press' },
      ],
    },
    {
      title: 'Pencari Kerja',
      links: [
        { name: 'Cari Lowongan', href: '/jobs' },
        { name: 'Tips Karir', href: '/career-advice' },
        { name: 'Buat CV Online', href: '/cv-builder' },
        { name: 'Tes Minat Bakat', href: '/aptitude-test' },
      ],
    },
    {
      title: 'Perusahaan',
      links: [
        { name: 'Pasang Lowongan', href: '/post-job' },
        { name: 'Database CV', href: '/cv-database' },
        { name: 'Solusi Rekrutmen', href: '/recruitment-solutions' },
        { name: 'Studi Kasus', href: '/case-studies' },
      ],
    },
    {
      title: 'Hubungi Kami',
      isContact: true,
      contacts: [
        { icon: <MapPin size={16} className="mr-2 flex-shrink-0" />, text: 'Jl. Karir Gemilang No. 123, Jakarta Pusat, Indonesia' },
        { icon: <Phone size={16} className="mr-2 flex-shrink-0" />, text: '+62 21 1234 5678' },
        { icon: <Mail size={16} className="mr-2 flex-shrink-0" />, text: 'support@portalkarir.com' },
      ]
    },
  ];

  return (
    <footer className="bg-slate-800 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2 mb-6 md:mb-0">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Briefcase size={32} className="text-sky-400" />
              <span className="font-bold text-2xl text-white">PortalKarir</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              PortalKarir adalah platform terdepan yang menghubungkan para pencari kerja berbakat dengan perusahaan-perusahaan terbaik di Indonesia. Temukan peluang karir impian Anda bersama kami.
            </p>
            <div className="mt-6">
                <h5 className="font-semibold text-slate-200 mb-3">Terhubung dengan Kami:</h5>
                <div className="flex space-x-3">
                {socialLinks.map((social) => (
                    <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-slate-400 hover:text-sky-400 transition-colors p-2 bg-slate-700 rounded-full hover:bg-slate-600"
                    >
                    {social.icon}
                    </a>
                ))}
                </div>
            </div>
          </div>

          {/* Footer Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h5 className="font-semibold text-slate-200 mb-4 uppercase tracking-wider text-sm">{section.title}</h5>
              {section.isContact ? (
                <ul className="space-y-3">
                  {section.contacts?.map((contact, index) => (
                    <li key={index} className="flex items-start text-sm text-slate-400 hover:text-sky-300 transition-colors">
                      {contact.icon}
                      <span>{contact.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-slate-400 hover:text-sky-300 hover:underline transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-slate-500 text-center md:text-left mb-4 md:mb-0">
            &copy; {currentYear} PortalKarir. Semua hak cipta dilindungi undang-undang.
          </p>
          <div className="flex space-x-4 text-xs">
            <Link to="/privacy-policy" className="text-slate-500 hover:text-sky-400 transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-slate-600">|</span>
            <Link to="/terms-of-service" className="text-slate-500 hover:text-sky-400 transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;