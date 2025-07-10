import {Progress} from "@heroui/progress";
import Dropzone from '../../components/file-drop-zone.jsx';

import { useState, useContext, useEffect } from 'react';

import { ProjectContext } from "../project-context.jsx";
import DocumentViewer, { DocumentCard } from "../../components/document-viewer.jsx";
import { AuthContext } from "../../AuthContext.jsx";

const Overview = () => {
  const ctx = useContext(ProjectContext);
  // const [progress, setProgress] = useState(ctx.adjustedProgress);
  const [documents, setDocuments] = useState([]);
  useEffect(() => {
    setDocuments(ctx.documents?.filter(doc => !doc.task));
  }, [ctx?.documents]);
  // console.log("ctx.adjustedProgress: ", ctx.adjustedProgress);
  // useEffect(() => {
  //   console.log("progress = ", progress);
  //   console.log("ctx.adjustedProgress = ", ctx.adjustedProgress);
  // }, [progress, ctx.adjustedProgress]);
  // useEffect(() => {
  //   setProgress(ctx.adjustedProgress);
  // }, [ctx.adjustedProgress]);
  const calculatePredictedEndDate = () => {
    if (!ctx.project.start || !ctx.project.end || !ctx.adjustedProgress) {
      return new Date();
    }
    
    const startDate = new Date(ctx.project.start);
    const endDate = new Date(ctx.project.end);
    const currentDate = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    
    // Calculate predicted duration based on progress
    const predictedDuration = ctx.adjustedProgress > 0 
      ? totalDuration / ctx.adjustedProgress 
      : totalDuration;
    
    return new Date(currentDate.getTime() + predictedDuration);
  };
  
  const { user } = useContext(AuthContext);
  const predictedEndDate = calculatePredictedEndDate();
  // console.log(predictedEndDate);
  const isOverdue = predictedEndDate > new Date(ctx.project.end);
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  // console.log(predictedEndDate > Date(ctx.project.end));
  return (
    <>
    <div className="my-10 mx-20">
      <div className="mb-5">
        <h1 className="prose text-3xl font-semibold">Progress</h1>
        <Progress
          value={ctx.adjustedProgress*100}
          aria-label="Project progress"
          // color="blue"
          className="mt-2"
          size="lg"
          label={
            <div className="flex flex-row justify-between">
              <span className="text-md font-semibold text-primary">{parseInt(ctx.adjustedProgress*100)}%</span>
            </div>
          }
        />
        <p className="prose text-lg">
          Expected to finish by {
            isOverdue ?
            <span className="prose text-danger">{formatDate(predictedEndDate)} (Overdue)</span> : formatDate(predictedEndDate)
          }
        </p>
      </div>
      <h1 className="prose text-3xl font-semibold">About this project</h1>
      <p className="prose text-lg">{ctx.project.description || "No information added yet."}</p>
      <h1 className="prose text-3xl font-semibold mt-5">Documents</h1>
      <div className="flex flex-row flex-wrap gap-3 my-3 items-stretch">
        {documents && documents.map(
          (document, index) => <DocumentViewer document={document} slot={<DocumentCard />} key={index} />
        )}
        {user?.role === 'admin' && (
          <Dropzone />
        )}
      </div>
    </div>
    </>
  );
};

export default Overview;