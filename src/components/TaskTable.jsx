/* eslint-disable */

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Plus, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];

const TaskTable = ({ initialTasks, apiEndpoint }) => {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editedRows, setEditedRows] = useState({});
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    if (!initialTasks) {
      fetchTasks();
    }
  }, [initialTasks]);

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
      setTasks(formattedTasks); // Set initial tasks
      //   setFilteredTasks(formattedTasks); // Also set filtered tasks initially
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    }
  };

  const handleAddRow = () => {
    const newTask = {
      id: tasks.length + 1,
      title: "New Task",
      description: "Click to edit",
      status: "To Do",
    };
    setTasks([newTask, ...tasks]);
    setEditedRows((prev) => ({ ...prev, [newTask.id]: true }));
    toast.success("New row added! Click to edit.");
  };

  const handleDeleteRow = (taskId) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== taskId);
      // Update filtered tasks as well
      setFilteredTasks(
        updatedTasks.filter((task) => {
          const matchesStatus =
            statusFilter === "all" || task.status === statusFilter;
          const matchesSearch =
            task.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
            task.description.toLowerCase().includes(globalFilter.toLowerCase());
          return matchesStatus && matchesSearch;
        })
      );
      return updatedTasks;
    });
    toast.success("Task deleted successfully!");
  };

  const handleCellEdit = (rowId, columnId, value) => {
    setTasks((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  // Editable Cell Component
  const EditableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue();
    const [value, setValue] = useState(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    const onBlur = () => {
      setIsEditing(false);
      if (value !== initialValue) {
        handleCellEdit(row.original.id, column.id, value);
        toast.success("Cell updated successfully!");
      }
    };

    if (column.id === "status" && isEditing) {
      return (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          autoFocus
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {["To Do", "In Progress", "Done"].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (isEditing) {
      return (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          autoFocus
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <div
        className="cursor-pointer p-2 -m-2 rounded hover:bg-gray-100"
        onClick={() => setIsEditing(true)}
      >
        {column.id === "status" ? (
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              value === "Done"
                ? "bg-green-100 text-green-800"
                : value === "In Progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {value}
          </span>
        ) : (
          value
        )}
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 70,
        enableEditing: false,
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: EditableCell,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: EditableCell,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: EditableCell,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleDeleteRow(row.original.id)}
            className="p-1 hover:bg-gray-100 rounded text-red-600"
          >
            <Trash2 size={16} />
          </button>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesSearch =
        task.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
        task.description.toLowerCase().includes(globalFilter.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <button
            onClick={handleAddRow}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Task
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing{" "}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{" "}
          to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            filteredData.length
          )}{" "}
          of {filteredData.length} tasks
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`p-2 rounded-lg ${
              !table.getCanPreviousPage()
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`p-2 rounded-lg ${
              !table.getCanNextPage()
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// TaskTable PropTypes
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
