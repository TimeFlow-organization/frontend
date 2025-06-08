import { useTranslation } from 'react-i18next';

type Props = { className?: string };

export default function LanguageSwitcher({ className = '' }: Props) {
  const { i18n } = useTranslation();

  return (
    <select
      className={`form-select form-select-sm ${className}`}
      style={{ width: 90 }}           /* ещё уже */
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      title="🌐 language"
    >
      <option value="en">🌐  EN</option>
      <option value="ua">🌐  UA</option>
    </select>
  );
}