const HeroSection = () => {
  return (
    <main className="h-[80vh] flex items-center justify-center">
      <div className="grid grid-cols-2 gap-4 max-w-5xl px-4">
        {/* text */}
        <div className="flex flex-col">
          <h3 className="text-5xl text-slate-900">
            Shared lists, always in sync.
          </h3>

          <p className="text-slate-600 mt-2">
            Create lists, share them with your people, and keep everyone on the
            same page in real time. Perfect for groceries, trips, tasks, and
            everything you need to get done together.
          </p>

          <a
            href=""
            className="border border-slate-300 px-4 py-2 mt-3 rounded-md self-start"
          >
            Get Started
          </a>
        </div>

        {/* visual */}
        <div className="bg-slate-400 p-1">
          {/* img later */}
          <div className="bg-red-300 ">ss</div>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
