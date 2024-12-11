import "./App.css";

import TaskTable from "./components/TaskTable";
import "tabulator-tables/dist/css/tabulator.min.css";

// bg-gray-100

function App() {
  return (
    <div className="min-h-screen ">
      <TaskTable />
    </div>
  );
}

export default App;
