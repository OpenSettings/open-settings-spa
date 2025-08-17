import { Injectable } from "@angular/core";
import { ThemePreference } from "../../core/services/theme.service";
import { v4 as uuidv4 } from 'uuid';

export type AuthType = 'OAuth2' | 'Machine';
export type AuthMethod = 'Basic' | 'Jwt'  | 'Cookie';
export type Headers = 'x-os-auth-type' | 'x-os-auth-method' | 'x-os-caller-type' | 'x-os-client-id' | 'x-os-pack-version' | 'x-os-pack-version-score';

@Injectable({
    providedIn: 'root'
})
export class UserPreferencesService {
    private readonly prefix: string = 'user_prefs_';

    private readonly KEYS = {
        APP_VIEW_MULTI_SELECTION_ENABLED: `${this.prefix}appViewMultiSelectionEnabled`,
        THEME_PREFERENCE: `${this.prefix}themePreference`,
        SIDEBAR_MENU_OPENED: `${this.prefix}sidebarMenuOpened`,
        STATE_ID: `${this.prefix}stateId`,
        CLAIMS: `${this.prefix}claims`,
        AUTH_TYPE: `${this.prefix}authType`,
        AUTH_METHOD: `${this.prefix}authMethod`,
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

    get authType(): AuthType | null {
        const item = localStorage.getItem(this.KEYS.AUTH_TYPE);
        return item ? item as AuthType : null;
    }

    setAuthType(authType: AuthType) {
        localStorage.setItem(this.KEYS.AUTH_TYPE, authType);
    }

    removeAuthType() {
        localStorage.removeItem(this.KEYS.AUTH_TYPE);
    }

    get authMethod(): | AuthMethod | null {
        const item = localStorage.getItem(this.KEYS.AUTH_METHOD);
        return item ? item as AuthMethod : null;
    }

    setAuthMethod(authMethod: AuthMethod) {
        localStorage.setItem(this.KEYS.AUTH_METHOD, authMethod);
    }

    removeAuthMethod() {
        localStorage.removeItem(this.KEYS.AUTH_METHOD);
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

    get stateId(): string {
        const item = localStorage.getItem(this.KEYS.STATE_ID);

        if (item) {
            return item;
        }

        const stateId = uuidv4().replace('-', '');

        this.setStateId(stateId);

        return stateId;
    }

    private setStateId(stateId: string) {
        localStorage.setItem(this.KEYS.STATE_ID, stateId);
    }

    removeStateId() {
        localStorage.removeItem(this.KEYS.STATE_ID);
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