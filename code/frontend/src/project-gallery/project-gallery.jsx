import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";

const projects = [
    { name: "Project X", startDate: "15-01-2024", progress: 80 },
    { name: "Project Y", startDate: "01-02-2024", progress: 50 },
    { name: "Project Z", startDate: "10-03-2024", progress: 30 },
];

const ProjectGallery = () => {
    const [activeTab, setActiveTab] = useState("projects");

    return (
        <div className="flex flex-col h-screen p-6">
            {/* Tabs Section */}
            <div className="flex space-x-4 mb-6">
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

            {/* Projects Tab */}
            {activeTab === "projects" && (
                <div className="flex flex-col rounded-xl shadow-lg p-6 mb-6 overflow-y-auto h-[90%] border border-amber-300">
                    <h1 className="text-4xl font-bold mb-4 border-b border-amber-400 pb-2">
                        Your Projects
                    </h1>
                    <div className="flex gap-8">
                        {projects.map((project, index) => (
                            <Card
                                key={index}
                                className="border border-amber-400 p-4 rounded-lg shadow-md w-64 h-64"
                            >
                                <CardHeader>
                                    <h2 className="text-lg font-semibold">{project.name}</h2>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-sm">Start Date: {project.startDate}</p>
                                    <h3 className="text-sm font-medium mt-2">Project Progress</h3>
                                    <div className="w-full bg-gray-400 rounded-full h-3 mt-1">
                                        <div
                                            className="bg-green-500 h-3 rounded-full"
                                            style={{ width: `${project.progress}%` }}
                                        ></div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
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
                    {/* You can add charts or data visualizations here */}
                </div>
            )}
        </div>
    );
};

export default ProjectGallery;
