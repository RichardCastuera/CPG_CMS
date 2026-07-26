import { columns } from "@/components/Guidelines/Columns";
import { DataTable } from "@/components/Guidelines/DataTable";
import { NewGuidelineButton } from "@/components/NewGuidelineButton";
import { Card } from "@/components/ui/card";
import { Guideline, guidelines } from "@/constants";

async function getData(): Promise<Guideline[]> {
  // Fetch data from your API here.
  return guidelines;
}

export default async function Guidelines() {
  const data = await getData();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col w-full gap-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Guidelines</h1>
            <p className="text-sm text-muted-foreground">
              Manage your clinical practice guidelines.
            </p>
          </div>
          <NewGuidelineButton />
        </header>
        <Card className="px-6 mb-6">
          <DataTable columns={columns} data={data} />
        </Card>
      </div>
    </div>
  );
}
