import { useState, useCallback } from "react";
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
import type {NodeKind, NodeType, Edge} from "common/types"

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
      // ...(actionSheetData.sourceHandleId
      //   ? { sourceHandle: actionSheetData.sourceHandleId }
      //   : {}),
    };

    setEdges((eds) => addEdge(newEdge, eds));

    // 3. Close the sheet
    setActionSheetData(null);
  };

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100"
    >
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
