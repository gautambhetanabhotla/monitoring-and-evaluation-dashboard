import React, { useState, useEffect, useContext } from "react";
import { Button } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Alert } from "@heroui/alert";
import { Plus, Key, Trash2, LogOut, Users, LayoutDashboard, ChevronDown, UserRoundPlus } from "lucide-react";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Chip } from "@heroui/chip";
import { DatePicker } from "@heroui/date-picker";
import Select from "react-select";
import { AuthContext } from "../AuthContext";
import StatsTab from "./stats-tab";
import ProjectsTab from "./projects-tab";
import { CalendarDate } from "@internationalized/date";

const getProjectsByClientId = async (userId) => {
    try {
        let url = "/api/projects/getProjects";
        if (userId) {
            url += `?userId=${userId}`;
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

const getClientData = async (userId) => {
    try {
        let url = "/api/user/getUser";
        if (userId) {
            url += `?userId=${userId}`;
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
    const [userProjects, setUserProjects] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);
    const isAdmin = user?.role === "admin";
    const isFieldStaff = user?.role === "field staff";
    const [activeTab, setActiveTab] = useState("");

    const queryParams = new URLSearchParams(location.search);
    const clientId = queryParams.get('clientId');
    const staffId = queryParams.get('staffId');

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

    const [userData, setUserData] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [modalErrors, setModalErrors] = useState("");

    const [fieldStaffModalOpen, setFieldStaffModalOpen] = useState(false);
    const [fieldStaff, setFieldStaff] = useState([]);
    const [selectedFieldStaff, setSelectedFieldStaff] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const resetFormFields = () => {
        setName("");
        setStartDate(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
        setEndDate(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
        setDescription("");
        setSelectedStates(new Set());
        setModalErrors("");
    };

    useEffect(() => {
        const fetchData = async () => {
            const projects = await getProjectsByClientId(clientId || staffId);
            setUserProjects(projects);

            const user = await getClientData(clientId || staffId);
            setUserData(user);
        };
        fetchData();
    }, [clientId, staffId]);

    useEffect(() => {
        if (!isOpen) {
            resetFormFields();
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchFieldAgents = async () => {
            const agents = await retrieveFieldAgents();
            setFieldStaff(agents);
        };
        fetchFieldAgents();
    }, []);

    useEffect(() => {
        if (staffId || isFieldStaff) {
            setActiveTab("projects");
        } else {
            setActiveTab("stats");
        }
    }, [staffId, isFieldStaff]);

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
                setUserProjects(updatedProjects);

                resetFormFields();
                onOpenChange(false);
            } else {
                setModalErrors(data.message);
                setTimeout(() => {
                    setModalErrors("");
                }, 7000);
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

    const generatePassword = async (userId) => {
        try {
            const length = Math.floor(Math.random() * (11 - 8 + 1)) + 8;
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let pwd = '';
          
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                pwd += characters[randomIndex];
            }

            const response = await fetch(`/api/user/updatepwd/${userId}`, {
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

    const removeClient = async (userId) => {
        try {
            const response = await fetch(`/api/user/delete/${userId}`, {
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

    const retrieveFieldAgents = async () => {
        try {
            const response = await fetch("/api/user/clients", {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();
            if (!data.success) {
                console.error("Couldn't fetch field staff:", data.message);
                return [];
            }

            const fieldStaff = data.users.filter(client => client.role === "field staff");
            return fieldStaff.map(({ username, assigned_projects, _id }) => ({
                username,
                projectCount: assigned_projects?.length || 0,
                _id
            }));
        } catch (error) {
            console.error("Error fetching field staff:", error);
            return [];
        }
    };

    const assignFieldAgent = async () => {
        if (!selectedFieldStaff || !selectedProject) {
            console.error("Please select a project AND at least one field staff.");
            return;
        }

        const fieldStaffIds = selectedFieldStaff.map((staff) => staff.value);
        const projectId = selectedProject;
        const projectData = {
            projectId,
            fieldStaffIds
        };

        try {
            const response = await fetch(`/api/user/updateproject`, {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(projectData)
            });
            const data = await response.json();
            if (data.success) {
                setFieldStaffModalOpen(false);
                setSelectedFieldStaff(null);
                setSelectedProject(null);

                const agents = await retrieveFieldAgents();
                setFieldStaff(agents);

                const updatedProjects = await getProjectsByClientId(clientId);
                setUserProjects(updatedProjects);
                console.log("Field agent assigned successfully");
            } else {
                console.error("Error assigning field agent:", data.message);
            }
        }
        catch (error) {
            console.error("Error assigning field agent:", error);
        }
    };

    const projectOptions = userProjects.map((proj) => ({
        value: proj._id,
        label: proj.name,
    }));

    const fieldStaffOptions = fieldStaff.map((agent) => ({
        value: agent._id,
        label: `${agent.username} (${agent.projectCount} projects)`,
    }));

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">
                        {userData ? userData.username : 'Loading...'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Project Gallery</p>
                </div>

                <nav className="flex-1 p-4">
                    <div className="space-y-2">
                        {!staffId && !isFieldStaff && (
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
                        )}
                        
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
                    {isAdmin && (
                        <>
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
                                onPress={() => setFieldStaffModalOpen(true)}
                                className="w-full justify-start bg-transparent text-gray-700 hover:bg-gray-100"
                                startContent={<UserRoundPlus size={20} />}
                            >
                            Assign Field Agent
                            </Button>
                            </>
                        )}
                        
                        <Button 
                            onPress={() => generatePassword(clientId || staffId)}
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
                        Remove User
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
                {isAdmin && (
                    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                        <Button
                            onPress={() => navigate('/clients')}
                            variant="light"
                            className="text-gray-700 hover:text-gray-900"
                            startContent={<ChevronDown className="rotate-90" size={20} />}
                        >
                            Back to Users
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
                    {activeTab === "stats" && !isFieldStaff && !staffId && (
                        <StatsTab clientProjects={userProjects} />
                    )}

                    {activeTab === "projects" && (
                        <ProjectsTab clientProjects={userProjects} clientId={clientId} staffId={staffId} />
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
                            {modalErrors && (
                                <div className="px-6">
                                    <Alert
                                        className="mb-4"
                                        variant="solid"
                                        color="danger"
                                        onClose={() => setModalErrors("")}
                                    >
                                        <div className="font-medium text-sm">{modalErrors}</div>
                                        <div className="text-xs mt-1">Please try again.</div>
                                    </Alert>
                                </div>
                            )}
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
                            <ModalHeader className="flex flex-col gap-1 text-red-500">Remove User</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to remove this client? This action cannot be undone.</p>
                                <p className="font-bold">{userData?.username}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="default" onPress={() => setConfirmDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button color="danger" onPress={() => removeClient(clientId || staffId)}>
                                    Remove
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Modal isOpen={fieldStaffModalOpen} placement="center" size="md" className="overflow-y-auto py-4"
                onOpenChange={(open) => {
                    setFieldStaffModalOpen(open);
                    if (!open) {
                        setSelectedFieldStaff(null);
                        setSelectedProject(null);
                    }
                }}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Assign Field Agent
                            </ModalHeader>
                            <ModalBody className="space-y-4">
                                <div>
                                <label className="text-sm font-medium mb-1 block">Select Project</label>
                                <Select
                                    options={projectOptions}
                                    placeholder="Choose a project"
                                    value={projectOptions.find((opt) => opt.value === selectedProject)}
                                    onChange={(selected) => setSelectedProject(selected?.value || null)}
                                    menuPlacement="bottom"
                                    menuPosition="absolute"
                                    menuShouldScrollIntoView={false}
                                    styles={{
                                        menuList: (base) => ({
                                          ...base,
                                          maxHeight: '20vh',
                                        }),
                                    }}
                                />
                                </div>
                                <div>
                                <label className="text-sm font-medium mb-1 block">Select Field Staff</label>
                                <Select
                                    options={fieldStaffOptions}
                                    placeholder="Choose field staff"
                                    value={selectedFieldStaff}
                                    onChange={(selected) => setSelectedFieldStaff(selected || [])}
                                    isMulti
                                    menuPlacement="bottom"
                                    menuPosition="absolute"
                                    styles={{
                                        menuList: (base) => ({
                                          ...base,
                                          maxHeight: '20vh',
                                        }),
                                    }}
                                />
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={assignFieldAgent}>
                                    Assign
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
