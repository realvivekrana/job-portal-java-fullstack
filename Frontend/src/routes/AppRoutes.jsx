import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import { ROLES } from '../utils/constants'
import PublicLayout from '../components/layout/PublicLayout'
import AuthLayout from '../components/layout/AuthLayout'
import DashboardLayout from '../components/layout/DashboardLayout'

import Home from '../pages/public/Home'
import JobListing from '../pages/public/JobListing'
import JobDetailsPage from '../pages/public/JobDetailsPage'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import NotFound from '../pages/public/NotFound'

import CandidateDashboard from '../pages/candidate/CandidateDashboard'
import CandidateProfile from '../pages/candidate/CandidateProfile'
import MyApplications from '../pages/candidate/MyApplications'

import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard'
import CompanyProfile from '../pages/recruiter/CompanyProfile'
import MyJobs from '../pages/recruiter/MyJobs'
import PostJob from '../pages/recruiter/PostJob'
import JobApplicants from '../pages/recruiter/JobApplicants'

import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import ManageJobs from '../pages/admin/ManageJobs'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobListing />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute roles={[ROLES.CANDIDATE]} />}>
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/applications" element={<MyApplications />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.RECRUITER]} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/company" element={<CompanyProfile />} />
            <Route path="/recruiter/jobs" element={<MyJobs />} />
            <Route path="/recruiter/jobs/new" element={<PostJob />} />
            <Route path="/recruiter/jobs/:id/edit" element={<PostJob />} />
            <Route path="/recruiter/jobs/:jobId/applicants" element={<JobApplicants />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/jobs" element={<ManageJobs />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}