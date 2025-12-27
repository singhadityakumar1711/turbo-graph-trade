import type { TradingMetadata } from "common/types";
import { Handle, Position } from "@xyflow/react";

export function Lighter({
  data,
}: {
  data: {
    metadata: TradingMetadata;
  };
}) {
  const isLong = data.metadata.type === "LONG";
  return (
    <div className="group relative p-5 bg-gradient-to-br from-pink-500 via-rose-600 to-fuchsia-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-pink-400/30 min-w-[200px]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
            Lighter
          </span>
        </div>
        <div className="space-y-2">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              isLong
                ? "bg-green-400/30 text-green-100"
                : "bg-red-400/30 text-red-100"
            }`}
          >
            {data.metadata.type}
          </div>
          <div className="text-2xl font-bold">{data.metadata.symbol}</div>
          <div className="text-sm opacity-90">Qty: {data.metadata.qty}</div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-pink-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        className="!w-3 !h-3 !bg-white !border-2 !border-emerald-500"
      />
    </div>
  );
}
