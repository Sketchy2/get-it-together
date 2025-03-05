import { auth } from "@/auth"
import { redirect } from "next/navigation";
import SignOut from "@/components/SignOut"
import Image from "next/image";
import styles from "@/app/page.module.css"

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image || "/vercel.svg"; // Provide a valid fallback image

  return (
    <div >
      <h1 className={styles.a}>Home Page</h1>
      <div >
      <h3>{userName}</h3>
        <Image
          src={userImage}
          alt={userName}
          width={72}
          height={72}
          className="rounded-full"
        />
        <SignOut />
        </div>
      </div>

  );
  
}
