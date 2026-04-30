// /news
'use client';

import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar'; 
import Sidebar from '../../components/Sidebar'; 
import '../../styles/globals.css';
import { FaNewspaper, FaClock, FaSpinner, FaUser, FaBroadcastTower } from 'react-icons/fa';

function NewsContent() {
    const [articles, setArticles] = useState([]);
    const [page, setPage] = useState(1); 
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); 
    const [error, setError] = useState('');
    const [hasMore, setHasMore] = useState(true); 
    const [userProfile, setUserProfile] = useState(null);
    const [headerInfo, setHeaderInfo] = useState({ title: 'Latest News Headlines', subtitle: 'Stay updated with stories from around the world.' });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // --- CHANGE: Pointing to the unified API route ---
                const response = await fetch('/api/get-profile'); 
                if (response.ok) {
                    const profile = await response.json();
                    setUserProfile(profile);
                } else {
                    setUserProfile({}); 
                }
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
                setUserProfile({});
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (userProfile !== null) {
            fetchNews(1, true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile]);

    const fetchNews = async (currentPage, isInitialLoad = false) => {
        if (isInitialLoad) {
            setLoading(true);
            setArticles([]);
        } else {
            setLoadingMore(true);
        }

        const apiKey = process.env.NEXT_PUBLIC_GUARDIAN_API_KEY;
        if (!apiKey) {
            setError('API key is missing.');
            setLoading(false);
            return;
        }

        let searchQuery = 'technology OR programming OR software';
        if (userProfile?.desiredRole) {
            const roleQuery = userProfile.desiredRole.split(',').map(r => `"${r.trim()}"`).join(' OR ');
            const experienceQuery = userProfile.experience ? ` AND "${userProfile.experience}"` : '';
            searchQuery = `(${roleQuery})${experienceQuery}`;
            setHeaderInfo({
                title: `News for a ${userProfile.desiredRole}`,
                subtitle: `Curated articles based on your career interests.`
            });
        } else {
            setHeaderInfo({
                title: 'Top Tech Stories',
                subtitle: 'Update your profile for a personalized feed!'
            });
        }

        const apiUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(searchQuery)}&api-key=${apiKey}&show-fields=thumbnail,trailText&order-by=newest&page-size=15&page=${currentPage}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const data = await response.json();
            const newArticles = data.response.results;
            
            setArticles(prev => isInitialLoad ? newArticles : [...prev, ...newArticles]);

            if (data.response.currentPage >= data.response.pages || newArticles.length === 0) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (err) {
            setError('Failed to fetch news. Please check your API key and network connection.');
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNews(nextPage);
    };

    if (loading && page === 1) {
        return (
            <div className="text-center py-20">
                <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto" />
                <p className="text-xl font-semibold text-gray-700 mt-6">Fetching your personalized feed...</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-200/80">
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${userProfile?.desiredRole ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'} mb-4`}>
                    {userProfile?.desiredRole ? <FaUser className="h-6 w-6" /> : <FaBroadcastTower className="h-6 w-6" />}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{headerInfo.title}</h1>
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">{headerInfo.subtitle}</p>
            </header>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-center">
                    <p className="font-bold">An Error Occurred</p>
                    <p>{error}</p>
                </div>
            )}

            {!error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <a key={article.id} href={article.webUrl} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                <div className="relative">
                                    <img src={article.fields.thumbnail || 'https://placehold.co/600x400/E2E8F0/4A5568?text=News'} alt={article.webTitle} className="w-full h-48 object-cover" />
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{article.sectionName}</div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{article.webTitle}</h2>
                                    <p className="text-gray-600 mt-2 flex-grow" dangerouslySetInnerHTML={{ __html: article.fields.trailText }} />
                                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500 flex items-center">
                                        <FaClock className="mr-2" />
                                        {new Date(article.webPublicationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        {loadingMore && <FaSpinner className="animate-spin text-3xl text-blue-600 mx-auto" />}
                        {!loadingMore && hasMore && (
                            <button onClick={handleLoadMore} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out">
                                Load More News
                            </button>
                        )}
                        {!hasMore && <p className="text-gray-500 font-semibold">You've reached the end of the articles.</p>}
                    </div>
                </>
            )}
        </div>
    );
}

export default function NewsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* <NavBar toggleSidebar={toggleSidebar} /> */}
            <div className="flex pt-16">
                {/* <Sidebar isOpen={isSidebarOpen} /> */}
                <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                    <NewsContent />
                </main>
            </div>
        </div>
    );
}

