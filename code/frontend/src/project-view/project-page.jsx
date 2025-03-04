// import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { Button, ButtonGroup } from "@heroui/button";
import { button, button as buttonStyles } from "@heroui/theme";
import '../index.css';

// import Charts from './project-page-charts.jsx';

const Overview = () => {
  return (
    <>
      <h1>Overview</h1>
    </>
  );
};

const KPIs = () => {
  return (
    <>
      <h1>KPIs</h1>
    </>
  );
};

const Timeline = () => {
  return (
    <>
      <h1>Timeline</h1>
    </>
  );
};

const SuccessStories = () => {
  return (
    <>
      <h1>Success stories</h1>
    </>
  );
};

const LogFramework = () => {
  return (
    <>
      <h1>Log framework</h1>
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
      <ButtonGroup>
        <Link to="overview" className={buttonStyles({ variant: "bordered", radius: "full" })}><Button color='danger' variant='shadow' className={buttonStyles({ variant: "bordered", radius: "full" })}>Overview</Button></Link>
        <Link to="kpis"><Button className={buttonStyles({variant: "shadow", color: "primary"})}>KPIs</Button></Link>
        <Link to="timeline"><Button>Timeline</Button></Link>
        <Link to="success-stories"><Button>Success stories</Button></Link>
        <Link to="log-framework"><Button>Log framework</Button></Link>
      </ButtonGroup>
      <Button>erfidhvsfui</Button>
      
    </>
  );
};

const ProjectPage = () => {
  const params = useParams();
  console.log(params);
  return (
    <>
      <ProjectHeader />
      <Outlet />
    </>
  );
};


export default ProjectPage;
export { ProjectHeader, Overview, KPIs, Timeline, SuccessStories, LogFramework };