import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sprout,
  Wheat,
  Package,
  ShoppingCart,
  LineChart,
  Wallet,
  ShieldCheck,
  Smartphone,
  Gauge,
  DatabaseBackup,
  ArrowRight,
} from "lucide-react";

import heroFarm from "@/assets/hero-farm.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriTrack — Agribusiness Management System" },
      {
        name: "description",
        content:
          "A web platform for farmers, suppliers and agribusiness managers to manage crops, inventory, sales, expenses and market prices from one dashboard.",
      },
      { property: "og:title", content: "AgriTrack — Agribusiness Management System" },
      {
        property: "og:description",
        content:
          "Manage crops, inventory, sales, expenses and market prices from one agribusiness dashboard.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Sprout,
    title: "Farmer & farm profiles",
    body: "Register land parcels with area, soil type and location so every record ties back to a real field.",
  },
  {
    icon: Wheat,
    title: "Crop planning",
    body: "Plan by season, log sowing and harvest windows, and schedule irrigation, spraying and weeding tasks.",
  },
  {
    icon: Package,
    title: "Inventory management",
    body: "Track seeds, fertilizers, pesticides and equipment with stock value and automatic reorder alerts.",
  },
  {
    icon: ShoppingCart,
    title: "Sales & purchases",
    body: "Record every sale and input purchase with buyer, supplier, rate and payment status.",
  },
  {
    icon: LineChart,
    title: "Market price updates",
    body: "Reference mandi rates by commodity and market so you can time selling decisions.",
  },
  {
    icon: Wallet,
    title: "Income & expense tracking",
    body: "Categorised cash flow with monthly charts and a live net position for the season.",
  },
];

const qualities = [
  { icon: ShieldCheck, label: "Secure authentication with encrypted, per-user data isolation" },
  { icon: Gauge, label: "Fast pages with minimal loading time" },
  { icon: DatabaseBackup, label: "Reliable managed backups and scalable architecture" },
  { icon: Smartphone, label: "Responsive on desktop and mobile browsers" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-lg">
            <Sprout className="size-5 text-primary" /> AgriTrack
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b">
          <img
            src={heroFarm}
            alt="Aerial view of terraced farmland at golden hour with green crop rows and harvested fields"
            width={1600}
            height={1008}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-field opacity-90" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl px-4 py-24 text-primary-foreground sm:px-6 sm:py-32">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-3 py-1 text-xs uppercase tracking-widest">
              Agribusiness Management System
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
              Run the whole farm business from a single dashboard.
            </h1>
            <p className="mt-6 max-w-2xl text-base opacity-90 sm:text-lg">
              AgriTrack is a web-based platform that helps farmers, suppliers and agribusiness
              managers manage crops, inventory, sales, expenses and market prices in one place —
              cutting manual paperwork and surfacing data-driven insight.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth">
                  Create your account <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/auth">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl">Everything the season needs</h2>
            <p className="mt-3 text-muted-foreground">
              Eight core modules covering registration through to reporting, built so a single
              record is entered once and reused everywhere.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article
                key={f.title}
                className="rounded-lg border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
              >
                <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grain-texture border-y bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl">
                  Built to be dependable, not just featureful
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Every account's data is isolated at the database level, so a farmer only ever sees
                  their own crops, stock and ledgers — while shared references like mandi prices stay
                  available to everyone.
                </p>
                <div className="mt-8">
                  <Button asChild>
                    <Link to="/auth">
                      Start tracking today <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <ul className="space-y-4">
                {qualities.map((q) => (
                  <li
                    key={q.label}
                    className="flex items-start gap-3 rounded-lg border bg-card p-4 shadow-soft"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                      <q.icon className="size-4" />
                    </span>
                    <p className="text-sm leading-relaxed">{q.label}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6">
          <p className="flex items-center gap-2">
            <Sprout className="size-4 text-primary" /> AgriTrack — Agribusiness Management System
          </p>
          <Link to="/auth" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
