import React from "react";
import { Card, CardBody } from "@heroui/card";

const StatsTab = ({ clientProjects }) => {
    return (
        <div className="space-y-6">
            {/* Stats Overview */}
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
        </div>
    );
};

export default StatsTab;