import { useState, useEffect, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import PropTypes from "prop-types";
import "tabulator-tables/dist/css/tabulator.min.css";

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];

const TaskTable = ({ initialTasks, apiEndpoint }) => {
  const tableRef = useRef(null);
  const [table, setTable] = useState(null);
  const [tasks, setTasks] = useState(initialTasks || []);

  useEffect(() => {
    if (!initialTasks) {
      fetchTasks();
    }
  }, [initialTasks]);

  useEffect(() => {
    if (tableRef.current) {
      // Define table columns
      const tableColumns = [
        {
          title: "ID",
          field: "id",
          width: 70,
          headerFilter: true,
        },
        {
          title: "Title",
          field: "title",
          editor: "input",
          headerFilter: true,
        },
        {
          title: "Description",
          field: "description",
          editor: "input",
          headerFilter: true,
        },
        {
          title: "Status",
          field: "status",
          editor: "select",
          editorParams: {
            values: STATUS_OPTIONS,
          },
          headerFilter: "select",
          headerFilterParams: {
            values: ["", ...STATUS_OPTIONS],
          },
        },
        {
          title: "Actions",
          formatter: function (cell) {
            return '<button class="delete-btn">Delete</button>';
          },
          cellClick: function (e, cell) {
            if (e.target.classList.contains("delete-btn")) {
              const taskId = cell.getRow().getData().id;
              handleDeleteTask(taskId);
            }
          },
          width: 100,
          hozAlign: "center",
          headerSort: false,
        },
      ];

      // Initialize Tabulator
      const newTable = new Tabulator(tableRef.current, {
        data: tasks,
        columns: tableColumns,
        layout: "fitColumns",
        responsiveLayout: "true",
        pagination: "local",
        paginationSize: 10,
        paginationSizeSelector: [5, 10, 20, 50],
        movableColumns: true,
        history: true,
        placeholder: "No Tasks Available",
        cellEdited: function (cell) {
          const row = cell.getRow();
          const updatedTask = row.getData();
          handleUpdateTask(updatedTask);
        },
      });

      setTable(newTable);

      // Cleanup
      return () => {
        if (newTable) {
          newTable.destroy();
        }
      };
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      const formattedTasks = data.slice(0, 20).map((task) => ({
        id: task.id,
        title: task.title,
        description: `Task description ${task.id}`,
        status: task.completed ? "Done" : "To Do",
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: tasks.length + 1,
      title: "New Task",
      description: "New Task Description",
      status: "To Do",
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add New Task
        </button>
      </div>

      {/* Tabulator table container */}
      <div
        ref={tableRef}
        className="bg-white rounded-lg shadow overflow-hidden"
      ></div>
    </div>
  );
};

TaskTable.propTypes = {
  initialTasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.oneOf(STATUS_OPTIONS).isRequired,
    })
  ),
  apiEndpoint: PropTypes.string,
};

TaskTable.defaultProps = {
  initialTasks: null,
  apiEndpoint: "https://jsonplaceholder.typicode.com/todos",
};

export default TaskTable;
