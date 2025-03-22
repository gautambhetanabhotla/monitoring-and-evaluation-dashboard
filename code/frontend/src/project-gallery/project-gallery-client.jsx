import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, useDisclosure } from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Alert } from "@heroui/alert";

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

const ProjectGallery = () => {
    const [activeTab, setActiveTab] = useState("projects");
    const [clientProjects, setClientProjects] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const clientId = queryParams.get('clientId');

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState("");

    const [password, setPassword] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const resetFormFields = () => {
        setName("");
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setDescription("");
    };

    useEffect(() => {
        const fetchProjects = async () => {
            const projects = await getProjectsByClientId(clientId);
            setClientProjects(projects);
        };
        fetchProjects();
    }, [clientId]);

    useEffect(() => {
        if (!isOpen) {
            resetFormFields();
        }
    }, [isOpen]);

    const logout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });
    
            const data = await response.json();
            if (data.success) {
                navigate("/"); 
            } else {
                console.error("Logout failed:", data.message);
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

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
                setShowAlert(true);
                
                setTimeout(() => {
                    setShowAlert(false);
                    setPassword("");
                }, 7000);
            } else {
                console.error("Updating password failed:", data.message);
            }
        } catch (error) {
            console.error("Error generating password:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen p-6 relative">
            {showAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <Alert 
                        className="max-w-md"
                        variant="faded"
                        color="success"
                        onClose={() => setShowAlert(false)}
                    >
                        <div className="font-medium">Password updated successfully!</div>
                        <div>{password}</div>
                        <div className="text-xs mt-2">This password will only be shown once. Please copy it now.</div>
                    </Alert>
                </div>
            )}

            <div className="flex justify-between mb-6">
                <div className="flex space-x-4">
                    <Button
                        className={`text-xl font-bold py-2 px-4 ${
                            activeTab === "projects"
                                ? "bg-amber-300 text-black"
                                : "bg-amber-100 text-gray-700"
                        }`}
                        onPress={() => setActiveTab("projects")}
                        size="md"
                        radius="large"
                    >
                        Your Projects
                    </Button>
                    <Button
                        className={`text-xl font-bold py-2 px-4 ${
                            activeTab === "visualization"
                                ? "bg-amber-300 text-black"
                                : "bg-amber-100 text-gray-700"
                        }`}
                        onPress={() => setActiveTab("visualization")}
                        size="md"
                        radius="large"
                    >
                        Your Projects in Numbers
                    </Button>
                    {/* <Button
                        className="text-xl font-bold py-2 px-4"
                        onPress={() => navigate('/projects')}
                        size="md"
                        radius="large"
                    >
                        Go Back
                    </Button> */}
                </div>
                
                <div className="flex space-x-4"> 
                    {clientId && (
                        <>
                        <Button
                            className="text-xl font-bold py-2 px-4 bg-amber-300 text-black"
                            size="md"
                            radius="large"
                            onPress={generatePassword}
                        >
                            Update Password
                        </Button>
                        <Button
                            className="text-xl font-bold py-2 px-4 bg-amber-300 text-black"
                            size="md"
                            radius="large"
                            onPress={onOpen}
                        >
                            Add Project
                        </Button>
                        </>
                    )}
                    <Button
                        className="text-xl font-bold py-2 px-4 bg-amber-300 text-black"
                        onPress={logout}
                        size="md"
                        radius="large"
                    >
                        Logout
                    </Button>

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
                </div>
            </div>

            {activeTab === "projects" && (
                <div className="flex flex-col rounded-xl shadow-lg p-6 mb-6 overflow-y-auto h-[90%] border border-amber-300">
                    <h1 className="text-4xl font-bold mb-4 border-b border-amber-400 pb-2">
                        Your Projects
                    </h1>
                    <div className="flex gap-8 flex-wrap">
                        {clientProjects.length === 0 ? (
                            <p className="text-xl text-gray-500">No projects found.</p>
                        ) : (
                            clientProjects.map((project, index) => (
                                <Card
                                    key={index}
                                    className="border border-amber-400 p-4 rounded-lg shadow-md w-64 h-64"
                                    isPressable
                                    onPress={() => navigate(`/${project._id}`)}
                                >
                                    <CardHeader>
                                        <h2 className="text-lg font-semibold">{project.name}</h2>
                                    </CardHeader>
                                    <CardBody>
                                        <p className="text-sm">Start Date: {project.start_date}</p>
                                        <h3 className="text-sm font-medium mt-2">Project Progress</h3>
                                        <div className="w-full bg-gray-400 rounded-full h-3 mt-1">
                                            <div
                                                className="bg-green-500 h-3 rounded-full"
                                                style={{ width: `${project.project_progress}%` }}
                                            ></div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === "visualization" && (
                <div className="flex flex-col rounded-xl shadow-lg p-6 h-[90%] border border-amber-300">
                    <h1 className="text-4xl font-bold mb-4 border-b border-amber-400 pb-2">
                        Your Projects in Numbers
                    </h1>
                    <p className="text-2xl">Stats and charts go here...</p>
                </div>
            )}
        </div>
    );
};

export default ProjectGallery;
