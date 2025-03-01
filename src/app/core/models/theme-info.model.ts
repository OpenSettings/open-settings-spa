import { ThemePreference, ThemeType } from "../services/theme.service";

export interface ThemeInfo {
    icon: string;
    type: ThemeType,
    preference: ThemePreference,
    name: string;
    tooltip: string;
}