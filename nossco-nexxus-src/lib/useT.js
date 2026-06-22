import { useAppSettings } from './AppSettingsContext';
import { t } from './translations';

/**
 * Hook that returns a translator function bound to the current language.
 * Usage: const T = useT(); then T('My string')
 */
export function useT() {
  const { lang } = useAppSettings();
  return (key) => t(lang, key);
}

export default useT;