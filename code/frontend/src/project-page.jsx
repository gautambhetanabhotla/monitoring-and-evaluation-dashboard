import Charts from './project-page-charts.jsx';

const UpcomingDeadlines = () => {
  return (
    <>
    </>
  );
};

const Task = () => {
  return (
    <>
    </>
  );
};

const ProjectPage = () => {
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
      <div>
        <article className="prose text-2xl p-4 m-4">Project description</article>
      </div>
      <div>
        <article className="prose text-6xl font-bold p-4 m-4">Overview</article>
        <UpcomingDeadlines />
        <Charts />
      </div>
      <div>
        <article className='prose text-6xl font-bold p-4 m-4'>Project structure</article>
      </div>
    </>
  );
};

export default ProjectPage;