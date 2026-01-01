import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import type { OnConnectEnd } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerSheet } from "./TriggerSheet";
import { PriceTrigger } from "@/assets/nodes/triggers/PriceTrigger";
import { TimerTrigger } from "@/assets/nodes/triggers/TimerTrigger";
import { ActionSheet } from "./ActionSheet";
import { Hyperliquid } from "@/assets/nodes/actions/Hyperliquid";
import { Backpack } from "@/assets/nodes/actions/Backpack";
import { Lighter } from "@/assets/nodes/actions/Lighter";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { NodeKind, NodeType, Edge } from "common/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const nodeTypes = {
  "price-trigger": PriceTrigger,
  "time-trigger": TimerTrigger,
  hyperliquid: Hyperliquid,
  backpack: Backpack,
  lighter: Lighter,
};
const proOptions = { hideAttribution: true };

function Flow() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [actionSheetData, setActionSheetData] = useState<{
    x: number;
    y: number;
    sourceId: string;
    sourceHandleId: string | null;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowId = searchParams.get("workflowId");

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  const { screenToFlowPosition } = useReactFlow();
  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid && connectionState.fromNode) {
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({ x: clientX, y: clientY });
        setActionSheetData({
          x: position.x,
          y: position.y,
          sourceId: connectionState.fromNode.id,
          sourceHandleId: connectionState.fromHandle?.id || null,
        });
      }
    },
    [screenToFlowPosition]
  );

  const onActionSelected = (type: NodeKind, metadata: any) => {
    if (!actionSheetData) return;

    const newNodeId = Math.random().toString();

    const newNode: NodeType = {
      id: newNodeId,
      type,
      position: { x: actionSheetData.x, y: actionSheetData.y },
      data: { kind: "action", metadata },
    };

    // 1. Add the new Node
    setNodes((nds) => [...nds, newNode]);

    // 2. Automatically create the Edge connecting Source -> New Node
    const newEdge: Edge = {
      id: `e-${actionSheetData.sourceId}-${newNodeId}`,
      source: actionSheetData.sourceId,
      target: newNodeId,
    };

    setEdges((eds) => addEdge(newEdge, eds));

    // 3. Close the sheet
    setActionSheetData(null);
  };

  useEffect(() => {
    // Load workflow if workflowId is present
    if (workflowId) {
      const loadWorkflow = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            navigate("/platform-signup");
            return;
          }

          const response = await fetch(
            `${API_BASE_URL}/workflow/${workflowId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to load workflow");
          }

          const workflow = await response.json();
          // Transform workflow nodes to match NodeType format
          const transformedNodes = workflow.nodes.map((node: any) => ({
            id: node.id,
            type: node.nodeId || node.type,
            position: node.position,
            data: node.data,
          }));
          setNodes(transformedNodes);
          setEdges(workflow.edges);
          // Load existing title if available
          if (workflow.title) {
            setWorkflowTitle(workflow.title);
          }
        } catch (err) {
          console.error("Error loading workflow:", err);
        }
      };
      loadWorkflow();
    }
  }, [workflowId, navigate]);

  const handlePublishClick = () => {
    if (nodes.length === 0) {
      alert("Please add at least one node to publish the workflow");
      return;
    }
    setShowTitleDialog(true);
  };

  const handlePublish = async () => {
    if (!workflowTitle.trim()) {
      alert("Please enter a workflow name");
      return;
    }

    setShowTitleDialog(false);
    setPublishing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/platform-signup");
        return;
      }

      // Transform nodes to match API schema
      const transformedNodes = nodes.map((node) => ({
        nodeId: node.type,
        data: {
          kind: node.data.kind.toUpperCase(),
          metadata: node.data.metadata,
        },
        id: node.id,
        position: node.position,
        credentials: null,
      }));

      const url = workflowId
        ? `${API_BASE_URL}/workflow/${workflowId}`
        : `${API_BASE_URL}/workflow`;
      const method = workflowId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          title: workflowTitle.trim(),
          nodes: transformedNodes,
          edges: edges,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to publish workflow");
      }

      await response.json();
      alert(
        workflowId
          ? "Workflow updated successfully!"
          : "Workflow published successfully!"
      );
      navigate("/platform-dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to publish workflow");
      console.error("Error publishing workflow:", err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 relative"
    >
      {/* Publish Button - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handlePublishClick}
          disabled={publishing || nodes.length === 0}
          className="bg-black text-white hover:bg-black/90 shadow-lg"
        >
          {publishing ? "Publishing..." : "Publish"}
        </Button>
      </div>

      {/* Title Dialog */}
      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Name Your Workflow</DialogTitle>
            <DialogDescription>
              Enter a name for your workflow. This will help you identify it
              later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workflow-title">Workflow Name</Label>
              <Input
                id="workflow-title"
                placeholder="My Workflow"
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && workflowTitle.trim()) {
                    handlePublish();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTitleDialog(false)}
              disabled={publishing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing || !workflowTitle.trim()}
              className="bg-black text-white hover:bg-black/90"
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!nodes.length && ( //-- if no nodes, show the trigger sheet
        <TriggerSheet
          onSelection={(type, metadata) => {
            //passing props to the trigger sheet
            setNodes([
              //appending the new node to the nodes array
              ...nodes,
              {
                type,
                data: {
                  kind: "trigger",
                  metadata,
                },
                id: Math.random().toString(),
                position: { x: 0, y: 0 },
              },
            ]);
          }}
        />
      )}
      {actionSheetData && <ActionSheet onSelection={onActionSelected} />}
      <ReactFlow
        // colorMode="dark"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        proOptions={proOptions}
        fitView
        className="bg-transparent"
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: "#64748b" },
          animated: true,
        }}
      >
        <Background
          id="1"
          gap={20}
          color="#e2e8f0"
          variant={BackgroundVariant.Lines}
          lineWidth={0.5}
        />

        <Background
          id="2"
          gap={100}
          color="#cbd5e1"
          variant={BackgroundVariant.Lines}
          lineWidth={1}
        />
        <Controls className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg" />
      </ReactFlow>
    </div>
  );
}
export default function CreateWorkflow() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
