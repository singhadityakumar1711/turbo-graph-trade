import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { User } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Workflow {
  _id: string;
  nodes: any[];
  edges: any[];
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/platform-signup");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/workflows`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/platform-signup");
          return;
        }
        throw new Error("Failed to fetch workflows");
      }

      const data = await response.json();
      //   console.log(data);
      setWorkflows(data);
    } catch (err) {
      setError("Failed to load workflows");
      console.error("Error fetching workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkflow = (workflowId: string) => {
    // Navigate to create-workflow page with workflow ID
    navigate(`/create-workflow?workflowId=${workflowId}`);
  };

  const handleRunWorkflow = async (workflowId: string) => {
    // TODO: Implement workflow execution
    console.log("Running workflow:", workflowId);
    alert("Workflow execution feature coming soon!");
  };

  const handleConnectCredentials = () => {
    // TODO: Implement credentials connection
    console.log("Connect credentials");
    alert("Credentials connection feature coming soon!");
  };

  const handleExecutions = () => {
    // TODO: Navigate to executions page
    console.log("View executions");
    alert("Executions page coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* Profile Tab */}
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
              <User className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleConnectCredentials}
              className="bg-white dark:bg-card"
            >
              Connect credentials
            </Button>
            <Button
              variant="outline"
              onClick={handleExecutions}
              className="bg-white dark:bg-card"
            >
              Executions
            </Button>
            <Button
              onClick={() => navigate("/create-workflow")}
              className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white"
            >
              New Workflow
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-border p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Workflows</h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground">
                Loading workflows...
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive mb-4">
              {error}
            </div>
          )}

          {!loading && !error && workflows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No workflows yet. Create your first workflow to get started!
              </p>
              <Button
                onClick={() => navigate("/create-workflow")}
                className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white"
              >
                Create Workflow
              </Button>
            </div>
          )}

          {!loading && !error && workflows.length > 0 && (
            <div className="space-y-4">
              {workflows.map((workflow, index) => (
                <div
                  key={workflow._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-foreground">
                      {index + 1}. Workflow {index + 1}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenWorkflow(workflow._id)}
                      className="bg-white dark:bg-card"
                    >
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunWorkflow(workflow._id)}
                      className="bg-white dark:bg-card"
                    >
                      Run
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
