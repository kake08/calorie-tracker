import { requireUser } from "@/lib/session";
import { logout } from "../actions";
import BottomNav from "../components/BottomNav";
import { ChangePinForm, GoalForm } from "./SettingsForms";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <GoalForm goal={user.daily_goal} share={user.share_today} />
      <ChangePinForm />
      <form action={logout}>
        <button className="w-full rounded-xl border border-line bg-card px-4 py-3 font-semibold active:opacity-80">
          Log out
        </button>
      </form>
      <BottomNav active="settings" />
    </div>
  );
}
