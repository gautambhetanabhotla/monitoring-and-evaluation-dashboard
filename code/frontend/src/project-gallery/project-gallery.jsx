import React, { useState, useEffect, useContext } from "react";
import { Button } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Alert } from "@heroui/alert";
import { Plus, Key, Trash2, LogOut, Users, LayoutDashboard, ChevronDown } from "lucide-react";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Chip } from "@heroui/chip";
import { DatePicker } from "@heroui/date-picker";
import { AuthContext } from "../AuthContext";
import StatsTab from "./stats-tab";
import ProjectsTab from "./projects-tab";
import { CalendarDate } from "@internationalized/date";

const getProjectsByClientId = async (clientId) => {
    try {
        let url = "/api/projects/getProjects";
        if (clientId) {
            url += `?clientId=${clientId}`;
        }
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (!data.success) {
            console.error("Error fetching projects:", data.message);
            return [];
        }
        return data.projects.map(({ name, start_date, project_progress, _id, states }) => ({
            name,
            start_date,
            project_progress,
            _id,
            states
        }));
    } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
    }
};

const getClientData = async (clientId) => {
    try {
        let url = "/api/user/getUser";
        if (clientId) {
            url += `?clientId=${clientId}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        if (!data.success) {
            console.error("Error fetching client data:", data.message);
            return null;
        }
        return data.user;
    } catch (error) {
        console.error("Error fetching client data:", error);
        return null;
    }
};

const ProjectGallery = () => {
    const [activeTab, setActiveTab] = useState("stats");
    const [clientProjects, setClientProjects] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const queryParams = new URLSearchParams(location.search);
    const clientId = queryParams.get('clientId');

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
    const [endDate, setEndDate] = useState(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
    const [description, setDescription] = useState("");
    const [selectedStates, setSelectedStates] = useState(new Set());

    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 
        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
        'Lakshadweep', 'Delhi', 'Puducherry', 'Ladakh', 'Jammu and Kashmir'
    ];

    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const [clientData, setClientData] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const resetFormFields = () => {
        setName("");
        setStartDate(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
        setEndDate(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
        setDescription("");
        setSelectedStates(new Set());
    };

    useEffect(() => {
        const fetchData = async () => {
            const projects = await getProjectsByClientId(clientId);
            setClientProjects(projects);

            const client = await getClientData(clientId);
            setClientData(client);
        };
        fetchData();
    }, [clientId]);

    useEffect(() => {
        if (!isOpen) {
            resetFormFields();
        }
    }, [isOpen]);

    const createProject = async () => {
        try {
            const response = await fetch(`/api/projects/addProject/${clientId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    start_date: startDate.toString(),
                    end_date: endDate.toString(),
                    project_progress: 0,
                    description,
                    states: Array.from(selectedStates)
                })
            });
    
            const data = await response.json();
            if (data.success) {
                const updatedProjects = await getProjectsByClientId(clientId);
                setClientProjects(updatedProjects);

                resetFormFields();
                onOpenChange(false);
            } else {
                console.error("Adding project failed:", data.message);
            }
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    const handleOpenChange = (open) => {
        if (!open) {
            resetFormFields();
        }
        onOpenChange(open);
    };

    const generatePassword = async () => {
        try {
            const length = Math.floor(Math.random() * (11 - 8 + 1)) + 8;
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let pwd = '';
          
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                pwd += characters[randomIndex];
            }

            const response = await fetch(`/api/user/updatepwd/${clientId}`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    pwd
                })
            });
            const data = await response.json();

            if (data.success) {
                setPassword(`New password: ${pwd}`);
                setEmailSent(data.emailSent);
                setShowAlert(true);
                
                setTimeout(() => {
                    setShowAlert(false);
                    setPassword("");
                    setEmailSent(false);
                }, 7000);
            } else {
                console.error("Updating password failed:", data.message);
            }
        } catch (error) {
            console.error("Error generating password:", error);
        }
    };

    const removeClient = async () => {
        try {
            const response = await fetch(`/api/user/delete/${clientId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            const data = await response.json();
            if (data.success) {
                setConfirmDeleteOpen(false);
                navigate('/clients');
            } else {
                console.error("Removing client failed:", data.message);
                setConfirmDeleteOpen(false);
            }
        } catch (error) {
            console.error("Error removing client:", error);
            setConfirmDeleteOpen(false);
        }
    };

    const removeState = (stateToRemove) => {
        const newStates = new Set(selectedStates);
        newStates.delete(stateToRemove);
        setSelectedStates(newStates);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">
                        {clientData ? clientData.username : 'Loading...'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Project Gallery</p>
                </div>

                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        <Button 
                            onPress={() => setActiveTab("stats")}
                            className={`w-full justify-start ${
                                activeTab === "stats" 
                                ? "bg-blue-50 text-blue-700" 
                                : "bg-transparent text-gray-700 hover:bg-gray-100"
                            }`}
                            startContent={<LayoutDashboard size={20} />}
                            >
                            Dashboard
                        </Button>
                        
                        <Button 
                            onPress={() => setActiveTab("projects")}
                            className={`w-full justify-start ${
                                activeTab === "projects" 
                                ? "bg-blue-50 text-blue-700" 
                                : "bg-transparent text-gray-700 hover:bg-gray-100"
                            }`}
                            startContent={<Users size={20} />}
                            >
                            Projects
                        </Button>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200">
                <div className="space-y-2">
                    {clientId && (
                        <>
                        <Button 
                            onPress={onOpen}
                            className="w-full justify-start bg-transparent text-gray-700 hover:bg-gray-100"
                            startContent={<Plus size={20} />}
                        >
                        New Project
                        </Button>
                        
                        <Button 
                            onPress={generatePassword}
                            className="w-full justify-start bg-transparent text-gray-700 hover:bg-gray-100"
                            startContent={<Key size={20} />}
                        >
                        Update Password
                        </Button>
                        
                        <Button 
                            onPress={() => setConfirmDeleteOpen(true)}
                            className="w-full justify-start bg-transparent text-red-600 hover:bg-red-50"
                            startContent={<Trash2 size={20} />}
                        >
                        Remove Client
                        </Button>
                        </>
                    )}
                    
                    <Button 
                        onPress={logout}
                        className="w-full justify-start bg-transparent text-gray-700 hover:bg-gray-100"
                        startContent={<LogOut size={20} />}
                    >
                    Logout
                    </Button>
                </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {clientId && (
                    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                        <Button
                            onPress={() => navigate('/clients')}
                            variant="light"
                            className="text-gray-700 hover:text-gray-900"
                            startContent={<ChevronDown className="rotate-90" size={20} />}
                        >
                            Back to Clients
                        </Button>

                        {showAlert && (
                            <div className="fixed top-4 right-4 z-50">
                                <Alert 
                                    className="max-w-md"
                                    variant="solid"
                                    color="success"
                                    onClose={() => setShowAlert(false)}
                                >
                                    <div className="font-medium text-sm">Password updated successfully!</div>
                                    <div className="text-sm">{password}</div>
                                    {emailSent 
                                        ? <div className="text-xs mt-1">An email containing the new password has been sent.</div>
                                        : <div className="text-xs mt-1 text-yellow-200">Warning: Failed to send password email.</div>
                                    }
                                </Alert>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-auto p-8">
                    {activeTab === "stats" && (
                        <StatsTab clientProjects={clientProjects} clientId={clientId} />
                    )}

                    {activeTab === "projects" && (
                        <ProjectsTab clientProjects={clientProjects} clientId={clientId} />
                    )}
                </div>
            </div>

            <Modal 
                isOpen={isOpen} 
                onOpenChange={handleOpenChange} 
                placement="center" 
                size="md"
                isDismissable={false}
                isKeyboardDismissDisabled={true}
                scrollBehavior="inside"
                classNames={{
                    base: "max-h-[80vh]",
                    body: "overflow-y-auto py-4"
                }}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add Project</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                <Input
                                    isRequired
                                    label="Project Name"
                                    labelPlacement="outside"
                                    placeholder="Enter project name"
                                    variant="bordered"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm">
                                        Select States/UTs
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-2">
                                        <Listbox
                                            aria-label="Select States/UTs"
                                            selectionMode="multiple"
                                            selectedKeys={selectedStates}
                                            onSelectionChange={setSelectedStates}
                                            disallowEmptySelection
                                            isVirtualized
                                            virtualization={{
                                                maxListboxHeight: 200,
                                                itemHeight: 40,
                                            }}
                                        >
                                            {indianStates.map((state) => (
                                                <ListboxItem key={state}>
                                                    {state}
                                                </ListboxItem>
                                            ))}
                                        </Listbox>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(selectedStates).map((state) => (
                                            <Chip
                                                key={state}
                                                onClose={() => removeState(state)}
                                                variant="flat"
                                                color="primary"
                                            >
                                                {state}
                                            </Chip>
                                        ))}
                                    </div>
                                    {selectedStates.size === 0 && (
                                        <small className="text-gray-500">
                                            At least one state is required
                                        </small>
                                    )}
                                </div>
                                <DatePicker
                                    isRequired
                                    label="Start Date"
                                    labelPlacement="outside"
                                    placeholder="Select start date"
                                    variant="bordered"
                                    defaultValue={startDate}
                                    showMonthAndYearPickers
                                    onChange={(date) => setStartDate(date || new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()))}
                                />
                                <DatePicker
                                    isRequired
                                    label="End Date"
                                    labelPlacement="outside"
                                    placeholder="Select end date"
                                    variant="bordered"
                                    defaultValue={endDate}
                                    showMonthAndYearPickers
                                    minValue={startDate}
                                    onChange={(date) => setEndDate(date || new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()))}
                                />
                                <Textarea
                                    isRequired
                                    label="Project Description"
                                    labelPlacement="outside"
                                    placeholder="Describe the project here"
                                    variant="bordered"
                                    maxLength={500}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    minRows={3}
                                    maxRows={5}
                                />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={createProject}>
                                    Add
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={confirmDeleteOpen} onOpenChange={(open) => setConfirmDeleteOpen(open)} placement="center" size="sm">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-red-500">Remove Client</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to remove this client? This action cannot be undone.</p>
                                <p className="font-bold">{clientData?.username}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" onPress={() => setConfirmDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={removeClient}>
                                    Remove
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ProjectGallery;
