import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ProjectPage, { Overview } from './project-view/project-page.jsx';
import ProjectGallery from './project-gallery/project-gallery.jsx';
import Charts from './project-view/project-page-charts.jsx';
import KPIs from './project-view/project-tabs/kpis.jsx';
import Timeline from './project-view/project-tabs/timeline.jsx';
import SuccessStories from './project-view/project-tabs/success-stories.jsx';
import LogFramework from './project-view/project-tabs/log-framework.jsx';
import Login from './authentication.jsx';
import Admin from './Admin.jsx';

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/projects' element={<ProjectGallery />} />
        <Route path='/admin' element={<Admin/>}/>
        <Route path='/:projectid' element={<ProjectPage />}>
          <Route index element={<Overview />} />
          <Route path='overview' element={<Charts />} />
          <Route path='kpis' element={<KPIs />} />
          <Route path='timeline' element={<Timeline />} />
          <Route path='success-stories' element={<SuccessStories />} />
          <Route path='log-framework' element={<LogFramework />} />
        </Route>
      </Routes>
    </BrowserRouter>
    {/* <ProjectPage /> */}
    </>
  );
};

export default App;
