import { annoucements } from "@/config/annoucement";
import clsx from "clsx";

type AnnoucementProps = {
  className?: string;
};

export function Annoucement({ className }: AnnoucementProps) {
  return (
    <div
      className={clsx(
        className,
        "flex space-x-8 px-4 overflow-x-scroll snap-x snap-mandatory"
      )}
      md="px-8"
    >
      {annoucements.map((annoucement) => (
        <div
          key={annoucement.title}
          className="max-w-sm flex shrink-0 snap-center items-center rounded-md bg-secondary/10 px-4 py-2 space-x-4"
        >
          <div>
            <annoucement.icon
              alt={annoucement.title}
              width={32}
              height={32}
            />
          </div>
          <div>
            <h4 className="font-medium">{annoucement.title}</h4>
            <p className="text-xs text-white/75">{annoucement.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
