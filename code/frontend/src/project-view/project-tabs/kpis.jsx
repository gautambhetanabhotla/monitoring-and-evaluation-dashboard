import { useContext, useState } from 'react';
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { Divider } from "@heroui/divider";
import {Button} from "@heroui/button";
import {Progress} from '@heroui/progress';
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
import {Chip} from "@heroui/chip";
import {Select, SelectItem} from "@heroui/select";
import {Modal, ModalContent, useDisclosure} from "@heroui/modal";
import {Input, Textarea} from "@heroui/input";
import {NumberInput} from "@heroui/number-input";
import {Form} from "@heroui/form";

import axios from 'axios';

import { PencilSquareIcon } from '@heroicons/react/24/solid';

import { ProjectContext } from '../project-context.jsx';

const EditKPIButton = ({ kpi }) => {

  const ctx = useContext(ProjectContext);
  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [logFrameLevel, setLogFrameLevel] = useState(new Set([kpi.logframe_level]));
  const [title, setTitle] = useState(kpi.indicator);
  const [whatItTracks, setWhatItTracks] = useState(kpi.what_it_tracks);
  const [explanation, setExplanation] = useState(kpi.explanation);
  const [baseline, setBaseline] = useState(kpi.baseline);
  const [target, setTarget] = useState(kpi.target);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.put(`/api/kpi/edit/${kpi.id}`, {
      id: kpi.id,
      project_id: ctx.project.id,
      indicator: title,
      what_it_tracks: whatItTracks,
      logframe_level: Array.from(logFrameLevel)[0],
      explanation: explanation,
      baseline: baseline,
      target: target,
    })
    .then(res => {
      if(!res.data.success) return;
      console.dir(res);
      ctx.editKPI({
        id: res.data.data._id,
        project_id: ctx.project.id,
        indicator: title,
        what_it_tracks: whatItTracks,
        logframe_level: Array.from(logFrameLevel)[0],
        explanation: explanation,
        baseline: baseline,
        target: target,
      });
      setLoading(false);
      onClose();
    });
  };

  const handleLogFrameLevelChange = (set) => {
    setLogFrameLevel(set);
  };

  return (
    <>
      <div className='absolute right-5 top-5'>
        <Button onPress={onOpen} isIconOnly><PencilSquareIcon className='size-6'/></Button>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={false}
        hideCloseButton={false}
        className='p-9'
        size='xl'
      >
        <ModalContent>
          <Form onSubmit={handleSubmit}>
            <Input isRequired label='Title' value={title} onValueChange={setTitle} />
            <Input isRequired label='What does it track?' value={whatItTracks} onValueChange={setWhatItTracks} />
            <Select
              isRequired
              label='Logframe level'
              selectedKeys={logFrameLevel}
              onSelectionChange={handleLogFrameLevelChange}
              selectionMode='single'
            >
              <SelectItem key='Goal'>Goal</SelectItem>
              <SelectItem key='Outcome'>Outcome</SelectItem>
              <SelectItem key='Output'>Output</SelectItem>
              <SelectItem key='Activity'>Activity</SelectItem>
            </Select>
            <Textarea label='Explanation' value={explanation} onValueChange={setExplanation} />
            <div className='flex flex-row gap-2 mt-5'>
            <NumberInput isRequired label='Baseline' value={baseline} onValueChange={setBaseline} />
            <NumberInput isRequired label='Target' value={target} onValueChange={setTarget} />
            </div>
            <div className='flex flex-row gap-2 mt-5'>
              <Button color='primary' size='lg' type='submit' isLoading={loading}>Submit</Button>
              <Button color='default' variant='bordered' size='lg' onPress={onClose}>Close</Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
    </>
  );
};

const KPI = ({ kpi }) => {
  const percentagecompletion = parseInt(100 * (
    (parseFloat(kpi.current) - parseFloat(kpi.baseline))
    / (parseFloat(kpi.target) - parseFloat(kpi.baseline))));
  return (
    <>
      <Card className="m-3 z-0">
        <CardHeader className="relative">
          <span className="prose text-2xl font-bold py-5 px-2 z-0 pr-16">{kpi.indicator}</span>
          <EditKPIButton kpi={kpi} aria-label="Edit KPI" />
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

const AddKPIButton = () => {

  const ctx = useContext(ProjectContext);
  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [logFrameLevel, setLogFrameLevel] = useState(new Set(['']));
  const [title, setTitle] = useState('');
  const [whatItTracks, setWhatItTracks] = useState('');
  const [explanation, setExplanation] = useState('');
  const [baseline, setBaseline] = useState(0);
  const [target, setTarget] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const kpi = {
      project_id: ctx.project.id,
      indicator: title,
      what_it_tracks: whatItTracks,
      logframe_level: Array.from(logFrameLevel)[0],
      explanation: explanation,
      baseline: baseline,
      target: target,
    };
    axios.post(`/api/kpi/create`, kpi)
    .then(res => {
      if(!res.data.success) return;
      console.dir(res);
      ctx.addKPI({...kpi, id: res.data.id});
      setLoading(false);
      onClose();
    });
  };

  const handleLogFrameLevelChange = (set) => {
    setLogFrameLevel(set);
  };

  return (
    <>
      <Button
        size='lg'
        color='primary'
        onPress={onOpen}
      >
        Add KPI
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        isKeyboardDismissDisabled={false}
        hideCloseButton={false}
        className='p-9'
        size='xl'
      >
        <ModalContent>
          <Form onSubmit={handleSubmit}>
            <Input isRequired label='Title' value={title} onValueChange={setTitle} />
            <Input isRequired label='What does it track?' value={whatItTracks} onValueChange={setWhatItTracks} />
            <Select
              isRequired
              label='Logframe level'
              selectedKeys={logFrameLevel}
              onSelectionChange={handleLogFrameLevelChange}
              selectionMode='single'
            >
              <SelectItem key='Goal'>Goal</SelectItem>
              <SelectItem key='Outcome'>Outcome</SelectItem>
              <SelectItem key='Output'>Output</SelectItem>
              <SelectItem key='Activity'>Activity</SelectItem>
            </Select>
            <Textarea label='Explanation' value={explanation} onValueChange={setExplanation} />
            <div className='flex flex-row gap-2 mt-5'>
            <NumberInput isRequired label='Baseline' value={baseline} onValueChange={setBaseline} />
            <NumberInput isRequired label='Target' value={target} onValueChange={setTarget} />
            </div>
            <div className='flex flex-row gap-2 mt-5'>
              <Button color='primary' size='lg' type='submit' isLoading={loading}>Submit</Button>
              <Button color='danger' size='lg' onPress={onClose}>Close</Button>
            </div>
          </Form>
        </ModalContent>
      </Modal>
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
        <h1 className="prose text-5xl p-10">Key performance indicators (KPIs)</h1>
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
        <AddKPIButton />
      </div>
      <KPIsList kpis={ctx.adjustedKPIs?.filter(kpi => {
        return (selectedLogframeLevels.size == 0 || selectedLogframeLevels.has(kpi.logframe_level))
        && kpi.indicator.toLowerCase().includes(searchQuery.toLowerCase());
      })} />
    </>
  );
};

export default KPIs;
export { EditKPIButton, KPI, KPIsList, AddKPIButton };
