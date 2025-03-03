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
=======
import ProjectPage from './project-view/project-page';
import Gallery from './project-gallery/project-gallery';

const App = () => {
  return (
    <Gallery />
  );
};

export default App;
