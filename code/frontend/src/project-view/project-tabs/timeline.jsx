import {Button} from "@heroui/button";
import {Textarea} from "@heroui/input";
import {Divider} from "@heroui/divider";
import {Card} from "@heroui/card";
import {Link} from "@heroui/link";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
import {Select, SelectItem} from "@heroui/select";
// import {Chip} from "@heroui/chip";
import {Popover, PopoverTrigger, PopoverContent} from "@heroui/popover";
import {Modal, ModalContent, useDisclosure} from "@heroui/modal";
import {Form} from "@heroui/form";
import {Input} from "@heroui/input";
import {NumberInput} from "@heroui/number-input";
import {Spacer} from "@heroui/spacer";

import { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { ProjectContext } from "../project-context.jsx";

import { PencilSquareIcon,
         CheckCircleIcon,
         ArrowTrendingDownIcon,
         ArrowTrendingUpIcon,
         PlusIcon,
         CheckIcon,
         ArrowsUpDownIcon } from "@heroicons/react/24/outline";

const AddTaskButton = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const ctx = useContext(ProjectContext);
  return (
    <>
      <Popover showArrow data-testid="add-task-button">
        <PopoverTrigger>
          <Button
            size='lg'
            color='primary'
            startContent={<PlusIcon className="size-6" />}
          >
            Add task
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
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
              })
              .catch(err => {
                console.error("Axios request failed:", err.response?.data?.message || err.message);
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
            <Button color='primary' type="submit" startContent={<PlusIcon className="size-6" />}>Add</Button>
            <Spacer />
          </Form>
        </PopoverContent>
      </Popover>
    </>
  );
};

const KPIUpdateButton = ({ task }) => {

  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const [loading, setLoading] = useState(false);

  const ctx = useContext(ProjectContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKPIid, setSelectedKPIid] = useState(null);
  const [finalValue, setFinalValue] = useState(""); // Initialize as empty string
  const [note, setNote] = useState("");
  const initialValue = ctx.adjustedKPIs?.find(kpi => kpi.id === selectedKPIid)?.current;

  const handleKPIselectionChange = (id) => {
    setSelectedKPIid(id);
    setSearchQuery(ctx.adjustedKPIs?.find(kpi => kpi.id === id)?.indicator || "");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    // console.log("SUBMITTING");
    // console.log(finalValue);
    const update = {
      // id: `kpi${ctx.KPIUpdates.length + 1}`,
      project: ctx.project.id,
      task: task.id,
      kpi: selectedKPIid,
      note: note,
      initial: initialValue,
      final: finalValue,
      date: new Date(),
    };
    axios.put(`/api/kpi/update/${selectedKPIid}`, {
      project_id: ctx.project.id,
      task_id: task.id,
      kpi_id: selectedKPIid,
      initial: initialValue,
      final: finalValue,
      updated_at: new Date(),
      note: note,
    })
    .then(res => {
      console.log(ctx.project.id);
      console.dir(res);
      ctx.updateKPI({
        ...update,
        id: res.data.id,
        updatedby: res.data.updatedby
      });
      setLoading(false);
      onClose();
    })
    .catch(err => {
      console.error("Axios request failed:", err.response?.data?.message || err.message);
      setLoading(false);
      onClose();
    });
  };

  return (
    <>
      <Button data-testid="kpi-update-button" onPress={onOpen} isIconOnly>
        <PlusIcon className="size-6" />
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        hideCloseButton={false}
        className="p-7"
      >
        <ModalContent>
          <Form onSubmit={handleSubmit}>
            <Spacer />
            <Autocomplete
              // autoFocus
              isRequired
              inputValue={searchQuery}
              onInputChange={setSearchQuery}
              selectedKey={selectedKPIid}
              onSelectionChange={handleKPIselectionChange}
              className="max-w-md"
              defaultItems={ctx.adjustedKPIs}
              label="KPI"
              placeholder="What KPI are you updating?"
            >
              {(item) => <AutocompleteItem key={item.id}>{item.indicator}</AutocompleteItem>}
            </Autocomplete>
            <NumberInput
              isInvalid={finalValue == null}
              label="Final value"
              isRequired
              value={finalValue}
              onValueChange={setFinalValue}
            />
            <Textarea
              label="Note"
              value={note}
              onValueChange={setNote}
            />
            <Spacer />
            <Button isLoading={loading} color='primary' type="submit" startContent={<CheckIcon className="size-6" />}>Update</Button>
            <Spacer />
          </Form>
        </ModalContent>
      </Modal>
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

const Task = ({ task }) => {

  const [title, setTitle] = useState(task?.title);
  const [description, setDescription] = useState(task?.description);
  const [editableDescription, setEditableDescription] = useState(false);
  const [chronologicalOrder, setChronologicalOrder] = useState(false);
  const ctx = useContext(ProjectContext);

  useEffect(() => {
    setTitle(task?.title);
  }, [task?.title]);
  useEffect(() => {
    setDescription(task?.description);
  }, [task?.description]); // Removing this useEffect causes the task to inherit the description of the previous task on first render. Why?

  // const updates = ctx.KPIUpdates.filter(update => update.task === task?.id );
  const [updates, setUpdates] = useState([]);
  useEffect(() => {
    console.dir(ctx.KPIUpdates.filter(update => {
      console.dir(update);
      return update.task === task?.id;
    }));
    setUpdates(ctx.KPIUpdates.filter(update => update.task === task?.id ));
    console.log(`updates for task ${task?.title}: ${updates.length}`);
  }, [ctx.KPIUpdates, task?.id, task?.title, updates.length]);
  
  // console.dir(updates);

  const buttonAction = () => {
    setEditableDescription(!editableDescription);
    if (editableDescription) {
      // await axios.fetch
      ctx.updateTaskDescription(task?.id, description);
    }
  };

  return (
    <>
      <Divider className="mt-10" />
      <h1 data-testid="task" className="prose text-5xl pl-10 mt-10">{title}</h1>
      <div className="pl-10">
        <h2 className="prose text-3xl p-10">Description</h2>
        <Textarea
          isReadOnly={!editableDescription}
          value={description}
          onValueChange={setDescription}
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
        <h2 className="prose text-3xl p-10 flex items-center gap-5">
          KPI Updates
          <KPIUpdateButton task={task} />
          <Button isIconOnly onPress={() => setChronologicalOrder(!chronologicalOrder)}>
            <ArrowsUpDownIcon className="size-6" />
          </Button>
        </h2>
        {updates &&
          chronologicalOrder ? updates.map( (kpiupdate, index) => <KPIUpdate update={kpiupdate} key={index} /> ):
          updates.slice().reverse().map( (kpiupdate, index) => <KPIUpdate update={kpiupdate} key={index} /> )
        }
        <div className="pl-10 mt-1">
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
