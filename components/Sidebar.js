// components/Sidebar.js
import Link from 'next/link';

export default function Sidebar({ isOpen }) {
  // EDIT: The menu is now an array of objects, each with a name and a URL path.
  // This is a more robust way to handle navigation links.
  const menuItems = [
    // { name: "Dashboard", path: "/dashboard" },
    { name: "Doubt Solving", path: "/doubt-solving" },
    // { name: "Study Notes", path: "/study-notes" },
    { name: "Quiz", path: "/mcq" },
    // { name: "Resource Finder", path: "/resource-finder" },
    { name: "Career Path Finder", path: "/career" },
    // { name: "Study Planner", path: "/study-planner" },
    { name: "Mind Map & FlashCards", path: "/flashcards-mindmap" },
    { name: "Badges", path: "/badge" },
    { name: "YouTube Summarizer", path: "/yt-summarizer" },
    { name: "Recent News", path: "/news" }
  ];

  return (
    <aside
      className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 px-6 py-4 overflow-y-auto
transition-all duration-300 ease-in-out z-0
${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none hidden'}`}
    >
      <ul className="space-y-3 text-base text-gray-700 font-medium">
        {menuItems.map(item => (
          <li key={item.name}>
            <Link
              href={item.path}
              className="block hover:text-[#20BEFF] hover:bg-gray-100 rounded-md px-3 py-2 transition"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}