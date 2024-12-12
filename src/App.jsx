import "./App.css";

import TaskTable from "./components/TaskTable";
import "tabulator-tables/dist/css/tabulator.min.css";
import { Toaster } from "react-hot-toast";

// bg-gray-100

function App() {
  return (
    <div className="min-h-screen ">
      <Toaster position="top-right" />
      <TaskTable />
    </div>
  );
}

export default App;
