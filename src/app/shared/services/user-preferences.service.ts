import { Injectable } from "@angular/core";
import { ThemePreference } from "../../core/services/theme.service";
import { v4 as uuidv4 } from 'uuid';

export type AuthType = 'basic' | 'oauth2';

@Injectable({
    providedIn: 'root'
})
export class UserPreferencesService {
    private readonly prefix: string = 'user_prefs_';

    private readonly KEYS = {
        APP_VIEW_MULTI_SELECTION_ENABLED: `${this.prefix}appViewMultiSelectionEnabled`,
        THEME_PREFERENCE: `${this.prefix}themePreference`,
        SIDEBAR_MENU_OPENED: `${this.prefix}sidebarMenuOpened`,
        UUID: `${this.prefix}uuid`,
        CLAIMS: `${this.prefix}claims`,
        AUTH: `${this.prefix}auth`,
        AUTH_TOKEN: `${this.prefix}authToken`,
        DRAG_AND_DROP_ENABLED: `${this.prefix}dragAndDropEnabled`
    };

    get authToken(): string | null {
        return localStorage.getItem(this.KEYS.AUTH_TOKEN);
    }

    setAuthToken(authToken: string): void {
        localStorage.setItem(this.KEYS.AUTH_TOKEN, authToken);
    }

    removeAuthToken() {
        localStorage.removeItem(this.KEYS.AUTH_TOKEN);
    }

    get auth(): AuthType | null {
        const item = localStorage.getItem(this.KEYS.AUTH);
        return item ? item as AuthType : null;
    }

    setAuth(authType: AuthType) {
        localStorage.setItem(this.KEYS.AUTH, authType);
    }

    removeAuth() {
        localStorage.removeItem(this.KEYS.AUTH);
    }

    get claims(): { [key: string]: string } | undefined {
        const item = localStorage.getItem(this.KEYS.CLAIMS);
        return item ? JSON.parse(item) : undefined;
    }

    setClaims(claims: { [key: string]: string }) {
        localStorage.setItem(this.KEYS.CLAIMS, JSON.stringify(claims));
    }

    removeClaims(): void {
        localStorage.removeItem(this.KEYS.CLAIMS);
    }

    get uuid(): string {
        const item = localStorage.getItem(this.KEYS.UUID);

        if (item) {
            return item;
        }

        const uuid = uuidv4().replace('-', '');

        this.setUuid(uuid);

        return uuid;
    }

    private setUuid(uuid: string) {
        localStorage.setItem(this.KEYS.UUID, uuid);
    }

    removeUuid() {
        localStorage.removeItem(this.KEYS.UUID);
    }

    get sidebarMenuOpened(): boolean {
        const item = localStorage.getItem(this.KEYS.SIDEBAR_MENU_OPENED);
        return item === 'true';
    }

    setSidebarMenuOpened(isOpened: boolean) {
        localStorage.setItem(this.KEYS.SIDEBAR_MENU_OPENED, isOpened ? 'true' : 'false');
    }

    get themePreference(): ThemePreference | undefined {
        const item = localStorage.getItem(this.KEYS.THEME_PREFERENCE);

        if (item) {
            return item as ThemePreference;
        }

        return undefined;
    }

    setThemePreference(themePreference: ThemePreference) {
        localStorage.setItem(this.KEYS.THEME_PREFERENCE, themePreference);
    }

    get appViewMultiSelectionEnabled(): boolean {
        const item = localStorage.getItem(this.KEYS.APP_VIEW_MULTI_SELECTION_ENABLED);
        return item === 'true';
    }

    setAppViewMultiSelectionEnabled(isEnabled: boolean) {
        localStorage.setItem(this.KEYS.APP_VIEW_MULTI_SELECTION_ENABLED, isEnabled ? 'true' : 'false');
    }

    get dragAndDropEnabled(): boolean {
        const item = localStorage.getItem(this.KEYS.DRAG_AND_DROP_ENABLED);

        return item === 'true';
    }

    setDragAndDropEnabled(isEnabled: boolean) {
        localStorage.setItem(this.KEYS.DRAG_AND_DROP_ENABLED, isEnabled ? 'true' : 'false');
    }
}