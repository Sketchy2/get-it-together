import { auth } from "@/auth"
import { redirect } from "next/navigation";
import SignOut from "@/components/SignOut"

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div >

      Home
      < SignOut />
    </div>
  );
  
}
