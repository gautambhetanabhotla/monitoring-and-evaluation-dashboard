import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/';
import { MemoryRouter } from 'react-router-dom';

import { 
  PencilSquareIcon,
  CheckCircleIcon,
  ArrowsUpDownIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

import KPIs, { EditKPIButton, KPI, KPIsList, AddKPIButton } from '../../src/project-view/project-tabs/kpis.jsx';
import { ProjectContext } from '../../src/project-view/project-context.jsx';


// Mock all the @heroui components
// jest.mock('@heroui/button', () => ({
//   Button: ({ isLoading, children, startContent, endContent, isIconOnly, onPress, type, color, size, ...props }) => (
//     <button onClick={onPress} type={type} data-color={color} data-size={size} {...props}>
//       {startContent}
//       {children}
//       {endContent}
//     </button> 
//   )
// }));

// jest.mock('@heroui/input', () => ({
//   Textarea: ({ children, value, onValueChange, isReadOnly, endContent, ...props }) => (
//     <div>
//       <textarea 
//         value={value || ''}
//         onChange={(e) => onValueChange && onValueChange(e.target.value)}
//         readOnly={isReadOnly}
//         {...props}
//       >
//         {children}
//       </textarea>
//       {endContent}
//     </div>
//   ),
//   Input: ({ children, value, onValueChange, label, ...props }) => (
//     <div>
//       {label && <label>{label}</label>}
//       <input 
//         value={value || ''}
//         onChange={(e) => onValueChange && onValueChange(e.target.value)}
//         {...props}
//       >
//         {children}
//       </input>
//     </div>
//   )
// }));

// jest.mock('@heroui/divider', () => ({
//   Divider: (props) => <hr {...props} />
// }));

// jest.mock('@heroui/card', () => ({
//   Card: ({ children, ...props }) => <div {...props}>{children}</div>,
//   CardHeader: ({children, ...props}) => <div {...props}>{children}</div>,
//   CardBody: ({children, ...props}) => <div {...props}>{children}</div>,
//   CardFooter: ({children, ...props}) => <div {...props}>{children}</div>
// }));

// jest.mock('@heroui/link', () => ({
//   Link: ({ children, ...props }) => <a {...props}>{children}</a>
// }));

// jest.mock('@heroui/autocomplete', () => ({
//   Autocomplete: ({ allowsCustomValue, children, inputValue, onInputChange, selectedKey, onSelectionChange, defaultItems, label, placeholder, ...props }) => (
//     <div>
//       {label && <label>{label}</label>}
//       <input 
//         value={inputValue || ''}
//         onChange={(e) => onInputChange && onInputChange(e.target.value)}
//         placeholder={placeholder}
//         {...props}
//       />
//       {Array.isArray(children) ? children.map(child => child) : children}
//     </div>
//   ),
//   AutocompleteItem: ({ children, ...props }) => <div {...props}>{children}</div>
// }));

// jest.mock('@heroui/select', () => ({
//   Select: ({ children, selectedKeys, onSelectionChange, ...props }) => (
//     <select 
//       value={selectedKeys?.values().next().value || ''}
//       onChange={(e) => {
//         const newSet = new Set([e.target.value]);
//         onSelectionChange && onSelectionChange(newSet);
//       }}
//       {...props}
//     >
//       {children}
//     </select>
//   ),
//   SelectItem: ({ children, key, ...props }) => <option value={key} {...props}>{children}</option>
// }));

// jest.mock('@heroui/popover', () => ({
//   Popover: ({ children, ...props }) => <div {...props}>{children}</div>,
//   PopoverTrigger: ({ children, ...props }) => <div {...props}>{children}</div>,
//   PopoverContent: ({ children, ...props }) => <div {...props}>{children}</div>
// }));

// jest.mock('@heroui/modal', () => ({
//   Modal: ({ children, isOpen, onOpenChange, ...props }) => (
//     isOpen ? <div data-testid="modal" {...props}>{children}</div> : null
//   ),
//   ModalContent: ({ children, ...props }) => <div {...props}>{children}</div>,
//   useDisclosure: () => ({
//     isOpen: false,
//     onOpen: jest.fn(),
//     onOpenChange: jest.fn(),
//     onClose: jest.fn()
//   })
// }));

// jest.mock('@heroui/form', () => ({
//   Form: ({ children, onSubmit, ...props }) => (
//     <form onSubmit={onSubmit} {...props}>{children}</form>
//   )
// }));

// jest.mock('@heroui/number-input', () => ({
//   NumberInput: ({ value, onValueChange, label, isRequired, isInvalid, ...props }) => (
//     <div>
//       {label && <label>{label}{isRequired && '*'}</label>}
//       <input
//         type="number"
//         value={value || ''}
//         onChange={(e) => onValueChange && onValueChange(e.target.value)}
//         data-invalid={isInvalid}
//         {...props}
//       />
//     </div>
//   )
// }));

// jest.mock('@heroui/spacer', () => ({
//   Spacer: () => <div style={{ margin: '10px 0' }} />
// }));

// jest.mock('@heroui/progress', () => ({
//   Progress: () => <div />
// }));

// jest.mock('@heroui/chip', () => ({
//   Chip: () => <div />
// }));

// // Mock the heroicons
// jest.mock('@heroicons/react/24/outline', () => ({
//   PencilSquareIcon: () => <span data-testid="pencil-icon">✏️</span>,
//   CheckCircleIcon: () => <span data-testid="check-circle-icon">✓</span>,
//   ArrowTrendingDownIcon: () => <span data-testid="arrow-down-icon">↓</span>,
//   ArrowTrendingUpIcon: () => <span data-testid="arrow-up-icon">↑</span>,
//   PlusIcon: () => <span data-testid="plus-icon">+</span>,
//   CheckIcon: () => <span data-testid="check-icon">✓</span>,
//   ArrowsUpDownIcon: () => <span data-testid="arrows-updown-icon">↕️</span>
// }));

// jest.mock('@heroicons/react/24/solid', () => ({
//   PencilSquareIcon: () => <span data-testid="pencil-icon">✏️</span>,
//   CheckCircleIcon: () => <span data-testid="check-circle-icon">✓</span>,
//   ArrowTrendingDownIcon: () => <span data-testid="arrow-down-icon">↓</span>,
//   ArrowTrendingUpIcon: () => <span data-testid="arrow-up-icon">↑</span>,
//   PlusIcon: () => <span data-testid="plus-icon">+</span>,
//   CheckIcon: () => <span data-testid="check-icon">✓</span>,
//   ArrowsUpDownIcon: () => <span data-testid="arrows-updown-icon">↕️</span>
// }));

const renderKPIs = (overrides = {}) => {
  return render(
    <MemoryRouter>
      <ProjectContext.Provider
        value={{
          tasks: [
            {
              "id": "t1",
              "project": "p1",
              "title": "Example task 1",
              "description": "This is an example task."
            },
            {
              "id": "t2",
              "project": "p1",
              "title": "Example task 2",
              "description": "This is another example task."
            }
          ],
          adjustedKPIs: [
            {
              "id": "kpi1",
              "project_id": "p1",
              "indicator": "Employment rate of trained youth",
              "what_it_tracks": "How many youth get jobs",
              "logframe_level": "Goal",
              "explanation": "# 1. Goal (Impact Level)\n**Project Goal:** To improve the employability and income levels of youth by providing electrician training.\n\n## Impact Indicators:\n1. Employment rate of trained youth (%)\n2. Increase in average income of trainees (%)\n\n## Data Source & Collection Method:\n1. Post-training employment surveys, income assessment, industry feedback\n\n## Assumptions & Risks:\n1. Availability of job opportunities in the sector\n2. Youth retention in electrician jobs\n\n## Visualization:\n1. Line charts showing employment and income trends over time\n",  
              "baseline": 10,
              "target": 80,
              "current": 10,
            },
            {
              "id": "kpi2",
              "project_id": "p1",
              "indicator": "Increase in average income of trainees",
              "what_it_tracks": "Growth in earnings",
              "logframe_level": "Goal",
              "explanation": "# 1. Goal (Impact Level)\n**Project Goal:** To improve the employability and income levels of youth by providing electrician training.\n\n## Impact Indicators:\n1. Employment rate of trained youth (%)\n2. Increase in average income of trainees (%)\n\n## Data Source & Collection Method:\n1. Post-training employment surveys, income assessment, industry feedback\n\n## Assumptions & Risks:\n1. Availability of job opportunities in the sector\n2. Youth retention in electrician jobs\n\n## Visualization:\n1. Line charts showing employment and income trends over time\n",  
              "baseline": 0,
              "target": 50,
              "current": 10,
            },
            {
              "id": "kpi3",
              "project_id": "p1",
              "indicator": "Percentage of trainees certified",
              "what_it_tracks": "How many trained youth secure employment/self-employment opportunities",
              "logframe_level": "Outcome",
              "explanation": "#2. Outcomes (Purpose Level)\n**Project Outcomes:**\n1. Trained youth secure employment/self-employment opportunities\n2. Certified trainees demonstrate improved technical skills\n\n** Outcome Indicators:**\n1. Percentage of trainees certified\n2. Percentage of trained youth employed within 6 months\n\n**Means of Verification:**\nCertification records, employer feedback, follow-up surveys\n\n **Assumptions & Risks:**\n1. Employers recognize and value certification\n2. Youth willingness to relocate for jobs\n\n**Visualization:**\n1. Bar graphs comparing certification rates and employment rates\n2. Maps showing employment locations",
              "baseline": 0,
              "target": 100,
              "current": 10,
            },
            {
              "id": "kpi4",
              "project_id": "p1",
              "indicator": "Percentage of trained youth employed within 6 months",
              "what_it_tracks": "How many certified trainees demonstrate improved technical skills",
              "logframe_level": "Outcome",
              "explanation": "#2. Outcomes (Purpose Level)\n**Project Outcomes:**\n1. Trained youth secure employment/self-employment opportunities\n2. Certified trainees demonstrate improved technical skills\n\n** Outcome Indicators:**\n1. Percentage of trainees certified\n2. Percentage of trained youth employed within 6 months\n\n**Means of Verification:**\nCertification records, employer feedback, follow-up surveys\n\n **Assumptions & Risks:**\n1. Employers recognize and value certification\n2. Youth willingness to relocate for jobs\n\n**Visualization:**\n1. Bar graphs comparing certification rates and employment rates\n2. Maps showing employment locations",
              "baseline": 0,
              "target": 80,
              "current": 10,
            },
            {
              "id": "kpi5",
              "project_id": "p1",
              "indicator": "Number of youth trained",
              "what_it_tracks": "How many were trained",
              "logframe_level": "Output",
              "explanation": "# 3. Outputs(Deliverables)\n**Project Outputs:**\n1. 100 youth trained in electrician skills\n2. 90 youth complete the full training course\n\n** Output Indicators:**\n1. Number of youth trained\n2. Number of youth completing the course\n\n**Data Collection Frequency:**\n1. Monthly/Quarterly updates\n\n **Responsible Team/Partners:**\n1. Training institutes\n2. Assessment agencies\n\n**Visualization:**\n1. Progress bars for % completion of outputs\n2. Pie charts for % of deliverables achieved",  
              "baseline": 0,
              "target": 100,
              "current": 10,
            },
            {
              "id": "kpi6",
              "project_id": "p1",
              "indicator": "Number of youth completing the course",
              "what_it_tracks": "How many finished the course",
              "logframe_level": "Output",
              "explanation": "# 3. Outputs(Deliverables)\n**Project Outputs:**\n1. 100 youth trained in electrician skills\n2. 90 youth complete the full training course\n\n** Output Indicators:**\n1. Number of youth trained\n2. Number of youth completing the course\n\n**Data Collection Frequency:**\n1. Monthly/Quarterly updates\n\n **Responsible Team/Partners:**\n1. Training institutes\n2. Assessment agencies\n\n**Visualization:**\n1. Progress bars for % completion of outputs\n2. Pie charts for % of deliverables achieved",  
              "baseline": 0,
              "target": 90,
              "current": 10,
            },
            {
              "id": "kpi7",
              "project_id": "p1",
              "indicator": "Practical training sessions",
              "what_it_tracks": "Hands-on electrician training",
              "logframe_level": "Activity",
              "explanation": "# 4. Activities (Process Level)\n**Key Activities:**\n1. Conducting theoretical and practical training sessions\n 2. Organizing industry exposure visits\n\n** Activity Timeline:**\n1. Training period: 6 months\n\n**Budget Allocation & Utilization:**\n1. Planned vs. Actual expenditure\n\n **Challenges & Mitigation Strategies:**\n1. Trainee dropouts → Counseling and motivation\n2. Placement hurdles → Industry partnerships\n\n**Visualization:**\n1. Gantt chart showing activity timelines\n2. Budget utilization graph (Planned vs. Spent)",
              "baseline": 0,
              "target": 50,
              "current": 10,
            },
            {
              "id": "kpi8",
              "project_id": "p1",
              "indicator": "Industry exposure visits",
              "what_it_tracks": "Visits to workplaces",
              "logframe_level": "Activity",
              "explanation": "# 4. Activities (Process Level)\n**Key Activities:**\n1. Conducting theoretical and practical training sessions\n 2. Organizing industry exposure visits\n\n** Activity Timeline:**\n1. Training period: 6 months\n\n**Budget Allocation & Utilization:**\n1. Planned vs. Actual expenditure\n\n **Challenges & Mitigation Strategies:**\n1. Trainee dropouts → Counseling and motivation\n2. Placement hurdles → Industry partnerships\n\n**Visualization:**\n1. Gantt chart showing activity timelines\n2. Budget utilization graph (Planned vs. Spent)",
              "baseline": 0,
              "target": 5,
              "current": 10,
            },
            {
              "id": "kpi9",
              "project_id": "p1",
              "indicator": "Budget utilization",
              "what_it_tracks": "How money is spent across activities",
              "logframe_level": "Activity",
              "explanation": "# 4. Activities (Process Level)\n**Key Activities:**\n1. Conducting theoretical and practical training sessions\n 2. Organizing industry exposure visits\n\n** Activity Timeline:**\n1. Training period: 6 months\n\n**Budget Allocation & Utilization:**\n1. Planned vs. Actual expenditure\n\n **Challenges & Mitigation Strategies:**\n1. Trainee dropouts → Counseling and motivation\n2. Placement hurdles → Industry partnerships\n\n**Visualization:**\n1. Gantt chart showing activity timelines\n2. Budget utilization graph (Planned vs. Spent)",
              "baseline": 0,
              "target": 100,
              "current": 10,
            }
          ],
          KPIUpdates: [
            {
                "id": "ku1",
                "task": "t1",
                "kpi": "kpi6",
                "initial": 20,
                "final": 35,
                "date": "2023-10-05T14:48:00.000Z",
                "note": "This is a note.",
                "updatedby": "Gautam Bhetanabhotla"
            },
            {
                "id": "ku2",
                "task": "t1",
                "kpi": "kpi6",
                "initial": 35,
                "final": 45,
                "date": "2023-10-07T10:41:41.000Z",
                "note": "",
                "updatedby": "Nikhil Repala"
            },
            {
                "id": "ku3",
                "task": "t1",
                "kpi": "kpi7",
                "initial": 40,
                "final": 41,
                "date": "2023-10-05T14:48:00.000Z",
                "note": "This is a note.",
                "updatedby": "Gautam Bhetanabhotla"
            },
            {
                "id": "ku4",
                "task": "t2",
                "kpi": "kpi7",
                "initial": 41,
                "final": 49,
                "date": "2023-10-05T14:48:00.000Z",
                "note": "This is a note.",
                "updatedby": "Gautam Bhetanabhotla"
            }
          ],
          project: {
            "id": "67cadfd3ae068409d0b8fd96",
            "name": "Example project 1",
            "description": "This is a description of the project.",
            "location": "Hyderabad, India",
            "start": "2023-10-05T14:48:00.000Z",
            "end": "2024-10-05T14:48:00.000Z",
            "thrust_areas": [
                "Education",
                "Health",
                "Environment"
            ],
            "funding_partner": "XYZ Foundation",
            "client": "ABC Trust"
          },
          updateKPI: jest.fn(),
          addKPI: jest.fn(),
          ...overrides
        }}
      >
        <KPIs />
      </ProjectContext.Provider>
    </MemoryRouter>
  );
};

const renderKPI = (overrides = {}) => {
  return render(
    <KPI kpi={{
      "id": "kpi9",
      "project_id": "p1",
      "indicator": "Budget utilization",
      "what_it_tracks": "How money is spent across activities",
      "logframe_level": "Activity",
      "explanation": "# 4. Activities (Process Level)\n**Key Activities:**\n1. Conducting theoretical and practical training sessions\n 2. Organizing industry exposure visits\n\n** Activity Timeline:**\n1. Training period: 6 months\n\n**Budget Allocation & Utilization:**\n1. Planned vs. Actual expenditure\n\n **Challenges & Mitigation Strategies:**\n1. Trainee dropouts → Counseling and motivation\n2. Placement hurdles → Industry partnerships\n\n**Visualization:**\n1. Gantt chart showing activity timelines\n2. Budget utilization graph (Planned vs. Spent)",
      "baseline": 0,
      "target": 100,
      "current": 10,
    }} />
  )
}

describe('KPIs component', () => {
  test('renders the KPI titles', () => {
    renderKPIs();
    expect(screen.getByText('Employment rate of trained youth')).toBeInTheDocument();
    expect(screen.getByText('Increase in average income of trainees')).toBeInTheDocument();
    expect(screen.getByText('Percentage of trainees certified')).toBeInTheDocument();
    expect(screen.getByText('Percentage of trained youth employed within 6 months')).toBeInTheDocument();
    expect(screen.getByText('Number of youth trained')).toBeInTheDocument();
    expect(screen.getByText('Number of youth completing the course')).toBeInTheDocument();
    expect(screen.getByText('Practical training sessions')).toBeInTheDocument();
    expect(screen.getByText('Industry exposure visits')).toBeInTheDocument();
    expect(screen.getByText('Budget utilization')).toBeInTheDocument();
  });

  test('renders the page title', () => {
    renderKPIs();
    expect(screen.getByText('Key performance indicators (KPIs)')).toBeInTheDocument();
  });
});

describe('KPI component', () => {
  test('renders the KPI title', () => {
    renderKPI();
    expect(screen.getByText('Budget utilization')).toBeInTheDocument();
  });
});