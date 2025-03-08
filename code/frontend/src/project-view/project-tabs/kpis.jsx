import { useState, useEffect } from 'react';
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { Divider } from "@heroui/divider";
import {Button, ButtonGroup} from "@heroui/button";
import Markdown from "marked-react";
import { PencilSquareIcon } from '@heroicons/react/24/solid';

const KPI = ({ kpi }) => {
  return (
    <>
      <Card className="m-3 z-0">
        <CardHeader className="relative">
          <span className="prose text-3xl font-bold py-5 px-2 z-0 pr-16">{kpi.indicator}</span>
          <Button isIconOnly className = "absolute right-5 top-10"><PencilSquareIcon className="size-6" /></Button>
        </CardHeader>
        <Divider />
        <CardBody className="px-5 py-6">
          <span className="prose text-xl font-bold">What does it track?</span>
          {kpi.what_it_tracks}
          <br />
          {/* <span className="prose text-xl font-bold">Explanation</span>
          <Markdown>{kpi.explanation}</Markdown> */}
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-center">
          <div className="grid grid-cols-5">
            <div className="flex flex-col justify-center align-middle text-red-500">
              <div>BASELINE</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.baseline}</div>
            </div>
            <div className="flex flex-row justify-center align-middle">
              <Divider orientation="vertical" />
            </div>
            <div className="flex flex-col justify-center align-middle text-blue-500">
              <div>CURRENT</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.current}</div>
            </div>
            <div className="flex flex-row justify-center align-middle">
              <Divider orientation="vertical" className="flex flex-col justify-center align-middle" />
            </div>
            <div className="flex flex-col justify-center align-middle text-green-500">
              <div className="flex flex-row justify-center">TARGET</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.target}</div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

const KPIs = () => {
  const [kpis, setKpis] = useState([]);

  useEffect(() => {
    fetch('/kpis.json')
      .then(response => response.json())
      .then(data => setKpis(data))
      .catch(error => console.error('Error fetching KPIs:', error));
  }, []);

  return (
    <>
      <div className="flex flex-row justify-center">
        <h1 className="prose text-6xl p-10">Key performance indexes (KPIs)</h1>
      </div>
      <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 xs:grid-cols-1 mx-24">
        {kpis.map((kpi, index) => {
          return <KPI key={index} kpi={kpi} />
        })}
      </div>
      <div className="flex flex-row justify-center mt-10">
        {kpis.length === 0 && <p className='prose text-xl'>No KPIs yet. Get started by adding one.</p>}
      </div>
      <div className="flex flex-row justify-center pt-10 pb-20">
        <Button className='prose text-xl mb-15 p-10' color='primary' size='lg'>Add KPI</Button>
      </div>
      
    </>
  );
};

export default KPIs;