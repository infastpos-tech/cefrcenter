import React, { useState, useEffect } from "react";
import { BookOpen, Search, Filter, ChevronDown, Loader, AlertCircle } from "lucide-react";
import BACKEND_URL from "./config/api";

const WritingComponent = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  const LEVELS = ["all", "A1", "A2", "B1", "B2", "C1"];
  const TYPES = ["all", "essay", "fill-in-blank", "grammar-correction", "sentence-building", "story-writing"];
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchExercises();
    // Check system dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLevel, selectedType]);

  const fetchExercises = async (page = 1, search = "", level = "all", type = "all") => {
    setLoading(true);
    setError(null);
    try {
      let query = `${BACKEND_URL}/api/writing?page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (level !== "all") query += `&level=${level}`;
      if (type !== "all") query += `&type=${type}`;

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
    fetchExercises(1, term, selectedLevel, selectedType);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    fetchExercises(1, searchTerm, level, selectedType);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    fetchExercises(1, searchTerm, selectedLevel, type);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchExercises(page, searchTerm, selectedLevel, selectedType);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const TypeBadge = ({ type }) => {
    const colors = {
      "essay": "bg-blue-100 text-blue-800",
      "fill-in-blank": "bg-green-100 text-green-800",
      "grammar-correction": "bg-yellow-100 text-yellow-800",
      "sentence-building": "bg-purple-100 text-purple-800",
      "story-writing": "bg-pink-100 text-pink-800",
    };
    return (
      <span className={`text-xs px-3 py-1 rounded-full font-medium ${colors[type] || "bg-gray-100"}`}>
        {type.replace("-", " ").toUpperCase()}
      </span>
    );
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

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-gradient-to-r from-blue-600 to-blue-700"} text-white py-12 px-4`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} />
            <h1 className="text-4xl font-bold">Writing Practice</h1>
          </div>
          <p className="text-blue-100">Master your writing skills with diverse exercises</p>
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
                placeholder="Search exercises..."
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
                        ? "bg-blue-600 text-white shadow-lg"
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

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedType === type
                        ? "bg-green-600 text-white shadow-lg"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {type === "all" ? "All Types" : type.replace("-", " ").toUpperCase()}
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
                darkMode
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-800 text-white"
              }`}
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
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
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
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
                  <div className={`${darkMode ? "bg-blue-900" : "bg-blue-50"} p-4`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg flex-1">{exercise.title}</h3>
                      <LevelBadge level={exercise.level} />
                    </div>
                    <TypeBadge type={exercise.type} />
                  </div>
                  <div className="p-4">
                    <p className={`text-sm mb-4 line-clamp-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {exercise.content}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {exercise.vocabulary?.slice(0, 3).map((word, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded ${
                            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
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
                        ? "bg-blue-600 text-white shadow-lg"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedExercise.title}</h2>
                  <div className="flex gap-2">
                    <LevelBadge level={selectedExercise.level} />
                    <TypeBadge type={selectedExercise.type} />
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
                  <h3 className="font-bold mb-2">Content</h3>
                  <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{selectedExercise.content}</p>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Instruction</h3>
                  <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{selectedExercise.instruction}</p>
                </div>

                {selectedExercise.sampleAnswer && (
                  <div>
                    <h3 className="font-bold mb-2">Sample Answer</h3>
                    <p className={`p-3 rounded ${darkMode ? "bg-gray-700 text-gray-200" : "bg-green-50 text-green-900"}`}>
                      {selectedExercise.sampleAnswer}
                    </p>
                  </div>
                )}

                {selectedExercise.hints && selectedExercise.hints.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Hints</h3>
                    <ul className={`space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {selectedExercise.hints.map((hint, idx) => (
                        <li key={idx}>• {hint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-bold mb-2">Duration: {selectedExercise.duration} minutes</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingComponent;
