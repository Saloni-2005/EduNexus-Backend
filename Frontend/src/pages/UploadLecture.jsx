import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';

export default function UploadLecture(){
  const { courseId } = useParams();
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [file,setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    if(!file) return alert('Select a file');
    setUploading(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('video', file);
    try {
      await API.post(`/lectures/${courseId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert('Lecture uploaded successfully!');
      nav(`/courses/${courseId}`);
    } catch(err){ 
      alert(err.response?.data?.message || 'Upload error'); 
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => nav(`/courses/${courseId}`)}
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Lecture</h1>
          <p className="text-gray-600">Add video content to your course</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handle} className="p-6 md:p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-heading mr-2 text-blue-600"></i>
                Lecture Title
              </label>
              <input 
                type="text"
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                placeholder="Enter lecture title"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-align-left mr-2 text-blue-600"></i>
                Description
              </label>
              <textarea 
                value={description} 
                onChange={e=>setDescription(e.target.value)}
                placeholder="Enter lecture description"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-video mr-2 text-blue-600"></i>
                Video File
              </label>
              
              {file ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-3 mr-4">
                        <i className="fas fa-video text-green-600 text-xl"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-center py-4">
                      <i className="fas fa-check-circle text-green-500 text-3xl mr-2"></i>
                      <span className="text-green-600 font-medium">File selected successfully</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors bg-gray-50">
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={e=>setFile(e.target.files[0])}
                    id="video-upload"
                    className="hidden"
                    required
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <div className="mb-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-cloud-upload-alt text-blue-600 text-3xl"></i>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select Video File</h3>
                    <p className="text-gray-600 mb-4">Click to browse or drag and drop</p>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i className="fas fa-folder-open mr-2"></i>
                      Choose File
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={uploading || !file || !title}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Upload Lecture
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

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mr-3 mt-1"></i>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Upload Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Supported formats: MP4, MOV, AVI, WMV</li>
                <li>• Maximum file size: 500 MB</li>
                <li>• Ensure video is clear and well-lit</li>
                <li>• Add a descriptive title for better organization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}