import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative group">
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md transition-colors">
                <Globe className="w-5 h-5" />
                <span className="uppercase font-medium">{i18n.language.split('-')[0]}</span>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`flex items-center space-x-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${i18n.language.startsWith(lang.code) ? 'text-blue-400 bg-gray-750' : 'text-gray-300'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LanguageSwitcher;
