import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard(){
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async (refresh = false) => {
    try {
      setLoading(true);
      const url = refresh ? '/users/dashboard/stats?refresh=true' : '/users/dashboard/stats';
  const res = await API.get(url);
  setStats(res.data);
    } catch(err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStudentDashboard = () => (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100 text-lg">Ready to continue your learning journey?</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="fas fa-graduation-cap text-4xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/my-courses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeCourses || 0}</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/assignments')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAssignments || 0}</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/assignments')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-orange-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.upcomingDeadlines || 0}</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/certificates')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-certificate text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.certificates || 0}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchStats(true);
              }}
              className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
              title="Refresh certificate count"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
          <div className="space-y-4">
            {stats?.recentCourses && stats.recentCourses.length > 0 ? (
              stats.recentCourses.map((course, index) => (
                <div 
                  key={course.id} 
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className={`w-10 h-10 ${index % 2 === 0 ? 'bg-blue-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                    <i className={`fas ${index % 2 === 0 ? 'fa-code text-blue-600' : 'fa-database text-green-600'}`}></i>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className={`${index % 2 === 0 ? 'bg-blue-600' : 'bg-green-600'} h-2 rounded-full`} style={{width: `${course.progress}%`}}></div>
                  </div>
                  <i className="fas fa-external-link-alt text-gray-400"></i>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No courses enrolled yet</p>
                <Link to="/courses" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                  Browse courses
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {stats?.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
              stats.upcomingDeadlines.map((assignment, index) => {
                const dueDate = new Date(assignment.dueDate);
                const now = new Date();
                const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={assignment.id} className={`flex items-center p-4 ${daysLeft <= 2 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'} rounded-lg`}>
                    <div className={`w-10 h-10 ${daysLeft <= 2 ? 'bg-red-100' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                      <i className={`fas ${daysLeft <= 2 ? 'fa-exclamation text-red-600' : 'fa-clock text-yellow-600'}`}></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">{assignment.course}</p>
                      <p className={`text-sm ${daysLeft <= 2 ? 'text-red-600' : 'text-yellow-600'}`}>
                        Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-calendar text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderInstructorDashboard = () => (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-green-100 text-lg">Manage your courses and track student progress</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="fas fa-chalkboard-teacher text-4xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/instructor-courses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.createdCourses || 0}</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/instructor-assignments')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAssignments || 0}</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/instructor-students')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/submissions')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-orange-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingSubmissions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
          <div className="space-y-4">
            {stats?.recentCourses && stats.recentCourses.length > 0 ? (
              stats.recentCourses.map((course, index) => (
                <div 
                  key={course.id} 
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className={`w-10 h-10 ${index % 2 === 0 ? 'bg-green-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                    <i className={`fas ${index % 2 === 0 ? 'fa-graduation-cap text-green-600' : 'fa-book text-blue-600'}`}></i>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.studentCount} students enrolled</p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <i className="fas fa-external-link-alt text-gray-400"></i>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No courses created yet</p>
                <Link to="/create-course" className="text-green-600 hover:text-green-800 mt-2 inline-block">
                  Create your first course
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
          <div className="space-y-4">
            {stats?.courseStats && stats.courseStats.length > 0 ? (
              stats.courseStats.map((course, index) => (
                <div key={course.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 ${index % 2 === 0 ? 'bg-purple-100' : 'bg-orange-100'} rounded-lg flex items-center justify-center`}>
                    <i className={`fas ${index % 2 === 0 ? 'fa-chart-bar text-purple-600' : 'fa-tasks text-orange-600'}`}></i>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span><i className="fas fa-users mr-1"></i>{course.studentCount} students</span>
                      <span><i className="fas fa-tasks mr-1"></i>{course.assignmentCount} assignments</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <i className="fas fa-chart-bar text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No course statistics available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-purple-100 text-lg">System overview and management</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="fas fa-cogs text-4xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/courses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCourses || 0}</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/admin')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/courses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAssignments || 0}</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/courses')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-300 cursor-pointer transition-all"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-orange-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalSubmissions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
        <div className="space-y-4">
          {stats?.recentCourses && stats.recentCourses.length > 0 ? (
            stats.recentCourses.map((course, index) => (
              <div 
                key={course.id} 
                onClick={() => navigate(`/courses/${course.id}`)}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className={`w-10 h-10 ${index % 2 === 0 ? 'bg-purple-100' : 'bg-pink-100'} rounded-lg flex items-center justify-center`}>
                  <i className={`fas ${index % 2 === 0 ? 'fa-graduation-cap text-purple-600' : 'fa-book text-pink-600'}`}></i>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium text-gray-900">{course.title}</h4>
                  <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                  <p className="text-sm text-gray-600">{course.studentCount} students enrolled</p>
                </div>
                <div className="text-sm text-gray-500 mr-2">
                  {new Date(course.createdAt).toLocaleDateString()}
                </div>
                <i className="fas fa-external-link-alt text-gray-400"></i>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-book text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No courses available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats?.role === 'student' && renderStudentDashboard()}
        {stats?.role === 'instructor' && renderInstructorDashboard()}
        {stats?.role === 'admin' && renderAdminDashboard()}
      </div>
    </div>
  );
}