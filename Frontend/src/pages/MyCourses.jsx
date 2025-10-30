import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseStats, setCourseStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get('/courses/user/enrolled');
      setCourses(res.data);
      
      // Fetch stats for each course
      const statsPromises = res.data.map(course => 
        API.get(`/courses/${course._id}/stats`).catch(() => null)
      );
      const statsResults = await Promise.all(statsPromises);
      
      const stats = {};
      statsResults.forEach((result, index) => {
        if (result && result.data) {
          stats[res.data[index]._id] = result.data;
        }
      });
      setCourseStats(stats);
    } catch(err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyCourses(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading your courses...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-600">Continue your learning journey with your enrolled courses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-book text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(course => {
                    const stats = courseStats[course._id];
                    return stats && stats.progress >= 100;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.filter(course => {
                    const stats = courseStats[course._id];
                    return stats && stats.progress > 0 && stats.progress < 100;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled</h3>
            <p className="text-gray-600 mb-6">Start your learning journey by enrolling in courses!</p>
            <Link 
              to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-search mr-2"></i>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <i className="fas fa-book text-6xl text-white opacity-80"></i>
                </div>
                
                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                    {courseStats[course._id]?.isNew && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                  
                  {/* Course Meta Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {course.category || 'Programming'}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      {course.level || 'Beginner'}
                    </span>
                    {course.price > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        ${course.price}
                      </span>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-600">
                        {courseStats[course._id]?.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{width: `${courseStats[course._id]?.progress || 0}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-600 text-sm"></i>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{course.instructor?.name}</p>
                      <p className="text-xs text-gray-500">Instructor</p>
                    </div>
                  </div>
                  
                  {/* Course Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <i className="fas fa-clock mr-1"></i>
                      <span>{courseStats[course._id]?.duration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span>{courseStats[course._id]?.averageRating || 0}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/courses/${course._id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-play mr-2"></i>
                      Continue
                    </Link>
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
