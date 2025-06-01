import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  User,
} from "firebase/auth";

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  // Email/Password Auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        setUser(res.user);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        setUser(res.user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Google Auth
  const handleGoogle = async () => {
    setError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setEmail("");
    setPassword("");
  };

  // UI
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user.email || user.displayName}</h2>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="avatar"
              className="mx-auto mb-3 rounded-full w-20 h-20 object-cover"
            />
          )}
          <button
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-full max-w-xs flex flex-col gap-3"
      >
        <h2 className="text-xl font-bold mb-2">
          {isRegister ? "Register" : "Login"}
        </h2>
        <input
          type="email"
          className="border px-3 py-2 rounded"
          placeholder="Email"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <input
          type="password"
          className="border px-3 py-2 rounded"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded py-2 font-semibold hover:bg-blue-600 transition"
        >
          {isRegister ? "Register" : "Login"}
        </button>
        <button
          type="button"
          className="bg-red-500 text-white rounded py-2 font-semibold hover:bg-red-600 transition"
          onClick={handleGoogle}
        >
          Login with Google
        </button>
        <p className="text-sm mt-1">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}

export default Auth;
