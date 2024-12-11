// src/components/TaskForm.jsx
import { useState } from "react";
import PropTypes from "prop-types";

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    task || { title: "", description: "", status: "To Do" }
  );

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Task Title"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Task Description"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
      <div>
        <select
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSubmit(formData)}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {task ? "Update Task" : "Add Task"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

TaskForm.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.oneOf(STATUS_OPTIONS).isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

TaskForm.defaultProps = {
  task: null,
};

export { STATUS_OPTIONS };
export default TaskForm;
