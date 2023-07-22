import UserAuthForm from "./UserAuthForm";
import { Icons } from "./icons";
import Link from "next/link";

const SignIn = () => {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto h-5 w-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a Reddit accoutnt and agree to our
          User Agreement and Privacy Policy.
        </p>

        {/* We can pass the classname to the children like a normal div */}
        <UserAuthForm className="" />

        <p className="px-8 text-center text-sm text-zinc-700">Already a Reddit Buddy?{" "} <Link href='/sign-in' className="hover:textg-zinc-800 text-sm underline underline-offset-4">Sign In</Link></p>

      </div>
    </div>
  );
};

export default SignIn;