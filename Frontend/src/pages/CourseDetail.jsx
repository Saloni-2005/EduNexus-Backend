import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail(){
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [courseStats, setCourseStats] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lectures');

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/courses/${id}`);
      setCourse(res.data);
      
      // Fetch course stats
      const statsRes = await API.get(`/courses/${id}/stats`);
      setCourseStats(statsRes.data);
      
      // Fetch user progress if enrolled
      try {
        const progressRes = await API.get(`/courses/${id}/progress`);
        setUserProgress(progressRes.data);
      } catch (err) {
        // User might not be enrolled, that's okay
        console.log('Could not fetch progress:', err.response?.data?.message);
      }
      
      const l = await API.get(`/lectures/course/${id}`);
      setLectures(l.data);
      const d = await API.get(`/discussions/${id}`);
      setDiscussions(d.data);
      
      // Fetch course ratings
      try {
        const ratingsRes = await API.get(`/courses/${id}/ratings`);
        setRatings(ratingsRes.data.ratings);
      } catch (err) {
        console.log('Could not fetch ratings:', err.response?.data?.message);
      }
    } catch(err){ 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetch(); },[id]);

  const postMsg = async () => {
    if (!msg.trim()) return;
    try {
      await API.post(`/discussions/${id}`, { message: msg });
      setMsg('');
      const d = await API.get(`/discussions/${id}`);
      setDiscussions(d.data);
    } catch(err){ console.error(err); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Loading course...</p>
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
        {/* Back Button */}
        <Link 
          to="/courses" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to courses
        </Link>

        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course?.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{course?.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <i className="fas fa-user mr-2"></i>
                  <span>Instructor: {course?.instructor?.name}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-users mr-2"></i>
                  <span>{courseStats?.enrollmentCount || 0} students</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock mr-2"></i>
                  <span>{courseStats?.duration || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-star text-yellow-400 mr-1"></i>
                  <span>{courseStats?.averageRating || 0} ({courseStats?.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Course Progress</h3>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-2">
                  <div className="bg-white h-2 rounded-full" style={{width: `${userProgress?.progress || 0}%`}}></div>
                </div>
                <p className="text-sm">{userProgress?.progress || 0}% Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('lectures')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'lectures'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-play mr-2"></i>
                Lectures ({lectures.length})
              </button>
              <button
                onClick={() => setActiveTab('discussions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'discussions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-comments mr-2"></i>
                Discussions ({discussions.length})
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ratings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="fas fa-star mr-2"></i>
                Ratings ({ratings.length})
              </button>
              {user?.role === 'instructor' && (
                <button
                  onClick={() => setActiveTab('instructor')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'instructor'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fas fa-cog mr-2"></i>
                  Instructor Tools
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {/* Lectures Tab */}
            {activeTab === 'lectures' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Lectures</h3>
                {lectures.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">No lectures available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lectures.map((lecture, index) => (
                      <div key={lecture._id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mr-3">
                                {index + 1}
                              </span>
                              <h4 className="text-lg font-medium text-gray-900">{lecture.title}</h4>
                            </div>
                            <p className="text-gray-600 mb-4">{lecture.description}</p>
                            {lecture.videoPath && (
                              <div className="bg-black rounded-lg overflow-hidden">
                                <video 
                                  width="100%" 
                                  controls 
                                  className="w-full"
                                  src={`http://localhost:5000/${lecture.videoPath}`}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Discussions</h3>
                
                {/* Post Message */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-blue-600"></i>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={msg}
                        onChange={e => setMsg(e.target.value)}
                        placeholder="Share your thoughts or ask a question..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={postMsg}
                          disabled={!msg.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <i className="fas fa-paper-plane mr-2"></i>
                          Post Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Discussion Messages */}
                <div className="space-y-4">
                  {discussions.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-comments text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600">No discussions yet. Start the conversation!</p>
                    </div>
                  ) : (
                    discussions.map(d => (
                      <div key={d._id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-600"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{d.user?.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(d.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{d.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Ratings Tab */}
            {activeTab === 'ratings' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Course Ratings & Reviews</h3>
                  {user?.role === 'student' && course?.students?.includes(user._id) && (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-star mr-2"></i>
                      Rate Course
                    </button>
                  )}
                </div>
                
                {ratings.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-star text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">No ratings yet. Be the first to rate this course!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-blue-600 text-sm"></i>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{rating.user?.name || 'Anonymous'}</p>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-sm ${
                                      star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {rating.review && (
                          <p className="text-gray-700 mt-2">{rating.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instructor Tools Tab */}
            {activeTab === 'instructor' && user?.role === 'instructor' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to={`/upload-lecture/${id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors"
                  >
                    <i className="fas fa-upload text-3xl mb-3"></i>
                    <h4 className="font-medium">Upload Lecture</h4>
                    <p className="text-sm opacity-90">Add new video content</p>
                  </Link>
                  <Link
                    to={`/create-assignment/${id}`}
                    className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-center transition-colors"
                  >
                    <i className="fas fa-tasks text-3xl mb-3"></i>
                    <h4 className="font-medium">Create Assignment</h4>
                    <p className="text-sm opacity-90">Add new assignments</p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rating Modal */}
      <RatingModal
        courseId={id}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onRatingSubmitted={() => {
          // Refresh ratings after submission
          fetch();
        }}
      />
    </div>
  );
}