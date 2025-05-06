import {Button} from "@heroui/button";
import {Textarea} from "@heroui/input";
import {Divider} from "@heroui/divider";
import {Modal, ModalContent, useDisclosure} from "@heroui/modal";
import {Form} from "@heroui/form";
import {NumberInput} from "@heroui/number-input";
import {Spacer} from "@heroui/spacer";
import {Autocomplete, AutocompleteItem} from "@heroui/autocomplete";
// import {Alert} from "@heroui/alert";

import {PencilSquareIcon, CheckCircleIcon, ArrowsUpDownIcon, PlusIcon, CheckIcon, ListBulletIcon} from "@heroicons/react/24/outline";

import {useContext, useEffect, useState} from "react";

import axios from "axios";

import { ProjectContext } from "../../project-context.jsx";
import { AuthContext } from "../../../AuthContext.jsx";
import { KPIUpdate } from "./timeline.jsx";
import DocumentViewer, { DocumentCard } from "../../../components/document-viewer.jsx";

const Task = ({ task }) => {

  const [title, setTitle] = useState(task?.title);
  const [description, setDescription] = useState(task?.description);
  const [editableDescription, setEditableDescription] = useState(false);
  const [chronologicalOrder, setChronologicalOrder] = useState(false);
  const [documents, setDocuments] = useState([]);
  const ctx = useContext(ProjectContext);
  const {user} = useContext(AuthContext);

  useEffect(() => {
    setTitle(task?.title);
  }, [task?.title]);
  useEffect(() => {
    setDescription(task?.description);
  }, [task?.description]);
  useEffect(() => {
    setDocuments(ctx.documents?.filter(doc => doc.task && doc.task === task?.id));
  }, [ctx?.documents, task?.id]);

  // const updates = ctx.KPIUpdates.filter(update => update.task === task?.id );
  const [updates, setUpdates] = useState([]);
  useEffect(() => {
    // console.dir(ctx.KPIUpdates.filter(update => {
    //   // console.dir(update);
    //   return update.task === task?.id;
    // }));
    setUpdates(ctx.KPIUpdates.filter(update => update.task === task?.id ));
    // console.log(`updates for task ${task?.title}: ${updates.length}`);
  }, [ctx.KPIUpdates, task?.id]);
  
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
      <h1 data-testid="task" className="prose text-4xl pl-10 mt-10 flex flex-row items-center gap-4"><ListBulletIcon className="size-14" />{title}</h1>
      <div className="">
        <h2 className="prose text-3xl p-5 px-10">About</h2>
        <Textarea
          isReadOnly={!editableDescription}
          value={description}
          onValueChange={setDescription}
          className="max-w-2xl ml-10"
          endContent={user?.role === 'admin' && (
            <Button
              isIconOnly
              color={editableDescription ? 'success' : 'primary'}
              size='md'
              onPress={buttonAction}
            >
              {!editableDescription ? 
              <PencilSquareIcon className="size-5" /> : <CheckCircleIcon className="size-6" />}
            </Button>
          )}
        />
        <h2 className="prose text-3xl p-5 pl-10 flex items-center gap-5">
          KPI Updates
          {user?.role !== 'client' && (
            <KPIUpdateButton task={task} />
          )}
          <Button isIconOnly onPress={() => setChronologicalOrder(!chronologicalOrder)}>
            <ArrowsUpDownIcon className="size-6" />
          </Button>
        </h2>
        {documents && documents.length > 0 && documents.map(
          (document, index) => <DocumentViewer document={document} slot={<DocumentCard />} key={index} />
        )}
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

const KPIUpdateButton = ({ task }) => {

  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const [loading, setLoading] = useState(false);

  const ctx = useContext(ProjectContext);
  const actx = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKPIid, setSelectedKPIid] = useState(null);
  const [finalValue, setFinalValue] = useState(0); // Initialize as empty string
  const [note, setNote] = useState("");
  const initialValue = ctx.adjustedKPIs?.find(kpi => kpi.id === selectedKPIid)?.current;
  // Add these state variables with your other state declarations
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return Promise.reject("Geolocation not supported");
    }
  
    setLocationLoading(true);
    setLocationError(null);
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(locationData);
          setLocationLoading(false);
          resolve(locationData);
        },
        (error) => {
          let errorMessage;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage = "Unknown error occurred";
          }
          setLocationError(errorMessage);
          setLocationLoading(false);
          reject(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleKPIselectionChange = (id) => {
    setSelectedKPIid(id);
    setSearchQuery(ctx.adjustedKPIs?.find(kpi => kpi.id === id)?.indicator || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      // Get location before submitting
      let locationData = null;
      try {
        locationData = await getCurrentLocation();
      } catch (locErr) {
        console.warn("Could not get location:", locErr);
        // Continue without location if there's an error
        setLoading(false);
        return;
      }
      
      const update = {
        project: ctx.project.id,
        task: task.id,
        kpi: selectedKPIid,
        note: note,
        initial: initialValue,
        final: finalValue,
        date: new Date(),
        location: locationData, // Add location data to the update
      };
      
      axios.put(`/api/kpi/update/${selectedKPIid}`, {
        project_id: ctx.project.id,
        task_id: task.id,
        kpi_id: selectedKPIid,
        initial: initialValue,
        final: finalValue,
        updated_at: new Date(),
        note: note,
        location: locationData, // Include location in API request
      })
      .then(res => {
        // console.dir(actx.user);
        ctx.updateKPI({
          ...update,
          id: res.data.id,
          updated_by: {
            _id: actx.user.id,
            username: actx.user.name,
          },
          // location: locationData,
        });
        setLoading(false);
        onClose();
      })
      .catch(err => {
        console.error("Axios request failed:", err.response?.data?.message || err.message);
        setLoading(false);
        onClose();
      });
    } catch (error) {
      console.error("Error in form submission:", error);
      setLoading(false);
    }
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
            <div className="flex items-center text-sm gap-2">
            {locationLoading ? (
              <span className="text-gray-500">Getting your location...</span>
            ) : locationError ? (
              <span className="text-danger">{locationError}, can&apos;t continue</span>
            ) : location ? (
              <span className="text-success flex items-center gap-1">
                <CheckIcon className="size-4" /> Location collected
              </span>
            ) : (
              <span className="text-gray-500">Location will be collected when submitting</span>
            )}
          </div>
            <Spacer />
            <Button isLoading={loading} color='primary' type="submit" startContent={<CheckIcon className="size-6" />}>Update</Button>
            <Spacer />
          </Form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Task;
export {Task, KPIUpdateButton };
