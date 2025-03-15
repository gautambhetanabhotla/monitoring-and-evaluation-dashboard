// frontend/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './HomePage.jsx';
import ProjectPage from './project-view/project-page.jsx';
import ProjectGallery from './project-gallery/project-gallery-client.jsx';
import Overview from './project-view/project-tabs/overview.jsx';
import Charts from './project-view/project-page-charts.jsx';
import KPIs from './project-view/project-tabs/kpis.jsx';
import Timeline from './project-view/project-tabs/timeline.jsx';
import SuccessStories from './project-view/project-tabs/success-stories.jsx';
import LogFramework from './project-view/project-tabs/log-framework.jsx';
import Admin from './Admin.jsx';
import Field_Staff from './Field_Staff.jsx'; 
import ProtectedRoute from './ProtectedRoute';
import Unauthorized from './Unauthorized'; // Create a simple Unauthorized component

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        
        <Route path='/projects' element={
          <ProtectedRoute allowedRoles={["admin", "client"]}>
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

        <Route path='/unauthorized' element={<Unauthorized />} />

        <Route path='/:projectid' element={
          <ProtectedRoute allowedRoles={["admin", "field staff", "client"]}>
            <ProjectPage />
          </ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path='overview' element={<Overview />} />
          <Route path='charts' element={<Charts />} />
          <Route path='kpis' element={<KPIs />} />
          <Route path='timeline' element={<Timeline />} />
          <Route path='success-stories' element={<SuccessStories />} />
          <Route path='log-framework' element={<LogFramework />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
