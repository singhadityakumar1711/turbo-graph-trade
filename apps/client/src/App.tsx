import { BrowserRouter, Route, Routes } from "react-router-dom";
import CreateWorkflow from "./components/CreateWorkflow.tsx";
// import Test from "./components/Test.tsx";
export default function App() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/create-workflow" element={<CreateWorkflow />} />
          {/* <Route path="/test" element={<Test />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}
