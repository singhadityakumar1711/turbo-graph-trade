import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
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
import type { OnConnectEnd, NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TriggerSheet } from "./TriggerSheet";
import { PriceTrigger } from "@/assets/nodes/triggers/PriceTrigger";
import { TimerTrigger } from "@/assets/nodes/triggers/TimerTrigger";
import { ActionSheet } from "./ActionSheet";
import { Hyperliquid } from "@/assets/nodes/actions/Hyperliquid";
import { Backpack } from "@/assets/nodes/actions/Backpack";
import { Lighter } from "@/assets/nodes/actions/Lighter";
import { Button } from "./ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "./ui/dialog";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
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
  const [selectedTriggerNode, setSelectedTriggerNode] = useState(false);
  const [selectedActionNode, setSelectedActionNode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [actionSheetData, setActionSheetData] = useState<{
    x: number;
    y: number;
    sourceId: string;
    // sourceHandleId: string | null;
  } | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState("Untitled");
  const [prevWorkflowTitle, setPrevWorkflowTitle] = useState("");
  const [showTriggerPane, setShowTriggerPane] = useState(false);
  const [showActionPane, setShowActionPane] = useState(false);
  //   const [showTitleDialog, setShowTitleDialog] = useState(false);
  const { screenToFlowPosition } = useReactFlow();
  const { workflowId } = useParams();
  const isEditMode = Boolean(workflowId && String(workflowId) !== "create");
  const [workflowExists, setWorkflowExists] = useState(false);
  const navigate = useNavigate();
  //   console.log(workflowId + " - " + isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const loadWorkflow = async () => {
        // setIsLoading(true);
        try {
          const response = await fetch(
            `${API_BASE_URL}/workflow/${workflowId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                authorization: String(localStorage.getItem("token")),
              },
            }
          );
          const data = await response.json();
          // Populate state with existing data
          setNodes(data.nodes);
          setEdges(data.edges);
          setWorkflowTitle(data.title);
          setWorkflowExists(true);
          setPrevWorkflowTitle(data.title);
        } catch (error) {
          console.error("Failed to load workflow", error);
          // Optional: navigate back to dashboard on error
        } finally {
          //   setIsLoading(false);
        }
      };
      loadWorkflow();
    }
  }, [workflowId, isEditMode]);

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

  // saving the starting node state
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
          //   sourceHandleId: connectionState.fromHandle?.id || null,
        });
      }
    },
    [screenToFlowPosition]
  );

  const onNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
    console.log(event);
    console.log("-----------");
    console.log(node);
    if (node.type == "price-trigger" || node.type == "time-trigger") {
      setSelectedTriggerNode(true);
      setSelectedNodeId(node.id);
    } else {
      setSelectedActionNode(true);
      setSelectedNodeId(node.id);
    }
  }, []);

  // adding the new node and connecting the edge
  const onActionSelected = (type: NodeKind, metadata: any) => {
    if (!actionSheetData) return;

    const newNodeId = Math.random().toString();

    const newNode: NodeType = {
      id: newNodeId,
      type,
      position: { x: actionSheetData.x, y: actionSheetData.y },
      data: { kind: "ACTION", metadata },
      credentials: "",
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

  const handlePublish = async () => {
    if (edges.length < 1) {
      alert("A Workflow should have atleast 2 nodes");
    } else {
      try {
        // Clean nodes to match backend schema (remove ReactFlow-specific properties)
        const cleanedNodes = nodes.map((node) => ({
          type: String(node.type),
          data: {
            kind: node.data.kind,
            metadata: node.data.metadata,
          },
          id: String(node.id),
          position: {
            x: Number(node.position.x),
            y: Number(node.position.y),
          },
          credentials: node.credentials || null,
        }));

        // Clean edges to match backend schema
        const cleanedEdges = edges.map((edge) => ({
          id: String(edge.id),
          source: String(edge.source),
          target: String(edge.target),
        }));

        console.log("Publishing Workflow");
        console.log(String(localStorage.getItem("token")));
        console.log(
          JSON.stringify({
            title: workflowTitle,
            nodes: cleanedNodes,
            edges: cleanedEdges,
          })
        );
        if (workflowExists) {
          const response = await fetch(
            `${API_BASE_URL}/workflow/${workflowId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                authorization: String(localStorage.getItem("token")),
              },
              body: JSON.stringify({
                prevTitle: prevWorkflowTitle,
                newTitle: workflowTitle,
                nodes: cleanedNodes,
                edges: cleanedEdges,
              }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update workflow:", errorData);
            const errorMessage = errorData.errors
              ? `Validation errors: ${JSON.stringify(errorData.errors, null, 2)}`
              : errorData.message || "Unknown error";
            alert(`Failed to publish workflow: ${errorMessage}`);
            return;
          }

          const data = await response.json();
          console.log(data);
          navigate("/platform-dashboard");
        } else {
          const response = await fetch(`${API_BASE_URL}/workflow`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: String(localStorage.getItem("token")),
            },
            body: JSON.stringify({
              title: workflowTitle,
              nodes: cleanedNodes,
              edges: cleanedEdges,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to publish workflow:", errorData);
            const errorMessage = errorData.errors
              ? `Validation errors: ${JSON.stringify(errorData.errors, null, 2)}`
              : errorData.message || "Unknown error";
            alert(`Failed to publish workflow: ${errorMessage}`);
            return;
          }

          const data = await response.json();
          console.log(data);
          navigate("/platform-dashboard");
        }
      } catch (error) {
        console.error("Failed to publish workflow", error);
        alert("Failed to publish workflow. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <div className="flex items-center w-full h-16 px-6 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm z-10 relative flex-shrink-0">
        {/* 2. Top-Left Title Section */}
        <div className="flex flex-col flex-1 min-w-0">
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            className="w-full text-2xl font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-0 placeholder-slate-400 truncate"
            placeholder={workflowTitle}
          />
        </div>

        {/* 3. Spacer to push other items to the right */}
        <div className="flex-grow"></div>

        {/* 4. Right side actions */}
        <button
          onClick={handlePublish}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Publish
        </button>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Button
              size="lg"
              onClick={() => setShowTriggerPane(true)}
              className="font-semibold px-10 py-6 text-base bg-white/95 hover:bg-white border border-slate-200/80 text-slate-800 shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-200 pointer-events-auto hover:scale-105"
            >
              Add Trigger
            </Button>
          </div>
        )}
        {showTriggerPane == true && (
          <TriggerSheet
            onSelection={(type, metadata) => {
              //passing propas to the trigger sheet
              setNodes([
                //appending the new node to the nodes array
                ...nodes,
                {
                  type,
                  data: {
                    kind: "TRIGGER",
                    metadata,
                  },
                  id: Math.random().toString(),
                  position: { x: 0, y: 0 },
                  credentials: "",
                },
              ]);
              setShowTriggerPane(false);
            }}
          />
        )}
        {selectedTriggerNode && (
          <TriggerSheet
            onSelection={(type, metadata) => {
              let newNodeId = Math.random().toString();
              setNodes((prevNodes) =>
                prevNodes.map((nds) =>
                  nds.id === selectedNodeId
                    ? {
                        ...nds,
                        type,
                        data: {
                          kind: "TRIGGER",
                          metadata,
                        },
                        id: newNodeId,
                        position: { x: nds.position.x, y: nds.position.y },
                        credentials: "",
                      }
                    : nds
                )
              );
              setEdges((prevEdges) =>
                prevEdges.map((edg) => ({ ...edg, source: newNodeId }))
              );
              setSelectedTriggerNode(false);
              setShowTriggerPane(false);
            }}
          />
        )}
        {actionSheetData && <ActionSheet onSelection={onActionSelected} />}
        {selectedActionNode && (
          <ActionSheet
            onSelection={(type, metadata) => {
              let newNodeId = Math.random().toString();
              setNodes((prevNodes) =>
                prevNodes.map((nds) =>
                  nds.id === selectedNodeId
                    ? {
                        ...nds,
                        type,
                        data: {
                          kind: "TRIGGER",
                          metadata,
                        },
                        id: newNodeId,
                        position: { x: nds.position.x, y: nds.position.y },
                        credentials: "",
                      }
                    : nds
                )
              );
              setEdges((prevEdges) =>
                prevEdges.map((edg) =>
                  edg.target === selectedNodeId
                    ? {
                        ...edg,
                        id: edg.id,
                        source: edg.source,
                        target: newNodeId,
                      }
                    : edg
                )
              );
              setSelectedActionNode(false);
              setActionSheetData(null);
            }}
          />
        )}
        <ReactFlow
          // colorMode="dark"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onNodeDoubleClick={onNodeDoubleClick}
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
    </div>
  );
}

export default function Workflow() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
