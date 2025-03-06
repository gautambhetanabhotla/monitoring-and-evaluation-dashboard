import ProjectPage, { Overview, KPIs, Timeline, SuccessStories, LogFramework } from './project-view/project-page.jsx';
import ProjectGallery from './project-gallery/project-gallery.jsx';
// import Gallery from './project-gallery/project-gallery';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<ProjectGallery />} />
        <Route path='/:projectid' element={<ProjectPage />}>
          <Route index element={<Overview />} />
          <Route path='overview' element={<Overview />} />
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
