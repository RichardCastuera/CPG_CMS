import { columns } from "@/components/Guidelines/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { NewGuidelineButton } from "@/components/NewGuidelineButton";
import { Guideline, guidelines } from "@/constants";

async function getData(): Promise<Guideline[]> {
  // Fetch data from your API here.
  return guidelines;
}

export default async function Guidelines() {
  const data = await getData();

  return (
    <div className="flex flex-col w-full gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h2>Guidelines</h2>
          <p>Manage your clinical practice guidelines.</p>
        </div>
        <NewGuidelineButton />
      </header>
      <main className="container mx-auto pb-10">
        <DataTable columns={columns} data={data} />
      </main>
    </div>
  );
}
