"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IoLogoGoogle } from "react-icons/io";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithGoogle,
} from "@/lib/firebase/auth";
import { toast } from "sonner";
import { Credentials } from "@/lib/authtype";
// import { set } from "date-fns";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const emailref = React.useRef() as React.LegacyRef<HTMLInputElement>;
  const passwordRef = React.useRef() as React.LegacyRef<HTMLInputElement>;
  // const { toast } = useToast();
  async function onSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const elements = event?.currentTarget
      ?.elements as typeof event.currentTarget.elements & {
      email: { value: string };
      password: { value: string };
    };
    handleSignInWithEmailAndPassword({
      email: elements?.email?.value,
      password: elements?.password?.value,
    });
  }

  const handleSignInWithGoogle = async () => {
    // Only click once. Loading state updated
    setIsLoading(true);
    // should not throw error
    var success = await signInWithGoogle();
    // reset cache

    if (success === true || success?.error === undefined) {
      // Successful signin. No need for login.
      // router.push("/dashboard");

      toast("Welcome back!", { description: "Get started with Smart Enroll." });
    } else {
      // Could not sign in. Probably due to insufficient permissions / auth error.
      toast.error("Something went wrong", {
        description: "Could not sign in with google.",
      });
    }
    setIsLoading(false);
  };

  const handleSignInWithEmailAndPassword = async (cred: Credentials) => {
    // We are signing in with email and password. We need to initialize the loading and await firebase.
    setIsLoading(true);
    // firebase function should not throw error
    var success: any = await signInWithEmailAndPassword(cred);

    // success message
    if (success?.error === undefined || success?.error === null) {
      // Successful signin. No need for login.
      // router.push("/dashboard");
      setIsLoading(true);
      toast("Welcome back!", { description: "Get started with Smart Enroll." });
    } else {
      toast.error("Something went wrong", {
        description: "Could not sign in with email.",
      });
      // Could not sign in. Probably due to insufficient permissions / auth error.
    }
    // disable the loading state
    setIsLoading(false);
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              ref={emailref}
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-gray-100 rounded-xl text-[16px] placeholder:text-sm"
              required
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              ref={passwordRef}
              placeholder="********"
              type="password"
              required
              className="bg-gray-100 rounded-xl text-[16px] placeholder:text-sm"
              minLength={6}
              maxLength={80}
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button className="rounded-full" disabled={isLoading}>
            {isLoading && (
              <span className="icon-[svg-spinners--180-ring-with-bg]"></span>
            )}
            Sign In with Email
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        onClick={handleSignInWithGoogle}
        variant="outline"
        className="rounded-full"
        type="button"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="icon-[svg-spinners--180-ring-with-bg]"></span>
        ) : (
          <IoLogoGoogle className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
}

export function UserAuthFormRegister({
  className,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const emailref = React.useRef() as React.LegacyRef<HTMLInputElement>;
  const passwordRef = React.useRef() as React.LegacyRef<HTMLInputElement>;
  async function onSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const elements = event?.currentTarget
      ?.elements as typeof event.currentTarget.elements & {
      email: { value: string };
      password: { value: string };
      confirmPassword: { value: string };
    };
    // console.log(elements);
    if (elements?.password?.value !== elements?.confirmPassword?.value) {
      toast.error("Something went wrong", {
        description: "Passwords do not match.",
      });
      return;
    }
    handleSignUp({
      email: elements?.email?.value,
      password: elements?.password?.value,
    });
  }

  const handleSignUp = async (cred: Credentials) => {
    var success = await createUserWithEmailAndPassword(cred);
    // console.log(success, "success");
    if (success?.error === undefined || success?.error === null) {
      setIsLoading(true);
      toast("Welcome back!", { description: "Get started with Smart Enroll." });
    } else {
      toast.error("Something went wrong", {
        description: "Could not sign in with email. Email might be in use.",
      });
    }
    setIsLoading(false);
  };

  const handleSignUpWithGoogle = async () => {
    // console.log("Msg: Signing up with google");
    var success = await signInWithGoogle();
    setIsLoading(true);
    if (success === true || success?.error === undefined) {
      toast("Welcome back!", { description: "Get started with Smart Enroll." });
    } else {
      toast.error("Something went wrong", {
        description: "Could not sign in with google.",
      });
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-gray-100 rounded-xl text-[16px] placeholder:text-sm"
              required
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              placeholder="********"
              type="password"
              name="password"
              required
              minLength={6}
              maxLength={80}
              autoCapitalize="none"
              className="bg-gray-100 rounded-xl text-[16px] placeholder:text-sm"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              placeholder="********"
              className="bg-gray-100 rounded-xl text-[16px] placeholder:text-sm"
              type="password"
              required
              minLength={6}
              maxLength={80}
              autoCapitalize="none"
              autoComplete="current-password"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button className="rounded-full " disabled={isLoading}>
            {isLoading && (
              <span className="icon-[svg-spinners--180-ring-with-bg]"></span>
            )}
            Sign Up with Email
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        onClick={handleSignUpWithGoogle}
        variant="outline"
        type="button"
        className="rounded-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="icon-[svg-spinners--180-ring-with-bg]"></span>
        ) : (
          <IoLogoGoogle className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
}
