import { Leaf } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <span className="absolute inset-2 rounded-full bg-primary/10" />
        <Leaf className="relative h-12 w-12 animate-pulse text-primary" />
      </div>
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Explorer's Notebook
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Packing your satchel…</p>
      </div>
    </div>
  );
}