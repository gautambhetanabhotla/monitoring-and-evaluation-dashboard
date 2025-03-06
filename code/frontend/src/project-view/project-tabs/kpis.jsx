import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { Divider } from "@heroui/divider";
import Markdown from "marked-react";

const KPI = ({ kpi }) => {
  return (
    <>
      <Card className="m-3 z-0">
        <CardHeader className="relative">
          <span className="prose text-3xl font-bold py-5 px-2 z-0">{kpi.indicator}</span>
        </CardHeader>
        <Divider />
        <CardBody className="px-5">
          <span className="prose text-xl font-bold">What does it track?</span>
          {kpi.what_it_tracks}
          <br />
          {/* <span className="prose text-xl font-bold">Explanation</span>
          <Markdown>{kpi.explanation}</Markdown> */}
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-center">
          <div className="grid grid-cols-5">
            <div className="flex flex-col justify-center align-middle text-red-500">
              <div>BASELINE</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.baseline}</div>
            </div>
            <div className="flex flex-row justify-center align-middle">
              <Divider orientation="vertical" />
            </div>
            <div className="flex flex-col justify-center align-middle text-blue-500">
              <div>CURRENT</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.current}</div>
            </div>
            <div className="flex flex-row justify-center align-middle">
              <Divider orientation="vertical" className="flex flex-col justify-center align-middle" />
            </div>
            <div className="flex flex-col justify-center align-middle text-green-500">
              <div className="flex flex-row justify-center">TARGET</div>
              <div className="text-4xl flex flex-row justify-center">{kpi.target}</div>
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
      <div className="flex flex-row justify-center">
        <h1 className="prose text-6xl p-10">Key performance indexes (KPIs)</h1>
      </div>
      <div className="grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 xs:grid-cols-1">
        {kpis.map((kpi, index) => {
          return <KPI key={index} kpi={kpi} />
        })}
      </div>
    </>
  );
};

export default KPIs;