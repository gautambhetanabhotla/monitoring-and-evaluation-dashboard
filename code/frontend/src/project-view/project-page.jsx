// import React from 'react';
import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import { Button, ButtonGroup } from "@heroui/button";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/navbar";
import { Card, CardHeader } from "@heroui/card";
import { HomeIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, CurrencyRupeeIcon, CalendarDateRangeIcon, UserIcon, LinkIcon } from '@heroicons/react/24/outline';
// import '../index.css';

// import Charts from './project-page-charts.jsx';

const Overview = () => {
  return (
    <>
      <h1>Overview</h1>
    </>
  );
};

const ProjectHeader = () => {
  const tabname = useLocation().pathname.split("/").pop();
  // console.log(tabname);
  return (
    <>
      <div className="mt-15 pt-15 grid xs:grid-cols-1 md:grid-cols-2 p-5">
        <Card className='my-5'>
          <div className="md:col-span-2 drop-shadow-white">
            <article className="prose text-7xl font-bold pt-14 pl-10 pb-16 drop-shadow-[0_35px_35px_rgba(255, 255, 255, 0.781)]">Project name</article>
          </div>
        </Card>
        <div className="md:col-span-1 grid xs:grid-cols-1 md:grid-cols-2 m-5">
          <div className="grid grid-rows-2">
            <Card className='p-5 m-1'>
              <CardHeader>
                <MapPinIcon className="size-6 stroke-blue-500" />
                <p className='prose pl-2 pr-2 text-lg text-blue-500'>Location</p>
                <LinkIcon className='size-4 stroke-blue-500' />
              </CardHeader>
            </Card>
            <Card className='p-5 m-1'>
              <CardHeader>
                <UserIcon className="size-6" />
                <p className='prose pl-2'>Client</p>
              </CardHeader>
            </Card>
          </div>
          <div className="grid grid-rows-2">
            <Card className='p-5 m-1'>
              <CardHeader>
                <CurrencyRupeeIcon className="size-6" />
                <p className='prose pl-2'>Funding partner</p>
              </CardHeader>
              
            </Card>
            <Card className='p-5 m-1'>
              <CardHeader>
                <CalendarDateRangeIcon className="size-6" />
                <p className='prose pl-2'>23/3/2025 to 23/5/2025</p>
              </CardHeader>
              
            </Card>
          </div>
        </div>
      </div>
      {/* <div className="sticky top-0 z-10 p-5 bg-white m-2 rounded-lg">
        <ButtonGroup className="flex flex-row justify-between">
          <Link to="overview"><Button className="px-20">Overview</Button></Link>
          <Link to="kpis"><Button className="px-20">KPIs</Button></Link>
          <Link to="timeline"><Button className="px-20">Timeline</Button></Link>
          <Link to="success-stories"><Button className="px-20">Success stories</Button></Link>
          <Link to="log-framework"><Button className="px-20">Log framework</Button></Link>
        </ButtonGroup>
      </div> */}
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
          <NavbarItem isActive={tabname === "overview"}>
            <Link to="overview">Overview</Link>
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

const ProjectPage = () => {
  return (
    <>
      <ProjectHeader />
      <Outlet />
    </>
  );
};


export default ProjectPage;
export { ProjectHeader, Overview };