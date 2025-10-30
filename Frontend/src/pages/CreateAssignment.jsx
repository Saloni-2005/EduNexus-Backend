import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';

export default function CreateAssignment(){
  const { courseId } = useParams();
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [dueDate,setDueDate] = useState('');
  const [creating, setCreating] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post(`/assignments/${courseId}`, { title, description, dueDate });
      alert('Assignment created successfully!');
      nav(`/courses/${courseId}`);
    } catch(err){ 
      alert(err.response?.data?.message || 'Error creating assignment'); 
      setCreating(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => nav(`/courses/${courseId}`)}
            className="text-green-600 hover:text-green-800 flex items-center mb-4 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Course
          </button>
          <div className="flex items-center mb-2">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <i className="fas fa-tasks text-green-600 text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Assignment</h1>
              <p className="text-gray-600">Add assignments for your students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white">Assignment Details</h2>
          </div>

          <form onSubmit={handle} className="p-6 md:p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-heading mr-2 text-green-600"></i>
                Assignment Title
              </label>
              <input 
                type="text"
                value={title} 
                onChange={e=>setTitle(e.target.value)}
                placeholder="e.g., Project Report, Week 1 Quiz"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-align-left mr-2 text-green-600"></i>
                Description
              </label>
              <textarea 
                value={description} 
                onChange={e=>setDescription(e.target.value)}
                placeholder="Provide detailed instructions for students..."
                rows="6"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
              ></textarea>
              <p className="text-xs text-gray-500 mt-2">
                Include submission guidelines, formatting requirements, and evaluation criteria
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-calendar-alt mr-2 text-green-600"></i>
                Due Date
              </label>
              <input 
                type="datetime-local" 
                value={dueDate} 
                onChange={e=>setDueDate(e.target.value)}
                min={getMinDate()}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={creating}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {creating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle mr-2"></i>
                    Create Assignment
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => nav(`/courses/${courseId}`)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-lightbulb text-green-600 mr-3 mt-1"></i>
            <div>
              <h4 className="font-medium text-green-900 mb-1">Tips for Creating Effective Assignments</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Set clear, specific learning objectives</li>
                <li>• Provide rubrics and grading criteria</li>
                <li>• Include examples or templates when possible</li>
                <li>• Give students enough time to complete the work</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}