import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { UserPreferencesService } from "../../services/user-preferences.service";

@Injectable({
    providedIn: 'root'
})
export class DefaultLayoutService {
    private menuOpenedSubject;

    constructor(private userPreferencesService: UserPreferencesService) {

        this.menuOpenedSubject = new BehaviorSubject(userPreferencesService.sidebarMenuOpened);

        this.menuOpened$ = this.menuOpenedSubject.asObservable();
    }

    menuOpened$: Observable<boolean>;

    get menuOpened(): boolean {
        return this.menuOpenedSubject.value;
    }

    setMenuOpened(isOpened: boolean): void {
        this.menuOpenedSubject.next(isOpened);

        this.userPreferencesService.setSidebarMenuOpened(isOpened);
    }

    toggleMenu() {
        const menuOpened = !this.isMenuOpened();

        this.menuOpenedSubject.next(menuOpened)

        this.userPreferencesService.setSidebarMenuOpened(menuOpened);
    }

    isMenuOpened(): boolean {
        return this.menuOpenedSubject.value;
    }
}