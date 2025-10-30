import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';

export default function InstructorAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/assignments/instructor/assignments');
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
              <p className="text-gray-600">Manage your assignments and view submissions</p>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-tasks text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">
                          {assignment.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-3">
                        <strong>Course:</strong> {assignment.course?.title}
                      </p>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {assignment.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-600">Total Submissions</p>
                      <p className="text-2xl font-bold text-blue-800">{assignment.submissionStats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-600">Graded</p>
                      <p className="text-2xl font-bold text-green-800">
                        {assignment.submissionStats.graded}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {assignment.submissionStats.pending}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/submissions?assignment=${assignment._id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-eye mr-2"></i>
                      View Submissions
                    </button>
                    <button
                      onClick={() => navigate(`/create-assignment/${assignment.course._id}?edit=${assignment._id}`)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
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