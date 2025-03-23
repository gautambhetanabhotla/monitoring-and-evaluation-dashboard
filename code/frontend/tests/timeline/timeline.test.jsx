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

// Add at the top of your timeline.test.jsx file

// Mock all the @heroui components
jest.mock('@heroui/button', () => ({
  Button: ({ children, startContent, endContent, isIconOnly, onPress, type, color, size, ...props }) => (
    <button onClick={onPress} type={type} data-color={color} data-size={size} {...props}>
      {startContent}
      {children}
      {endContent}
    </button>
  )
}));

jest.mock('@heroui/input', () => ({
  Textarea: ({ children, value, onValueChange, isReadOnly, endContent, ...props }) => (
    <div>
      <textarea 
        value={value || ''}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        readOnly={isReadOnly}
        {...props}
      >
        {children}
      </textarea>
      {endContent}
    </div>
  ),
  Input: ({ children, value, onValueChange, label, ...props }) => (
    <div>
      {label && <label>{label}</label>}
      <input 
        value={value || ''}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        {...props}
      >
        {children}
      </input>
    </div>
  )
}));

jest.mock('@heroui/divider', () => ({
  Divider: (props) => <hr {...props} />
}));

jest.mock('@heroui/card', () => ({
  Card: ({ children, ...props }) => <div {...props}>{children}</div>
}));

jest.mock('@heroui/link', () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>
}));

jest.mock('@heroui/autocomplete', () => ({
  Autocomplete: ({ children, inputValue, onInputChange, selectedKey, onSelectionChange, defaultItems, label, placeholder, ...props }) => (
    <div>
      {label && <label>{label}</label>}
      <input 
        value={inputValue || ''}
        onChange={(e) => onInputChange && onInputChange(e.target.value)}
        placeholder={placeholder}
        {...props}
      />
      {Array.isArray(children) ? children.map(child => child) : children}
    </div>
  ),
  AutocompleteItem: ({ children, ...props }) => <div {...props}>{children}</div>
}));

jest.mock('@heroui/select', () => ({
  Select: ({ children, selectedKeys, onSelectionChange, ...props }) => (
    <select 
      value={selectedKeys?.values().next().value || ''}
      onChange={(e) => {
        const newSet = new Set([e.target.value]);
        onSelectionChange && onSelectionChange(newSet);
      }}
      {...props}
    >
      {children}
    </select>
  ),
  SelectItem: ({ children, key, ...props }) => <option value={key} {...props}>{children}</option>
}));

jest.mock('@heroui/popover', () => ({
  Popover: ({ children, ...props }) => <div {...props}>{children}</div>,
  PopoverTrigger: ({ children, ...props }) => <div {...props}>{children}</div>,
  PopoverContent: ({ children, ...props }) => <div {...props}>{children}</div>
}));

jest.mock('@heroui/modal', () => ({
  Modal: ({ children, isOpen, onOpenChange, ...props }) => (
    isOpen ? <div data-testid="modal" {...props}>{children}</div> : null
  ),
  ModalContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  useDisclosure: () => ({
    isOpen: false,
    onOpen: jest.fn(),
    onOpenChange: jest.fn(),
    onClose: jest.fn()
  })
}));

jest.mock('@heroui/form', () => ({
  Form: ({ children, onSubmit, ...props }) => (
    <form onSubmit={onSubmit} {...props}>{children}</form>
  )
}));

jest.mock('@heroui/number-input', () => ({
  NumberInput: ({ value, onValueChange, label, isRequired, isInvalid, ...props }) => (
    <div>
      {label && <label>{label}{isRequired && '*'}</label>}
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
        data-invalid={isInvalid}
        {...props}
      />
    </div>
  )
}));

jest.mock('@heroui/spacer', () => ({
  Spacer: () => <div style={{ margin: '10px 0' }} />
}));

// Mock the heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PencilSquareIcon: () => <span data-testid="pencil-icon">✏️</span>,
  CheckCircleIcon: () => <span data-testid="check-circle-icon">✓</span>,
  ArrowTrendingDownIcon: () => <span data-testid="arrow-down-icon">↓</span>,
  ArrowTrendingUpIcon: () => <span data-testid="arrow-up-icon">↑</span>,
  PlusIcon: () => <span data-testid="plus-icon">+</span>,
  CheckIcon: () => <span data-testid="check-icon">✓</span>,
  ArrowsUpDownIcon: () => <span data-testid="arrows-updown-icon">↕️</span>
}));

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

describe('Timeline Component', () => {
  test('renders tasks and KPI updates', () => {
    renderTimeline();
    
    const taskElements = screen.getAllByTestId("task");
    expect(taskElements).toHaveLength(2);

    const kpiUpdateElements = screen.getAllByTestId("kpi-update");
    expect(kpiUpdateElements).toHaveLength(4);
  });

  test('renders task title and description', () => {
    renderTimeline();
    
    const taskTitleElement = screen.getByText(/Example task 1/i);
    expect(taskTitleElement).toBeInTheDocument();

    const taskDescriptionElement = screen.getByText(/This is an example task./i);
    expect(taskDescriptionElement).toBeInTheDocument();
  });

  test('renders KPI update details', () => {
    renderTimeline();
    
    // const initial1 = screen.getByText(/20/i);
    // const final1 = screen.getByText(/35/i);
    // const note1 = screen.getByText(/This is a note./i);
    const updatedBy1 = screen.getByText(/Gautam Bhetanabhotla/i);
    // expect(initial1).toBeInTheDocument();
    // expect(final1).toBeInTheDocument();
    // expect(note1).toBeInTheDocument();
    expect(updatedBy1).toBeInTheDocument();
    // expect(kpiUpdateElement).toBeInTheDocument();
  });

  test('renders add task button', () => {
    renderTimeline();
    
    const addTaskButton = screen.getByTestId("add-task-button");
    expect(addTaskButton).toBeInTheDocument();
  });

  // test('renders add KPI update button', () => {
  //   renderTimeline();
    
  //   const addKPIUpdateButton = screen.getByTestId("kpi-update-button");
  //   expect(addKPIUpdateButton).toBeInTheDocument();
  // });
});