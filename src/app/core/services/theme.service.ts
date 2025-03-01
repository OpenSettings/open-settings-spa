import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { ThemeInfo } from "../models/theme-info.model";
import { UserPreferencesService } from "../../shared/services/user-preferences.service";
import { LicenseEdition, WindowService } from "./window.service";

const darkThemeClass = 'dark-theme';

const DarkTheme: ThemeInfo = {
    icon: 'dark_mode',
    type: 'dark',
    preference: 'dark',
    name: 'Dark',
    tooltip: ''
};

const LightTheme: ThemeInfo = {
    icon: 'light_mode',
    type: 'light',
    preference: 'light',
    name: 'Light',
    tooltip: ''
};

const SystemTheme: ThemeInfo = {
    icon: 'wind_power',
    type: 'light',
    preference: 'system',
    name: 'System',
    tooltip: 'Uses your OS theme setting.'
};

const AutoTheme: ThemeInfo = {
    icon: 'brightness_medium',
    type: 'light',
    preference: 'auto',
    name: 'Auto',
    tooltip: 'Dark mode at night, light mode during the day.'
}

const SystemDark: ThemeInfo = {
    icon: 'dark_mode',
    type: 'dark',
    preference: 'system',
    name: 'System',
    tooltip: ''
};

const SystemLight: ThemeInfo = {
    icon: 'light_mode',
    type: 'light',
    preference: 'system',
    name: 'System',
    tooltip: ''
};

const AutoDark: ThemeInfo = {
    icon: 'dark_mode',
    type: 'dark',
    preference: 'auto',
    name: 'Auto',
    tooltip: ''
};

const AutoLight: ThemeInfo = {
    icon: 'light_mode',
    type: 'light',
    preference: 'auto',
    name: 'Auto',
    tooltip: ''
}

const Themes: ThemeInfo[] = [
    DarkTheme,
    LightTheme,
    SystemTheme,
    AutoTheme
];


export type ThemeType = 'light' | 'dark';

export type ThemePreference = 'light' | 'dark' | 'system' | 'auto';

declare function getEditionTheme(edition: number): string;

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private isDarkThemeSubject: BehaviorSubject<boolean>;
    private destroy$ = new Subject<void>();
    private initialEditionTheme: string = '';

    constructor(private userPreferencesService: UserPreferencesService,
             windowService: WindowService
    ) {
        const isDarkTheme = document.body.classList.contains(darkThemeClass)

        this.isDarkThemeSubject = new BehaviorSubject<boolean>(isDarkTheme);

        windowService.license$.pipe(takeUntil(this.destroy$)).subscribe((license) => {

            const newEditionTheme = getEditionTheme(license.edition);

            if(!this.initialEditionTheme) {
                this.initialEditionTheme = newEditionTheme;
                return;
            }

            if(newEditionTheme == this.initialEditionTheme){
                return;
            }

            this.setEditionTheme(newEditionTheme);
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    themes = Themes;

    isDarkTheme$() {
        return this.isDarkThemeSubject.asObservable();
    }

    get systemTheme(): ThemeType {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    get autoTheme(): ThemeType {
        const hour = new Date().getHours();

        return hour >= 18 || hour < 6 ? 'dark' : 'light';
    }

    get themePreference(): ThemePreference | undefined {
        return this.userPreferencesService.themePreference;
    }

    toggleTheme(): void {
        this.setThemePreference(this.isDarkTheme() ? 'light' : 'dark');
    }

    setTheme(themeType: ThemeType) {
        if (themeType === "dark") {
            this.enableDarkTheme();
        } else {
            this.disableDarkTheme();
        }
    }

    setThemePreference(themePreference: ThemePreference): void {
        switch (themePreference) {
            case 'dark':
                this.enableDarkTheme();
                break;
            case 'light':
                this.disableDarkTheme();
                break;
            case 'system':
                this.setTheme(this.systemTheme);
                break;
            case 'auto':
                this.setTheme(this.autoTheme);
                break;
        }

        this.userPreferencesService.setThemePreference(themePreference);
    }

    isDarkTheme(): boolean {
        return this.isDarkThemeSubject.value;
    }

    getThemeInfo(themePreference: ThemePreference): ThemeInfo {
        switch (themePreference) {
            case 'dark':
                return DarkTheme;
            case 'light':
                return LightTheme;
            case 'system':
                return this.systemTheme === 'dark'
                    ? SystemDark
                    : SystemLight;
            case 'auto':
                return this.autoTheme === 'dark' ? AutoDark : AutoLight;
        }
    }

    setEditionTheme(editionTheme: string) {
        document.body.classList.replace(this.initialEditionTheme, editionTheme);
        this.initialEditionTheme = editionTheme;
    }

    private enableDarkTheme(): void {
        document.body.classList.add(darkThemeClass);
        this.isDarkThemeSubject.next(true);
    }

    private disableDarkTheme(): void {
        document.body.classList.remove(darkThemeClass);
        this.isDarkThemeSubject.next(false);
    }
}