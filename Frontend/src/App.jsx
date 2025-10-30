import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load all page components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const MyCourses = lazy(() => import('./pages/MyCourses'));
const InstructorCourses = lazy(() => import('./pages/InstructorCourses'));
const InstructorAssignments = lazy(() => import('./pages/InstructorAssignments'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Submissions = lazy(() => import('./pages/Submissions'));
const Profile = lazy(() => import('./pages/Profile'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const CreateCourse = lazy(() => import('./pages/CreateCourse'));
const UploadLecture = lazy(() => import('./pages/UploadLecture'));
const CreateAssignment = lazy(() => import('./pages/CreateAssignment'));
const SubmitAssignment = lazy(() => import('./pages/SubmitAssignment'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const InstructorStudents = lazy(() => import('./pages/InstructorStudents'));

const PrivateRoute = ({ children, roles = [] }) => {
  const { user } = useAuth();
  if(!user) return <Navigate to="/login" />;
  if(roles.length && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent:'center'}}><span className="loader spinner" style={{fontSize:'2rem'}}>Loading...</span></div>}>
          <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
            <Route path="/courses" element={<PrivateRoute><Courses/></PrivateRoute>} />
            <Route path="/my-courses" element={<PrivateRoute roles={['student']}><MyCourses/></PrivateRoute>} />
            <Route path="/instructor-courses" element={<PrivateRoute roles={['instructor']}><InstructorCourses/></PrivateRoute>} />
            <Route path="/instructor-assignments" element={<PrivateRoute roles={['instructor']}><InstructorAssignments/></PrivateRoute>} />
            <Route path="/assignments" element={<PrivateRoute roles={['student']}><Assignments/></PrivateRoute>} />
            <Route path="/certificates" element={<PrivateRoute roles={['student']}><Certificates/></PrivateRoute>} />
            <Route path="/submissions" element={<PrivateRoute roles={['instructor']}><Submissions/></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
            <Route path="/courses/:id" element={<PrivateRoute><CourseDetail/></PrivateRoute>} />
            <Route path="/create-course" element={<PrivateRoute roles={['instructor']}><CreateCourse/></PrivateRoute>} />
            <Route path="/upload-lecture/:courseId" element={<PrivateRoute roles={['instructor']}><UploadLecture/></PrivateRoute>} />
            <Route path="/create-assignment/:courseId" element={<PrivateRoute roles={['instructor']}><CreateAssignment/></PrivateRoute>} />
            <Route path="/submit-assignment/:assignmentId" element={<PrivateRoute roles={['student']}><SubmitAssignment/></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminPanel/></PrivateRoute>} />
            <Route path="/instructor-students" element={<PrivateRoute roles={['instructor']}><InstructorStudents/></PrivateRoute>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}