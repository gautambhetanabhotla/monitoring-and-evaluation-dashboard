import { useContext, createContext, useState, useEffect } from 'react';
import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import { Button, ButtonGroup } from "@heroui/button";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/navbar";
import { Card, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { HomeIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, CurrencyRupeeIcon, CalendarDateRangeIcon, UserIcon, LinkIcon } from '@heroicons/react/24/outline';
// import '../index.css';

// import Charts from './project-page-charts.jsx';

const ProjectHeader = () => {
  const tabname = useLocation().pathname.split("/").pop();
  const ctx = useContext(ProjectContext);
  return (
    <>
      <div className="mt-15 pt-15 grid grid-cols-1 p-5">
        <Card className='my-5'>
          <div className="md:col-span-2 drop-shadow-white">
            <article
              className="prose text-7xl font-bold pt-14 pl-10 pb-16 drop-shadow-[0_35px_35px_rgba(255, 255, 255, 0.781)]"
            >
              {ctx.project.name}
            </article>
          </div>
        </Card>
        <div className="md:col-span-1 gris md:grid-cols-2 m-5">
          <div className="grid grid-rows-2">
            <Chip className='p-5 m-1'>
              <MapPinIcon className="size-6 stroke-blue-500" />
              <p className='prose pl-2 pr-2 text-lg text-blue-500'>{ctx.project.location}</p>
              <LinkIcon className='size-4 stroke-blue-500' />
            </Chip>
            <Chip className='p-5 m-1'>
              <UserIcon className="size-6" />
              <p className='prose pl-2'>{ctx.project.client}</p>
            </Chip>
          </div>
          <div className="grid grid-rows-2">
            <Chip className='p-5 m-1 flex flex-row'>
              <CurrencyRupeeIcon className="size-6" />
              <p className='prose pl-2'>{ctx.project.funding_partner}</p>
            </Chip>
            <Chip className='p-5 m-1'>
              <CalendarDateRangeIcon className="size-6" />
              <p className='prose pl-2'>{Date(ctx.project.start).toString()} to {Date(ctx.project.end).toString()}</p>
            </Chip>
          </div>
        </div>
      </div>
      <Navbar
        shouldHideOnScroll
        isBordered
        classNames={{
          item: [
            "flex",
            "relative",
            "h-full",
            "items-center",
            "data-[active=true]:after:content-['']",
            "data-[active=true]:after:absolute",
            "data-[active=true]:after:bottom-0",
            "data-[active=true]:after:left-0",
            "data-[active=true]:after:right-0",
            "data-[active=true]:after:h-[2px]",
            "data-[active=true]:after:rounded-[2px]",
            "data-[active=true]:after:bg-primary",
            "data-[active=true]:text-blue-500",
          ],
        }}
      >
        <NavbarBrand>
          <Link className='inline' to="/">
            <HomeIcon className="size-6 inline" />
            <p className='prose inline pl-2'>Home</p>
          </Link>
        </NavbarBrand>
        <NavbarContent>
          <NavbarItem isActive={tabname !== "charts" && tabname !== "kpis" && tabname !== "timeline" && tabname !== "success-stories" && tabname !== "log-framework"}>
            <Link to="overview">Overview</Link>
          </NavbarItem>
          <NavbarItem isActive={tabname === "charts"}>
            <Link to="charts">Charts</Link>
          </NavbarItem>
          <NavbarItem isActive={tabname === "kpis"}>
            <Link to="kpis">KPIs</Link>
          </NavbarItem>
          <NavbarItem isActive={tabname === "timeline"}>
            <Link to="timeline">Timeline</Link>
          </NavbarItem>
          <NavbarItem isActive={tabname === "success-stories"}>
            <Link to="success-stories">Success stories</Link>
          </NavbarItem>
          <NavbarItem isActive={tabname === "log-framework"}>
            <Link to="log-framework">Log framework</Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </>
  );
};

const ProjectContext = createContext();

const ProjectContextProvider = ({ children }) => {
  const [project, setProject] = useState({});
  const [successStories, setSuccessStories] = useState([]);
  const [KPIUpdates, setKPIUpdates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [KPIs, setKPIs] = useState([]);
  const [adjustedKPIs, setAdjustedKPIs] = useState([]);

  useEffect(() => {
    fetch('/kpis.json')
    .then(response => response.json())
    .then(data => setKPIs(data))
    .catch(error => console.error("Error fetching KPIs" + error));
  }, []);

  useEffect(() => {
    const updatedKPIs = KPIs.map(KPI => {
      const updatesOfKPI = KPIUpdates
        .filter(update => update.kpi === KPI.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return {
        ...KPI,
        current: updatesOfKPI.length > 0 ? updatesOfKPI[0].final : KPI.baseline,
      };
    });
    setAdjustedKPIs(updatedKPIs);
  }, [KPIs, KPIUpdates]);

  useEffect(() => {
    fetch('/kpiupdates.json')
    .then(response => response.json())
    .then(data => {
      for (const update of data) {
        const d = update.date;
        const date = new Date(d);
        update.date = date;
      }
      setKPIUpdates(data);
      // console.dir(data);
    })
    .catch(error => console.error("Error fetching KPI updates" + error));
  }, []);

  useEffect(() => {
    fetch('/project.json')
    .then(response => response.json())
    .then(data => setProject(data))
    .catch(error => console.error("Error fetching project" + error));
  }, []);

  useEffect(() => {
    fetch('/success-stories.json')
    .then(response => response.json())
    .then(data => setSuccessStories(data))
    .catch(error => console.error("Error fetching success stories" + error));
  }, []);

  useEffect(() => {
    fetch('/tasks.json')
    .then(response => response.json())
    .then(data => setTasks(data))
    .catch(error => console.error("Error fetching tasks" + error));
  }, []);
  
  const updateKPI = (update) => {
    setKPIUpdates([...KPIUpdates, update]);
  };

  return (
    <ProjectContext.Provider value={{project, setProject, successStories, setSuccessStories, KPIUpdates, setKPIUpdates, tasks, setTasks, adjustedKPIs, setKPIs, updateKPI}}>{children}</ProjectContext.Provider>
  );
};

const ProjectPage = () => {
  return (
    <>
      <ProjectContextProvider>
        <ProjectHeader />
        <Outlet />
      </ProjectContextProvider>
    </>
  );
};

export default ProjectPage;
export { ProjectHeader, ProjectContext, ProjectContextProvider };