import React, { useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import * as Tooltip from '@radix-ui/react-tooltip';

const INDIA_JSON = "https://raw.githubusercontent.com/adarshbiradar/maps-geojson/refs/heads/master/india.json";

const stateCodeMapping = {
    'Andhra Pradesh': 'IN-AP',
    'Arunachal Pradesh': 'IN-AR',
    'Assam': 'IN-AS',
    'Bihar': 'IN-BR',
    'Chhattisgarh': 'IN-CT',
    'Goa': 'IN-GA',
    'Gujarat': 'IN-GJ',
    'Haryana': 'IN-HR',
    'Himachal Pradesh': 'IN-HP',
    'Jharkhand': 'IN-JH',
    'Karnataka': 'IN-KA',
    'Kerala': 'IN-KL',
    'Madhya Pradesh': 'IN-MP',
    'Maharashtra': 'IN-MH',
    'Manipur': 'IN-MN',
    'Meghalaya': 'IN-ML',
    'Mizoram': 'IN-MZ',
    'Nagaland': 'IN-NL',
    'Odisha': 'IN-OR',
    'Punjab': 'IN-PB',
    'Rajasthan': 'IN-RJ',
    'Sikkim': 'IN-SK',
    'Tamil Nadu': 'IN-TN',
    'Telangana': 'IN-TG',
    'Tripura': 'IN-TR',
    'Uttarakhand': 'IN-UT',
    'Uttar Pradesh': 'IN-UP',
    'West Bengal': 'IN-WB',
    'Delhi': 'IN-DL',
    'Jammu and Kashmir': 'IN-JK',
    'Ladakh': 'IN-LA',
    'Puducherry': 'IN-PY',
    'Andaman and Nicobar Islands': 'IN-AN',
    'Chandigarh': 'IN-CH',
    'Dadra and Nagar Haveli and Daman and Diu': 'IN-DN',
    'Lakshadweep': 'IN-LD'
};

const IndiaMap = ({ projects }) => {
    const projectsByState = useMemo(() => {
        const stateProjects = {};
        
        projects.forEach(project => {
            if (project.states) {
                project.states.forEach(state => {
                    const stateCode = stateCodeMapping[state];
                    
                    if (stateCode) {
                        if (!stateProjects[stateCode]) {
                            stateProjects[stateCode] = [];
                        }
                        stateProjects[stateCode].push(project.name);
                    }
                });
            }
        });

        return stateProjects;
    }, [projects]);

    const getStateColor = (stateId) => {
        const stateProjectNames = projectsByState[stateId] || [];
        if (stateProjectNames.length === 0) return "#D6D6DA";
        return `rgba(0, 83, 156, ${Math.min(0.2 + (stateProjectNames.length * 0.2), 1)})`;
    };

    return (
        <div className="relative w-full h-[400px]">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 500,
                    center: [78.9629, 22.5937]
                }}
                width={300}
                height={300}
                className="w-full h-full"
            >
                <Geographies geography={INDIA_JSON}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            const stateName = geo.properties.st_nm;
                            const stateCode = stateCodeMapping[stateName];
                            const projectNames = stateCode ? projectsByState[stateCode] || [] : [];

                            return (
                                <Tooltip.Provider key={geo.rsmKey}>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <Geography
                                                geography={geo}
                                                fill={getStateColor(stateCode)}
                                                stroke="#FFFFFF"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { outline: "none", fill: "#0073E6" },
                                                }}
                                            />
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className="bg-white px-3 py-2 rounded shadow-lg text-sm z-50">
                                                <Tooltip.Arrow className="fill-white" />
                                                <div>
                                                    <strong>{stateName}</strong>
                                                    <div className="mt-1">
                                                        {projectNames.length > 0 ? (
                                                            <>
                                                                <div>Projects - {projectNames.length}</div>
                                                            </>
                                                        ) : (
                                                            "No projects"
                                                        )}
                                                    </div>
                                                </div>
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </Tooltip.Provider>
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
};

export default IndiaMap;