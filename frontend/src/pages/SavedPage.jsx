import React, { useState } from "react";
import { Bookmark, Search, Filter } from "lucide-react";

const SavedPage = () => {
  const [filter, setFilter] = useState("all");
  
  // Example saved items (replace with your actual data)
  const savedItems = [
    {
      id: 1,
      title: "Basic Conversation Practice",
      type: "exercise",
      difficulty: "beginner",
      savedAt: "2024-03-15",
      description: "Practice common everyday conversations",
    },
    {
      id: 2,
      title: "Advanced Grammar Quiz",
      type: "quiz",
      difficulty: "advanced",
      savedAt: "2024-03-14",
      description: "Test your knowledge of complex grammar rules",
    },
    // Add more items as needed
  ];

  const filterTypes = [
    { label: "All", value: "all" },
    { label: "Exercises", value: "exercise" },
    { label: "Quizzes", value: "quiz" },
  ];

  const filteredItems = savedItems.filter(item => 
    filter === "all" ? true : item.type === filter
  );

  return (
    <div className="max-w-[430px] mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bookmark className="w-6 h-6" />
          Saved Items
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search saved items..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === type.value
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Saved Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {item.type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {item.difficulty}
                  </span>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-primary"
                aria-label="Remove from saved"
              >
                <Bookmark className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No saved items found</p>
        </div>
      )}
    </div>
  );
};

export default SavedPage; 