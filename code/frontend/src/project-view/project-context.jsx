import { createContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const ProjectContext = createContext();

const ProjectContextProvider = ({ children }) => {

  const [project, setProject] = useState({});
  const [successStories, setSuccessStories] = useState([]);
  const [KPIUpdates, setKPIUpdates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [KPIs, setKPIs] = useState([]);
  const [adjustedKPIs, setAdjustedKPIs] = useState([]);
  const [documents, setDocuments] = useState([]);

  const location = useLocation();

  // KPIs
  useEffect(() => {
    if(!project?.id) return;
    fetch(`/api/kpi/getKpis/${project?.id}`, { credentials: 'include' })
    .then(response => {
      // console.dir(response);
      return response.json();
    })
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

  // Adjusted KPIs
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

  // KPI Updates
  useEffect(() => {
    if(!project?.id || !KPIs || KPIs.length === 0) return;
    for (const kpi of KPIs) {
      fetch(`/api/kpi/getKpiUpdates/${kpi?.id}`, { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        // console.dir(data);
        if(!data.success || !data.data) return;
        for (const update of data.data) {
          update.id = update._id;
          update.date = update.updated_at;
          update.kpi = update.kpi_id;
          update.task = update.task_id;
          update.updatedby = update.updated_by;
          update.project = update.project_id;
          const d = update.date;
          const date = new Date(d);
          update.date = date;
        }
        setKPIUpdates(KPIUpdates => [...KPIUpdates, ...data.data]);
        // console.dir(data.data);
      })
      .catch(error => console.error("Error fetching KPI updates" + error));
    }
  }, [project?.id, KPIs]);

  // Project
  useEffect(() => {
    // fetch('/project.json')
    // .then(response => response.json())
    // .then(data => setProject(data))
    // .catch(error => console.error("Error fetching project" + error));
    // console.dir(location.pathname.split('/'));
    const project_id = location.pathname.split('/')[1];
    // console.log(project_id);
    axios.get(`/api/projects/get/${project_id}`, { credentials: 'include' })
    .then(response => {
      // console.dir(response);
      if(response.data.success) {
        const proj = response.data.project;
        proj.start = proj.start_date;
        proj.end = proj.end_date;
        proj.progress = proj.project_progress;
        proj.id = proj._id;
        setProject(proj);
      }
    });
  }, [location.pathname]);

  // Success stories
  useEffect(() => {
    fetch('/success-stories.json')
    .then(response => response.json())
    .then(data => setSuccessStories(data))
    .catch(error => console.error("Error fetching success stories" + error));
  }, []);

  // Tasks
  useEffect(() => {
    if(!project?.id) return;
    fetch(`/api/task/getTasks/${project?.id}`, { credentials: 'include' })
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
      // console.dir(data);
    })
    .catch(error => console.error("Error fetching tasks" + error));
  }, [project?.id]);

  // Documents
  useEffect(() => {
    if(!project || !project?.id) return;
    fetch(`/api/document/getDocuments/${project.id}`)
    .then(res => res.json())
    .then(data => {
      console.dir(data);
      setDocuments(data.documents.map(d => {
        return {
          id: d._id,
          project: d.projectId,
          task: d.taskId,
          kpiUpdate: d.kpi_update_id,
          metadata: d.metadata,
          data: d.binaryData,
        };
      }));
    });
  }, [project, project?.id]);
  
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

  const editKPI = (targetKPI) => {
    console.dir(targetKPI);
    console.dir(KPIs.map(KPI => KPI.id === targetKPI.id ? targetKPI : KPI));
    setKPIs(KPIs.map(KPI => KPI.id === targetKPI.id ? targetKPI : KPI));
  };

  const addDocuments = (newDocuments) => {
    setDocuments(documents => [...documents, ...newDocuments]);
  };

  const addDocument = (newDocument) => {
    setDocuments(documents => [...documents, newDocument]);
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
        editKPI,
        updateTaskDescription,
        addTask,
        addKPI,
        documents,
        addDocuments,
        addDocument
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectContext, ProjectContextProvider };
