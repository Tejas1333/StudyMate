// components/InitialPage.js
import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  FaRocket,
  FaLightbulb,
  FaSearch,
  FaYoutube,
  FaFileAlt,
  FaCalendarAlt,
  FaBrain,
  FaGraduationCap,
  FaNewspaper,
  FaStar,
  FaTrophy,
} from "react-icons/fa";

const InitialPage = () => {
  const { data: session } = useSession();
  return (
    <div
      className="bg-gray-50 text-gray-800 pt-16"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='%23a0aec0' fill-opacity='0.2'%3E%3Cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <section className="text-center py-20 px-4 bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Stop Studying Harder. <br />
            <span className="text-[#20BEFF]">Start Studying Smarter.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            From instant doubt-solving to personalized career guidance,
            StudyMate is the only AI-powered tool you need to unlock your full
            academic potential.
          </p>

          {session ? (
            <button className="mt-12 px-8 py-4 bg-[#20BEFF] text-white font-bold rounded-lg shadow-lg hover:bg-[#20BEFF] transition duration-300 transform hover:scale-105">
              Welcome To StudyMate
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-block mt-10 px-8 py-4 bg-[#20BEFF] text-white font-bold rounded-lg shadow-lg hover:bg-[#20BEFF] transition duration-300 transform hover:scale-105"
            >
              Get Started for Free
            </Link>
          )}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works in 3 Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6">
              <div className="bg-blue-100 text-[#20BEFF] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Input Your Query</h3>
              <p className="text-gray-600">
                Ask a question, paste a YouTube link, or choose a topic you want
                to master.
              </p>
            </div>
            <div className="p-6">
              <div className="bg-blue-100 text-[#20BEFF] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your request in seconds, fetching the
                most relevant information.
              </p>
            </div>
            <div className="p-6">
              <div className="bg-blue-100 text-[#20BEFF] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Get Instant Results
              </h3>
              <p className="text-gray-600">
                Receive clear summaries, notes, mind maps, or career guidance
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Instant Knowledge, Zero Hassle
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Never get stuck on a problem again. Get the answers you need, right
            when you need them.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaLightbulb />}
              title="Doubt Solver"
              description="Get instant, step-by-step solutions to complex problems."
            />
            <FeatureCard
              icon={<FaYoutube />}
              title="YouTube Summarizer"
              description="Turn long video lectures into concise, easy-to-read summaries."
            />
            <FeatureCard
              icon={<FaSearch />}
              title="Resource Finder"
              description="Discover the best free learning materials and articles on any topic."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Organize Your Learning, Effortlessly
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Structure your study sessions and revise more effectively with our
            smart tools.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaFileAlt />}
              title="AI Notes"
              description="Automatically generate structured, high-quality notes from any content."
            />
            <FeatureCard
              icon={<FaCalendarAlt />}
              title="Study Planner"
              description="Create optimized study schedules tailored to your goals and deadlines."
            />
            <FeatureCard
              icon={<FaBrain />}
              title="Mind Maps"
              description="Visualize complex topics with AI-generated mind maps and flashcards."
            />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Prepare for Your Future</h2>
          <p className="text-lg text-gray-600 mb-12">
            Go beyond academics. Get the insights you need to build a successful
            career.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<FaGraduationCap />}
              title="Career Guidance"
              description="Explore career paths, analyze job markets, and get a personalized learning roadmap."
            />
            <FeatureCard
              icon={<FaNewspaper />}
              title="Recent News"
              description="Stay updated with the latest trends and skills in your field of interest."
            />
          </div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      {/* <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Trusted by Students Everywhere</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <TestimonialCard quote="StudyMate's doubt solver saved me hours of frustration before my exam!" author="Priya, Engineering Student" />
            <TestimonialCard quote="The career guidance feature opened my eyes to possibilities I never considered. I finally have a clear path!" author="Rohan, 12th Grade" />
          </div>
        </div>
      </section> */}

      <section className="py-20 px-4 bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto text-center">
          <FaTrophy className="text-5xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Make Learning Fun</h2>
          <p className="text-lg text-gray-600">
            Track your progress, earn rewards for your hard work, and turn
            studying into an adventure.
          </p>
        </div>
      </section>

      {session ? (
        <section className="py-20 px-4 bg-[#20BEFF] text-white mt-12 rounded-lg shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold">Welcome Back!</h2>
            <p className="mt-4 text-lg text-blue-100">
              You're ready to go. Dive back into your studies and continue your
              progress.
            </p>
          </div>
        </section>
      ) : (
        <section className="py-20 px-4 bg-[#20BEFF] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of successful students and supercharge your
              learning today.
            </p>
            <Link
              href="/login"
              className="inline-block mt-8 px-8 py-4 bg-white text-[#20BEFF] font-bold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
            >
              Sign Up for Free
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
    <div className="text-4xl text-[#20BEFF] mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, author }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
    <div className="flex text-yellow-400 mb-4">
      <FaStar />
      <FaStar />
      <FaStar />
      <FaStar />
      <FaStar />
    </div>
    <p className="text-gray-600 italic">"{quote}"</p>
    <p className="mt-4 font-bold text-gray-800 text-right">- {author}</p>
  </div>
);

export default InitialPage;
