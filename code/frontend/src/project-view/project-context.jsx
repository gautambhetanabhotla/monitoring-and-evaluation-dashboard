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
    if(!project?.id) return;
    fetch(`/api/kpi/getKpis/${project?.id}`)
    .then(response => {console.dir(response); return response.json();})
    .then(data => {
      if(data.success) {
        for (const element of data.data) {
          element.id = element._id;
        }
        setKPIs(data.data);
        console.dir(data);
      }
    })
    .catch(error => console.error("Error fetching KPIs - " + error));
  }, [project?.id]);

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
    if(!project?.id || !KPIs) return;
    for (const kpi of KPIs) {
      fetch(`/api/kpi/getKpiUpdates/${kpi?.id}`)
      .then(response => response.json())
      .then(data => {
        // console.dir(data);
        if(!data.success) return;
        for (const update of data.data) {
          update.id = update._id;
          update.date = update.updated_at;
          update.kpi = update.kpi_id;
          update.task = update.task_id;
          update.updatedby = update.updated_by;
          const d = update.date;
          const date = new Date(d);
          update.date = date;
        }
        setKPIUpdates(data.data);
        console.dir(data.data);
      })
      .catch(error => console.error("Error fetching KPI updates" + error));
    }
  }, [project?.id, KPIs]);

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
    if(!project?.id) return;
    fetch(`/api/task/getTasks/${project?.id}`)
    .then(response => response.json())
    .then(data => {
      if(!data.data) return;
      setTasks(data.data.map(element => {
        return {
          id: element._id,
          project_id: element.project_id,
          title: element.title,
          description: element.description,
        };
      }));
      console.dir(data);
    })
    .catch(error => console.error("Error fetching tasks" + error));
  }, [project?.id]);
  
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

  const addTask = (id, title, description) => {
    const newTask = {
      id: id,
      project: project.id,
      title: title,
      description: description,
    };
    setTasks([...tasks, newTask]);
    // console.dir([...tasks, newTask]);
  };

  const addKPI = (kpi) => {
    setKPIs([...KPIs, kpi]);
  };

  return (
    <ProjectContext.Provider
      value={{
              project,
              setProject,
              successStories,
              setSuccessStories,
              KPIUpdates,
              // setKPIUpdates,
              tasks,
              // setTasks,
              adjustedKPIs,
              // setKPIs,
              updateKPI,
              updateTaskDescription,
              addTask,
              addKPI
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectContext, ProjectContextProvider };
