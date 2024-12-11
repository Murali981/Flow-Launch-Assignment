// src/components/TaskFilter.jsx
import PropTypes from "prop-types";
import { STATUS_OPTIONS } from "./TaskForm";

const TaskFilter = ({ value, onChange }) => {
  return (
    <select
      className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All Status</option>
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
};

TaskFilter.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TaskFilter;
