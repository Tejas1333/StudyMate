"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import "../../styles/globals.css";



export default function LoginPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [LoginIn, setLoginIn] = useState(false)


  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (email === "studymate@gmail.com" && password === "studymate") {
      console.log("Login successful!");
      router.push("/");
      setLoginIn(true)
    } else {
      setError("Invalid username or password.");
    }

    console.log("Attempting to log in with:", { email, password });

  };

  const handleGoogleLogin = () => {
    console.log("Redirecting to Google Login...");

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-2xl rounded-2xl m-4">
        <div className="text-center">
          <h1 className="mb-3 text-4xl font-bold">Welcome back</h1>
          <p className="font-light text-gray-500">
            Please enter your details to sign in.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              className="input-field"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="error-box">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="input-field"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="btn-secondary"
          >
            Sign in
          </button>
        </form>

        <div className="flex items-center justify-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center border border-gray-300 p-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
        >
          <svg
            className="w-6 h-6 inline mr-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.187-8.264l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.371,34.221,44,28.718,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></path>
          </svg>
          Sign in with Google
        </button>

        <div className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="#" className="font-medium text-[#20BEFF] hover:underline">
            Sign up for free
          </a>
        </div>
      </div>
    </div>
  );
}
