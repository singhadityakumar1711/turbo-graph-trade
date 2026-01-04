import type { NodeKind, TradingMetadata, TradingType } from "common/types";
import { SUPPORTED_ASSETS } from "common/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  //   SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  //   SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  //   SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface SupportedActions {
  id: NodeKind;
  title: string;
  description: string;
}

const SUPPORTED_ACTIONS: SupportedActions[] = [
  {
    id: "hyperliquid",
    title: "Hyperliquid",
    description: "Place a trade on Hyperliquid",
  },
  {
    id: "backpack",
    title: "Backpack",
    description: "Place a trade on Backpack",
  },
  {
    id: "lighter",
    title: "Lighter",
    description: "Place a trade on Lighter",
  },
];

const SUPPORTED_TRADE: TradingType[] = ["LONG", "SHORT"];

export const ActionSheet = ({
  onSelection,
}: {
  onSelection: (kind: NodeKind, metadata: TradingMetadata) => void;
}) => {
  //   const [metadata, setMetadata] = useState<TradingMetadata>({
  //     type: "LONG",
  //     qty: 10,
  //     symbol: "BTC",
  //   });
  const [selectedAction, setSelectedAction] = useState<NodeKind>(
    SUPPORTED_ACTIONS[0].id
  );
  const [tradeType, setTradeType] = useState<TradingType>("LONG");
  const [qty, setQty] = useState<number | null>(null);
  const [symbol, setSymbol] =
    useState<(typeof SUPPORTED_ASSETS)[number]>("BTC");
  return (
    <Sheet open={true}>
      <SheetContent
        className="bg-gradient-to-b from-slate-50 to-white shadow-2xl animate-in slide-in-from-right duration-500 border-l border-slate-200"
        side="right"
      >
        <SheetHeader className="space-y-4 pb-6 border-b border-slate-200">
          <SheetTitle className="font-sans text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Select Action
          </SheetTitle>
          <SheetDescription className="text-slate-600 font-medium">
            Choose the type of Action you want to add
          </SheetDescription>
        </SheetHeader>
        <div className="mt-2 space-y-6">
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Action Type
            </label>
            <Select
              value={selectedAction}
              onValueChange={(value) => setSelectedAction(value as NodeKind)}
            >
              <SelectTrigger className="w-full h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400">
                <SelectValue placeholder="Select an Action" />
              </SelectTrigger>
              <SelectContent position="popper" className="border-slate-200">
                <SelectGroup>
                  {SUPPORTED_ACTIONS.map(({ id, title }) => (
                    // <>
                    <SelectItem
                      value={id}
                      key={id}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      {title}
                    </SelectItem>
                    // </>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {(selectedAction == "hyperliquid" ||
            selectedAction == "lighter" ||
            selectedAction == "backpack") && (
            <div className="space-y-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Select Symbol
                </label>
                <Select
                  value={symbol}
                  onValueChange={
                    (value) =>
                      setSymbol(value as (typeof SUPPORTED_ASSETS)[number])
                    // setMetadata([...])
                  }
                >
                  <SelectTrigger className="w-full h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400">
                    <SelectValue placeholder="Select Symbol" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="border-slate-200">
                    <SelectGroup>
                      {SUPPORTED_ASSETS.map((pos) => (
                        // <>
                        <SelectItem
                          value={pos}
                          key={pos}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          {pos}
                        </SelectItem>
                        // </>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Quantity
                </label>
                <Input
                  type="number"
                  // value={qty as number}
                  value={qty ?? ""}
                  // onChange={(e) => {
                  //   setQty(Number(e.target.value));
                  // }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQty(val === "" ? null : Number(val));
                  }}
                  className="h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                  placeholder="Enter quantity"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Select Position
                </label>
                <Select
                  value={tradeType}
                  onValueChange={(value) => setTradeType(value as TradingType)}
                >
                  <SelectTrigger className="w-full h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400">
                    <SelectValue placeholder="Select your Trade position" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="border-slate-200">
                    <SelectGroup>
                      {SUPPORTED_TRADE.map((pos) => (
                        // <>
                        <SelectItem
                          value={pos}
                          key={pos}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          {pos}
                        </SelectItem>
                        // </>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <SheetFooter className="mt-8 pt-6 border-t border-slate-200">
          <Button
            type="submit"
            onClick={() =>
              onSelection(selectedAction, {
                type: tradeType,
                qty: qty as number,
                symbol: symbol,
              })
            }
            className="w-full h-11 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Create Action
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
