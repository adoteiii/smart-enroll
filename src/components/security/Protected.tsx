"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useContext, useEffect, useState } from "react";
import { Context } from "@/lib/userContext";

interface ProtectedProps {
  children: ReactNode;
}
export function Protected(props: ProtectedProps) {
  const { user, loading } = useContext(Context);
  const [authenticated, setAuthenticated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (loading) {
      setAuthenticated(false);
      return;
    }
    if (user === null && !loading) {
      router.push("/signin");
      return;
    }
    setAuthenticated(true);
  }, [user, loading]);

  return authenticated ? props.children : <></>;
}
