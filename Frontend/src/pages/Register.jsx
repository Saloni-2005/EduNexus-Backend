import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [role,setRole]=useState('student');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ name, email, password, role });
      nav('/');
    } catch(err){ 
      alert(err.response?.data?.message || 'Register failed'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join EduNexus and start learning today</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
          <form onSubmit={handle} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400"></i>
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e=>setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  role === 'student' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={e=>setRole(e.target.value)}
                    className="sr-only"
                  />
                  <i className="fas fa-graduation-cap text-2xl mb-2 text-blue-600"></i>
                  <span className="text-sm font-medium text-gray-900">Student</span>
                  <span className="text-xs text-gray-500 text-center">Learn new skills</span>
                </label>
                
                <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  role === 'instructor' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="instructor"
                    checked={role === 'instructor'}
                    onChange={e=>setRole(e.target.value)}
                    className="sr-only"
                  />
                  <i className="fas fa-chalkboard-teacher text-2xl mb-2 text-green-600"></i>
                  <span className="text-sm font-medium text-gray-900">Instructor</span>
                  <span className="text-xs text-gray-500 text-center">Teach others</span>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  Create account
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}