// src/pages/CVScoringPage.tsx
import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';   
import { UploadCloud, FileText as FileTextIcon, CheckCircle, AlertTriangle, Loader2, Sparkles, Info, ListFilter, FileCheck2, ChevronDown, Construction } from 'lucide-react';
import Swal from 'sweetalert2';
import { auth, db } from '../firebase'; 
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'; 
import { Link as RouterLink } from 'react-router-dom'; 

// Interface untuk dokumen pengguna dari Firestore
interface UserDocument {
  id: string;
  documentName: string; 
  fileUrl: string;
  uploadedAt: Date; 
  type: string; 
}

// Interface untuk hasil skor
interface ScoreResult {
  overallScore: number;
  matchPercentage?: number;
  strengths: string[];
  areasForImprovement: string[];
  keywordAnalysis?: {
    found: string[];
    missing: string[];
  };
  atsFriendliness?: {
    score: number;
    tips: string[];
  };
}

// Mock data untuk hasil skor
const MOCK_SCORE_RESULT: ScoreResult = {
  overallScore: 75, 
  matchPercentage: 60, 
  strengths: [
    "Contoh kekuatan: Penggunaan kata kunci yang cukup baik.",
    "Contoh kekuatan: Format CV standar dan mudah dibaca sekilas.",
    "Contoh kekuatan: Pengalaman kerja relevan dengan beberapa kata kunci.",
  ],
  areasForImprovement: [
    "Contoh perbaikan: Tambahkan lebih banyak pencapaian terukur (angka/data).",
    "Contoh perbaikan: Sesuaikan ringkasan profil agar lebih spesifik ke target pekerjaan.",
    "Contoh perbaikan: Periksa kembali tata bahasa dan ejaan.",
  ],
  keywordAnalysis: {
    found: ["Contoh Skill Ditemukan 1", "Contoh Skill Ditemukan 2"],
    missing: ["Contoh Skill Disarankan 1", "Contoh Skill Disarankan 2", "Contoh Skill Disarankan 3"],
  },
  atsFriendliness: {
    score: 6, 
    tips: [
        "Tips ATS: Gunakan font standar (misal: Arial, Calibri, Times New Roman).",
        "Tips ATS: Hindari penggunaan tabel, kolom, atau gambar yang berlebihan.",
        "Tips ATS: Simpan dalam format PDF jika memungkinkan.",
    ]
  }
};

