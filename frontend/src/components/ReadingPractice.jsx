import React, { useState, useEffect } from "react";
import { BookMarked, Search, Loader, AlertCircle } from "lucide-react";
import BACKEND_URL from "./config/api";

const ReadingComponent = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  const LEVELS = ["all", "A1", "A2", "B1", "B2", "C1"];
  const THEMES = ["all", "daily-life", "leisure", "environment", "education", "health"];
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchExercises();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedTheme]);

  const fetchExercises = async (page = 1, search = "", level = "all", theme = "all") => {
    setLoading(true);
    setError(null);
    try {
      let query = `${BACKEND_URL}/api/reading?page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (level !== "all") query += `&level=${level}`;
      if (theme !== "all") query += `&theme=${theme}`;

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
    fetchExercises(1, term, selectedLevel, selectedTheme);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    fetchExercises(1, searchTerm, level, selectedTheme);
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    fetchExercises(1, searchTerm, selectedLevel, theme);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchExercises(page, searchTerm, selectedLevel, selectedTheme);
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

  const calculateReadingTime = (text) => {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-purple-600 to-purple-700"} text-white py-12 px-4`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookMarked size={32} />
            <h1 className="text-4xl font-bold">Reading Practice</h1>
          </div>
          <p className={`${darkMode ? "text-purple-300" : "text-purple-100"}`}>Enhance your comprehension and vocabulary</p>
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
                placeholder="Search passages..."
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
                        ? "bg-purple-600 text-white shadow-lg"
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

            {/* Theme Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={selectedTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme === "all" ? "All Themes" : theme.replace("-", " ").toUpperCase()}
                  </option>
                ))}
              </select>
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
            <BookMarked size={48} className="mx-auto mb-4 opacity-50" />
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
                  onClick={() => setSelectedExercise(exercise)}
                  className={`${
                    darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:shadow-lg"
                  } rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:scale-105`}
                >
                  <div className={`${darkMode ? "bg-purple-900" : "bg-purple-50"} p-4`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg flex-1">{exercise.title}</h3>
                      <LevelBadge level={exercise.level} />
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        darkMode ? "bg-gray-700 text-gray-300" : "bg-purple-100 text-purple-800"
                      }`}>
                        {exercise.theme || "General"}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        darkMode ? "bg-gray-700 text-gray-300" : "bg-purple-100 text-purple-800"
                      }`}>
                        ~{calculateReadingTime(exercise.passage)} min
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className={`text-sm mb-4 line-clamp-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {exercise.passage}
                    </p>
                    {exercise.questions && exercise.questions.length > 0 && (
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        📝 {exercise.questions.length} questions
                      </p>
                    )}
                  </div>
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
                        ? "bg-purple-600 text-white shadow-lg"
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
                    {selectedExercise.theme && (
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        darkMode ? "bg-gray-700 text-gray-300" : "bg-purple-100 text-purple-800"
                      }`}>
                        {selectedExercise.theme}
                      </span>
                    )}
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
                <div>
                  <h3 className="font-bold mb-2">Passage</h3>
                  <p className={`p-3 rounded leading-relaxed ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-900"}`}>
                    {selectedExercise.passage}
                  </p>
                </div>

                {selectedExercise.questions && selectedExercise.questions.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Questions ({selectedExercise.questions.length})</h3>
                    <div className="space-y-3">
                      {selectedExercise.questions.slice(0, 2).map((q, idx) => (
                        <div key={idx} className={`p-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                          <p className="font-medium mb-2">{idx + 1}. {q.question}</p>
                          <ul className={`text-sm space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {q.options.map((opt, i) => (
                              <li key={i}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {selectedExercise.questions.length > 2 && (
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          + {selectedExercise.questions.length - 2} more questions
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedExercise.vocabulary && selectedExercise.vocabulary.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Vocabulary</h3>
                    <div className="space-y-2">
                      {selectedExercise.vocabulary.slice(0, 3).map((v, idx) => (
                        <div key={idx} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          <span className="font-medium">{v.word}:</span> {v.definition}
                        </div>
                      ))}
                    </div>
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

export default ReadingComponent;
