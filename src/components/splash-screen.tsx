import logo from "@/assets/ecosnap-logo.jpeg";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <img
          src={logo}
          alt="EcoSnap logo"
          className="relative h-28 w-28 animate-pulse rounded-2xl object-contain"
        />
      </div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          EcoSnap
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Packing your satchel…</p>
      </div>
    </div>
  );
}