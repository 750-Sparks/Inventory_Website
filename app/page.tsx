import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TeamLogin } from "@/components/team-login";

export default async function HomePage() {
  const cookieStore = await cookies();
  const teamNumber = cookieStore.get("team_number")?.value;

  // If already logged in, redirect to dashboard
  if (teamNumber) {
    redirect("/dashboard");
  }

  return <TeamLogin />;
}
