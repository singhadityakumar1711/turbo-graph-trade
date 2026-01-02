import { BrowserRouter, Route, Routes } from "react-router-dom";
// import CreateWorkflow from "./components/CreateWorkflow.tsx";
import Workflow from "./components/Workflow.tsx";
import SignUp from "./components/SignUp.tsx";
import Dashboard from "./components/Dashboard.tsx";
// import Test from "./components/Test.tsx";
export default function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/platform-signup" element={<SignUp />} />
          <Route path="/platform-dashboard" element={<Dashboard />} />
          {/* <Route path="/create-workflow" element={<CreateWorkflow />} /> */}
          <Route path="/platform-workflow/create" element={<Workflow />} />
          <Route path="/platform-workflow/:workflowId" element={<Workflow />} />
          {/* <Route path="/test" element={<Test />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}
