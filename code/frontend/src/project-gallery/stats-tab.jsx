import React from "react";
import { Card, CardBody } from "@heroui/card";
import IndiaMap from "../components/IndiaMap";

const StatsTab = ({ clientProjects }) => {    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white shadow-sm">
                    <CardBody>
                        <h3 className="text-gray-500 text-sm font-medium">Total Projects</h3>
                        <p className="text-3xl font-bold mt-2">{clientProjects.length}</p>
                    </CardBody>
                </Card>
                <Card className="bg-white shadow-sm">
                    <CardBody>
                        <h3 className="text-gray-500 text-sm font-medium">Active Projects</h3>
                        <p className="text-3xl font-bold mt-2">
                            {clientProjects.filter(p => p.project_progress < 100).length}
                        </p>
                    </CardBody>
                </Card>
                <Card className="bg-white shadow-sm">
                    <CardBody>
                        <h3 className="text-gray-500 text-sm font-medium">Completed Projects</h3>
                        <p className="text-3xl font-bold mt-2">
                            {clientProjects.filter(p => p.project_progress === 100).length}
                        </p>
                    </CardBody>
                </Card>
            </div>

            <Card className="bg-white shadow-sm min-h-[480px]">
                <CardBody>
                    <h3 className="text-gray-500 text-sm font-medium mb-4">Project Locations</h3>
                    <div className="w-full h-[400px]">
                        <IndiaMap projects={clientProjects} />
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default StatsTab;