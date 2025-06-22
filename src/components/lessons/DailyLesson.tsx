/*
BSD 3-Clause License

Copyright (c) 2025, paulmicky1
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Clock,
  BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Question {
  id: string
  question_text: string
  options: string[]
  correct_answer: number
}

interface Lesson {
  id: string
  title: string
  video_url: string
  questions: Question[]
  day_number: number
}

const DailyLesson: React.FC = () => {
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [videoWatched, setVideoWatched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [videoProgress, setVideoProgress] = useState(0)

  useEffect(() => {
    fetchTodayLesson()
  }, [])

  const fetchTodayLesson = async () => {
    try {
      // Mock lesson data - in real app, fetch from Supabase
      const mockLesson: Lesson = {
        id: '1',
        title: 'Introduction to Professional Techniques',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Mock video
        day_number: 1,
        questions: [
          {
            id: '1',
            question_text: 'What is the most important aspect of professional development?',
            options: [
              'Consistency in practice',
              'Natural talent',
              'Expensive equipment',
              'Social media presence'
            ],
            correct_answer: 0
          },
          {
            id: '2',
            question_text: 'How often should you practice to see significant improvement?',
            options: [
              'Once a month',
              'Once a week',
              'Daily',
              'Only when inspired'
            ],
            correct_answer: 2
          },
          {
            id: '3',
            question_text: 'What is the key to building a professional portfolio?',
            options: [
              'Quantity over quality',
              'Quality over quantity',
              'Following trends only',
              'Copying others\' work'
            ],
            correct_answer: 1
          }
        ]
      }
      
      setLesson(mockLesson)
    } catch (error) {
      console.error('Error fetching lesson:', error)
      toast.error('Failed to load today\'s lesson')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress)
    if (progress >= 90) { // Mark as watched when 90% complete
      setVideoWatched(true)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleQuizSubmit = async () => {
    if (selectedAnswers.length < lesson!.questions.length) {
      toast.error('Please answer all questions')
      return
    }

    const correctAnswers = selectedAnswers.filter((answer, index) => 
      answer === lesson!.questions[index].correct_answer
    ).length

    const score = Math.round((correctAnswers / lesson!.questions.length) * 100)

    try {
      // Save progress to Supabase
      const { error } = await supabase
        .from('user_progress')
        .insert([
          {
            user_id: user?.id,
            lesson_id: lesson!.id,
            quiz_score: score,
            completed_at: new Date().toISOString()
          }
        ])

      if (error) throw error

      // Mark attendance
      await supabase
        .from('user_attendance')
        .insert([
          {
            user_id: user?.id,
            date: new Date().toISOString().split('T')[0],
            logged_in: true,
            lesson_completed: true
          }
        ])

      setQuizCompleted(true)
      toast.success(`Quiz completed! Score: ${score}%`)
    } catch (error) {
      console.error('Error saving progress:', error)
      toast.error('Failed to save progress')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading today's lesson...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Lesson Available</h2>
          <p className="text-gray-600">Check back tomorrow for your next lesson.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Day {lesson.day_number} Lesson
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>15 minutes</span>
            </div>
          </div>
          <h2 className="text-xl text-gray-700">{lesson.title}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <iframe
                  src={lesson.video_url}
                  className="w-full h-64 md:h-80"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Daily Lesson Video"
                ></iframe>
                
                {/* Video Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 p-2">
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Video Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-600 hover:text-gray-900">
                    <Play className="h-5 w-5 mr-1" />
                    Play
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-gray-900">
                    <Volume2 className="h-5 w-5 mr-1" />
                    Volume
                  </button>
                </div>
                <button className="flex items-center text-gray-600 hover:text-gray-900">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>

              {/* Video Progress Status */}
              {videoWatched && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Video watched! Ready for quiz.</span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Section */}
          <div className="space-y-6">
            {!showQuiz && videoWatched && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ready for Today's Quiz?
                </h3>
                <p className="text-gray-600 mb-4">
                  Test your knowledge with {lesson.questions.length} questions about today's lesson.
                </p>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="w-full btn-primary"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {showQuiz && !quizCompleted && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {currentQuestion + 1} of {lesson.questions.length}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {Math.round(((currentQuestion + 1) / lesson.questions.length) * 100)}%
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-gray-900 mb-4">
                    {lesson.questions[currentQuestion].question_text}
                  </p>
                  
                  <div className="space-y-3">
                    {lesson.questions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestion, index)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedAnswers[currentQuestion] === index
                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  {currentQuestion > 0 && (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      className="btn-secondary"
                    >
                      Previous
                    </button>
                  )}
                  
                  {currentQuestion < lesson.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="btn-primary ml-auto"
                      disabled={selectedAnswers[currentQuestion] === undefined}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizSubmit}
                      className="btn-primary ml-auto"
                      disabled={selectedAnswers.some(answer => answer === undefined)}
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            )}

            {quizCompleted && (
              <div className="card">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Quiz Completed!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Great job completing today's lesson and quiz.
                  </p>
                  <button className="btn-primary">
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyLesson 