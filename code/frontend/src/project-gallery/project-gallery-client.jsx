import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useLocation, useNavigate } from "react-router-dom";

const getProjectsByClientId = async (clientId) => {
    try {
        let url = "http://localhost:5011/api/projects/getProjects";
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

    useEffect(() => {
        const fetchProjects = async () => {
            const projects = await getProjectsByClientId(clientId);
            setClientProjects(projects);
        };
        fetchProjects();
    }, [clientId]);

    const logout = async () => {
        try {
            const response = await fetch("http://localhost:5011/api/auth/logout", {
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

    return (
        <div className="flex flex-col h-screen p-6">
            {/* Tabs Section */}
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
                </div>
                {/* Right-align the logout button */}
                <Button
                    className="text-xl font-bold py-2 px-4 bg-amber-300 text-black"
                    onPress={logout}
                    size="md"
                    radius="large"
                >
                    Logout
                </Button>
            </div>

            {/* Projects Tab */}
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

            {/* Visualization Tab */}
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
