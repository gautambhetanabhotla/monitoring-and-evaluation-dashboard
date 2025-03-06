// import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Button, ButtonGroup } from "@heroui/button";
import '../index.css';

// import Charts from './project-page-charts.jsx';

const Overview = () => {
  return (
    <>
      <h1>Overview</h1>
    </>
  );
};

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
      <div className="sticky top-0 z-10 p-5 bg-white m-2 rounded-lg">
        <ButtonGroup className="flex flex-row justify-between">
          <Link to="overview"><Button className="px-20">Overview</Button></Link>
          <Link to="kpis"><Button className="px-20">KPIs</Button></Link>
          <Link to="timeline"><Button className="px-20">Timeline</Button></Link>
          <Link to="success-stories"><Button className="px-20">Success stories</Button></Link>
          <Link to="log-framework"><Button className="px-20">Log framework</Button></Link>
        </ButtonGroup>
      </div>
    </>
  );
};

const ProjectPage = () => {
  const params = useParams();

  console.dir(params);

  return (
    <>
      <ProjectHeader />
      <Outlet />
    </>
  );
};


export default ProjectPage;
export { ProjectHeader, Overview };