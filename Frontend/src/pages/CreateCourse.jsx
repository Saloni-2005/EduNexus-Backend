import React, { useState } from 'react';
import API from '../api/axios';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';

export default function CreateCourse(){
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/courses', { title, description });
      alert('Course created successfully!');
      nav('/courses');
    } catch(err) { 
      alert(err.response?.data?.message || 'Error creating course'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <i className="fas fa-graduation-cap text-indigo-600 text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-600">Design and launch your course to share knowledge with students</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white">Course Information</h2>
          </div>
          <div className="p-8">
          <form onSubmit={handle} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Course Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={e=>setTitle(e.target.value)}
                placeholder="Enter an engaging course title"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Course Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e=>setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course"
                rows="6"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Course Preview */}
            {(title || description) && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Course Preview</h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {title || 'Course Title'}
                  </h4>
                  <p className="text-gray-600">
                    {description || 'Course description will appear here...'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => nav('/courses')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !description.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating Course...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Course
                  </>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-start">
            <i className="fas fa-lightbulb text-indigo-600 mr-3 mt-1"></i>
            <div>
              <h4 className="font-medium text-indigo-900 mb-2">Course Creation Tips</h4>
              <ul className="text-sm text-indigo-800 space-y-1">
            <li>• Choose a clear, descriptive title that tells students what they'll learn</li>
            <li>• Write a detailed description including learning objectives and prerequisites</li>
            <li>• You can add lectures and assignments after creating the course</li>
            <li>• Consider adding appropriate category and difficulty level settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}