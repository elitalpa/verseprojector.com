import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./components/language-switcher";

function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="flex flex-col items-center justify-center h-screen relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-4xl font-bold">{t("app.title")}</h1>
      <p className="text-muted-foreground mt-2">{t("app.description")}</p>
    </main>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}

export default App;
