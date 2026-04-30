"use client";

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import '../../styles/globals.css';


// --- SVG Icon Components ---
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);
const LinkedInIcon = () => (
    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"></path></svg>
);
const GitHubIcon = () => (
    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path></svg>
);
const PortfolioIcon = () => (
    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0112 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 003 12c0 .778.099 1.533.284 2.253m0 0a11.953 11.953 0 007.843 2.918" /></svg>
);
// --- End SVG Icon Components ---

export default function UserProfilePage() {
    const { data: session, status } = useSession();
    const user = session?.user;

    const [formData, setFormData] = useState({
        fullName: '', location: '', phone: '', experience: '', desiredRole: '',
        linkedin: '', github: '', portfolio: '', profilePicture: null,
    });
    const [profilePreview, setProfilePreview] = useState('https://placehold.co/128x128/e0e7ff/4f46e5?text=Upload');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- NEW: useEffect to fetch profile data ---
    useEffect(() => {
        // Only fetch data if the user is authenticated
        if (status === 'authenticated') {
            const fetchProfile = async () => {
                try {
                    const response = await fetch('/api/get-profile');
                    if (!response.ok) {
                        // Don't throw an error for 404, it just means no profile exists yet
                        if (response.status === 404) {
                            console.log("No profile found, using session data.");
                            // Pre-fill with session data for new users
                            setFormData(prev => ({...prev, fullName: user?.name || ''}));
                            setProfilePreview(user?.image || 'https://placehold.co/128x128/e0e7ff/4f46e5?text=Upload');
                            return;
                        }
                        throw new Error('Failed to fetch profile');
                    }
                    const data = await response.json();

                    // Populate form with fetched data
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.fullName || user?.name || '',
                        location: data.location || '',
                        phone: data.phone || '',
                        experience: data.experience || '',
                        desiredRole: data.desiredRole || '',
                        linkedin: data.onlinePresence?.linkedin || '',
                        github: data.onlinePresence?.github || '',
                        portfolio: data.onlinePresence?.portfolio || '',
                    }));

                    // Set profile picture preview from fetched data, fallback to session/placeholder
                    setProfilePreview(data.profilePictureUrl || user?.image || 'https://placehold.co/128x128/e0e7ff/4f46e5?text=Upload');

                } catch (error) {
                    console.error("Error fetching profile data:", error);
                    setMessage('❌ Could not load profile data.');
                }
            };

            fetchProfile();
        }
    }, [status, user]); // Rerun when session status or user object changes


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB check
                setMessage("❌ File size exceeds 1MB."); // Use message state instead of alert
                return;
            }
            setFormData(prev => ({ ...prev, profilePicture: file }));
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!session) {
            setMessage('Error: You must be signed in to save your profile.');
            return;
        }
        setIsLoading(true);
        setMessage('');

        const data = new FormData();
        // Append all form fields to FormData object
        Object.keys(formData).forEach(key => {
            if (formData[key]) { // Only append if value exists
                data.append(key, formData[key]);
            }
        });
        
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (response.ok) {
                setMessage('✅ Profile saved successfully!');
            } else {
                setMessage(`❌ Error: ${result.message}`);
            }
        } catch (error) {
            setMessage('❌ An unexpected error occurred.');
            console.error("Submission error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") { return <p className="text-center p-10">Loading session...</p>; }
    if (status === "unauthenticated") { return <p className="text-center p-10">Please sign in to edit your profile.</p>; }

    return (
        <div className="bg-gray-100 text-gray-800 font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Your Profile</h1>
                        <p className="text-gray-600 mt-1">Keep your professional information up to date.</p>
                    </header>
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <img src={profilePreview} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" alt="Profile Picture" />
                                        <label htmlFor="profilePicture" className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-transform duration-200 hover:scale-110">
                                            <EditIcon />
                                        </label>
                                        <input type="file" id="profilePicture" name="profilePicture" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </div>
                                    <p className="text-sm text-gray-500">JPG, GIF or PNG. 1MB max.</p>
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g., Vikrant Pandey" className="input-field" />
                                    </div>
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Mumbai, India" className="input-field"  />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" name="email" value={user?.email || ''} required className="input-field" readOnly />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 00000 11111" className="input-field" />
                                    </div>
                                </div>
                            </div>
                            <hr className="my-8 border-gray-200" />
                            <div className="space-y-8">
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Experience <span className="text-red-500">*</span></h3>
                                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                    <select id="experience" name="experience" value={formData.experience} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                                        <option value="">Select your experience level</option>
                                        <option value="No Experience">No Experience</option>
                                        <option value="0-1 Years">0-1 Years</option>
                                        <option value="1-3 Years">1-3 Years</option>
                                        <option value="3-5 Years">3-5 Years</option>
                                        <option value="5-10 Years">5-10 Years</option>
                                        <option value="10+ Years">10+ Years</option>
                                    </select>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Career Choice <span className="text-red-500">*</span></h3>
                                    <label htmlFor="desiredRole" className="block text-sm font-medium text-gray-700 mb-1">Desired Role</label>
                                    <input type="text" name="desiredRole" value={formData.desiredRole} onChange={handleChange} placeholder="e.g., AI Engineer, DevOps Engineer" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Online Presence</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <LinkedInIcon />
                                            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <GitHubIcon />
                                            <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <PortfolioIcon />
                                            <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="https://your-portfolio.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button type="button" className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={isLoading} className="btn-primary shadow-sm disabled:bg-blue-400 disabled:cursor-not-allowed">
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                            {message && <p className={`text-center mt-4 font-medium ${message.startsWith('❌') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
