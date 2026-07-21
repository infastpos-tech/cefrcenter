import React, { useState, useEffect } from "react";
import { Headphones, Search, Loader, AlertCircle, Play } from "lucide-react";
import BACKEND_URL from "./config/api";

const ListeningComponent = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedAccent, setSelectedAccent] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [playingId, setPlayingId] = useState(null);

  const LEVELS = ["all", "A1", "A2", "B1", "B2", "C1"];
  const ACCENTS = ["all", "British", "American", "Australian", "General"];
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchExercises();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedAccent]);

  const fetchExercises = async (page = 1, search = "", level = "all", accent = "all") => {
    setLoading(true);
    setError(null);
    try {
      let query = `${BACKEND_URL}/api/listening?page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (level !== "all") query += `&level=${level}`;
      if (accent !== "all") query += `&accent=${accent}`;

      const response = await fetch(query);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      
      const data = await response.json();
      setExercises(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err.message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchExercises(1, term, selectedLevel, selectedAccent);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    fetchExercises(1, searchTerm, level, selectedAccent);
  };

  const handleAccentChange = (accent) => {
    setSelectedAccent(accent);
    fetchExercises(1, searchTerm, selectedLevel, accent);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchExercises(page, searchTerm, selectedLevel, selectedAccent);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const LevelBadge = ({ level }) => {
    const colors = {
      "A1": "bg-green-500",
      "A2": "bg-green-600",
      "B1": "bg-yellow-500",
      "B2": "bg-orange-500",
      "C1": "bg-red-500",
    };
    return (
      <span className={`text-white text-sm font-bold px-3 py-1 rounded ${colors[level]}`}>
        {level}
      </span>
    );
  };

  const AccentBadge = ({ accent }) => {
    const colors = {
      "British": "bg-blue-100 text-blue-800",
      "American": "bg-green-100 text-green-800",
      "Australian": "bg-purple-100 text-purple-800",
      "General": "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[accent] || "bg-gray-100"}`}>
        {accent}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-orange-600 to-orange-700"} text-white py-12 px-4`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Headphones size={32} />
            <h1 className="text-4xl font-bold">Listening Practice</h1>
          </div>
          <p className={`${darkMode ? "text-orange-300" : "text-orange-100"}`}>Develop your listening skills with authentic audio</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-8`}>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search listening exercises..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedLevel === level
                        ? "bg-orange-600 text-white shadow-lg"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {level === "all" ? "All Levels" : level}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Accent</label>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent}
                    onClick={() => handleAccentChange(accent)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                      selectedAccent === accent
                        ? "bg-orange-600 text-white shadow-lg"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {accent}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                darkMode ? "bg-yellow-600 text-white" : "bg-gray-800 text-white"
              }`}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className={`${darkMode ? "bg-red-900 border-red-700" : "bg-red-50 border-red-300"} border rounded-lg p-4 mb-8 flex items-center gap-3`}>
            <AlertCircle className="text-red-600" size={24} />
            <p className={darkMode ? "text-red-200" : "text-red-800"}>Error: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader className="animate-spin mx-auto mb-4" size={40} />
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Loading exercises...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && exercises.length === 0 && (
          <div className={`${darkMode ? "bg-gray-800" : "bg-gray-50"} rounded-lg p-12 text-center`}>
            <Headphones size={48} className="mx-auto mb-4 opacity-50" />
            <p className={`text-lg font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              No exercises found
            </p>
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Exercises Grid */}
        {!loading && exercises.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {exercises.map((exercise) => (
                <div
                  key={exercise._id}
                  className={`${
                    darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:shadow-lg"
                  } rounded-lg shadow-md overflow-hidden transition-all hover:scale-105`}
                >
                  <div className={`${darkMode ? "bg-orange-900" : "bg-orange-50"} p-4 flex items-start justify-between`}>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{exercise.title}</h3>
                      <LevelBadge level={exercise.level} />
                    </div>
                    <button
                      onClick={() => {
                        setPlayingId(playingId === exercise._id ? null : exercise._id);
                        if (exercise.audioUrl) {
                          const audio = new Audio(exercise.audioUrl);
                          audio.play().catch(() => setError("Audio playback not available"));
                        }
                      }}
                      className={`p-3 rounded-full transition-all ${
                        playingId === exercise._id
                          ? "bg-orange-600 text-white"
                          : darkMode
                          ? "bg-gray-700 text-orange-400 hover:bg-gray-600"
                          : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                      }`}
                    >
                      <Play size={20} />
                    </button>
                  </div>
                  <div className="p-4">
                    <AccentBadge accent={exercise.accent || "General"} />
                    <p className={`text-sm mt-3 mb-4 line-clamp-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {exercise.transcript}
                    </p>
                    {exercise.questions && exercise.questions.length > 0 && (
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        📝 {exercise.questions.length} questions • {exercise.duration}s audio
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedExercise(exercise)}
                    className={`w-full p-3 font-medium transition-colors ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-orange-400"
                        : "bg-gray-100 hover:bg-gray-200 text-orange-600"
                    }`}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === page
                        ? "bg-orange-600 text-white shadow-lg"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-2xl max-w-2xl w-full my-8`}>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedExercise.title}</h2>
                  <div className="flex gap-2">
                    <LevelBadge level={selectedExercise.level} />
                    <AccentBadge accent={selectedExercise.accent || "General"} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className={`text-2xl font-bold ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-black"}`}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Audio Player */}
                <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-orange-50"}`}>
                  <button
                    onClick={() => {
                      if (selectedExercise.audioUrl) {
                        const audio = new Audio(selectedExercise.audioUrl);
                        audio.play().catch(() => setError("Audio playback not available"));
                      }
                    }}
                    className="flex items-center gap-3 w-full justify-center py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Play size={20} fill="white" />
                    <span className="font-medium">Play Audio ({selectedExercise.duration}s)</span>
                  </button>
                </div>

                {/* Transcript */}
                <div>
                  <h3 className="font-bold mb-2">Transcript</h3>
                  <p className={`p-3 rounded leading-relaxed ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-900"}`}>
                    {selectedExercise.transcript}
                  </p>
                </div>

                {/* Summary */}
                {selectedExercise.summary && (
                  <div>
                    <h3 className="font-bold mb-2">Summary</h3>
                    <p className={`p-3 rounded ${darkMode ? "bg-gray-700 text-gray-200" : "bg-blue-50 text-blue-900"}`}>
                      {selectedExercise.summary}
                    </p>
                  </div>
                )}

                {/* Questions */}
                {selectedExercise.questions && selectedExercise.questions.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Questions ({selectedExercise.questions.length})</h3>
                    <div className="space-y-3">
                      {selectedExercise.questions.slice(0, 2).map((q, idx) => (
                        <div key={idx} className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                          <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                          <ul className={`text-sm space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {q.options.map((opt, i) => (
                              <li key={i} className={q.correctAnswer === opt ? "font-medium text-green-600" : ""}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Points */}
                {selectedExercise.keyPoints && selectedExercise.keyPoints.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Key Points</h3>
                    <ul className={`space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {selectedExercise.keyPoints.map((point, idx) => (
                        <li key={idx}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeningComponent;
