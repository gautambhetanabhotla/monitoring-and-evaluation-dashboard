// import React from 'react';
import { Outlet } from 'react-router-dom';

import { Button, ButtonGroup } from "@heroui/button";

import Charts from './project-page-charts.jsx';

const ProjectHeader = () => {
  return (
    <>
      <div className="flex flex-col relative">
        <div className="basis-40 bg-amber-400 relative">
          <article className="prose absolute bottom-2 text-7xl font-bold left-4">Project name</article>
        </div>
        <div className="basis-20 bg-amber-500 relative">
          <article className="prose absolute top-2 text-3xl font-semibold left-4">Client name</article>
        </div>
      </div>
      <ButtonGroup>
        <Button></Button>
        <Button></Button>
        <Button></Button>
      </ButtonGroup>
      <Outlet />
    </>
  );
};

const ProjectPage = () => {
  return (
    <></>
  );
};

export default ProjectPage;
export { ProjectHeader };