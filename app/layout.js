"use client";

import { useState } from 'react';
import SessionWrapper from '@/components/sessionWrapper';
import NavBar from '@/components/NavBar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer'
// import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en">
      <body className={`${inter.className}bg-gray-50`}>
        <SessionWrapper>
          <NavBar toggleSidebar={toggleSidebar} />
          <div className="flex pt-16">
            <Sidebar isOpen={isSidebarOpen} />
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
              {children}
            </main>
          </div>
        </SessionWrapper>
        <Footer/>
      </body>
    </html>
  );
}