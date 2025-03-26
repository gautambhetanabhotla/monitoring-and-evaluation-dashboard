import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/';
import { MemoryRouter } from 'react-router-dom';

import { 
  PencilSquareIcon,
  CheckCircleIcon,
  ArrowsUpDownIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';

import Timeline, { Task, KPIUpdate, AddTaskButton, KPIUpdateButton } from '../../src/project-view/project-tabs/timeline.jsx';
import { ProjectContext } from '../../src/project-view/project-context.jsx';

// jest.mock('@heroui/divider', () => ({
//   Divider: (props) => <hr {...props} />
// }));

// jest.mock('@heroui/card', () => ({
//   Card: ({ children, ...props }) => <div {...props}>{children}</div>
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
//   SelectItem: ({ key, children, ...props }) => <option value={key} {...props}>{children}</option>
// }));

// jest.mock('@heroui/popover', () => ({
//   Popover: ({ showArrow, children, ...props }) => <div {...props}>{children}</div>,
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

const renderTimeline = (overrides = {}) => {
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
          ...overrides
        }}
      >
        <Timeline />
      </ProjectContext.Provider>
    </MemoryRouter>
  );
};

const renderTask = (overrides = {}) => {
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
          ...overrides
        }}
      >
        <Task task={{
          "id": "t1",
          "project": "p1",
          "title": "Example task 1",
          "description": "This is an example task."
        }} />
      </ProjectContext.Provider>
    </MemoryRouter>
  )
}

describe('Timeline Component', () => {

  const tasks = [
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
  ];

  const addTask = jest.fn((newTask) => {
    tasks.push(newTask);
  });

  beforeEach(() => {
    renderTimeline({tasks, addTask});
  });

  test('renders tasks and KPI updates', () => {
    const taskElements = screen.getAllByTestId("task");
    expect(taskElements).toHaveLength(2);

    const kpiUpdateElements = screen.getAllByTestId("kpi-update");
    expect(kpiUpdateElements).toHaveLength(4);
  });

  test('renders add task button', () => {
    const addTaskButton = screen.getByTestId("add-task-button");
    expect(addTaskButton).toBeInTheDocument();
  });

  // test('adds task correctly', () => {
  //   const addTaskButton = screen.getByTestId("add-task-button");
  //   fireEvent.click(addTaskButton);

  //   const titleInput = screen.getByLabelText(/Task title/i);
  //   fireEvent.change(titleInput, { target: { value: 'New Task' } });

  //   const descriptionInput = screen.getByLabelText(/Task description/i);
  //   fireEvent.change(descriptionInput, { target: { value: 'This is a new task.' } });

  //   const submitButton = screen.getByText(/^Add$/i);
  //   fireEvent.click(submitButton);

  //   // expect(tasks).toHaveLength(3);
  //   // expect(tasks[2].title).toBe('New Task');
  //   // expect(tasks[2].description).toBe('This is a new task.');
  // });

});

describe('Task component', () => {

  beforeEach(() => {
    renderTask();
  });

  test('renders task title and description', () => {
    const taskTitleElement = screen.getByText(/Example task 1/i);
    expect(taskTitleElement).toBeInTheDocument();

    const taskDescriptionElement = screen.getByText(/This is an example task./i);
    expect(taskDescriptionElement).toBeInTheDocument();
  });

  test('renders KPI update button', () => {
    const btn = screen.getByTestId("kpi-update-button");
    expect(btn).toBeInTheDocument();
  });

});