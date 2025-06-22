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
  Download, 
  Share2, 
  Award, 
  GraduationCap, 
  Calendar,
  MapPin,
  Star
} from 'lucide-react'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

interface CertificateData {
  studentName: string
  courseName: string
  completionDate: string
  location: string
  certificateId: string
  grade: string
}

const Certificate: React.FC = () => {
  const { user } = useAuth()
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchCertificateData()
  }, [])

  const fetchCertificateData = async () => {
    try {
      // Fetch user profile and certificate data
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (profileData && profileData.certificate_earned) {
        const mockCertificateData: CertificateData = {
          studentName: profileData.full_name,
          courseName: `${profileData.chosen_hobby} Professional Development`,
          completionDate: format(new Date(), 'MMMM dd, yyyy'),
          location: profileData.location,
          certificateId: `CERT-${Date.now().toString().slice(-8)}`,
          grade: 'A+'
        }
        setCertificateData(mockCertificateData)
      }
    } catch (error) {
      console.error('Error fetching certificate data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    setGeneratingPDF(true)
    try {
      const certificateElement = document.getElementById('certificate')
      if (!certificateElement) return

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`certificate-${certificateData?.certificateId}.pdf`)
      
      toast.success('Certificate downloaded successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Professional Certificate',
        text: `I just completed the ${certificateData?.courseName} course!`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Certificate link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your certificate...</p>
        </div>
      </div>
    )
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Available</h2>
          <p className="text-gray-600 mb-4">
            Complete your 3-month trial course to earn your certificate.
          </p>
          <button className="btn-primary">
            Continue Learning
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Certificate of Completion
          </h1>
          <p className="text-gray-600">
            Congratulations on completing your professional development journey!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={generatePDF}
            disabled={generatingPDF}
            className="btn-primary flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
          </button>
          <button
            onClick={shareCertificate}
            className="btn-secondary flex items-center"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share Certificate
          </button>
        </div>

        {/* Certificate Display */}
        <div className="flex justify-center">
          <div 
            id="certificate"
            className="bg-gradient-to-br from-blue-50 to-indigo-100 border-8 border-double border-blue-300 rounded-2xl p-8 w-full max-w-4xl"
            style={{ aspectRatio: '1.414' }}
          >
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-600 rounded-full p-4">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                University of Hobby Excellence
              </h1>
              <p className="text-xl text-gray-600">
                Certificate of Professional Development
              </p>
            </div>

            {/* Certificate Body */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-6">
                This is to certify that
              </p>
              <h2 className="text-3xl font-bold text-primary-600 mb-6 border-b-2 border-primary-300 pb-2">
                {certificateData.studentName}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                has successfully completed the
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                {certificateData.courseName}
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                demonstrating exceptional commitment, dedication, and professional growth
              </p>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-gray-900">Completion Date</span>
                </div>
                <p className="text-gray-700">{certificateData.completionDate}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-gray-900">Location</span>
                </div>
                <p className="text-gray-700">{certificateData.location}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-gray-900">Grade</span>
                </div>
                <p className="text-gray-700">{certificateData.grade}</p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="flex justify-between items-end">
              <div className="text-center">
                <div className="w-32 h-0.5 bg-gray-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Course Director</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Certificate ID: {certificateData.certificateId}
                </p>
                <div className="w-32 h-0.5 bg-gray-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">University Seal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Info */}
        <div className="mt-8 text-center">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About Your Certificate
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Verification</h4>
                <p>This certificate can be verified online using the Certificate ID.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Credits</h4>
                <p>This course represents 90 hours of professional development training.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certificate 