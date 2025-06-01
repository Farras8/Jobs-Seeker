import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Firebase import - DO NOT EDIT
import Swal from "sweetalert2";
import { Briefcase, MapPin, DollarSign, Bookmark } from "lucide-react"; // Icons for Card
import Footer from "./Footer"; // Ensure this path is correct
import { Link } from "react-router-dom";
import Navbar from "./Navbar"; // Ensure this path is correct
import { doc, getDoc, collection } from "firebase/firestore"; // Import Firestore methods

// Define the interface for Bookmark job data
interface BookmarkedJob {
  id: string;
  jobId: string;
  bookmarkedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    companyName: string;
    location: string;
    jobType: string;
    skillsRequired: string[];
    salary: {
      min: number;
      max: number;
      currency: string;
    };
    postedAt: {
      _seconds: number;
      _nanoseconds: number;
    };
  };
}

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError("User belum login");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      try {
        const response = await fetch(
          "https://jobseeker-capstone-705829099986.asia-southeast2.run.app/bookmarks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          const jobDetails = await Promise.all(
            data.bookmarks.map(async (bookmark: any) => {
              const jobRef = doc(db, "jobs", bookmark.jobId);
              const jobSnap = await getDoc(jobRef);
              if (jobSnap.exists()) {
                const jobData = jobSnap.data();
                return {
                  ...bookmark,
                  job: {
                    ...jobData,
                    id: jobSnap.id, // Add jobId to the job data
                  },
                };
              }
              return bookmark;
            })
          );
          setBookmarks(jobDetails);
        } else {
          setError("Terjadi kesalahan saat memuat data bookmarks.");
        }
      } catch (err) {
        console.error("Error fetching bookmarks:", err);
        setError("Gagal memuat bookmarks.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // Function to handle job removal from bookmarks
  const handleRemoveBookmark = async (bookmarkId: string) => {
    const confirmed = await Swal.fire({
      title: "Yakin ingin menghapus bookmark ini?",
      text: "Data yang sudah dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire("Error", "User tidak terautentikasi.", "error");
        return;
      }

      const token = await user.getIdToken();

      // Call DELETE API
      const response = await fetch(
        `https://jobseeker-capstone-705829099986.asia-southeast2.run.app/bookmarks/${bookmarkId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus bookmark");
      }

      // If successful, remove the bookmark from the state
      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== bookmarkId));

      Swal.fire("Terhapus!", "Bookmark berhasil dihapus.", "success");
    } catch (error) {
      Swal.fire("Gagal!", (error as Error).message || "Terjadi kesalahan", "error");
    }
  };

  // Render loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="ml-4 text-lg text-gray-700 mt-4">Memuat bookmarks...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex flex-col justify-center items-center flex-grow text-red-600">
          <p className="text-xl font-semibold">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-grow">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Bookmarks Anda</h1>

        {/* Display the list of bookmarked jobs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-start space-x-6 mb-6">
                <div className="flex-shrink-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      bookmark.job.companyName.substring(0, 2)
                    )}&background=random&color=fff&bold=true&size=128`}
                    alt={bookmark.job.companyName}
                    className="w-20 h-20 rounded-lg object-contain border border-gray-200 p-1"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                    {bookmark.job.jobTitle}
                  </h3>
                  <p className="text-lg font-medium text-gray-600">{bookmark.job.companyName}</p>
                  <p className="text-sm text-gray-500 flex items-center mt-2">
                    <MapPin size={14} className="mr-2 text-gray-500" />
                    {bookmark.job.location}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Briefcase size={14} className="mr-2 text-gray-500" />
                    {bookmark.job.jobType}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <DollarSign size={14} className="mr-2 text-gray-500" />
                    {bookmark.job.salary?.min.toLocaleString("id-ID")} -{" "}
                    {bookmark.job.salary?.max.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Link
                  to={`/jobs/${bookmark.job.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Lihat Detail
                </Link>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookmarks;
