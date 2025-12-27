import type {
  NodeKind,
  PriceTriggerNodeMetadata,
  TimerTriggerNodeMetadata,
} from "common/types";
import { SUPPORTED_ASSETS } from "common/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  // SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  // SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  // SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface SupportedTrigger {
  id: NodeKind;
  title: string;
  description: string;
}

const SUPPORTED_TRIGGERS: SupportedTrigger[] = [
  {
    id: "time-trigger",
    title: "Time Trigger",
    description: "Triggers at specific time intervals",
  },
  {
    id: "price-trigger",
    title: "Price Trigger",
    description: "Triggers when a price threshold is met",
  },
];

export const TriggerSheet = ({
  onSelection,
}: {
  onSelection: (
    kind: NodeKind,
    metadata: PriceTriggerNodeMetadata | TimerTriggerNodeMetadata
  ) => void;
}) => {
  const [metadata, setMetadata] = useState<
    PriceTriggerNodeMetadata | TimerTriggerNodeMetadata
  >({
    time: 90,
  });
  const [selectedTrigger, setSelectedTrigger] = useState<NodeKind>(
    SUPPORTED_TRIGGERS[0].id
  );
  return (
    <Sheet open={true}>
      {/* {console.log("sheet opened")} */}
      <SheetContent
        className="bg-gradient-to-b from-slate-50 to-white shadow-2xl animate-in slide-in-from-right duration-500 border-l border-slate-200"
        side="right"
      >
        <SheetHeader className="space-y-4 pb-6 border-b border-slate-200">
          <SheetTitle className="font-sans text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Select Trigger
          </SheetTitle>
          <SheetDescription className="text-slate-600 font-medium">
            Choose the type of trigger you want to add
          </SheetDescription>
        </SheetHeader>
        <div className="mt-2 space-y-6">
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="text-sm font-semibold text-slate-700 ">
              Trigger Type
            </label>

            <Select
              value={selectedTrigger}
              onValueChange={(value) => setSelectedTrigger(value as NodeKind)}
            >
              <SelectTrigger className="w-full h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400">
                <SelectValue placeholder="Select a Trigger" />
              </SelectTrigger>
              <SelectContent position="popper" className="border-slate-200">
                <SelectGroup>
                  {SUPPORTED_TRIGGERS.map(({ id, title }) => (
                    <>
                      <SelectItem
                        value={id}
                        key={id}
                        className="cursor-pointer hover:bg-slate-50"
                      >
                        {title}
                      </SelectItem>
                    </>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {selectedTrigger == "time-trigger" && (
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="text-sm font-semibold text-slate-700">
                Number of seconds after which the Trigger should run
              </label>
              <Input
                type="number"
                value={(metadata as TimerTriggerNodeMetadata).time}
                onChange={(e) => {
                  setMetadata((m) => ({
                    ...m,
                    time: Number(e.target.value),
                  }));
                }}
                className="h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                placeholder="Enter seconds"
              />
            </div>
          )}
          {selectedTrigger == "price-trigger" && (
            <div className="space-y-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Price
                </label>
                <Input
                  type="number"
                  onChange={(e) => {
                    setMetadata((m) => ({
                      ...m,
                      price: Number(e.target.value),
                    }));
                  }}
                  className="h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400"
                  placeholder="Enter price"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Asset
                </label>
                <Select
                  value={(metadata as PriceTriggerNodeMetadata).asset}
                  onValueChange={(value) =>
                    setMetadata((m) => ({
                      ...m,
                      asset: value as PriceTriggerNodeMetadata["asset"],
                    }))
                  }
                >
                  <SelectTrigger className="w-full h-11 border-slate-300 focus:border-slate-400 focus:ring-slate-400">
                    <SelectValue placeholder="Select an Asset" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="border-slate-200">
                    <SelectGroup>
                      {SUPPORTED_ASSETS.map((id) => (
                        <>
                          <SelectItem
                            value={id}
                            key={id}
                            className="cursor-pointer hover:bg-slate-50"
                          >
                            {id}
                          </SelectItem>
                        </>
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
            onClick={() => onSelection(selectedTrigger, metadata)}
            className="w-full h-11 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Create Trigger
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
