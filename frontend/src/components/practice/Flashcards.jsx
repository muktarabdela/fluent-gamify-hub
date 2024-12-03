import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react'

const Flashcards = ({ exercise }) => {
  console.log(exercise)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const cards = exercise.content
  const currentCard = cards[currentIndex]

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
      {/* Topic Header */}
      <h2 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
        {exercise.topic_name} - Flashcards
      </h2>

      {/* Card Container */}
      <div className="relative w-full max-w-2xl aspect-[4/3] perspective-1000">
        <div
          className={`w-full h-full transition-transform duration-700 ease-in-out transform-style-3d cursor-pointer hover:shadow-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={handleFlip}
        >
          {/* Front of Card */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center h-full border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
              <div className="relative w-56 h-56 mb-6">
                <img
                  src={currentCard?.image_url}
                  alt={currentCard?.word}
                  className="w-full h-full object-cover rounded-xl shadow-lg transform transition-transform hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
              </div>
              <h3 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {currentCard?.word}
              </h3>
              <p className="text-gray-500 mt-4">Click to flip</p>
            </div>
          </div>

          {/* Back of Card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-xl p-8 flex flex-col h-full border-2 border-indigo-200">
              <h4 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Definition
              </h4>
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">{currentCard?.definition}</p>
              <h4 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Examples
              </h4>
              <ul className="space-y-3 text-gray-700">
                {currentCard?.examples?.map((example, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-indigo-500">•</span>
                    <span className="text-lg">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-8 mt-10">
        <button
          onClick={handlePrevious}
          className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        >
          <ChevronLeft className="w-8 h-8 text-indigo-600" />
        </button>
        <button
          onClick={handleFlip}
          className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        >
          <RotateCw className="w-8 h-8 text-indigo-600" />
        </button>
        <button
          onClick={handleNext}
          className="p-4 rounded-full bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        >
          <ChevronRight className="w-8 h-8 text-indigo-600" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 px-6 py-3 bg-white rounded-full shadow-lg">
        <span className="font-semibold text-indigo-600">{currentIndex + 1}</span>
        <span className="text-gray-400 mx-2">/</span>
        <span className="font-semibold text-gray-600">{cards.length}</span>
      </div>
    </div>
  )
}

export default Flashcards
