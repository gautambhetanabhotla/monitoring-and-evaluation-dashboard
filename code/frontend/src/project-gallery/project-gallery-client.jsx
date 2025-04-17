import React, { useState, useEffect, useContext } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button, ButtonGroup } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Alert } from "@heroui/alert";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { ChevronLeft, PieChart, LayoutGrid, MoreVertical } from "lucide-react";
import { AuthContext } from "../AuthContext";

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
    const [activeTab, setActiveTab] = useState("projects");
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
        <div className="flex flex-col h-screen p-6 relative">
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

            <div className="mb-6 text-center">
                <h1 className="text-4xl font-bold">
                    {clientData ? clientData.username : 'Loading client...'}
                </h1>
            </div>

            <div className="flex justify-between items-center mb-6 rounded-xl p-3 shadow-md bg-gray-900">
                {clientId && (
                    <Button 
                        className="flex items-center gap-1 text-black"
                        size="md"
                        radius="large"
                        onPress={() => navigate('/clients')}
                        color="primary"
                    >
                        <ChevronLeft size={18} />
                        Back
                    </Button>
                )}

                <ButtonGroup>
                    <Button
                        className={`flex items-center gap-1 ${
                            activeTab === "projects"
                                ? "text-black"
                                : "text-cyan-700"
                        }`}
                        onPress={() => setActiveTab("projects")}
                        size="md"
                        radius="large"
                        color="primary"
                        variant={activeTab === "projects" ? "solid" : "flat"}
                    >
                        <LayoutGrid size={18} />
                        Projects
                    </Button>
                    <Button
                        className={`flex items-center gap-1 ${
                            activeTab === "visualization"
                                ? "text-black"
                                : "text-cyan-700"
                        }`}
                        onPress={() => setActiveTab("visualization")}
                        size="md"
                        radius="large"
                        color="primary"
                        variant={activeTab === "visualization" ? "solid" : "flat"}
                    >
                        <PieChart size={18} />
                        Project Stats
                    </Button>
                </ButtonGroup>

                <Dropdown>
                    <DropdownTrigger>
                        <Button 
                            className="text-black"
                            size="md"
                            radius="large"
                            color="primary"
                        >
                            <MoreVertical size={18} />
                            More
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Client Options">
                        {clientId && (
                            <>
                            <DropdownItem onPress={onOpen} key="add-project">
                                Add Project
                            </DropdownItem>
                            <DropdownItem onPress={generatePassword} key="update-password">
                                Update Password
                            </DropdownItem>
                            <DropdownItem 
                                onPress={() => setConfirmDeleteOpen(true)} 
                                key="remove-client"
                                className="text-red-500"
                            >
                                Remove This Client
                            </DropdownItem>
                            </>
                        )}
                        <DropdownItem onPress={logout} key="logout">
                            Logout
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
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

            {activeTab === "projects" && (
                <div className="flex flex-col rounded-xl shadow-lg p-6 mb-6 overflow-y-auto h-[90%] border border-cyan-800">
                    <h1 className="text-4xl font-bold border-b pb-4 border-cyan-800">
                        Your Projects
                    </h1>
                    <div className="pt-6 overflow-y-auto flex-1">
                    <div className="flex gap-8 flex-wrap">
                        {clientProjects.length === 0 ? (
                            <p className="text-xl text-gray-500">No projects found.</p>
                        ) : (
                            clientProjects.map((project, index) => (
                                <Card
                                    key={index}
                                    className="border border-cyan-800 p-4 rounded-lg shadow-md w-64 h-64"
                                    isPressable
                                    onPress={() => navigate(clientId ? `/${project._id}?clientId=${clientId}` : `/${project._id}`)}
                                >
                                    <CardHeader>
                                        <h2 className="text-lg font-semibold">{project.name}</h2>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-sm">Start Date: {project.start_date}</p>
                                        <h3 className="text-sm font-medium mt-2">Project Progress</h3>
                                        <div className="w-full bg-gray-400 rounded-full h-3 mt-1">
                                            <div
                                                className="bg-green-700 h-3 rounded-full"
                                                style={{ width: `${project.project_progress}%` }}
                                            ></div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))
                        )}
                    </div>
                    </div>
                </div>
            )}

            {activeTab === "visualization" && (
                <div className="flex flex-col rounded-xl shadow-lg p-6 h-[90%] border border-cyan-800">
                    <h1 className="text-4xl font-bold mb-4 border-b pb-4 border-cyan-800">
                        Your Projects in Numbers
                    </h1>
                    <div className="overflow-y-auto flex-1">
                        <p className="text-2xl">Stats and charts go here...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectGallery;
