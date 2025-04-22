import React, { useState, useMemo } from "react";
import { Card, CardBody } from "@heroui/card";
import { useNavigate } from "react-router-dom";
import { Progress } from "@heroui/progress";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { RadioGroup, Radio } from "@heroui/radio";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const ProjectsTab = ({ clientProjects, clientId, staffId }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [progressFilter, setProgressFilter] = useState(0);
    const [progressComparison, setProgressComparison] = useState("above");
    const [dateFilter, setDateFilter] = useState(null);
    const [dateComparison, setDateComparison] = useState("after");

    const filteredProjects = useMemo(() => {
        let filtered = clientProjects.filter(project =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (progressFilter > 0) {
            filtered = filtered.filter(project => 
                progressComparison === "above" 
                    ? project.project_progress >= progressFilter
                    : project.project_progress <= progressFilter
            );
        }

        if (dateFilter) {
            const filterDate = new Date(dateFilter.year, dateFilter.month - 1, dateFilter.day);
            filtered = filtered.filter(project => {
                const projectDate = new Date(project.start_date);
                return dateComparison === "after" 
                    ? projectDate >= filterDate
                    : projectDate <= filterDate;
            });
        }

        return filtered;
    }, [clientProjects, searchQuery, progressFilter, progressComparison, dateFilter, dateComparison]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-4xl"
                    startContent={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
                    isClearable
                    onClear={() => setSearchQuery("")}
                    classNames={{
                        clearButton: "opacity-100"
                    }}
                />
                <Popover placement="left" closeOnInteractOutside={false}>
                    <PopoverTrigger>
                        <Button variant="flat" startContent={<FunnelIcon className="h-5 w-5" />} className="ml-auto">
                            Filters
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="p-4 space-y-4">
                            <Popover closeOnInteractOutside={false}>
                                <PopoverTrigger>
                                    <Button className="w-full" variant="bordered">Filter by Progress</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="p-3 w-64 space-y-4">
                                        <RadioGroup
                                            orientation="horizontal"
                                            value={progressComparison}
                                            onValueChange={setProgressComparison}
                                            className="mb-2"
                                        >
                                            <Radio value="above">Above</Radio>
                                            <Radio value="below">Below</Radio>
                                        </RadioGroup>
                                        <Slider
                                            aria-label="Progress filter"
                                            step={1}
                                            maxValue={100}
                                            minValue={0}
                                            value={progressFilter}
                                            onChange={setProgressFilter}
                                        />
                                        <p className="text-sm text-center mt-2">Current: {progressFilter}%</p>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Popover closeOnInteractOutside={false}>
                                <PopoverTrigger>
                                    <Button className="w-full" variant="bordered">Filter by Date</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="p-3 w-64 space-y-4">
                                        <RadioGroup
                                            orientation="horizontal"
                                            value={dateComparison}
                                            onValueChange={setDateComparison}
                                            className="mb-2"
                                        >
                                            <Radio value="after">After</Radio>
                                            <Radio value="before">Before</Radio>
                                        </RadioGroup>
                                        <Input
                                            type="date"
                                            value={
                                                dateFilter
                                                ? `${dateFilter.year}-${String(dateFilter.month).padStart(2, '0')}-${String(dateFilter.day).padStart(2, '0')}`
                                                : ""
                                            }
                                            onChange={(e) => {
                                                const [year, month, day] = e.target.value.split("-");
                                                setDateFilter({ year: parseInt(year), month: parseInt(month), day: parseInt(day) });
                                            }}
                                            className="w-full"
                                        />
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div className="flex justify-center mt-4">
                                <Button
                                    variant="flat"
                                    color="danger"
                                    onPress={() => {
                                        setProgressFilter(0);
                                        setDateFilter(null);
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project, index) => (
                    <Card
                        key={index}
                        isPressable
                        onPress={() => {
                            if (clientId) {
                                navigate(`/${project._id}?clientId=${clientId}`);
                            } else if (staffId) {
                                navigate(`/${project._id}?staffId=${staffId}`);
                            } else {
                                navigate(`/${project._id}`);
                            }   
                        }}
                        className="bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                        <CardBody>
                            <h3 className="font-semibold text-lg mb-4">{project.name}</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{formatDate(project.start_date)}</p>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="font-medium">{project.project_progress}%</span>
                                    </div>
                                    <Progress aria-label="Progress" className="max-w-md" value={project.project_progress} />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProjectsTab;