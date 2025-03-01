import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { UserPreferencesService } from "../../../shared/services/user-preferences.service";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppViewService {
    private settingViewSubject = new BehaviorSubject<SettingViewModel | undefined>(undefined);
    private appViewMultiSelectionEnabledSubject: BehaviorSubject<boolean>;

    settingView$ = this.settingViewSubject.asObservable();
    appViewMultiSelectionEnabled$: Observable<boolean>;

    constructor(private userPreferencesService: UserPreferencesService) {
        this.appViewMultiSelectionEnabledSubject = new BehaviorSubject(userPreferencesService.appViewMultiSelectionEnabled);
        this.appViewMultiSelectionEnabled$ = this.appViewMultiSelectionEnabledSubject.asObservable();
    }

    get settingView() {
        return this.settingViewSubject.getValue();
    }

    get appViewMultiSelectionEnabled() {
        return this.appViewMultiSelectionEnabledSubject.getValue();
    }

    emitSettingView(settingView: SettingViewModel | undefined) {
        this.settingViewSubject.next(settingView);
    }

    emitAppViewMultiSelectionEnabled(isEnabled: boolean){
        this.userPreferencesService.setAppViewMultiSelectionEnabled(isEnabled);
        this.appViewMultiSelectionEnabledSubject.next(isEnabled);
    }
}

export type SettingViewType =
    'viewSetting' |
    'viewCreateSetting' |
    'viewUpdateSetting' |
    'viewCopySettingTo' |
    'viewSettingHistories' |
    'viewSettingHistory';

export interface SettingViewModel {
    selectedSettingId?: string;
    selectedHistoryId?: string;
    settingViewType: SettingViewType;
}