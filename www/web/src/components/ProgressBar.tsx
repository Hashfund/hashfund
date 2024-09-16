import clsx from "clsx";

type ProgressBarProps = {
  className?: string;
  value: number;
};
export default function ProgressBar({ className, value }: ProgressBarProps) {
  return (
    <div className={clsx(className, "bg-dark-200 rounded")}>
      <div
        className="rounded bg-primary p-1.5"
        lt-md="p-1"
        style={{ width: value + "%" }}
      />
    </div>
  );
}
