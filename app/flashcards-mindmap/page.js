'use client';
// Final Merged FlashcardsContent Component

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
// Correctly merged icons for all features
import { FaBookOpen, FaFilePdf, FaKeyboard, FaPencilAlt, FaHistory, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import '../../styles/globals.css';

// Dynamically import the Tree component to avoid SSR issues
const Tree = dynamic(() => import('react-d3-tree').then((mod) => mod.Tree), {
    ssr: false,
});

// --- Helper Functions & Components ---

function transformJsonToD3TreeFormat(jsonData) {
    if (!jsonData || typeof jsonData !== 'object' || Object.keys(jsonData).length === 0) return null;
    const rootKey = Object.keys(jsonData)[0];
    const rootValue = jsonData[rootKey];

    const buildNode = (name, childrenObj) => {
        const node = { name };
        if (childrenObj && typeof childrenObj === 'object' && Object.keys(childrenObj).length > 0) {
            node.children = Object.entries(childrenObj).map(([childName, childValue]) => buildNode(childName, childValue));
        }
        return node;
    };
    return buildNode(rootKey, rootValue);
}

const renderCustomNodeElement = ({ nodeDatum, toggleNode }) => (
    <g>
        <circle r={12} fill={nodeDatum.children ? '#20BEFF' : '#8c9eff'} onClick={toggleNode} />
        <text fill="#333" stroke="none" x={20} y={-5} className="font-semibold text-sm">
            {nodeDatum.name}
        </text>
    </g>
);

// --- UPDATED History Display Component with Topic Editing ---
function StudyHistoryDisplay({
    history, isLoading, error, onSelectItem,
    editingTopicId, newTopicName, setNewTopicName,
    onStartEdit, onSaveEdit, onCancelEdit
}) {
    if (isLoading) {
        return <div className="text-center p-8">Loading history...</div>;
    }
    if (error) {
        return <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>;
    }
    if (history.length === 0) {
        return <p className="text-center text-gray-500 mt-8">No history found. Generate some study materials to get started!</p>;
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onSaveEdit();
        if (e.key === 'Escape') onCancelEdit();
    };

    return (
        <div className="space-y-4">
            {history.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-center gap-4">
                    {editingTopicId === item._id ? (
                        // --- EDITING VIEW ---
                        <>
                            <input
                                type="text"
                                value={newTopicName}
                                onChange={(e) => setNewTopicName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="input-field"
                                autoFocus
                            />
                            <button onClick={onSaveEdit} className="btn-primary"><FaCheck /></button>
                            <button onClick={onCancelEdit} className="btn-secondary"><FaTimes /></button>
                        </>
                    ) : (
                        // --- NORMAL VIEW ---
                        <>
                            <div className="flex-grow cursor-pointer" onClick={() => onSelectItem(item)}>
                                <h3 className="text-xl font-bold text-gray-800">{item.topic}</h3>
                                <p className="text-gray-500 text-sm">
                                    Created on {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => onStartEdit(item)} className="btn-primary">
                                <FaPencilAlt />
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}


// --- Main Component ---
export default function FlashcardsContent() {
    const mindMapContainerRef = useRef(null);

    // --- STATE MANAGEMENT ---
    const [view, setView] = useState('generator');
    const [inputMethod, setInputMethod] = useState('topic');
    const [topicName, setTopicName] = useState('');
    const [plainTextInput, setPlainTextInput] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [mindMapRawJson, setMindMapRawJson] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [flippedCardIndices, setFlippedCardIndices] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [studyHistory, setStudyHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedFlashcards, setEditedFlashcards] = useState([]);
    const [editingTopicId, setEditingTopicId] = useState(null);
    const [newTopicName, setNewTopicName] = useState('');

    const mindMapTreeData = transformJsonToD3TreeFormat(mindMapRawJson);
    const currentFlashcards = selectedHistoryItem ? selectedHistoryItem.flashcards : flashcards;

    useEffect(() => {
        const fetchHistory = async () => {
            setHistoryLoading(true);
            setHistoryError('');
            try {
                const res = await fetch('/api/flashcards-mindmap');
                if (!res.ok) throw new Error('Failed to fetch study history.');
                const data = await res.json();
                setStudyHistory(data.history || []);
            } catch (err) {
                setHistoryError(err.message);
            } finally {
                setHistoryLoading(false);
            }
        };
        if (view === 'history') {
            fetchHistory();
        }
    }, [view]);
    
    const handleFileChange = (e) => setPdfFile(e.target.files[0]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputMethod === 'topic' && !topicName.trim()) {
            setError('Please enter a topic name.');
            return;
        }
        setLoading(true);
        setMindMapRawJson(null);
        setFlashcards([]);
        setError('');
        setFlippedCardIndices(new Set());

        const saveStudyMaterials = async (materials) => {
             if (!materials || !materials.flashcards) {
                setError("AI failed to generate flashcards. Please try again.");
                return;
            }
            try {
                const payload = {
                    topic: topicName || "Untitled Study Set",
                    mindMap: materials.mindMap,
                    flashcards: materials.flashcards,
                };
                const res = await fetch('/api/flashcards-mindmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (res.ok) {
                    const { savedMaterial } = await res.json();
                    setStudyHistory(prev => [savedMaterial, ...prev]);
                } else {
                    const errorData = await res.json();
                    setError(`Failed to save: ${errorData.error || 'Unknown server error'}`);
                }
            } catch (err) {
                 setError(`Network Error: ${err.message}`);
            }
        };

        let requestBody = {
            aiTask: 'flashcards_mindmap',
            query: { inputMethod, topicName, plainTextContent: plainTextInput, fileContent: null, fileName: null, fileType: null }
        };

        const processAndSend = async () => {
            try {
                const res = await fetch('/api/run-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
                const data = await res.json();
                if (res.ok && data.response) {
                    setMindMapRawJson(data.response.mindMap || null);
                    setFlashcards(data.response.flashcards || []);
                    await saveStudyMaterials(data.response);
                } else {
                    setError(data.error || 'Unknown API error.');
                }
            } catch (err) {
                setError('Network or server error: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (inputMethod === 'pdf' && pdfFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                requestBody.query.fileContent = btoa(event.target.result);
                requestBody.query.fileName = pdfFile.name;
                requestBody.query.fileType = 'application/pdf';
                processAndSend();
            };
            reader.onerror = (err) => {
                setError('Error reading PDF file: ' + err.message);
                setLoading(false);
            }
            reader.readAsBinaryString(pdfFile);
        } else {
            processAndSend();
        }
    };

    const handleCardFlip = (index) => {
        const newFlipped = new Set(flippedCardIndices);
        newFlipped.has(index) ? newFlipped.delete(index) : newFlipped.add(index);
        setFlippedCardIndices(newFlipped);
    };
    
    const handleSelectHistoryItem = (item) => {
        if (editingTopicId) return; // Prevent navigation while editing a topic name
        setSelectedHistoryItem(item);
        setView('history-detail');
        setFlippedCardIndices(new Set());
        setIsEditing(false);
    };
    
    const resetToGenerator = () => {
        setView('generator');
        setSelectedHistoryItem(null);
        setMindMapRawJson(null);
        setFlashcards([]);
        setTopicName('');
        setPlainTextInput('');
        setPdfFile(null);
        setIsEditing(false);
        setEditingTopicId(null);
    }

    // --- Flashcard Editing Functions ---
    const handleEditToggle = () => {
        if (!isEditing) setEditedFlashcards([...currentFlashcards]);
        setIsEditing(!isEditing);
    };
    const handleAddCard = () => setEditedFlashcards([...editedFlashcards, { question: 'New Question', answer: 'New Answer' }]);
    const handleDeleteCard = (indexToDelete) => setEditedFlashcards(editedFlashcards.filter((_, index) => index !== indexToDelete));
    const handleCardChange = (index, field, value) => {
        const updatedCards = [...editedFlashcards];
        updatedCards[index][field] = value;
        setEditedFlashcards(updatedCards);
    };
    const handleSaveChanges = async () => {
        const documentId = selectedHistoryItem?._id;
        if (!documentId) {
            setError("Could not find item to update.");
            return;
        }
        try {
            const res = await fetch('/api/flashcards-mindmap', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: documentId, flashcards: editedFlashcards }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save changes.');
            
            setStudyHistory(prev => prev.map(item => item._id === documentId ? data.updatedMaterial : item));
            setSelectedHistoryItem(data.updatedMaterial);
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Topic Name Editing Functions ---
    const handleTopicEditStart = (item) => {
        setEditingTopicId(item._id);
        setNewTopicName(item.topic);
    };
    const handleTopicUpdate = async () => {
        if (!newTopicName.trim() || !editingTopicId) return;
        try {
            const res = await fetch('/api/flashcards-mindmap', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingTopicId, topic: newTopicName }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update topic.');
            
            setStudyHistory(prev => prev.map(item => (item._id === editingTopicId ? data.updatedMaterial : item)));
            if (selectedHistoryItem?._id === editingTopicId) {
                setSelectedHistoryItem(data.updatedMaterial);
            }
            setEditingTopicId(null);
            setNewTopicName('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-8">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3">AI Study Assistant</h1>
                <p className="text-xl text-gray-600">Generate, save, and customize your study materials.</p>
            </header>

            <div className="bg-white p-3 rounded-2xl shadow-lg mb-12 border border-gray-200 flex justify-center gap-4">
                <button onClick={resetToGenerator} className={`${view === 'generator' ? 'btn-primary' : 'btn-secondary'}`}>
                    <FaPencilAlt /> New Study Set
                </button>
                <button onClick={() => setView('history')} className={`${view.includes('history') ? 'btn-primary' : 'btn-secondary'}`}>
                    <FaHistory /> History
                </button>
            </div>
            
            {view === 'generator' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6 sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-800">1. Choose Your Input</h2>
                            <div className="flex flex-col sm:flex-row gap-2 bg-gray-100 rounded-lg p-1">
                                <button type="button" onClick={() => setInputMethod('topic')} className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${inputMethod === 'topic' ? 'bg-white text-[#20BEFF] shadow' : 'text-gray-600'}`}><FaPencilAlt className="mr-2"/>Topic</button>
                                <button type="button" onClick={() => setInputMethod('plain_text')} className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${inputMethod === 'plain_text' ? 'bg-white text-[#20BEFF] shadow' : 'text-gray-600'}`}><FaKeyboard className="mr-2"/>Text</button>
                                <button type="button" onClick={() => setInputMethod('pdf')} className={`w-full p-2 rounded-md font-semibold transition flex items-center justify-center ${inputMethod === 'pdf' ? 'bg-white text-[#20BEFF] shadow' : 'text-gray-600'}`}><FaFilePdf className="mr-2"/>PDF</button>
                            </div>
                            {inputMethod === 'topic' && <input type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="e.g., Quantum Mechanics" className="input-field" />}
                            {inputMethod === 'plain_text' && <textarea value={plainTextInput} onChange={(e) => setPlainTextInput(e.target.value)} placeholder="Paste your notes here..." rows="8" className="input-field" />}
                            {inputMethod === 'pdf' && <input type="file" accept=".pdf" onChange={handleFileChange} className="input-field file:bg-blue-50 file:text-[#20BEFF] hover:file:bg-blue-100"/>}
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Generating...' : 'Generate & Save'}
                            </button>
                            {error && <div className="error-box">{error}</div>}
                        </form>
                    </div>
                    <div className="lg:col-span-3 space-y-8">
                        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center"><FaBookOpen className="mr-3 text-blue-500"/>Mind Map</h2>
                            </div>
                            <div ref={mindMapContainerRef} className="w-full h-[500px] bg-gray-50 rounded-lg flex items-center justify-center">
                                {loading && !mindMapTreeData && <p>Generating mind map...</p>}
                                {!loading && !mindMapTreeData && <p className="text-gray-500">Your mind map will appear here.</p>}
                                {mindMapTreeData && <Tree data={mindMapTreeData} orientation="vertical" pathFunc="step" separation={{ siblings: 1.5, nonSiblings: 2 }} translate={{x: 350, y: 50}} renderCustomNodeElement={renderCustomNodeElement} />}
                            </div>
                        </section>
                        <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Flashcards</h2>
                            {loading && flashcards.length === 0 && <p>Generating flashcards...</p>}
                            {!loading && flashcards.length === 0 && <p className="text-gray-500">Your flashcards will appear here.</p>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 perspective">
                                {flashcards.map((card, index) => (
                                    <div key={index} className="flip-card h-56" onClick={() => handleCardFlip(index)}>
                                        <div className={`flip-card-inner ${flippedCardIndices.has(index) ? 'is-flipped' : ''}`}>
                                            <div className="flip-card-front"><h3 className="text-lg font-bold">{card.question}</h3></div>
                                            <div className="flip-card-back"><p>{card.answer}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            )}
            
            {view === 'history' && (
                <StudyHistoryDisplay 
                    history={studyHistory} 
                    isLoading={historyLoading} 
                    error={historyError} 
                    onSelectItem={handleSelectHistoryItem}
                    editingTopicId={editingTopicId}
                    newTopicName={newTopicName}
                    setNewTopicName={setNewTopicName}
                    onStartEdit={handleTopicEditStart}
                    onSaveEdit={handleTopicUpdate}
                    onCancelEdit={() => setEditingTopicId(null)}
                />
            )}
            
            {view === 'history-detail' && selectedHistoryItem && (
                <div className="space-y-8">
                    <section className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                             {editingTopicId === selectedHistoryItem._id ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input
                                        type="text"
                                        value={newTopicName}
                                        onChange={(e) => setNewTopicName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleTopicUpdate();
                                            if (e.key === 'Escape') setEditingTopicId(null);
                                        }}
                                        className="input-field"
                                        autoFocus
                                    />
                                    <button onClick={handleTopicUpdate} className="p-2 text-green-500 hover:bg-green-100 rounded-full"><FaCheck /></button>
                                    <button onClick={() => setEditingTopicId(null)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FaTimes /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-bold text-gray-800">Flashcards for "{selectedHistoryItem.topic}"</h2>
                                    <button onClick={() => handleTopicEditStart(selectedHistoryItem)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
                                        <FaPencilAlt size="0.8em" />
                                    </button>
                                </div>
                            )}

                            <div>
                                {isEditing ? (
                                    <button onClick={handleSaveChanges} className="btn-primary">
                                        Save Changes
                                    </button>
                                ) : (
                                    <button onClick={handleEditToggle} disabled={currentFlashcards.length === 0} className="px-4 py-2 bg-gray-200 text-[#20BEFF] rounded-lg font-semibold text-sm hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2">
                                        <FaPencilAlt /> Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        {error && <div className="error-box">{error}</div>}

                        {isEditing ? (
                             <div className="flashcard-editor space-y-4">
                                {editedFlashcards.map((card, index) => (
                                    <div key={index} className="flashcard-editor-card">
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <textarea
                                                value={card.question}
                                                onChange={(e) => handleCardChange(index, 'question', e.target.value)}
                                                className="flashcard-editor-textarea"
                                                placeholder="Question"
                                                rows={3}
                                            />
                                            <textarea
                                                value={card.answer}
                                                onChange={(e) => handleCardChange(index, 'answer', e.target.value)}
                                                className="flashcard-editor-textarea"
                                                placeholder="Answer"
                                                rows={3}
                                            />
                                        </div>
                                        <button onClick={() => handleDeleteCard(index)} className="delete-card-btn">
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={handleAddCard} className="add-card-btn">
                                    <FaPlus /> Add Flashcard
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 perspective">
                                {currentFlashcards.map((card, index) => (
                                    <div key={index} className="flip-card h-56" onClick={() => handleCardFlip(index)}>
                                        <div className={`flip-card-inner ${flippedCardIndices.has(index) ? 'is-flipped' : ''}`}>
                                            <div className="flip-card-front"><h3 className="text-lg font-bold">{card.question}</h3></div>
                                            <div className="flip-card-back"><p>{card.answer}</p></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}