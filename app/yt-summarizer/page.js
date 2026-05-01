// /yt-summarizer
"use client";

import { useState } from "react";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/Sidebar";
import "../../styles/globals.css";
import { FaYoutube, FaFileAlt, FaListUl } from "react-icons/fa";

function YTSummarizerContent() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setError("Please enter a valid YouTube URL.");
      return;
    }
    setLoading(true);
    setError("");
    setSummary("");
    setTranscript("");

    try {
      const res = await fetch("/api/run-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiTask: "yt-summarizer",
          query: youtubeUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.Summary) {
        // <-- REMOVED .response
        setSummary(data.Summary.summary); // <-- REMOVED .response
        setTranscript(data.Summary.transcript); // <-- REMOVED .response
      } else {
        setError(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError(
        "Failed to connect to the summarizer service. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
          AI YouTube Summarizer
        </h1>
        <p className="text-xl text-gray-600">
          Paste a YouTube video link to get its summary and full transcript.
        </p>
      </header>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-12 border border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-grow w-full">
            <FaYoutube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              // cannot use input-filed duw to yt logo
              className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed  md:w-auto px-8"
          >
            {loading ? "Summarizing..." : "Generate"}
          </button>
        </form>
        {error && <p className="error-box">{error}</p>}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaFileAlt className="mr-3 text-blue-500" /> Summary
          </h2>
          <div className=" text-gray-700 leading-relaxed whitespace-pre-wrap">
            {loading && !summary && <p>Generating summary...</p>}
            {!loading && !summary && (
              <p className="text-gray-500">
                The video summary will appear here.
              </p>
            )}
            {summary}
          </div>
        </section>

        {/* Transcript Section - Commented Out */}
        {/* <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FaListUl className="mr-3 text-blue-500" /> Transcript
          </h2>
          <div className="h-96 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 leading-relaxed whitespace-pre-wrap">
            {loading && !transcript && <p>Fetching transcript...</p>}
            {!loading && !transcript && (
              <p className="text-gray-500">
                The full video transcript will appear here.
              </p>
            )}
            {transcript}
          </div>
        </section>  */}

        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex justify-between items-center text-xl font-bold text-gray-800"
          >
            <span className="flex items-center">
              <FaListUl className="mr-3 text-blue-500" /> Transcript
            </span>
            <span className="text-lg">{showTranscript ? "▲" : "▼"}</span>
          </button>

          {/* Dropdown content */}
          {showTranscript && (
            <div className="mt-4 h-96 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600 leading-relaxed whitespace-pre-wrap">
              {loading && !transcript && <p>Fetching transcript...</p>}
              {!loading && !transcript && (
                <p className="text-gray-500">
                  The full video transcript will appear here.
                </p>
              )}
              {transcript}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function YTSummarizerPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* <NavBar toggleSidebar={toggleSidebar} /> */}
      <div className="flex pt-16">
        <main
          className="flex-1 transition-all duration-300 flex justify-center"
        >
          <YTSummarizerContent />
        </main>
      </div>
    </div>
  );
}
