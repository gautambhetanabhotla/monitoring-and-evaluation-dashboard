import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import ProtectedRoute from './ProtectedRoute';  
import ProjectPage from './project-view/project-header.jsx';
import ProjectGallery from './project-gallery/project-gallery.jsx';
import Overview from './project-view/project-tabs/overview.jsx';
import Charts from './project-view/project-page-charts.jsx';
import KPIs from './project-view/project-tabs/kpis.jsx';
import Timeline from './project-view/project-tabs/timeline/timeline.jsx';
import SuccessStories from './project-view/project-tabs/success-stories.jsx';
import LogFramework from './project-view/project-tabs/log-framework.jsx';
import ChatLayout from './Chatbot/ChatLayout.jsx';
import Admin from './Admin.jsx';
import Field_Staff from './Field_Staff.jsx'; 
import { ClientGallery } from './project-gallery/client-gallery.jsx';
import Unauthorized from './Unauthorized';  
import HomePage from './HomePage';
import { AuthProvider } from './AuthContext.jsx';

const App = () => {
  useEffect(() => {
    document.querySelector("body")?.classList.add("light", "text-foreground", "bg-background");
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/unauthorized' element={<Unauthorized />} />

        <Route path='/projects' element={
          <ProtectedRoute allowedRoles={["admin", "client", "field staff"]}>
            <ProjectGallery />
          </ProtectedRoute>
        } />

        <Route path='/admin' element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Admin />
          </ProtectedRoute>
        } />

        <Route path='/field-staff' element={
          <ProtectedRoute allowedRoles={["field staff"]}>
            <Field_Staff />
          </ProtectedRoute>
        } />

        <Route path='/clients' element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <ClientGallery />
          </ProtectedRoute>
        } />

        <Route path='/:projectid' element={
          <ProtectedRoute allowedRoles={["admin", "client", "field staff"]}>
            <ProjectPage />
          </ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path='overview' element={<Overview />} />
          <Route path='charts' element={<Charts />} />
          <Route path='kpis' element={<KPIs />} />
          <Route path='timeline' element={<Timeline />} />
          <Route path='success-stories' element={<SuccessStories />} />
          <Route path='chatbot' element={<ChatLayout />} />
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