const CVScoringPage: React.FC = () => {
  const [uploadedCvFile, setUploadedCvFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isLoadingScore, setIsLoadingScore] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null); 
  const [scoreError, setScoreError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userCVs, setUserCVs] = useState<UserDocument[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string>('');
  const [isLoadingCVs, setIsLoadingCVs] = useState<boolean>(true); // Mulai true untuk fetch CV
  const [cvListError, setCvListError] = useState<string | null>(null);

  useEffect(() => {
    Swal.fire({
      title: `<div class="flex items-center text-xl font-semibold text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2.5 text-orange-500 flex-shrink-0"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M17 12h.01"/><path d="M12 12h.01"/><path d="M7 12h.01"/><path d="M5 12H2.5A1.5 1.5 0 0 1 1 10.5V8.5A1.5 1.5 0 0 1 2.5 7H5Z"/><path d="M19 12h2.5a1.5 1.5 0 0 0 1.5-1.5V8.5A1.5 1.5 0 0 0 21.5 7H19Z"/></svg>
                Fitur Dalam Pengembangan
              </div>`,
      html: `
        <div class="text-gray-600 text-sm sm:text-base py-2 text-left">
          <p>Fitur <strong>CV Scoring</strong> ini masih dalam tahap pengembangan.</p>
          <p class="mt-2">Hasil analisis yang akan Anda lihat setelah mengunggah CV adalah <strong class="text-orange-600">data template</strong> untuk demonstrasi.</p>
          <p class="mt-1">Kami sedang bekerja keras untuk menyajikan analisis CV yang akurat untuk Anda segera!</p>
        </div>
      `,
      iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M17 12h.01"/><path d="M12 12h.01"/><path d="M7 12h.01"/><path d="M5 12H2.5A1.5 1.5 0 0 1 1 10.5V8.5A1.5 1.5 0 0 1 2.5 7H5Z"/><path d="M19 12h2.5a1.5 1.5 0 0 0 1.5-1.5V8.5A1.5 1.5 0 0 0 21.5 7H19Z"/></svg>`,
      confirmButtonText: 'Saya Mengerti',
      confirmButtonColor: '#3085d6',
      customClass: {
        popup: 'rounded-xl shadow-xl',
        title: '!pt-5 !px-5 !pb-0',
        htmlContainer: '!px-5 !pb-2 !pt-2',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-colors',
      }
    });
  }, []);


  useEffect(() => {
    const fetchUserCVs = async (userId: string) => {
      setIsLoadingCVs(true);
      setCvListError(null);
      try {
        const documentsPath = `users/${userId}/documents`;
        const documentsCollectionRef = collection(db, documentsPath);
        const q = query(
          documentsCollectionRef, 
          where("type", "==", "CV"), 
          orderBy("uploadedAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const fetchedCVs: UserDocument[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const uploadedAtTimestamp = data.uploadedAt as Timestamp;
          return {
            id: doc.id,
            documentName: data.documentName || data.fileName || 'Nama File Tidak Ada',
            fileUrl: data.fileUrl || '#',
            uploadedAt: uploadedAtTimestamp ? uploadedAtTimestamp.toDate() : new Date(),
            type: data.type || 'Tidak Diketahui',
          };
        });
        setUserCVs(fetchedCVs);
      } catch (err: any) {
        console.error("Error fetching user CVs:", err);
        setCvListError(`Gagal memuat daftar CV Anda: ${err.message}`);
        setUserCVs([]);
      } finally {
        setIsLoadingCVs(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserCVs(user.uid);
      } else {
        setUserCVs([]);
        setSelectedCvId('');
        setCvListError("Silakan login untuk melihat dan menggunakan CV Anda untuk scoring.");
        setIsLoadingCVs(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleFileChangeAndUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        Swal.fire("Error", "Ukuran file CV tidak boleh melebihi 5MB.", "error");
        setUploadedCvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        Swal.fire("Error", "Format file CV harus PDF atau DOC/DOCX.", "error");
        setUploadedCvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setUploadedCvFile(file); 
      setSelectedCvId(''); 
      setScoreError(null);
      setScoreResult(null);
    }
  };

  const handleSubmitForScoring = async (event: FormEvent) => {
    event.preventDefault();
    
    let cvToScoreName: string | null = null;

    if (selectedCvId) {
        const foundCv = userCVs.find(cv => cv.id === selectedCvId);
        if (foundCv) cvToScoreName = foundCv.documentName;
    } else if (uploadedCvFile) {
        cvToScoreName = uploadedCvFile.name;
    }

    if (!cvToScoreName) {
      Swal.fire("Perhatian", "Silakan pilih CV dari daftar atau unggah file CV baru.", "warning");
      return;
    }

    setIsLoadingScore(true);
    setScoreError(null);
    setScoreResult(null);

    console.log("Memulai scoring untuk CV:", cvToScoreName);
    console.log("Dengan deskripsi pekerjaan:", jobDescription || "Tidak ada");

    await new Promise(resolve => setTimeout(resolve, 1500)); 

    setScoreResult(MOCK_SCORE_RESULT); 
    setIsLoadingScore(false);
  };

  const renderScoreGauge = (score: number) => {
    const percentage = Math.max(0, Math.min(100, score));
    const circumference = 2 * Math.PI * 45; 
    const offset = circumference - (percentage / 100) * circumference;
    let strokeColor = "stroke-green-500";
    if (percentage < 50) strokeColor = "stroke-red-500";
    else if (percentage < 75) strokeColor = "stroke-yellow-500";

    return (
      <div className="relative w-40 h-40 sm:w-48 sm:h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-gray-200 stroke-current" strokeWidth="10" cx="50" cy="50" r="45" fill="transparent"></circle>
          <circle
            className={`${strokeColor} stroke-current transition-all duration-1000 ease-out`}
            strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="45" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 50 50)"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl sm:text-4xl font-bold ${strokeColor.replace('stroke-', 'text-')}`}>{percentage}</span>
          <span className="text-xs text-gray-500">Overall Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <div className="bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white py-16 sm:py-20">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileCheck2 size={60} className="mx-auto mb-6 text-sky-300" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Analisis & Peringkat CV
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-sky-100 max-w-3xl mx-auto">
            Unggah atau pilih CV Anda untuk mendapatkan skor dan analisis (saat ini menggunakan template).
          </p>
        </div>
      </div>

      <main className="flex-grow max-w-4xl mx-auto py-10 sm:py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl space-y-8">
          
          <form onSubmit={handleSubmitForScoring} className="space-y-6">
            <div className="p-6 bg-sky-50 border border-sky-200 rounded-lg">
                <h2 className="text-xl font-semibold text-sky-700 mb-3 flex items-center">
                    <FileTextIcon size={24} className="mr-2.5" />
                    1. Pilih atau Unggah CV Anda
                </h2>
                {isLoadingCVs ? (
                    <div className="flex items-center text-gray-500 py-4">
                        <Loader2 className="animate-spin mr-2" size={20} /> Memuat daftar CV Anda...
                    </div>
                ) : cvListError && userCVs.length === 0 ? (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {cvListError}
                        {cvListError.includes("login") && 
                            <RouterLink to="/login" className="ml-2 font-semibold underline hover:text-red-700">Login</RouterLink>
                        }
                    </div>
                ) : userCVs.length > 0 ? (
                    <div className="space-y-3">
                        <label htmlFor="cvSelect" className="block text-sm font-medium text-gray-700">
                        Pilih CV yang sudah ada:
                        </label>
                        <div className="relative">
                            <select
                                id="cvSelect"
                                value={selectedCvId}
                                onChange={(e) => { setSelectedCvId(e.target.value); setUploadedCvFile(null);}}
                                className="w-full block p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                            >
                                <option value="">-- Pilih dari CV Tersimpan --</option>
                                {userCVs.map((cv) => (
                                <option key={cv.id} value={cv.id}>
                                    {cv.documentName} (Diupload: {cv.uploadedAt.toLocaleDateString('id-ID')})
                                </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown size={18} className="text-gray-400" />
                            </div>
                        </div>
                         <p className="text-center text-sm text-gray-500 my-3">atau</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 mb-3 italic">Anda belum memiliki CV tersimpan yang bertipe "CV".</p>
                )}
                <div>
                    <label htmlFor="cvFileUpload" className={`w-full flex flex-col items-center px-6 py-8 border-2 ${uploadedCvFile ? 'border-green-400 bg-green-50 hover:bg-green-100' : 'border-gray-300 hover:border-blue-400'} border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors mt-2`}>
                        {uploadedCvFile ? (
                            <>
                                <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
                                <span className="mt-2 text-sm font-medium text-gray-700">{uploadedCvFile.name}</span>
                                <span className="text-xs text-gray-500">{(uploadedCvFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span className="mt-1 text-xs text-blue-600 hover:text-blue-700">Klik untuk ganti file</span>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                                <span className="mt-2 block text-sm font-medium text-gray-900">Unggah File CV Baru</span>
                                <span className="text-xs text-gray-500">PDF, DOC, DOCX (Maks 5MB)</span>
                            </>
                        )}
                        <input
                            id="cvFileUpload"
                            name="cvFileUpload"
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileChangeAndUpload}
                        />
                    </label>
                     {userCVs.length === 0 && !isLoadingCVs && !cvListError && (
                        <p className="text-xs text-center text-gray-500 mt-3">
                            Belum ada CV? <RouterLink to="/profile/edit" className="text-blue-600 hover:underline">Unggah sekarang di profil Anda.</RouterLink>
                        </p>
                     )}
                </div>
            </div>
             <div>
              <label htmlFor="jobDescription" className="block text-lg font-semibold text-gray-700 mb-2 mt-6">
                2. Deskripsi Pekerjaan Target <span className="text-sm font-normal text-gray-500">(Opsional)</span>
              </label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                rows={6}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 placeholder-gray-400"
                placeholder="Tempel deskripsi pekerjaan di sini untuk analisis kecocokan yang lebih akurat..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isLoadingScore}
              />
              <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <Info size={14} className="mr-1.5 text-sky-600" />
                Menambahkan deskripsi pekerjaan akan membantu kami memberikan skor kecocokan yang lebih relevan (saat fitur penuh diimplementasikan).
              </p>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoadingScore || isLoadingCVs || (!selectedCvId && !uploadedCvFile)}
                className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-all"
              >
                {isLoadingScore ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                ) : (
                  <Sparkles size={20} className="mr-2.5" />
                )}
                {isLoadingScore ? "Menganalisis CV..." : "Dapatkan Skor CV Saya"}
              </button>
            </div>
          </form>

          {scoreError && !isLoadingScore && (
            <div className="mt-10 pt-8 border-t border-gray-200">
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
                        <div>
                        <p className="font-bold text-lg">Gagal Melakukan Analisis</p>
                        <p className="text-sm mt-1">{scoreError}</p>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {scoreResult && !isLoadingScore && !scoreError && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 text-center">
                <Sparkles size={28} className="inline mr-2.5 text-yellow-500" />
                Hasil Analisis CV Anda (Template)
              </h2>
              
              <div className="flex flex-col items-center mb-10">
                {renderScoreGauge(scoreResult.overallScore)}
                {scoreResult.matchPercentage !== undefined && (
                    <p className="mt-4 text-lg font-medium text-gray-700">
                        Kecocokan dengan Pekerjaan: <span className="text-blue-600 font-bold">{scoreResult.matchPercentage}%</span>
                    </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-green-700 mb-3 flex items-center">
                    <CheckCircle size={22} className="mr-2"/>
                    Kekuatan Utama (Contoh)
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-green-800 pl-1">
                    {scoreResult.strengths.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-300 shadow-sm">
                  <h3 className="text-xl font-semibold text-yellow-700 mb-3 flex items-center">
                    <AlertTriangle size={22} className="mr-2"/>
                    Area Perbaikan (Contoh)
                    </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800 pl-1">
                    {scoreResult.areasForImprovement.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              </div>

              {scoreResult.keywordAnalysis && (
                <div className="mt-8 bg-sky-50 p-6 rounded-lg border border-sky-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-sky-700 mb-4">Analisis Kata Kunci (Contoh)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <p className="font-medium text-sky-800 mb-2">Kata Kunci Ditemukan:</p>
                      {scoreResult.keywordAnalysis.found.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {scoreResult.keywordAnalysis.found.map(k => <span key={k} className="px-3 py-1 bg-sky-200 text-sky-800 rounded-full text-xs font-medium">{k}</span>)}
                        </div>
                      ) : <p className="text-xs text-gray-500 italic">Tidak ada.</p>}
                    </div>
                    <div>
                      <p className="font-medium text-orange-600 mb-2">Kata Kunci Disarankan:</p>
                      {scoreResult.keywordAnalysis.missing.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {scoreResult.keywordAnalysis.missing.map(k => <span key={k} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">{k}</span>)}
                        </div>
                      ): <p className="text-xs text-gray-500 italic">Tidak ada saran tambahan.</p>}
                    </div>
                  </div>
                </div>
              )}
              
              {scoreResult.atsFriendliness && (
                 <div className="mt-8 bg-indigo-50 p-6 rounded-lg border border-indigo-200 shadow-sm">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-4 flex items-center">
                        <ListFilter size={22} className="mr-2"/>
                        Kesesuaian ATS (Contoh)
                    </h3>
                    <div className="flex items-center mb-3">
                        <div className="text-3xl font-bold text-indigo-600 mr-3">{scoreResult.atsFriendliness.score}<span className="text-lg text-indigo-500">/10</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${scoreResult.atsFriendliness.score * 10}%` }}></div>
                        </div>
                    </div>
                    <p className="text-sm text-indigo-700 mb-2">Tips untuk meningkatkan skor ATS (Contoh):</p>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-indigo-800 pl-1">
                        {scoreResult.atsFriendliness.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                    </ul>
                 </div>
              )}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500 italic">
                    <strong>Catatan:</strong> Hasil analisis di atas adalah data template dan tidak mencerminkan skor CV Anda yang sebenarnya. Fitur ini masih dalam pengembangan.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CVScoringPage;
