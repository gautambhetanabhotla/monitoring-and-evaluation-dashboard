import { useContext, useState } from 'react';
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { Divider } from "@heroui/divider";
import {Button} from "@heroui/button";
import {Progress} from '@heroui/progress';
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
import {Chip} from "@heroui/chip";
import {Select, SelectItem} from "@heroui/select";
// import Markdown from "marked-react";
import { PencilSquareIcon } from '@heroicons/react/24/solid';

import { ProjectContext } from '../project-context.jsx';

const KPI = ({ kpi }) => {
  const percentagecompletion = parseInt(100 * (
    (parseFloat(kpi.current) - parseFloat(kpi.baseline))
    / (parseFloat(kpi.target) - parseFloat(kpi.baseline))));
  return (
    <>
      <Card className="m-3 z-0">
        <CardHeader className="relative">
          <span className="prose text-2xl font-bold py-5 px-2 z-0 pr-16">{kpi.indicator}</span>
          <Button isIconOnly className="absolute right-5 top-5" aria-label="Edit KPI"><PencilSquareIcon className="size-6" /></Button>
        </CardHeader>
        <Divider />
        <CardBody className="px-5 py-6">
          <span className="prose text-xl font-bold">What does it track?</span>
          {kpi.what_it_tracks}
          <br />
          <span className="mt-4 flex flex-row items-center gap-3">
            <p className='prose text-xl font-bold'>Logframe level: </p>
            <Chip color='default'>{kpi.logframe_level}</Chip>
          </span>
        </CardBody>
        <Progress
          radius='none'
          value={percentagecompletion}
          color={percentagecompletion < 10 ? 'danger' : percentagecompletion < 100 ? 'primary' : 'success'}
          aria-label={`Progress: ${percentagecompletion}%`}
        />
        <Divider />
        <CardFooter className="flex justify-center">
          <div className="grid grid-cols-5">
            <div className="flex flex-col justify-center align-middle text-red-500" aria-label={`Baseline: ${kpi.baseline}`}>
              <div>BASELINE</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.baseline}</div>
            </div>
            <div className="flex flex-row justify-center align-middle">
              <Divider orientation="vertical" />
            </div>
            <div className="flex flex-col justify-center align-middle text-blue-500" aria-label={`Current: ${kpi.current}`}>
              <div>CURRENT</div>
              <div className="prose text-4xl flex flex-row justify-center">{kpi.current}</div>
            </div>
            <div className="flex flex-row justify-center align-middle">
              <Divider orientation="vertical" className="flex flex-col justify-center align-middle" />
            </div>
            <div className="flex flex-col justify-center align-middle text-green-500" aria-label={`Target: ${kpi.target}`}>
              <div className="flex flex-row justify-center">TARGET</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.target}</div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

const KPIsList = ({ kpis }) => {
  return (
    <>
      <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 xs:grid-cols-1 md:mx-24 mt-7">
        {kpis?.map((kpi, index) => {
          return <KPI key={index} kpi={kpi} />;
        })}
      </div>
      <div className="flex flex-row justify-center mt-10">
        {kpis?.length === 0 && <p className='prose text-xl'>No KPIs yet. Get started by adding one.</p>}
      </div>
    </>
  );
};

const KPIs = () => {
  const ctx = useContext(ProjectContext);
  const logframeLevels = ['Goal', 'Outcome', 'Output', 'Activity'];
  const [selectedLogframeLevels, setSelectedLogframeLevels] = useState(new Set(['Goal', 'Outcome', 'Output', 'Activity']));
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <>
      <div className="flex flex-row justify-center">
        <h1 className="prose text-5xl p-10">Key performance indexes (KPIs)</h1>
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-3 px-10">
        <Autocomplete
          allowsCustomValue
          inputValue={searchQuery}
          onInputChange={setSearchQuery}
          className="max-w-md"
          defaultItems={ctx.adjustedKPIs}
          label="KPI"
          placeholder="Search for KPIs"
        >
          {(item) => <AutocompleteItem key={item.id}>{item.indicator}</AutocompleteItem>}
        </Autocomplete>
        <Select
          label="Logframe levels" 
          placeholder='Filter by logframe levels'
          selectionMode="multiple"
          classNames={{
            base: "max-w-sm", // Controls the width of the entire component
            trigger: "max-w-sm", // Controls the width of the trigger button
            value: "mt-2"
          }}
          renderValue={(items) => (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Chip key={item.key}>{item.textValue}</Chip>
              ))}
            </div>
          )}
          onSelectionChange={items => setSelectedLogframeLevels(items)}
        >
          {logframeLevels.map(level => (
            <SelectItem key={level}>{level}</SelectItem>
          ))}
        </Select>
        <Button size='lg' color='primary'>Add KPI</Button>
      </div>
      <KPIsList kpis={ctx.adjustedKPIs?.filter(kpi => {
        return (selectedLogframeLevels.size == 0 || selectedLogframeLevels.has(kpi.logframe_level))
        && kpi.indicator.toLowerCase().includes(searchQuery.toLowerCase());
      })} />
    </>
  );
};

export default KPIs;