import { Outlet, Link, createRootRoute, HeadContent, Scripts, useNavigate } from "@tanstack/react-router";
import { Home, BookOpen, User, ShoppingBag, Scroll } from "lucide-react";

import appCss from "../styles.css?url";
import { useCharacter } from "@/hooks/use-character";
import { CharacterCreator } from "@/components/character-creator";
import { SettingsProvider, useSettings } from "@/hooks/use-settings";
import { AdventureStylePicker } from "@/components/adventure-style-picker";
import { LanguagePicker } from "@/components/language-picker";
import { SplashScreen } from "@/components/splash-screen";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#e8dfc6" },
      { title: "EcoSnap -- Daily nature quests" },
      { name: "description", content: "A cozy walking companion. Get a daily nature quest, track your walk, log your mood, and collect sketched memories in your journal." },
      { name: "author", content: "EcoSnap" },
      { property: "og:title", content: "EcoSnap -- Daily nature quests" },
      { property: "og:description", content: "A cozy walking companion. Get a daily nature quest, track your walk, log your mood, and collect sketched memories in your journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "EcoSnap -- Daily nature quests" },
      { name: "twitter:description", content: "A cozy walking companion. Get a daily nature quest, track your walk, log your mood, and collect sketched memories in your journal." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8XyiZ6FspCeqcY2hjGbMQ9Lr19N2/social-images/social-1778083986326-Larger_EcoSnap_logo.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/8XyiZ6FspCeqcY2hjGbMQ9Lr19N2/social-images/social-1778083986326-Larger_EcoSnap_logo.webp" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SettingsProvider>
      <div className="min-h-[100dvh] flex justify-center bg-background">
        <div className="relative w-full max-w-[480px] min-h-[100dvh] flex flex-col">
          <main className="flex-1 pb-28">
            <Outlet />
          </main>
          <BottomTabs />
          <OnboardingGates />
        </div>
      </div>
    </SettingsProvider>
  );
}

function OnboardingGates() {
  const { character, loading } = useCharacter();
  const { settings, ready: settingsReady } = useSettings();
  const navigate = useNavigate();
  if (loading || !settingsReady) return <SplashScreen />;
  // Step 1: pick a language.
  if (!settings.language) {
    return <LanguagePicker dismissible={false} />;
  }
  // Step 2: create the character.
  if (!character) {
    return (
      <CharacterCreator
        onClose={() => {
          /* non-dismissible on first run */
        }}
        onSaved={() => {
          /* stay so AdventureStylePicker shows next */
        }}
        dismissible={false}
      />
    );
  }
  // Step 3: pick an adventure style.
  if (!settings.style) {
    return (
      <AdventureStylePicker
        dismissible={false}
        onSaved={() => {
          navigate({ to: "/" });
        }}
      />
    );
  }
  return null;
}

function BottomTabs() {
  const { t } = useSettings();
  const tabs = [
    { to: "/", label: t("Home"), icon: Home },
    { to: "/quests", label: t("Quests"), icon: Scroll },
    { to: "/journal", label: t("Journal"), icon: BookOpen },
    { to: "/shop", label: t("Shop"), icon: ShoppingBag },
    { to: "/profile", label: t("Profile"), icon: User },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 z-50"
      aria-label="Primary"
    >
      <ul className="parchment-card flex items-center justify-around px-2 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="group flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-muted-foreground transition-colors data-[status=active]:text-primary"
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110 group-data-[status=active]:scale-110" />
              <span className="text-[11px] font-semibold tracking-wide uppercase">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
