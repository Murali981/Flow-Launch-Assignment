// Install and import react-hot-toast
// npm install react-hot-toast

// TaskTable.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import Modal from "./Modal";
import TaskForm, { STATUS_OPTIONS } from "./TaskForm";
import TaskList from "./TaskList";
import TaskFilter from "./TaskFilter";

const TaskTable = ({ initialTasks, apiEndpoint }) => {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(20);

  // Add task counters
  const taskCounters = {
    total: tasks.length,
    "To Do": tasks.filter((task) => task.status === "To Do").length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Done: tasks.filter((task) => task.status === "Done").length,
  };

  useEffect(() => {
    if (!initialTasks) {
      fetchTasks();
    }
  }, [initialTasks]);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter, searchQuery]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      const formattedTasks = data.map((task) => ({
        id: task.id,
        title: task.title,
        description: `Task description ${task.id}`,
        status: task.completed ? "Done" : "To Do",
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination calculations
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleAddTask = (newTask) => {
    const task = {
      id: tasks.length + 1,
      ...newTask,
    };
    setTasks([...tasks, task]);
    setIsModalOpen(false);
    toast.success("Task added successfully!");
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
    setIsModalOpen(false);
    toast.success("Task updated successfully!");
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted successfully!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <TaskFilter value={statusFilter} onChange={setStatusFilter} />
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add New Task
          </button>
        </div>
      </div>

      {/* Task Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Tasks</div>
          <div className="text-2xl font-bold">{taskCounters.total}</div>
        </div>
        {STATUS_OPTIONS.map((status) => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500">{status}</div>
            <div className="text-2xl font-bold">{taskCounters[status]}</div>
          </div>
        ))}
      </div>

      {/* Task List */}
      <TaskList
        tasks={currentTasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {indexOfFirstTask + 1} to{" "}
          {Math.min(indexOfLastTask, filteredTasks.length)} of{" "}
          {filteredTasks.length} tasks
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Edit Task" : "Add New Task"}
      >
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
        />
      </Modal>
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
