import { useContext, useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/navbar";
import { Card } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { HomeIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, CurrencyRupeeIcon, CalendarDateRangeIcon, UserIcon, LinkIcon } from '@heroicons/react/24/outline';
// import '../index.css';

import { ProjectContext, ProjectContextProvider } from './project-context.jsx';

const ProjectHeader = () => {

  const ctx = useContext(ProjectContext);
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  return (
    <>
      <div className="mt-15 pt-15 grid grid-cols-1 p-5">
        <Card className='my-5'>
          <div className="md:col-span-2 drop-shadow-white">
            <article
              className="prose text-7xl font-bold pt-14 pl-10 pr-10 pb-16 drop-shadow-[0_35px_35px_rgba(255, 255, 255, 0.781)]"
            >
              {ctx.project.name}
            </article>
          </div>
        </Card>
        <div className="flex flex-row justify-center flex-wrap">
          <Chip className='p-5 m-1'>
            <span className='flex flex-row justify-center align-middle'>
              <MapPinIcon className="size-6 stroke-blue-500" />
              <p className='prose pl-2 pr-2 text-lg text-blue-500'>{ctx.project.location}</p>
              <LinkIcon className='mt-1 size-5 stroke-blue-500' />
            </span>
          </Chip>
          <Chip className='p-5 m-1'>
            <span className='flex flex-row'>
              <UserIcon className="size-6" />
              <p className='prose pl-2 text-lg'>{ctx.project.client}</p>
            </span>
          </Chip>
          <Chip className='p-5 m-1'>
            <span className='flex flex-row'>
              <CurrencyRupeeIcon className="size-6" />
              <p className='prose pl-2 text-lg'>{ctx.project.funding_partner}</p>
            </span>
          </Chip>
          <Chip className='p-5 m-1'>
            <span className='flex flex-row'>
              <CalendarDateRangeIcon className="size-6" />
              <p className='prose pl-2 text-lg'>{formatDate(ctx.project.start)} to {formatDate(ctx.project.end)}</p>
            </span>
          </Chip>
        </div>
      </div>
      {/* <Nav /> */}
    </>
  );
};

const Nav = () => {

  let tabname = useLocation().pathname.split("/").pop();
  if (!(['overview', 'charts', 'kpis', 'timeline', 'success-stories', 'log-framework'].includes(tabname))) {
    tabname = 'overview';
  }
  // const [selectedTab, setSelectedTab] = useState(tabname);
  const navbarRef = useRef(null);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/user/getUser`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <>
      <Navbar
        ref={navbarRef}
        shouldHideOnScroll={false}
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
          <Link className='inline' to="/projects">
            <HomeIcon className="size-6 inline" />
            <p className='prose inline pl-2'>Home</p>
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden md:flex">
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
        <NavbarContent justify='end'>
          <NavbarItem>
            <Popover showArrow>
              <PopoverTrigger>
                <Avatar />
              </PopoverTrigger>
              <PopoverContent className='p-5 bg-gray-800'>
                <div>
                  <span className='flex flex-row mb-2'>
                    <p className="prose text-md mt-1 mr-5 text-white">{user?.email}</p>
                    <Chip color={user?.role === 'admin' ? 'danger' : (user?.role === 'client' ? 'primary' : 'secondary')}>{user?.role}</Chip>
                  </span>
                  <Button>Logout</Button>
                </div>
              </PopoverContent>
            </Popover>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenuToggle />
        <NavbarMenu portalContainer={navbarRef.current}>
          <NavbarMenuItem>
            <Link to="overview">Overview</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="charts">Charts</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="kpis">KPIs</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="timeline">Timeline</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="success-stories">Success stories</Link>
          </NavbarMenuItem>
          <NavbarMenuItem>
            <Link to="log-framework">Log framework</Link>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
};

const ProjectPage = () => {
  return (
    <>
      <ProjectContextProvider>
        <ProjectHeader />
        <Nav />
        <Outlet />
      </ProjectContextProvider>
    </>
  );
};

export default ProjectPage;
export { ProjectHeader };