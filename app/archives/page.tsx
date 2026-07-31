const Archive = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex w-full flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Archive</h1>
            <p className="text-sm text-muted-foreground">
              Guideline versions are automatically archived after 5 years. They
              remain readable and exportable, but are hidden from the active CPG
              library.
            </p>
          </div>
        </header>
      </div>
    </div>
  );
};

export default Archive;
