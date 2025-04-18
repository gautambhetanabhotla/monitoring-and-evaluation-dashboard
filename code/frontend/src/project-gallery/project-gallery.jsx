import React, { useState, useEffect, useContext } from "react";
import { Button } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Alert } from "@heroui/alert";
import { Plus, Key, Trash2, LogOut, Users, LayoutDashboard, ChevronDown } from "lucide-react";
import { AuthContext } from "../AuthContext";
import StatsTab from "./stats-tab";
import ProjectsTab from "./projects-tab";

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
        return data.projects.map(({ name, start_date, project_progress, _id }) => ({
            name,
            start_date,
            project_progress,
            _id
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
    const [activeTab, setActiveTab] = useState("visualization");
    const [clientProjects, setClientProjects] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const queryParams = new URLSearchParams(location.search);
    const clientId = queryParams.get('clientId');

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState("");

    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const [clientData, setClientData] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const resetFormFields = () => {
        setName("");
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setDescription("");
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
                    start_date: startDate,
                    end_date: endDate,
                    project_progress: 0,
                    description
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
                            onPress={() => setActiveTab("visualization")}
                            className={`w-full justify-start ${
                                activeTab === "visualization" 
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
                    {activeTab === "visualization" && (
                        <StatsTab clientProjects={clientProjects} clientId={clientId} />
                    )}

                    {activeTab === "projects" && (
                        <ProjectsTab clientProjects={clientProjects} clientId={clientId} />
                    )}
                </div>
            </div>

            <Modal isOpen={isOpen} onOpenChange={handleOpenChange} placement="center" size="md">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Add Project</ModalHeader>
                            <ModalBody>
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
                            <Input
                                isRequired
                                label="Start Date"
                                labelPlacement="outside"
                                placeholder="Enter start date"
                                variant="bordered"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <Input
                                isRequired
                                label="End Date"
                                labelPlacement="outside"
                                placeholder="Enter end date"
                                variant="bordered"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                            />
                            <Textarea
                                isRequired
                                label="Project Description"
                                labelPlacement="outside"
                                placeholder="Describe the project here, in 500 characters"
                                variant="bordered"
                                maxLength={500}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                minRows={3}
                                maxRows={5}
                                className="max-h-40 overflow-y-auto"
                            />
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
