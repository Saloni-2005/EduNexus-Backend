import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/assignments/user/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (assignment) => {
    if (assignment.isSubmitted) return 'bg-green-100 text-green-800 border-green-200';
    
    const daysLeft = getDaysLeft(assignment.dueDate);
    if (daysLeft < 0) return 'bg-red-100 text-red-800 border-red-200';
    if (daysLeft <= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusText = (assignment) => {
    if (assignment.isSubmitted) return 'Submitted';
    
    const daysLeft = getDaysLeft(assignment.dueDate);
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Due Today';
    if (daysLeft === 1) return 'Due Tomorrow';
    return `Due in ${daysLeft} days`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading assignments...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
              <p className="text-gray-600">Track and submit your course assignments</p>
            </div>
            <button
              onClick={() => navigate('/my-courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <i className="fas fa-book mr-2"></i>
              View Courses
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-tasks text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.isSubmitted).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => !a.isSubmitted).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => !a.isSubmitted && getDaysLeft(a.dueDate) < 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tasks text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-4">You don't have any assignments yet.</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">{assignment.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment)}`}>
                          {getStatusText(assignment)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-book mr-2"></i>
                        <span className="mr-4">{assignment.course?.title}</span>
                        <i className="fas fa-calendar-alt mr-2"></i>
                        <span>Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {assignment.isSubmitted ? (
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check-circle mr-2"></i>
                          <span className="font-medium">Submitted</span>
                          {assignment.submission?.submittedAt && (
                            <span className="ml-2 text-sm text-gray-500">
                              on {formatDate(assignment.submission.submittedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <i className="fas fa-clock mr-2"></i>
                          <span>Not submitted</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/courses/${assignment.course?._id}`)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        View Course
                      </button>
                      
                      {!assignment.isSubmitted && (
                        <button
                          onClick={() => navigate(`/submit-assignment/${assignment._id}`)}
                          className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                            getDaysLeft(assignment.dueDate) < 0 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          <i className="fas fa-upload mr-2"></i>
                          Submit Assignment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
