"use client";

import { useState, useMemo, useEffect } from "react";
// Import the icons from react-icons
import { FaPencilAlt, FaKeyboard, FaFilePdf } from "react-icons/fa";

// --- MOCKED HOOKS & DATA (for standalone functionality) ---

// Mock implementation of the useQuizStreak custom hook
const useQuizStreak = () => {
  const [streak, setStreak] = useState(5); // Example streak
  const [unlockedBadges, setUnlockedBadges] = useState([
    { name: "Quiz Novice" },
  ]); // Example badge

  // A function to simulate recording activity.
  const recordActivity = () => {
    console.log("Quiz activity recorded.");
  };

  return { streak, unlockedBadges, recordActivity };
};

// --- Helper Components (included directly for a single-file solution) ---

// A simple loading spinner component
function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-white border-dashed rounded-full animate-spin"></div>
    </div>
  );
}

// Component to display the user's quiz history
function QuizHistoryDisplay({ history, isLoading, error, onSelectQuiz }) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-box" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-8">
        You haven't completed any quizzes yet. Generate one to get started!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((quiz) => (
        <div
          key={quiz._id || quiz.createdAt}
          className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 transition-all cursor-pointer"
          onClick={() => onSelectQuiz(quiz)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{quiz.topic}</h3>
              <p className="text-gray-500 text-sm">
                {new Date(quiz.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-blue-600">
                {quiz.score} / {quiz.totalQuestions}
              </p>
              <span className="text-sm font-semibold text-gray-600">Score</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Quiz Page Component ---

export default function MCQGeneratorContent() {
  // --- STATE MANAGEMENT ---
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [view, setView] = useState("quiz");

  // State for multi-input type
  const [inputType, setInputType] = useState("topic"); // 'topic', 'plain_text', 'pdf'
  const [paragraphText, setParagraphText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // --- HISTORY STATE ---
  const [quizHistory, setQuizHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryQuiz, setSelectedHistoryQuiz] = useState(null);

  // --- CUSTOM HOOKS ---
  const { streak, recordActivity } = useQuizStreak();

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const res = await fetch("/api/mcq");
        if (!res.ok) throw new Error("Failed to fetch quiz history.");
        const data = await res.json();
        setQuizHistory(data.history || []);
      } catch (err) {
        setHistoryError(err.message || "Could not load quiz history.");
      } finally {
        setHistoryLoading(false);
      }
    };

    if (view === "history") {
      fetchHistory();
    }
  }, [view]);

  const score = useMemo(() => {
    if (!showResults) return 0;
    return mcqs.reduce((correctCount, mcq) => {
      const userAnswerKey = userAnswers[mcq.question];
      return correctCount + (userAnswerKey === mcq.correct_answer ? 1 : 0);
    }, 0);
  }, [showResults, mcqs, userAnswers]);

  const handleGenerateMCQs = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMcqs([]);
    setError("");
    setUserAnswers({});
    setShowResults(false);
    setView("quiz");
    setSelectedHistoryQuiz(null);
    recordActivity();

    try {
      let res;
      // Handle file upload with FormData
      if (inputType === "pdf" && selectedFile) {
        const formData = new FormData();
        formData.append("aiTask", "mcq");
        formData.append("file", selectedFile);
        const query = { num_questions: numQuestions, input_type: "file" };
        formData.append("query", JSON.stringify(query));

        res = await fetch("/api/run-ai", {
          method: "POST",
          body: formData,
        });
      } else {
        // Handle topic and paragraph with JSON
        let queryPayload = { num_questions: numQuestions };
        if (inputType === "topic") {
          queryPayload.topic = topic;
          queryPayload.input_type = "topic";
        } else if (inputType === "plain_text") {
          queryPayload.paragraph = paragraphText;
          queryPayload.input_type = "paragraph";
        }

        res = await fetch("/api/run-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aiTask: "mcq", query: queryPayload }),
        });
      }

      const data = await res.json();
      if (
        res.ok &&
        data.response &&
        Array.isArray(data.response.mcqs) &&
        data.response.mcqs.length > 0
      ) {
        setMcqs(data.response.mcqs);
        if (inputType === "pdf")
          setTopic(selectedFile.name.split(".").slice(0, -1).join("."));
        if (inputType === "plain_text") setTopic("Custom Text Quiz");
      } else {
        setError(data.error || "No MCQs were generated. Please try again.");
      }
    } catch (err) {
      setError("Network error or problem connecting to the AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (question, optionKey) => {
    if (showResults || selectedHistoryQuiz) return;
    setUserAnswers({ ...userAnswers, [question]: optionKey });
  };

  const handleQuizSubmit = async () => {
    setShowResults(true);
    const finalScore = score; // Use the memoized score

    const quizResult = {
      topic,
      score: finalScore,
      totalQuestions: mcqs.length,
      questions: mcqs,
      userAnswers,
      createdAt: new Date().toISOString(),

      // ✅ ADD THIS (VERY IMPORTANT)
      inputType,

      sourceContent:
        inputType === "topic"
          ? topic
          : inputType === "plain_text"
            ? paragraphText
            : selectedFile?.name || "",
    };

    try {
      const res = await fetch("/api/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizResult),
      });

      if (res.ok) {
        const { savedQuiz } = await res.json();
        setQuizHistory((prevHistory) => [savedQuiz, ...prevHistory]);
      } else {
        console.error("Failed to save quiz history.");
      }
    } catch (err) {
      console.error("Error saving quiz history:", err);
    }
  };

  const handleSelectHistoryQuiz = (quiz) => {
    setSelectedHistoryQuiz(quiz);
    setView("history-detail");
  };

  const getOptionStyle = (mcq, optionKey, quizContext) => {
    const isSelected = quizContext.userAnswers[mcq.question] === optionKey;
    const isCorrect = optionKey === mcq.correct_answer;

    if (isCorrect) return "bg-green-100 text-green-900 ring-2 ring-green-500";
    if (isSelected && !isCorrect)
      return "bg-red-100 text-red-900 ring-2 ring-red-500";
    return "bg-gray-100 border-gray-200 text-gray-600 opacity-80";
  };

  const renderQuizContent = (questions, answers, isReview) => (
    <div className="space-y-8">
      {isReview && selectedHistoryQuiz && (
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center border-2 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800">
            Reviewing: {selectedHistoryQuiz.topic}
          </h2>
          <p className="text-4xl font-extrabold text-[#20BEFF] my-2">
            {selectedHistoryQuiz.score} / {selectedHistoryQuiz.totalQuestions}
          </p>
          <p className="text-gray-600">
            Completed on{" "}
            {new Date(selectedHistoryQuiz.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
      {showResults && !isReview && (
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center border-2 border-blue-500">
          <h2 className="text-2xl font-bold text-gray-800">Quiz Complete!</h2>
          <p className="text-4xl font-extrabold text-[#20BEFF] my-2">
            {score} / {mcqs.length}
          </p>
          <p className="text-gray-600">Great job! See your results below.</p>
        </div>
      )}
      {questions.map((mcq, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
        >
          <p className="text-lg font-semibold text-gray-800 mb-4">
            <span className="font-bold">Q{index + 1}:</span> {mcq.question}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mcq.options &&
              Object.entries(mcq.options).map(([key, value]) => (
                <button
                  key={key}
                  disabled={showResults || isReview}
                  onClick={() => handleSelectAnswer(mcq.question, key)}
                  className={`p-3 text-left rounded-lg border-2 transition-all duration-300 w-full ${
                    showResults || isReview
                      ? getOptionStyle(mcq, key, {
                          userAnswers: answers,
                          ...mcq,
                        })
                      : answers[mcq.question] === key
                        ? "bg-[#20BEFF] border-gray-400 text-white shadow-md ring-2 "
                        : "bg-white hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  <span className="font-bold mr-2">{key}:</span>
                  {value}
                </button>
              ))}
          </div>
          {(showResults || isReview) && (
            <div className="mt-5 pt-5 border-t border-dashed">
              <p className="text-gray-800">
                <span className="font-bold">Explanation: </span>
                {mcq.explanation}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Helper to check if the form is valid for submission
  const isFormInvalid = () => {
    if (loading) return true;
    if (inputType === "topic") return !topic.trim();
    if (inputType === "plain_text") return !paragraphText.trim();
    if (inputType === "pdf") return !selectedFile;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <style>{`
                body { background-color: #f7fafc; font-family: sans-serif; }
            `}</style>
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
          {view === "history" && "Quiz History"}
          {view === "history-detail" && "Review Quiz"}
          {view === "quiz" && "MCQ Quiz Generator"}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          {view === "quiz"
            ? "Test your knowledge on any topic."
            : "Review your past performance."}
        </p>
        <p className="mt-4 text-md text-gray-500">
          🔥 Your current quiz streak is:{" "}
          <strong>
            {streak} day{streak !== 1 && "s"}
          </strong>
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg mb-12 border border-gray-200 flex justify-center gap-4">
        <button
          onClick={() => {
            setView("quiz");
            setSelectedHistoryQuiz(null);
            setMcqs([]);
            setShowResults(false);
            setTopic("");
            setUserAnswers({});
          }}
          className={`${view === "quiz" ? "btn-primary" : "btn-secondary"}`}
        >
          New Quiz
        </button>
        <button
          onClick={() => setView("history")}
          className={`${view === "history" || view === "history-detail" ? "btn-primary" : "btn-secondary"}`}
        >
          History
        </button>
      </div>

      {view === "quiz" && (
        <>
          <form
            onSubmit={handleGenerateMCQs}
            className="bg-white p-6 rounded-2xl shadow-lg mb-12 border border-gray-200"
          >
            {/* Input Type Selector with Icons */}
            <div className="flex justify-center gap-2 mb-4 p-2 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setInputType("topic")}
                className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${
                  inputType === "topic"
                    ? "bg-white text-[#20BEFF] shadow"
                    : "text-gray-600"
                }`}
              >
                <FaPencilAlt className="mr-2" />
                Topic
              </button>
              <button
                type="button"
                onClick={() => setInputType("plain_text")}
                className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${
                  inputType === "plain_text"
                    ? "bg-white text-[#20BEFF] shadow"
                    : "text-gray-600"
                }`}
              >
                <FaKeyboard className="mr-2" />
                Text
              </button>
              <button
                type="button"
                onClick={() => setInputType("pdf")}
                className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${
                  inputType === "pdf"
                    ? "bg-white text-[#20BEFF] shadow"
                    : "text-gray-600"
                }`}
              >
                <FaFilePdf className="mr-2" />
                PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Conditional Inputs */}
              {inputType === "topic" && (
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter any topic..."
                  className="md:col-span-3 p-3 input-field"
                  required
                />
              )}
              {inputType === "plain_text" && (
                <textarea
                  value={paragraphText}
                  onChange={(e) => setParagraphText(e.target.value)}
                  placeholder="Paste your paragraph here..."
                  className="md:col-span-3 p-3 input-field"
                  required
                />
              )}
              {inputType === "pdf" && (
                <div className="md:col-span-3 input-field">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#20BEFF] hover:file:bg-blue-100"
                    accept=".pdf,.txt,.md"
                    required
                  />
                </div>
              )}

              <input
                type="number"
                value={numQuestions}
                onChange={(e) =>
                  setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                max="20"
                className="md:col-span-1 p-3 input-field"
                required
              />
              <button
                type="submit"
                disabled={isFormInvalid()}
                className="btn-primary"
              >
                {loading ? <Spinner /> : "Generate"}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-box" role="alert">
              <p>{error}</p>
            </div>
          )}

          {mcqs.length > 0 && (
            <>
              {renderQuizContent(mcqs, userAnswers, false)}
              {!showResults && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(userAnswers).length !== mcqs.length}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Check Answers
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {view === "history" && (
        <QuizHistoryDisplay
          history={quizHistory}
          isLoading={historyLoading}
          error={historyError}
          onSelectQuiz={handleSelectHistoryQuiz}
        />
      )}

      {view === "history-detail" &&
        selectedHistoryQuiz &&
        renderQuizContent(
          selectedHistoryQuiz.questions,
          selectedHistoryQuiz.userAnswers,
          true,
        )}
    </div>
  );
}
