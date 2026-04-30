"use client";
import "../../styles/globals.css";
import { useState, useRef, useEffect } from "react";

function DownloadButton({ pdfData, fileName }) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${pdfData}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="btn-secondary"
    >
      📥 Download PDF: {fileName}
    </button>
  );
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTask, setActiveTask] = useState("doubt-solving");
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleApiCall = async (task) => {
    if (!input.trim()) return;
    const userInput = input;

    setChatHistory((prev) => [...prev, { role: "user", content: userInput }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/run-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiTask: task, query: userInput }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.isPdf) {
          setChatHistory((prev) => [
            ...prev,
            { role: "ai", content: data.displayText },
            {
              role: "download",
              content: { pdfData: data.pdfData, fileName: data.fileName },
            },
          ]);
        } else {
          setChatHistory((prev) => [
            ...prev,
            { role: "ai", content: data.response },
          ]);
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "error",
            content: data.error || "An unknown error occurred.",
          },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "error", content: "Failed to connect to the server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskButtonClick = (task) => {
    setActiveTask(task);
    if (input.trim()) {
      handleApiCall(task);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleApiCall(activeTask);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-screen flex flex-col overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-2">
          AI Career Counselor
        </h1>
        <p className="text-lg text-gray-600">
          Start a conversation to explore your career path.
        </p>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-grow min-h-0 bg-white border border-gray-200 rounded-xl shadow-inner p-6 mb-4 overflow-y-auto"
      >
        {chatHistory.map((message, index) => {
          if (message.role === "download") {
            return (
              <div key={index} className="flex justify-start mb-4">
                <DownloadButton
                  pdfData={message.content.pdfData}
                  fileName={message.content.fileName}
                />
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`max-w-lg p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-[#20BEFF] text-white"
                    : message.role === "ai"
                    ? "bg-gray-100"
                    : "bg-red-100"
                }`}
              >
                <p
                  className="whitespace-pre-wrap"
                  style={{
                    color:
                      message.role === "user"
                        ? "white"
                        : message.role === "error"
                        ? "#991B1B"
                        : "#1F2937",
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      typeof message.content === "string"
                        ? message.content
                            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
                            .replace(/_(.*?)_/g, "<i>$1</i>") // Italic
                            .replace(
                              /\[(.*?)\]\((https?:\/\/[^\s]+)\)/g,
                              '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>'
                            )
                            .replace(
                              /(?<!href=")(https?:\/\/[^\s]+)/g,
                              '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>'
                            )
                        : "",
                  }}
                ></p>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl">
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-start space-x-2 mb-2">
        <button
          onClick={() => setActiveTask("doubt-solving")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
            activeTask === "doubt-solving"
              ? "bg-[#20BEFF] text-white "
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => handleTaskButtonClick("generate-notes")}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
            activeTask === "generate-notes"
              ? "bg-gray-800 text-white "
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Generate Notes
        </button>
        <button
          onClick={() => handleTaskButtonClick("find-youtube-videos")}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 ${
            activeTask === "find-youtube-videos"
              ? "bg-red-600 text-white "
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Find YouTube Videos
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question or enter a topic..."
          className="input-field"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}