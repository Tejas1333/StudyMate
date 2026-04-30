"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession,signIn, signOut } from "next-auth/react";
import { FaBars } from "react-icons/fa";


export default function NavBar({ toggleSidebar }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-4 bg-[#20BEFF] text-white z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-white text-2xl cursor-pointer"
        >
          <FaBars />
        </button>
        <Link href="/" className="text-xl font-bold">
          StudyMate
        </Link>
      </div>
      <div>
        {user ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-300 hover:border-white transition"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src="/default_pic.jpg" 
                  alt="A descriptive alt text"
                  width={500} 
                  height={300} 
                />
              )}
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-black">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="px-4 py-2 font-semibold text-black bg-white rounded hover:bg-gray-200 cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
