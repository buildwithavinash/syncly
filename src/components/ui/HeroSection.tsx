import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import ImagePlaceholder from "../common/ImagePlaceholder";

const HeroSection = () => {
  return (
    <section className="mx-auto max-w-container px-gutter pt-14 pb-section sm:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <h1 className="font-display text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            Plan it <span className="italic">together.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-slate sm:text-lg">
            Cartify keeps grocery runs, trips, and shared to-dos in one
            list — updated the moment someone else moves in it.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>

            
              <a href="#how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm text-ink transition-colors hover:border-border-strong"
            >
              See how it works
            </a>
          </div>
        </div>

        <ImagePlaceholder label="Add product screenshot — list detail view" />
      </div>
    </section>
  );
};

export default HeroSection;