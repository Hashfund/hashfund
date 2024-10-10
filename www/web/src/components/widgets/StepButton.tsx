import clsx from "clsx";

import { Tab } from "@headlessui/react";
import { IoMdCheckmark } from "react-icons/io";
import { TbLayersSelectedBottom } from "react-icons/tb";

type StepButtonProps = {
  position: string;
  title: string;
  hideLine?: boolean;
};

export default function StepButton({
  position,
  title,
  hideLine,
}: StepButtonProps) {
  return (
    <Tab
      className={clsx(
        "text-left flex lt-lg:items-center lt-lg:space-x-4 lg:flex-col focus:outline-none",
        [hideLine ? "" : "lt-lg:flex-1"]
      )}
    >
      {({ selected }) => (
        <>
          <div className="flex lt-lg:items-center space-x-4">
            <div>
              <div
                className={clsx(
                  "border border-secondary text-secondary text-black w-8 h-8 flex items-center justify-center rounded-full",
                  {
                    "border-none bg-primary ring-1 ring-primary  ring-offset-4 ring-offset-black":
                      selected,
                  }
                )}
              >
                {selected ? <IoMdCheckmark className="text-black" /> : position}
              </div>
              {!hideLine && (
                <div
                  className={clsx(
                    "ml-4 w-0.4 h-16 bg-primary/50 lt-lg:hidden",
                    {
                      "bg-primary": selected,
                    }
                  )}
                />
              )}
            </div>
            <div className="flex flex-col lt-lg:flex-1 lt-lg:items-center">
              <p
                className={clsx([selected ? "text-primary" : "text-secondary"])}
              >
                Step {position}
              </p>
              <p
                className={clsx("lt-lg:hidden", [
                  selected ? "text-primary" : "text-secondary ",
                ])}
              >
                {title}
              </p>
            </div>
          </div>
          {!hideLine && (
            <div
              className={clsx("ml-4 flex-1 h-0.4 bg-secondary lg:hidden", {
                "bg-primary": selected,
              })}
            />
          )}
        </>
      )}
    </Tab>
  );
}
