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
  Calendar, 
  BookOpen, 
  Trophy, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  BarChart3,
  Target,
  Award
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'

interface UserProfile {
  id: string
  full_name: string
  chosen_hobby: string
  trial_start_date: string
  trial_completed: boolean
  certificate_earned: boolean
  current_course_id?: string
}

interface ProgressData {
  totalDays: number
  completedDays: number
  currentStreak: number
  attendanceRate: number
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<ProgressData>({
    totalDays: 0,
    completedDays: 0,
    currentStreak: 0,
    attendanceRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        
        // Calculate progress
        const trialStartDate = new Date(profileData.trial_start_date)
        const today = new Date()
        const totalDays = differenceInDays(today, trialStartDate) + 1
        const maxDays = 90 // 3 months
        
        // Mock progress data (in real app, fetch from attendance table)
        const completedDays = Math.min(Math.floor(totalDays * 0.8), maxDays)
        const currentStreak = Math.min(7, completedDays)
        const attendanceRate = Math.round((completedDays / Math.min(totalDays, maxDays)) * 100)
        
        setProgress({
          totalDays: Math.min(totalDays, maxDays),
          completedDays,
          currentStreak,
          attendanceRate
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentPhase = () => {
    if (!profile) return 'Loading...'
    
    if (!profile.trial_completed) {
      return 'Trial Course'
    } else if (profile.certificate_earned && !profile.current_course_id) {
      return 'Certified Graduate'
    } else {
      return 'Advanced Course'
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Trial Course':
        return 'bg-blue-100 text-blue-800'
      case 'Certified Graduate':
        return 'bg-green-100 text-green-800'
      case 'Advanced Course':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.full_name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Your journey in {profile?.chosen_hobby} continues
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(getCurrentPhase())}`}>
              {getCurrentPhase()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{progress.totalDays}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{progress.completedDays}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{progress.currentStreak} days</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{progress.attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Lesson */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PlayCircle className="h-5 w-5 mr-2 text-primary-600" />
                  Today's Lesson
                </h2>
                <span className="text-sm text-gray-500">
                  Day {progress.completedDays + 1} of {progress.totalDays}
                </span>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  Introduction to Advanced Techniques
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Learn the fundamentals of professional {profile?.chosen_hobby.toLowerCase()} techniques that will set you apart in the industry.
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>15 minutes</span>
                </div>
              </div>
              
              <button className="w-full btn-primary">
                Start Today's Lesson
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Course Progress */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary-600" />
                Course Progress
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Trial Course</span>
                    <span className="text-gray-900">{Math.round((progress.completedDays / progress.totalDays) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((progress.completedDays / progress.totalDays) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {profile?.trial_completed && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Advanced Course</span>
                      <span className="text-gray-900">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-primary-600" />
                Achievements
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">First Week Complete</p>
                    <p className="text-sm text-green-700">Completed 7 consecutive days</p>
                  </div>
                </div>
                
                {progress.completedDays >= 30 && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-blue-900">One Month Milestone</p>
                      <p className="text-sm text-blue-700">Consistent learning for 30 days</p>
                    </div>
                  </div>
                )}
                
                {profile?.trial_completed && (
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <Trophy className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-purple-900">Trial Course Complete</p>
                      <p className="text-sm text-purple-700">Ready for advanced courses</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 