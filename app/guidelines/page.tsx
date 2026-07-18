import { columns } from "@/components/Guidelines/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { Guideline, guidelines } from "@/constants";

async function getData(): Promise<Guideline[]> {
  // Fetch data from your API here.
  return guidelines;
}

export default async function Guidelines() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
