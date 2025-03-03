import ProjectPage from './project-page.jsx';
import ProjectGallery from './project-gallery/project-gallery.jsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'><ProjectGallery /></Route>
        <Route path='/project'><ProjectPage /></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
