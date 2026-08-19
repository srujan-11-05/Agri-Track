import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sprout, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AgriTrack Agribusiness Management" },
      {
        name: "description",
        content:
          "Secure login and registration for farmers, suppliers and agribusiness managers using AgriTrack.",
      },
      { property: "og:title", content: "Sign in — AgriTrack Agribusiness Management" },
      {
        property: "og:description",
        content: "Secure login and registration for farmers, suppliers and agribusiness managers.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [accountType, setAccountType] = useState("farmer");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters for your password");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          account_type: accountType,
          farm_name: farmName,
          location,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your inbox if confirmation is required.");
  };

  const googleSignIn = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-field p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="grain-texture absolute inset-0 opacity-40" aria-hidden="true" />
        <Link to="/" className="relative flex items-center gap-2 font-display text-xl">
          <Sprout className="size-6" /> AgriTrack
        </Link>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl leading-tight">
            One dashboard for the whole growing season.
          </h2>
          <p className="mt-4 text-sm opacity-85">
            Crops, inventory, sales, purchases, expenses and daily mandi prices — tracked in one
            secure place for farmers, suppliers and agribusiness managers.
          </p>
        </div>
        <p className="relative text-xs opacity-70">
          Encrypted accounts · Row-level data isolation · Works on mobile
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 font-display text-xl lg:hidden">
            <Sprout className="size-6 text-primary" /> AgriTrack
          </Link>

          <Tabs defaultValue="signin">
            <TabsList className="w-full">
              <TabsTrigger value="signin" className="flex-1">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <h1 className="font-display text-2xl">Welcome back</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to reach your farm dashboard.
              </p>
              <form onSubmit={signIn} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="mt-1.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <h1 className="font-display text-2xl">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your farm profile in under a minute.
              </p>
              <form onSubmit={signUp} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    required
                    className="mt-1.5"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="accountType">I am a</Label>
                    <Select value={accountType} onValueChange={setAccountType}>
                      <SelectTrigger id="accountType" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="manager">Agribusiness manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Village / district</Label>
                    <Input
                      id="location"
                      className="mt-1.5"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="farmName">Farm or business name</Label>
                  <Input
                    id="farmName"
                    className="mt-1.5"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-1.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="mt-1.5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Minimum 8 characters.</p>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="size-4 animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={googleSignIn} disabled={busy}>
            Continue with Google
          </Button>
        </div>
      </div>
    </main>
  );
}
