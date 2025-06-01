// src/services/bookmarkService.ts
import { auth } from '../firebase'; // Sesuaikan path jika firebase.ts ada di src/

const API_BASE_URL = "https://jobseeker-capstone-705829099986.asia-southeast2.run.app";

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Pengguna belum terautentikasi");
  return await user.getIdToken();
}

export interface ApiBookmark {
  id: string; // ID unik dari bookmark itu sendiri
  jobId: string;
  bookmarkedAt: { _seconds: number; _nanoseconds: number }; // Sesuai struktur Firestore Timestamp
}

interface AddBookmarkResponse {
  id: string;
  message: string;
  bookmark: {
    jobId: string;
    bookmarkedAt: { _seconds: number; _nanoseconds: number };
  };
}

interface GetBookmarksResponse {
  bookmarks: ApiBookmark[];
}

export async function addBookmark(jobId: string): Promise<AddBookmarkResponse> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jobId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Gagal menambahkan bookmark");
  }
  return await response.json();
}

export async function getBookmarks(): Promise<GetBookmarksResponse> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Gagal mengambil data bookmark");
  }
  return await response.json();
}

export async function removeBookmark(bookmarkId: string): Promise<{ message: string }> {
  const token = await getAuthToken();
  const response = await fetch(`${API_BASE_URL}/bookmarks/${bookmarkId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Gagal menghapus bookmark");
  }
  return await response.json();
}