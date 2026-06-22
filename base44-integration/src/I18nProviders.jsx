import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { LocaleProvider } from "./context/LocaleContext";

/**
 * Wrap your existing Base44 App export with this provider stack.
 *
 * In main.jsx:
 *   import AppWithI18n from "./AppWithI18n";
 *   createRoot(...).render(<AppWithI18n />);
 *
 * In AppWithI18n.jsx:
 *   import App from "./App";
 *   export default function AppWithI18n() {
 *     return (
 *       <I18nextProvider i18n={i18n}>
 *         <LocaleProvider>
 *           <App />
 *         </LocaleProvider>
 *       </I18nextProvider>
 *     );
 *   }
 */
export function I18nProviders({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LocaleProvider>{children}</LocaleProvider>
    </I18nextProvider>
  );
}
