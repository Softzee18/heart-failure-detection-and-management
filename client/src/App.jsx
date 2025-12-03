// import { Toaster } from "sonner";
// import "./App.css";
// import AdminDashboard from "./pages/adminDashboard";
// import DoctorsDashboard from "./pages/DoctorsDashboard";
// import LoginPage from "./pages/LoginPage";
// import NotFound from "./pages/NotFound";
// import NurseDashboard from "./pages/NurseDashboard";
// import SigupPage from "./pages/SigupPage";
// import UserDashboard from "./pages/UserDashboard";
// import { Routes, Route, BrowserRouter } from "react-router";
// import { ProtectedRoute } from "./ProtectedRoutes/ClientProtected";

// function App() {
//   return (
//     <BrowserRouter>
//       <Toaster position="top-right" richColors />
//       <Routes>
//         <Route path="*" element={<NotFound />} />
//         <Route path="/auth/signup" element={<SigupPage />} />
//         <Route path="/auth/login" element={<LoginPage />} />
//         <Route element={<ProtectedRoute requiredRole="doctor" />}>
//           <Route path="/doctor/dashboard" element={<DoctorsDashboard />} />
//         </Route>
//         <Route element={<ProtectedRoute requiredRole="admin" />}>
//           <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         </Route>
//         <Route element={<ProtectedRoute requiredRole="user" />}>
//           <Route path="/user/dashboard" element={<UserDashboard />} />
//         </Route>
//         <Route element={<ProtectedRoute requiredRole="nurse" />}>
//           <Route path="/nurse/dashboard" element={<NurseDashboard />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { Toaster } from "sonner";
import "./App.css";
import AdminDashboard from "./pages/adminDashboard";
import DoctorsDashboard from "./pages/DoctorsDashboard";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import NurseDashboard from "./pages/NurseDashboard";
import SigupPage from "./pages/SigupPage";
import UserDashboard from "./pages/UserDashboard";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes/ClientProtected";
import { PublicRoute } from "./ProtectedRoutes/PublicRoute";
import { HomeRedirect } from "./ProtectedRoutes/HomeRedirect";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<HomeRedirect />} />

        {/* Public routes — only accessible when logged out */}
        <Route element={<PublicRoute />}>
          <Route path="/auth/signup" element={<SigupPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
        </Route>

        {/* Protected routes — only accessible when logged in */}
        <Route element={<ProtectedRoute requiredRole="doctor" />}>
          <Route path="/doctor/dashboard" element={<DoctorsDashboard />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="nurse" />}>
          <Route path="/nurse/dashboard" element={<NurseDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
