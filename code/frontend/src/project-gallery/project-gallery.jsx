import React from "react";

const projects = [
    { name: "Project X", startDate: "15-01-2024", progress: 80 },
    { name: "Project Y", startDate: "01-02-2024", progress: 50 },
    { name: "Project Z", startDate: "10-03-2024", progress: 30 },
];

const Gallery = () => {
    return (
        <div className="flex flex-col h-screen p-6 bg-amber-100">
            <div className="flex flex-col bg-amber-200 rounded-xl shadow-lg p-6 mb-6 overflow-y-auto h-[60%] border border-amber-300">
                <h1 className="text-4xl font-bold mb-4 border-b border-amber-400 pb-2">
                    Your Projects
                </h1>
                <div className="space-y-4">
                    {projects.map((project, index) => (
                        <div key={index} className="border border-amber-400 bg-amber-100 p-4 rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold">{project.name}</h2>
                            <p className="text-sm">Start Date: {project.startDate}</p>
                            <h3 className="text-sm font-medium mt-2">Project Progress</h3>
                            <div className="w-full bg-gray-400 rounded-full h-3 mt-1">
                                <div
                                    className="bg-green-500 h-3 rounded-full"
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col bg-amber-200 rounded-xl shadow-lg p-6 h-[40%] border border-amber-300">
                <h1 className="text-4xl font-bold mb-4 border-b border-amber-400 pb-2">
                    Your Projects in Numbers
                </h1>
                <p className="text-2xl">Stats and chartsgo here...</p>
            </div>
        </div>
    );
};

export default Gallery;
