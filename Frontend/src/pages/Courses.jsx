import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import NavBar from '../components/NavBar';
import { Link } from 'react-router-dom';

export default function Courses(){
  const [courses,setCourses] = useState([]);
  const [courseStats, setCourseStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Newest');
  const [isSearching, setIsSearching] = useState(false);

  const fetch = async (search = '', category = 'All Categories', level = 'All Levels', sort = 'Newest') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All Categories') params.append('category', category);
      if (level !== 'All Levels') params.append('level', level);
      if (sort) params.append('sort', sort);
      
      const res = await API.get(`/courses?${params.toString()}`);
      setCourses(res.data.courses || res.data);
      
      const statsPromises = (res.data.courses || res.data).map(course => 
        API.get(`/courses/${course._id}/stats`).catch(() => null)
      );
      const statsResults = await Promise.all(statsPromises);
      
      const stats = {};
      statsResults.forEach((result, index) => {
        if (result && result.data) {
          stats[(res.data.courses || res.data)[index]._id] = result.data;
        }
      });
      setCourseStats(stats);
    } catch(err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetch(); },[]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsSearching(true);
      fetch(searchTerm, selectedCategory, selectedLevel, sortBy).finally(() => {
        setIsSearching(false);
      });
    }
  };

  const handleSearchButton = () => {
    setIsSearching(true);
    fetch(searchTerm, selectedCategory, selectedLevel, sortBy).finally(() => {
      setIsSearching(false);
    });
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    fetch(searchTerm, e.target.value, selectedLevel, sortBy);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    fetch(searchTerm, selectedCategory, e.target.value, sortBy);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    fetch(searchTerm, selectedCategory, selectedLevel, e.target.value);
  };

  const enroll = async (id) => {
    try {
      await API.post(`/courses/${id}/enroll`);
      alert('Successfully enrolled!');
      fetch(searchTerm, selectedCategory, selectedLevel, sortBy); // Refresh with current filters
    } catch(err) {
      alert(err.response?.data?.message || 'Error enrolling');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading courses...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
          <p className="text-gray-600">Discover and enroll in courses to enhance your skills</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      placeholder="Search courses... (Press Enter to search)"
                      value={searchTerm}
                      onChange={handleSearch}
                      onKeyPress={handleSearchSubmit}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          fetch('', selectedCategory, selectedLevel, sortBy);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSearchButton}
                    disabled={isSearching}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    {isSearching ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search mr-2"></i>
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <select 
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Categories</option>
                  <option>Web Development</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>Programming</option>
                  <option>Business</option>
                  <option>Marketing</option>
                </select>
                <select 
                  value={selectedLevel}
                  onChange={handleLevelChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>All Levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Popular</option>
                  <option>Rating</option>
                  <option>Title</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {(searchTerm || selectedCategory !== 'All Categories' || selectedLevel !== 'All Levels') && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                  <span className="text-blue-800">
                    {isSearching ? 'Searching...' : `Found ${courses.length} course${courses.length !== 1 ? 's' : ''}`}
                    {searchTerm && ` for "${searchTerm}"`}
                    {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
                    {selectedLevel !== 'All Levels' && ` (${selectedLevel} level)`}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All Categories');
                    setSelectedLevel('All Levels');
                    setSortBy('Newest');
                    fetch();
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-600">Check back later for new courses!</p>
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
                      <i className="fas fa-users mr-1"></i>
                      <span>{courseStats[course._id]?.enrollmentCount || 0} students</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-star text-yellow-400 mr-1"></i>
                      <span>{courseStats[course._id]?.averageRating || 0} ({courseStats[course._id]?.totalReviews || 0})</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-clock mr-1"></i>
                      <span>{courseStats[course._id]?.duration || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      to={`/courses/${course._id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-eye mr-2"></i>
                      View Course
                    </Link>
                    <button 
                      onClick={() => enroll(course._id)}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-plus"></i>
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