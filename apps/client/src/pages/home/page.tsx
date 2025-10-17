import { buttonVariants } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";

export const HomePage = () => (
  <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>Resume Forge</title>
      <meta
        name="description"
        content="Build, edit, and export your resumes with a private, self-hosted tool."
      />
    </Helmet>

    <div className="space-y-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Resume Forge</h1>
      <p className="text-lg text-muted-foreground">
        Keep a personal copy of Reactive Resume focused on the essentials. Create resumes, manage
        templates, and export your work without the extra marketing fluff.
      </p>
    </div>

    <div className="flex flex-wrap gap-4">
      <Link
        to="/auth/login"
        className={cn(buttonVariants({ size: "lg" }), "px-6")}
        aria-label="Sign in to access your resumes"
      >
        Sign In
      </Link>
      <Link
        to="/auth/register"
        className={cn(buttonVariants({ size: "lg", variant: "outline" }), "px-6")}
        aria-label="Create a new account"
      >
        Create Account
      </Link>
      <Link
        to="/dashboard/resumes"
        className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "px-6")}
        aria-label="Go directly to the resume dashboard"
      >
        Go to Dashboard
      </Link>
    </div>
  </main>
);
