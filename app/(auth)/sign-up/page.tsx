import AuthForm from "@/components/auth/auth-form";
import React from "react";

const SignUpPage = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <AuthForm type="sign-up" />
    </div>
  );
};

export default SignUpPage;
