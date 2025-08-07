import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProviderInfo, WindowService } from '../../core/services/window.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomValidators } from '../../shared/utils/custom-validators';
import { ThemeInfo } from '../../core/models/theme-info.model';
import { Subscription } from 'rxjs';
import { UserPreferencesService } from '../../shared/services/user-preferences.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    route?: string;
    serviceType?: string;
    packVersion?: string;
    providerInfo?: ProviderInfo;
    hidePassword: boolean = true;
    themeInfo?: ThemeInfo;
    selectedLogin: 'basic' | null = null;
    subscriptions: Subscription = new Subscription();

    constructor(private router: Router,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private windowService: WindowService,
        private userPreferencesService: UserPreferencesService
    ) { }

    ngOnInit(): void {

        if (this.authService.isAuthenticated || !this.authService.isAuthorizationRequired) {
            this.router.navigate(['']);
        }

        this.route = this.windowService.controller.route;
        this.providerInfo = this.windowService.providerInfo;
        this.serviceType = this.windowService.serviceType;
        this.packVersion = this.windowService.packInfo.version;
        
        if (!this.providerInfo.oAuth2.isActive) {
            this.selectedLogin = 'basic';
        }

        this.form = this.formBuilder.group({
            clientId: ['', [Validators.required, CustomValidators.mustGuid]],
            clientSecret: ['', [Validators.required, CustomValidators.mustGuid]]
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    selectLogin(type: 'basic'): void {
        this.selectedLogin = type;
    }

    onSubmit() {
        if (this.form.valid) {
            this.login();
        }
    }

    get clientId() {
        return this.form.get('clientId')?.value;
    }

    get clientSecret() {
        return this.form.get('clientSecret')?.value;
    }

    login(): void {

        const clientId = this.clientId;

        const clientSecret = this.clientSecret;

        if (!clientId || !clientSecret) {
            return;
        }

        const subscription = this.authService.basicAuthorize(clientId, clientSecret).subscribe(isAuthenticated => {

            if (isAuthenticated) {
                this.router.navigate(['']);
                return;
            }

            const errorMessage = isAuthenticated === false ? `Error: Credentials are not valid!` : 'Error: Exception occurred while the processing';

            this.snackBar.open(errorMessage, 'Close', {
                horizontalPosition: 'center',
                verticalPosition: 'top',
                duration: 2250
            });
        });

        this.subscriptions.add(subscription);
    }

    handleOauth(): void {

        let url = this.route + '/v1/auth/login';

        if (this.serviceType === 'Consumer') {
            url += `?uuid=${this.userPreferencesService.uuid}`;
        }

        this.userPreferencesService.setAuth('oauth2')
        
        window.location.href = url;
    }

    reset(): void {
        this.selectedLogin = null;
        this.form.get('clientId')?.setValue('');
        this.form.get('clientSecret')?.setValue('');
    }

    togglePasswordVisibility() {
        this.hidePassword = !this.hidePassword;
    }
}