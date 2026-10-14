import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/common/Button";

export function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="max-w-md text-center space-y-4">
        <span className="text-6xl font-extrabold text-primary block">404</span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Page Not Found</h1>
        <p className="text-sm text-muted-foreground">
          The requested page does not exist or has been relocated within MediSens AI.
        </p>
        <div className="pt-2">
          <Button asChild size="md">
            <Link to="/">
              <ArrowLeft className="size-4 mr-1" /> Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
