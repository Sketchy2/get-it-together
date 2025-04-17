import { auth } from "@/auth"
import SignOut from "@/components/auth/SignOut"
import Image from "next/image";
import styles from "@/app/page.module.css"

export default async function Home() {
  const session = await auth();
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image || "/vercel.svg"; // Provide a valid fallback image

  return (
    <div >
      <h1 className={styles.a}>Assignment Page</h1>
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
