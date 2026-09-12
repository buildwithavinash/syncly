import { Link } from "react-router";
import { ArrowRight, Users, History, Link2 } from "lucide-react";
import Header from "../components/common/Header";
import HeroSection from "../components/ui/HeroSection";
import ImagePlaceholder from "../components/common/ImagePlaceholder";

const steps = [
  {
    number: "01",
    title: "Start a list",
    description:
      "Create a list for anything — groceries, a weekend trip, moving day. Give it a name and you're in.",
  },
  {
    number: "02",
    title: "Bring people in",
    description:
      "Send an invite link. Anyone who opens it can preview the list before deciding to join.",
  },
  {
    number: "03",
    title: "Stay in sync",
    description:
      "Check things off, add new items, see who's online. Everyone looks at the same list, updated live.",
  },
];

const features = [
  {
    icon: Users,
    title: "Live presence",
    description: "See who's actually looking at the list right now.",
  },
  {
    icon: History,
    title: "Activity log",
    description: "Every add, check, and edit is timestamped and attributed.",
  },
  {
    icon: Link2,
    title: "Shareable invites",
    description: "One link gets anyone onto the list — no setup required.",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <HeroSection />

      <section id="how-it-works" className="border-t border-border">
        <div className="mx-auto max-w-container px-gutter py-section">
          <div className="mb-10 max-w-lg">
            <p className="mb-2 text-sm font-medium text-accent">
              How it works
            </p>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Three steps, and you're planning together.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-lg border border-border bg-bg p-5"
              >
                <ImagePlaceholder
                  label={`Add screenshot — step ${step.number}`}
                  className="mb-4"
                />

                <p className="mb-1 font-display text-sm text-accent">
                  {step.number}
                </p>
                <h3 className="mb-1.5 font-display text-lg text-ink">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-container px-gutter py-section">
          <div className="mb-10 max-w-lg">
            <p className="mb-2 text-sm font-medium text-accent">
              Built for real-time
            </p>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Not just a list. A shared one.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title}>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-accent-tint">
                  <feature.icon className="h-4 w-4 text-accent-ink" />
                </div>
                <h3 className="mb-1.5 font-display text-lg text-ink">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-container px-gutter py-section text-center">
          <h2 className="mx-auto max-w-md font-display text-2xl text-ink sm:text-3xl">
            Your next list is one click away.
          </h2>

          <Link
            to="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Create your first list
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-container flex-col items-center gap-4 px-gutter py-8 text-sm text-slate sm:flex-row sm:justify-between">
          <span className="font-display italic text-ink">Cartify</span>

          <div className="flex gap-5">
            <Link to="/login" className="transition-colors hover:text-ink">
              Log in
            </Link>
            <Link to="/signup" className="transition-colors hover:text-ink">
              Sign up
            </Link>
          </div>

          <span>© {new Date().getFullYear()} Cartify</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;