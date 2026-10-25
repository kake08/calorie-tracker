import { requireUser } from "@/lib/session";
import BottomNav from "../components/BottomNav";
import AddEntryForm from "./AddEntryForm";

export default async function AddPage() {
  await requireUser();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Add food</h1>
      <AddEntryForm />
      <BottomNav active="add" />
    </div>
  );
}
