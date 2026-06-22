import LandingPage from "./components/LandingPage";
import { LocaleProvider } from "./context/LocaleContext";

export default function App() {
  return (
    <LocaleProvider>
      <LandingPage />
    </LocaleProvider>
  );
}
