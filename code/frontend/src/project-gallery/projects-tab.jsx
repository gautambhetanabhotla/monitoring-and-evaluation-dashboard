import React from "react";
import { Card, CardBody } from "@heroui/card";
import { useNavigate } from "react-router-dom";

const ProjectsTab = ({ clientProjects, clientId }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientProjects.map((project, index) => (
                <Card
                    key={index}
                    isPressable
                    onPress={() => navigate(clientId ? `/${project._id}?clientId=${clientId}` : `/${project._id}`)}
                    className="bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                    <CardBody>
                        <h3 className="font-semibold text-lg mb-4">{project.name}</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Start Date</p>
                                <p className="font-medium">{project.start_date}</p>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-medium">{project.project_progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${project.project_progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
};

export default ProjectsTab;