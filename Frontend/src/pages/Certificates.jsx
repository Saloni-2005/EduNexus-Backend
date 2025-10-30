import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await API.get('/assignments/user/certificates');
      setCertificates(res.data);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading certificates...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
              <p className="text-gray-600">View your earned certificates and achievements</p>
            </div>
            <button
              onClick={() => navigate('/assignments')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <i className="fas fa-tasks mr-2"></i>
              View Assignments
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Achievement Summary</h2>
              <p className="text-yellow-100">You have earned {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-certificate text-4xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates List */}
        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-certificate text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
            <p className="text-gray-600 mb-4">Complete assignments to earn certificates!</p>
            <button
              onClick={() => navigate('/assignments')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Assignments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate, index) => (
              <div key={certificate._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Certificate of Completion</h3>
                      <p className="text-blue-100 text-sm">#{certificate.certificateNumber}</p>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <i className="fas fa-certificate text-2xl"></i>
                    </div>
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="p-6">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {certificate.course?.title}
                    </h4>
                    <p className="text-gray-600 mb-3">
                      Assignment: {certificate.assignment?.title}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-calendar-alt text-blue-600 mr-3 w-4"></i>
                      <span>Issued: {formatDate(certificate.issuedAt)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-user text-blue-600 mr-3 w-4"></i>
                      <span>Instructor: {certificate.course?.instructor?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="fas fa-check-circle text-green-600 mr-3 w-4"></i>
                      <span>Status: {certificate.status === 'issued' ? 'Valid' : 'Revoked'}</span>
                    </div>
                  </div>

                  {/* Certificate Footer */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        EduNexus Learning Platform
                      </div>
                      <button
                        onClick={() => {
                          const certificateData = {
                            course: certificate.course?.title,
                            assignment: certificate.assignment?.title,
                            certificateNumber: certificate.certificateNumber,
                            issuedAt: certificate.issuedAt,
                            instructor: certificate.course?.instructor?.name
                          };
                          navigator.clipboard.writeText(JSON.stringify(certificateData, null, 2));
                          alert('Certificate details copied to clipboard!');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <i className="fas fa-copy mr-1"></i>
                        Copy Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mr-3 mt-1"></i>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">About Certificates</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Certificates are automatically generated when you submit assignments</li>
                <li>• Each certificate has a unique certificate number for verification</li>
                <li>• Certificates serve as proof of completion for course assignments</li>
                <li>• You can share your achievements with employers or educational institutions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
