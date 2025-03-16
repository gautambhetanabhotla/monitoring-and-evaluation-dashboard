import { createContext, useEffect, useState } from 'react';

const ProjectContext = createContext();

const ProjectContextProvider = ({ children }) => {
  const [project, setProject] = useState({});
  const [successStories, setSuccessStories] = useState([]);
  const [KPIUpdates, setKPIUpdates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [KPIs, setKPIs] = useState([]);
  const [adjustedKPIs, setAdjustedKPIs] = useState([]);

  useEffect(() => {
    fetch('/kpis.json')
    .then(response => response.json())
    .then(data => setKPIs(data))
    .catch(error => console.error("Error fetching KPIs" + error));
  }, []);

  useEffect(() => {
    const updatedKPIs = KPIs.map(KPI => {
      const updatesOfKPI = KPIUpdates
        .filter(update => update.kpi === KPI.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      return {
        ...KPI,
        current: updatesOfKPI.length > 0 ? updatesOfKPI[0].final : KPI.baseline,
      };
    });
    setAdjustedKPIs(updatedKPIs);
  }, [KPIs, KPIUpdates]);

  useEffect(() => {
    fetch('/kpiupdates.json')
    .then(response => response.json())
    .then(data => {
      for (const update of data) {
        const d = update.date;
        const date = new Date(d);
        update.date = date;
      }
      setKPIUpdates(data);
      // console.dir(data);
    })
    .catch(error => console.error("Error fetching KPI updates" + error));
  }, []);

  useEffect(() => {
    fetch('/project.json')
    .then(response => response.json())
    .then(data => setProject(data))
    .catch(error => console.error("Error fetching project" + error));
  }, []);

  useEffect(() => {
    fetch('/success-stories.json')
    .then(response => response.json())
    .then(data => setSuccessStories(data))
    .catch(error => console.error("Error fetching success stories" + error));
  }, []);

  useEffect(() => {
    fetch('/tasks.json')
    .then(response => response.json())
    .then(data => setTasks(data))
    .catch(error => console.error("Error fetching tasks" + error));
  }, []);
  
  const updateKPI = (update) => {
    setKPIUpdates([...KPIUpdates, update]);
  };

  const updateTaskDescription = ((taskid, description) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskid) {
        task.description = description;
      }
      return task;
    });
    setTasks(updatedTasks);
  });

  const addTask = (title, description) => {
    const newTask = {
      id: `t${tasks.length + 1}`,
      project: project.id,
      title: title,
      description: description,
    };
    setTasks([...tasks, newTask]);
    // console.dir([...tasks, newTask]);
  };

  return (
    <ProjectContext.Provider
      value={{
              project,
              setProject,
              successStories,
              setSuccessStories,
              KPIUpdates,
              setKPIUpdates,
              tasks,
              setTasks,
              adjustedKPIs,
              setKPIs,
              updateKPI,
              updateTaskDescription,
              addTask,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectContext, ProjectContextProvider };
