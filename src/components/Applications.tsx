import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebase";
import Swal from "sweetalert2";
import { doc, getDoc } from "firebase/firestore"; // Firebase functions to get job data
import Footer from "./Footer";
import Navbar from "./Navbar";
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react'; // Import Trash2 icon

// Define the interface for Application data
interface Application {
  id: string;
  jobId: string;
  status: string;
  resumeUrl: string;
  coverLetter: string;
  notes: string;
  appliedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  jobTitle?: string;
  companyName?: string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "https://jobseeker-capstone-705829099986.asia-southeast2.run.app"; // Define base URL

  // Function to fetch job details
  const fetchJobDetails = async (jobId: string) => {
    try {
      // Assuming your jobs are in a top-level "jobs" collection
      // If they are under company specific collections, this path needs adjustment
      const docRef = doc(db, "jobs", jobId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.warn(`Job with ID ${jobId} not found in 'jobs' collection.`);
        // Fallback or alternative fetching logic if jobs are structured differently
        // For example, if jobs are under users (recruiters) or companies
        // const companyJobRef = doc(db, "companies", "someCompanyId", "jobs", jobId);
        // const companyJobSnap = await getDoc(companyJobRef);
        // if (companyJobSnap.exists()) return companyJobSnap.data();
        return null;
      }
    } catch (error) {
      console.error("Error fetching job data for job ID:", jobId, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        setError("User belum login. Silakan login untuk melihat lamaran Anda.");
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `${API_BASE_URL}/applications`, // Use base URL
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          if (data.applications && data.applications.length > 0) {
            const applicationsWithDetails = await Promise.all(
              data.applications.map(async (application: Application) => {
                const jobDetails = await fetchJobDetails(application.jobId);
                return {
                  ...application,
                  jobTitle: jobDetails?.jobTitle || "Judul Tidak Diketahui",
                  companyName: jobDetails?.companyName || "Perusahaan Tidak Diketahui",
                };
              })
            );
            setApplications(applicationsWithDetails);
          } else {
            setApplications([]); // Set to empty array if no applications
          }
        } else {
          setError(data.error || "Terjadi kesalahan saat memuat aplikasi.");
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Gagal terhubung ke server untuk memuat aplikasi.");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchApplications();
      } else {
        setError("User belum login. Silakan login untuk melihat lamaran Anda.");
        setApplications([]);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);


  const handleCancelApplication = async (applicationId: string) => {
    const result = await Swal.fire({
      title: "Anda yakin?",
      text: "Lamaran ini akan dibatalkan dan data terkait akan dihapus. Tindakan ini tidak dapat diurungkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, batalkan lamaran!",
      cancelButtonText: "Tidak",
    });

    if (result.isConfirmed) {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire("Error", "User tidak terautentikasi.", "error");
        return;
      }
      const token = await user.getIdToken();

      Swal.fire({
        title: 'Membatalkan...',
        text: 'Mohon tunggu sebentar.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(
          `${API_BASE_URL}/applications/${applicationId}`, // Use base URL
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseData = await response.json();

        if (response.ok) {
          setApplications((prevApplications) =>
            prevApplications.filter((app) => app.id !== applicationId)
          );
          Swal.fire("Dibatalkan!", responseData.message || "Lamaran berhasil dibatalkan.", "success");
        } else {
          throw new Error(responseData.error || "Gagal membatalkan lamaran.");
        }
      } catch (err: any) {
        console.error("Error cancelling application:", err);
        Swal.fire("Gagal!", err.message || "Terjadi kesalahan saat membatalkan lamaran.", "error");
      }
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="ml-4 text-lg text-gray-700 mt-4">Memuat aplikasi Anda...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-grow text-center px-4">
          <XCircle size={48} className="text-red-500 mb-4" />
          <p className="text-xl font-semibold text-red-600">{error}</p>
          {error.includes("User belum login") && (
            <Link to="/login" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Login Sekarang
            </Link>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="max-w-5xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-grow w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Lamaran Terkirim</h1>
          <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            Total: {applications.length} lamaran
          </span>
        </div>

        {applications.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <FileText size={64} className="mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">Belum Ada Lamaran</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Anda belum mengirimkan lamaran pekerjaan apapun. Mulai cari dan lamar pekerjaan impian Anda sekarang!</p>
            <Link
                to="/jobs"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
            >
                Cari Lowongan
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                <div className="mb-2 sm:mb-0">
                  <h3 className="text-xl font-semibold text-blue-700 hover:text-blue-800">
                    <Link to={`/jobs/${application.jobId}`}>
                        {application.jobTitle || "Judul Pekerjaan Tidak Tersedia"}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500">{application.companyName || "Nama Perusahaan Tidak Tersedia"}</p>
                </div>
                <div className="flex items-center text-xs font-medium">
                  {application.status === 'pending' && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full flex items-center">
                      <Clock size={14} className="mr-1.5" /> Menunggu Respon
                    </span>
                  )}
                  {application.status === 'accepted' && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center">
                      <CheckCircle size={14} className="mr-1.5" /> Diterima
                    </span>
                  )}
                  {application.status === 'rejected' && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center">
                      <XCircle size={14} className="mr-1.5" /> Ditolak
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 text-sm text-gray-700">
                {application.coverLetter && (
                    <div>
                        <p className="font-semibold mb-1 text-gray-600">Surat Lamaran:</p>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-xs">
                            {application.coverLetter}
                        </p>
                    </div>
                )}
                {application.notes && (
                    <div>
                        <p className="font-semibold mb-1 text-gray-600">Catatan Tambahan:</p>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-xs">
                            {application.notes}
                        </p>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="font-semibold text-gray-600">Resume: </span>
                        <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Lihat Resume
                        </a>
                        <span className="mx-1 text-gray-300">|</span>
                        <a
                            href={application.resumeUrl}
                            download
                            className="text-green-600 hover:text-green-800 hover:underline"
                        >
                            Unduh Resume
                        </a>
                    </div>
                    <p className="text-xs text-gray-400">
                        Dikirim pada: {new Date(application.appliedAt._seconds * 1000).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>


              </div>

              <div className="mt-5 pt-4 border-t border-gray-200 flex justify-end gap-3">
                <Link
                  to={`/jobs/${application.jobId}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Lihat Detail Lowongan
                </Link>
                {/* Tombol Batal Melamar hanya jika status 'pending' */}
                {application.status === 'pending' && (
                    <button
                        onClick={() => handleCancelApplication(application.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium py-2 px-4 rounded-lg border border-red-600 hover:bg-red-50 transition-colors flex items-center"
                    >
                        <Trash2 size={16} className="mr-1.5" /> Batal Melamar
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Applications;