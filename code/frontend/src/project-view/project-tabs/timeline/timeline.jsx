import {Button} from "@heroui/button";
import {Textarea} from "@heroui/input";
// import {Divider} from "@heroui/divider";
import {Card} from "@heroui/card";
import {Link} from "@heroui/link";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
import {Select, SelectItem} from "@heroui/select";
// import {Chip} from "@heroui/chip";
import {Popover, PopoverTrigger, PopoverContent} from "@heroui/popover";
import {Form} from "@heroui/form";
import {Input} from "@heroui/input";
// import {NumberInput} from "@heroui/number-input";
import {Spacer} from "@heroui/spacer";

import { 
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

import { useState, useContext, useEffect } from 'react';

import axios from 'axios';

import { Task, KPIUpdateButton } from "./task.jsx";

import { ProjectContext } from "../../project-context.jsx";

const AddTaskButton = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const ctx = useContext(ProjectContext);
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <>
      <Popover showArrow isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger>
          <Button
            size='lg'
            color='primary'
            data-testid="add-task-button"
            startContent={<PlusIcon className="size-6" />}
          >
            Add task
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              // console.log("submitting " + title + " " + description);
              axios.post('/api/task/create', {
                project_id: ctx.project.id,
                title: title,
                description: description,
              })
              .then(res => {
                if (!res.data.success) return;
                console.dir(res.data);
                ctx.addTask(res.data.id, title, description);
                setIsPopoverOpen(false);
                setTitle('');
                setDescription('');
                setLoading(false);
              })
              .catch(err => {
                console.error("Axios request failed:", err.response?.data?.message || err.message);
                setLoading(false);
                setIsPopoverOpen(false);
              });
            }}
          >
            <Spacer />
            <Input
              label="Task title"
              isRequired
              errorMessage="A title is required."
              value={title}
              onValueChange={setTitle}
            />
            <Textarea
              label="Task description"
              value={description}
              onValueChange={setDescription}
            />
            <Spacer />
            <Button
              color='primary'
              type="submit"
              startContent={<PlusIcon className="size-6" />}
              isLoading={loading}
            >
              Add
            </Button>
            <Spacer />
          </Form>
        </PopoverContent>
      </Popover>
    </>
  );
};

const Timeline = () => {

  const [chronologicalOrder, setChronologicalOrder] = useState(false); // Chronological order is oldest to newest
  // setChronologicalOrder(false);
  const ctx = useContext(ProjectContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState(ctx.tasks);

  const [value, setValue] = useState(new Set(['Sort: Newest to oldest']));

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setFilteredTasks(ctx.tasks.filter(task => query.length === 0 || task.title.toLowerCase().includes(query.toLowerCase())));
  };

  const handleSelectChange = (set) => {
    if (set.has('Sort: Newest to oldest')) {
      setChronologicalOrder(false);
      setValue(set);
    } else {
      setChronologicalOrder(true);
      setValue(set);
    }
  };

  useEffect(() => {
    setFilteredTasks(ctx.tasks);
  }, [ctx.tasks]);

  return (
    <>
      <div className="flex flex-row justify-center">
        <h1 className="prose text-6xl p-10">Project timeline</h1>
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-3 px-10">
        <Autocomplete
          allowsCustomValue
          inputValue={searchQuery}
          onInputChange={handleSearchChange}
          className="max-w-md"
          defaultItems={ctx.tasks}
          // label="KPI"
          aria-label="Search for tasks"
          placeholder="Search for tasks"
          size="lg"
        >
          {(item) => <AutocompleteItem key={item.id}>{item.title}</AutocompleteItem>}
        </Autocomplete>
        <Select
          className="max-w-xs"
          size='lg'
          aria-label="Sort by date"
          selectedKeys={value}
          onSelectionChange={handleSelectChange}
        >
          <SelectItem key='Sort: Newest to oldest'>Sort: Newest to oldest</SelectItem>
          <SelectItem key='Sort: Oldest to newest'>Sort: Oldest to newest</SelectItem>
        </Select>
        <AddTaskButton />
      </div>
      {chronologicalOrder ? 
        filteredTasks.map((task, index) => <Task task={task} key={index} /> ) : 
        filteredTasks.slice().reverse().map( (task, index) => <Task task={task} key={index} /> )}
      <div className="flex flex-row justify-center mt-10">
        {filteredTasks.length === 0 &&
        (ctx.tasks.length === 0 ?
        <p className='prose text-xl'>No tasks exist yet. Get started by adding one.</p> :
        <p className='prose text-xl'>No tasks match the search parameters.</p>)
        }
      </div>
    </>
  );
};

const KPIUpdate = ({ update }) => {
  const ctx = useContext(ProjectContext);
  return (
    <>
      <Card className="max-w-2xl m-2 ml-10 p-5">
        <h3 data-testid="kpi-update" className="prose text-xl font-bold">{ctx.adjustedKPIs?.find(kpi => kpi.id === update.kpi)?.indicator}</h3>
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
export { Task, KPIUpdate, AddTaskButton, KPIUpdateButton };
