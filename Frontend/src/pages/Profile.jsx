import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Fetch user's dashboard stats
      const statsRes = await API.get('/users/dashboard/stats');
      setProfileData(statsRes.data);
    } catch(err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfileData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your learning progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user text-white text-3xl"></i>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-600 mb-2">{user?.email}</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user?.role === 'instructor' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Account status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {user?.role === 'student' ? 'Learning Statistics' : 'Teaching Statistics'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user?.role === 'student' ? (
                  // Student Stats
                  <>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-book text-blue-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.activeCourses || 0}</p>
                      <p className="text-sm text-gray-600">Active Courses</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-tasks text-green-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.totalAssignments || 0}</p>
                      <p className="text-sm text-gray-600">Assignments</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-check-circle text-purple-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.submittedAssignments || 0}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-certificate text-yellow-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.certificates || 0}</p>
                      <p className="text-sm text-gray-600">Certificates</p>
                    </div>
                  </>
                ) : (
                  // Instructor Stats
                  <>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-book text-blue-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.createdCourses || 0}</p>
                      <p className="text-sm text-gray-600">Created Courses</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-tasks text-green-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.totalAssignments || 0}</p>
                      <p className="text-sm text-gray-600">Total Assignments</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-users text-purple-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.totalStudents || 0}</p>
                      <p className="text-sm text-gray-600">Total Students</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="fas fa-file-alt text-orange-600 text-xl"></i>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profileData?.pendingSubmissions || 0}</p>
                      <p className="text-sm text-gray-600">Pending Reviews</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              
              {profileData?.recentCourses && profileData.recentCourses.length > 0 ? (
                <div className="space-y-4">
                  {profileData.recentCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="fas fa-book text-blue-600"></i>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600">Progress: {course.progress}%</p>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: `${course.progress}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.role === 'student' ? (
                <>
                  <Link 
                    to="/my-courses"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
                  >
                    <i className="fas fa-book text-2xl mb-2"></i>
                    <h4 className="font-medium">My Courses</h4>
                    <p className="text-sm opacity-90">View enrolled courses</p>
                  </Link>
                  
                  <Link 
                    to="/courses"
                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
                  >
                    <i className="fas fa-search text-2xl mb-2"></i>
                    <h4 className="font-medium">Browse Courses</h4>
                    <p className="text-sm opacity-90">Discover new courses</p>
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/instructor-courses"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors"
                  >
                    <i className="fas fa-chalkboard-teacher text-2xl mb-2"></i>
                    <h4 className="font-medium">My Courses</h4>
                    <p className="text-sm opacity-90">Manage your courses</p>
                  </Link>
                  
                  <Link 
                    to="/instructor-assignments"
                    className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors"
                  >
                    <i className="fas fa-tasks text-2xl mb-2"></i>
                    <h4 className="font-medium">Assignments</h4>
                    <p className="text-sm opacity-90">Manage assignments</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
