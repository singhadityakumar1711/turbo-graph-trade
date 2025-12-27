import type { TimerTriggerNodeMetadata } from "common/types";
import { Handle, Position } from "@xyflow/react";

export function TimerTrigger({
  data,
}: {
  data: {
    metadata: TimerTriggerNodeMetadata;
  };
}) {
  return (
    <div className="group relative p-5 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-400/30 min-w-[180px]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
            Time Trigger
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-xl font-bold">Every</div>
          <div className="text-2xl font-bold">{data.metadata.time}s</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-blue-500"
      />
    </div>
  );
}
