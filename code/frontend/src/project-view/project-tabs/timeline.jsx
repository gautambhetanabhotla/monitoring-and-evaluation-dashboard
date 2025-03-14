import {Button} from "@heroui/button";
import {Textarea} from "@heroui/input";
import {Divider} from "@heroui/divider";
import {Card} from "@heroui/card";
import {Link} from "@heroui/link";

import { useState, useContext } from 'react';

import { ProjectContext } from "../project-page.jsx";

import { PencilSquareIcon,
         CheckCircleIcon,
         ArrowTrendingDownIcon,
         ArrowTrendingUpIcon,
         PlusIcon } from "@heroicons/react/24/outline";

const Timeline = () => {
  const [chronologicalOrder, setChronologicalOrder] = useState(false);
  const ctx = useContext(ProjectContext);
  return (
    <>
      <div className="flex flex-row justify-center">
        <h1 className="prose text-6xl p-10">Project timeline</h1>
      </div>
      {chronologicalOrder ? 
        ctx.tasks.map((task, index) => <Task taskdet={task} key={index} /> ) : 
        ctx.tasks.slice().reverse().map( (task, index) => <Task task={task} key={index} /> )}
      <div className="flex flex-row justify-center mt-10">
        {ctx.tasks.length === 0 && <p className='prose text-xl'>No tasks yet. Get started by adding one.</p>}
      </div>
      <Button
        className='prose text-xl mb-15 sm:p-8 xs:p-4 fixed bottom-5 right-5'
        color='primary'
        size='sm'
        aria-label="Add task"
        startContent={<PlusIcon className="size-6" />}
      >
        Add task
      </Button>
    </>
  );
};

const Task = ({ task }) => {
  const [description, setDescription] = useState(task.description);
  const [editableDescription, setEditableDescription] = useState(false);
  const ctx = useContext(ProjectContext);
  // for(const update of ctx.KPIUpdates)
  // console.log("TASK ID: ", task.id, "KPI UDPDATE ID: ", update.task);
  const updates = ctx.KPIUpdates.filter( (update) => update.task === task.id );
  const buttonAction = () => {
    setEditableDescription(!editableDescription);
    if (!editableDescription) {
      // await axios.fetch
    }
  };
  return (
    <>
      <Divider />
      <h1 className="prose text-5xl pl-10 mt-10">{task.title}</h1>
      <div className="pl-10">
        <h2 className="prose text-3xl p-10">Description</h2>
        <Textarea
          isReadOnly={!editableDescription}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="max-w-2xl ml-10"
          endContent={
            <Button
              isIconOnly
              color={editableDescription ? 'success' : 'primary'}
              size='md'
              onPress={buttonAction}
            >
              {!editableDescription ? 
              <PencilSquareIcon className="size-5" /> : <CheckCircleIcon className="size-6" />}
            </Button>
          }
        />
        <h2 className="prose text-3xl p-10 flex items-center gap-5">KPI Updates<Button isIconOnly onPress={() => {}}><PlusIcon className="size-6" /></Button></h2>
        
        {updates && updates.map( (kpiupdate, index) => <KPIUpdate update={kpiupdate} key={index} /> )}
        <div className="flex flex-row justify-center mt-10">
          {updates?.length === 0 && <p className='prose text-xl'>No KPI updates yet. Get started by adding one.</p>}
        </div>
      </div>
    </>
  );
};

const KPIUpdate = ({ update }) => {
  const ctx = useContext(ProjectContext);
  return (
    <>
      <Card className="max-w-2xl m-2 ml-10 p-5">
        <h3 className="prose text-xl font-bold">{ctx.adjustedKPIs.find(kpi => kpi.id === update.kpi).indicator}</h3>
        <span className="prose pt-2 flex items-center gap-6">
          <span className="prose flex items-center gap-3 text-xl">{update.initial}
          {update.final > update.initial ?
            <ArrowTrendingUpIcon className="size-5 text-green-500" /> :
            <ArrowTrendingDownIcon className="size-5 text-red-500" />
          }
          {update.final}
          </span>
          <p className="prose text-md">on {update.date.toString()} <br />by <Link>{update.updatedby}</Link></p>
        </span>
      </Card>
    </>
  );
};

export default Timeline;