import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { Divider } from "@heroui/divider";
import Markdown from "marked-react";

const KPI = ({ kpi }) => {
  return (
    <>
      <Card>
        <CardHeader><span className="prose text-3xl font-bold">{kpi.indicator}</span></CardHeader>
        <Divider />
        <CardBody>
          <span className="prose text-xl font-bold">What does it track?</span>
          {kpi.what_it_tracks}
          <br />
          {/* <span className="prose text-xl font-bold">Explanation</span>
          <Markdown>{kpi.explanation}</Markdown> */}
        </CardBody>
        <Divider />
        <CardFooter>
          <div className="grid grid-cols-5">
            <div className="flex flex-col justify-center align-middle">
              <div>BASELINE</div>
              <div className="text-4xl">{kpi.baseline}</div>
            </div>
            <Divider orientation="vertical" />
            <div className="flex flex-col justify-center align-middle">
              <div>CURRENT</div>
              <div className="text-4xl">{kpi.current}</div>
            </div>
            <Divider orientation="vertical" />
            <div className="flex flex-col justify-center align-middle">
              <div>TARGET</div>
              <div className="text-4xl">{kpi.target}</div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

const KPIs = () => {
  const kpis = [
    {
      indicator: "Employment rate of trained youth",
      what_it_tracks: "How many youth get jobs",
      logframe_level: "Goal",
      explanation: `# 1. Goal (Impact Level)
                    **Project Goal:** To improve the employability and income levels of youth by providing electrician training.

                    ## Impact Indicators:
                    1. Employment rate of trained youth (%)
                    2. Increase in average income of trainees (%)

                    ## Data Source & Collection Method:
                    1. Post-training employment surveys, income assessment, industry feedback

                    ## Assumptions & Risks:
                    1. Availability of job opportunities in the sector
                    2. Youth retention in electrician jobs

                    ## Visualization:
                    1. Line charts showing employment and income trends over time
      `,
      baseline: 10,
      target: 80,
      current: 50,
    },
  ]
  return (
    <>
      <h1 className="prose text-6xl">KPIs</h1>
      <div className="grid grid-cols-2">
        {kpis.map((kpi, index) => {
          return <KPI key={index} kpi={kpi} />
        })}
      </div>
    </>
  );
};

export default KPIs;