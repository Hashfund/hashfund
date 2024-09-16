import Button from "./wallet-connect/Button";

export function Toolbar() {
  return (
    <header className="flex p-2">
      <div className="flex-1" />
      <div>
        <Button />
      </div>
    </header>
  );
}
