// /career
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import NavBar from "../../components/NavBar";
import Sidebar from "../../components/Sidebar";
import "../../styles/globals.css";
import {
  FaPaperPlane,
  FaBriefcase,
  FaChartLine,
  FaRoad,
  FaBuilding,
  FaComments,
} from "react-icons/fa";

function CareerGuidanceContent() {
  const [careerName, setCareerName] = useState("");

  const [guideData, setGuideData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleGenerateGuide = async (e) => {
    e.preventDefault();
    if (!careerName.trim()) {
      setError("Please enter a profession.");
      return;
    }
    setLoading(true);
    setError("");
    setGuideData(null);
    setChatHistory([]); // Reset chat on new guide generation

    try {
      const res = await fetch("/api/run-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiTask: "career",
          query: { career_name: careerName },
        }),
      });

      const data = await res.json();

      if (res.ok && data.response) {
        setGuideData(data.response);
        setActiveTab("overview");
        setChatHistory([
          {
            role: "assistant",
            content: `Hello! I am ready to answer your questions about a career in **${data.response.career_name}**. What would you like to know?`,
          },
        ]);
      } else {
        setError(data.error || "Failed to generate the career guide.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newHumanMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, newHumanMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/run-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiTask: "career",
          query: {
            user_query: chatInput,
            career_data: guideData,
          },
        }),
      });
      const data = await res.json();

      if (res.ok && data.response && data.response.chat_response) {
        const newAssistantMessage = {
          role: "assistant",
          content: data.response.chat_response,
        };
        setChatHistory((prev) => [...prev, newAssistantMessage]);
      } else {
        const errorMessage = {
          role: "assistant",
          content: `Sorry, I encountered an error: ${data.error || "Unknown issue"}`,
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMessage = {
        role: "assistant",
        content: `Network error: Could not connect to the assistant.`,
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <FaBriefcase />,
      content: guideData?.research,
    },
    {
      id: "market",
      label: "Market Analysis",
      icon: <FaChartLine />,
      content: guideData?.market_analysis,
    },
    {
      id: "roadmap",
      label: "Learning Roadmap",
      icon: <FaRoad />,
      content: guideData?.learning_roadmap,
    },
    {
      id: "insights",
      label: "Industry Insights",
      icon: <FaBuilding />,
      content: guideData?.industry_insights,
    },
    {
      id: "chat",
      label: "Chat with AI",
      icon: <FaComments />,
      content: "chat_interface",
    },
  ];

  return (
    <div className="w-full flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
            AI Career Guidance
          </h1>
          <p className="text-xl text-gray-600">
            Enter any profession to receive a detailed, AI-generated guide.
          </p>
        </header>

        {/* Input Form */}
        <form
          onSubmit={handleGenerateGuide}
          className="bg-white p-6 rounded-2xl shadow-lg mb-12 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
              placeholder="e.g., Software Engineer, Doctor, Graphic Designer..."
              className="input-field"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Analyzing..." : "Generate Guide"}
            </button>
          </div>
          {error && <p className="error-box">{error}</p>}
        </form>

        {loading && (
          <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
            <p className="text-lg font-semibold text-gray-700">
              Analyzing career path... Please wait.
            </p>
          </div>
        )}
        {!loading && !guideData && (
          <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
            <p className="text-lg font-semibold text-gray-500">
              Your detailed career guide will appear here.
            </p>
          </div>
        )}

        {guideData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav
                className="-mb-px flex space-x-4 overflow-x-auto p-4"
                aria-label="Tabs"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg flex items-center transition ${
                      activeTab === tab.id
                        ? "btn-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 min-h-[60vh]">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={activeTab === tab.id ? "block" : "hidden"}
                >
                  {tab.content === "chat_interface" ? (
                    <div className="flex flex-col h-[60vh]">
                      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                        {chatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`prose max-w-lg p-3 rounded-2xl ${msg.role === "user" ? "bg-blue-500 text-white prose-invert" : "bg-gray-200 text-gray-800"}`}
                            >
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                        {isChatLoading && (
                          <div className="flex justify-start">
                            <div className="p-3 rounded-2xl bg-gray-200">
                              Typing...
                            </div>
                          </div>
                        )}
                      </div>
                      <form
                        onSubmit={handleSendChatMessage}
                        className="mt-4 flex gap-2 border-t pt-4"
                      >
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask a follow-up question..."
                          className="input-field"
                        />
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={isChatLoading}
                        >
                          <FaPaperPlane />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <ReactMarkdown>
                        {tab.content ||
                          `No content available for ${tab.label}.`}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CareerGuidancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* <NavBar toggleSidebar={toggleSidebar} /> */}
      <div className="flex pt-16">
        <main className="flex-1 flex justify-center transition-all duration-300">
          <div
            className="w-full"
            style={{
              maxWidth: isSidebarOpen ? "calc(100% - 256px)" : "100%",
            }}
          >
            <CareerGuidanceContent />
          </div>
        </main>
      </div>
    </div>
  );
}
