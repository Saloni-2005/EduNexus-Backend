import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import NavBar from '../components/NavBar';

export default function SubmitAssignment(){
  const { assignmentId: id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [file,setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await API.get(`/assignments/${id}`);
        setAssignment(res.data);
      } catch(err){
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if(id) fetchAssignment();
  }, [id]);

  const handle = async (e) => {
    e.preventDefault();
    if(!file) return alert('Please select a file to submit');
    setSubmitting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
  const res = await API.post(`/assignments/submit/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      if (res.data.certificate) {
        alert(`Assignment submitted successfully!\nCertificate Number: ${res.data.certificate.certificateNumber}\nCertificate issued on: ${new Date(res.data.certificate.issuedAt).toLocaleDateString()}`);
      } else {
        alert('Assignment submitted successfully!');
      }
      nav(-1);
    } catch(err){ 
      console.error('Submission error:', err);
      alert(err.response?.data?.message || 'Error submitting assignment'); 
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => nav(-1)}
            className="text-purple-600 hover:text-purple-800 flex items-center mb-4 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </button>
          <div className="flex items-center mb-2">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <i className="fas fa-upload text-purple-600 text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Submit Assignment</h1>
              <p className="text-gray-600">Upload your completed work</p>
            </div>
          </div>
        </div>

        {assignment && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <h2 className="text-xl font-bold text-white">{assignment.title || 'Assignment'}</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  <i className="fas fa-info-circle text-purple-600 mr-2"></i>
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
              </div>
              {assignment.dueDate && (
                <div className="flex items-center text-sm">
                  <i className="fas fa-calendar-alt text-gray-500 mr-2"></i>
                  <span className="text-gray-600">
                    Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white">Upload Your Submission</h2>
          </div>

          <form onSubmit={handle} className="p-6 md:p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <i className="fas fa-file mr-2 text-purple-600"></i>
                Select File
              </label>
              
              {file ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-3 mr-4">
                        <i className="fas fa-file text-green-600 text-xl"></i>
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
                      <span className="text-green-600 font-medium">File ready for submission</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-400 transition-colors bg-gray-50">
                  <input 
                    type="file"
                    onChange={e=>setFile(e.target.files[0])}
                    id="file-upload"
                    className="hidden"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="mb-4">
                      <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-cloud-upload-alt text-purple-600 text-3xl"></i>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select Submission File</h3>
                    <p className="text-gray-600 mb-4">Click to browse or drag and drop your file</p>
                    <div className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
                disabled={submitting || !file}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Assignment
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => nav(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
        </form>
        </div>

        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="fas fa-exclamation-circle text-purple-600 mr-3 mt-1"></i>
            <div>
              <h4 className="font-medium text-purple-900 mb-1">Important Submission Guidelines</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Make sure your file is complete and final before submitting</li>
                <li>• Supported formats: PDF, DOC, DOCX, ZIP, etc.</li>
                <li>• Maximum file size: 50 MB</li>
                <li>• You cannot edit your submission after submitting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}