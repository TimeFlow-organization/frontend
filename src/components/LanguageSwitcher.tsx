import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="mb-3">
      <label className="form-label me-2">{t('language')}:</label>
      <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={i18n.language}>
        <option value="en">English</option>
        <option value="ua">Українська</option>
      </select>
    </div>
  );
}
