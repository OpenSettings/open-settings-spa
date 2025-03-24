import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ThemePreference, ThemeService } from "../../../core/services/theme.service";
import { ThemeInfo } from "../../../core/models/theme-info.model";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { MatMenuTrigger } from "@angular/material/menu";
import { Subscription, timer } from "rxjs";
import { GetUserNotificationsResponseNotification, GetUserNotificationsResponseNotificationCounts, NotificationsService, NotificationType } from "../../services/notifications.service";
import { GetLinksResponseLink, OpenSettingsService } from "../../services/open-settings.service";

@Component({
    selector: 'app-account-menu',
    templateUrl: './account-menu.component.html',
    styleUrl: './account-menu.component.css'
})
export class AccountMenuComponent implements OnInit, AfterViewInit, OnDestroy {
    themeInfo?: ThemeInfo;
    selectedMenu?: string;
    nextMenu?: string
    currentTheme?: { preference: ThemePreference, name: string };
    isAuthenticated?: boolean;
    displayName?: string;
    initials?: string;
    userId?: string;
    email?: string;
    themes: ThemeInfo[] = [];
    notificationCounts: GetUserNotificationsResponseNotificationCounts = {
        opened: 0,
        notOpened: 0,
        viewed: 0,
        notViewed: 0,
        dismissed: 0,
        notDismissed: 0
    };
    notifications: GetUserNotificationsResponseNotification[] = [];
    docs: GetLinksResponseLink = { url: '', isActive: false };
    help: GetLinksResponseLink = { url: '', isActive: false };
    feedback: GetLinksResponseLink = { url: '', isActive: false };

    private subscriptions: Subscription = new Subscription();

    @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

    constructor(
        private router: Router,
        private authService: AuthService,
        private themeService: ThemeService,
        private notificationsService: NotificationsService,
        private openSettingsService: OpenSettingsService,
    ) { }

    ngOnInit(): void {
        this.themes = this.themeService.themes;
        this.themeInfo = this.themeService.getThemeInfo(this.themeService.themePreference ?? 'light');
        this.isAuthenticated = this.authService.isAuthenticated;

        const claims = this.authService.claims;
        this.displayName = claims['db_user_displayName'] ?? '';
        this.initials = claims['db_user_initials'] ?? '';
        this.userId = claims['db_user_id'] ?? '';
        this.email = claims['db_user_email'] ?? '';

        if (this.userId) {
            const subscription = this.notificationsService.getUserNotifications({
                userId: this.userId,
                isDismissed: false
            }).subscribe({
                next: (response) => {

                    const responseData = response.data;

                    if (!responseData) {
                        return;
                    }

                    this.notificationCounts.opened += responseData.notificationCounts.opened;
                    this.notificationCounts.notOpened += responseData.notificationCounts.notOpened;
                    this.notificationCounts.viewed += responseData.notificationCounts.viewed;
                    this.notificationCounts.notViewed += responseData.notificationCounts.notViewed;
                    this.notificationCounts.dismissed += responseData.notificationCounts.dismissed;
                    this.notificationCounts.notDismissed += responseData.notificationCounts.notDismissed;

                    responseData.notifications.forEach(notification => {
                        this.notifications.push(notification);
                    });
                }
            });

            this.subscriptions.add(subscription);
        } else {
            this.getNotifications();
        }

        const linkSubscription = this.openSettingsService.getLinks().subscribe(response => {

            const docs = response['docs'];
            const help = response['help'];
            const feedback = response['feedback'];

            if (docs) {
                this.docs.url = docs.url;
                this.docs.isActive = docs.isActive;
            }

            if (help) {
                this.help.url = help.url;
                this.help.isActive = help.isActive;
            }

            if (feedback) {
                this.feedback.url = feedback.url;
                this.feedback.isActive = feedback.isActive;
            }
        });

        this.subscriptions.add(linkSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngAfterViewInit(): void {
        const subscription = this.menuTrigger.menuClosed.subscribe(() => {
            const timerSubscription = timer(130).subscribe(() => {
                this.selectedMenu = this.nextMenu;
                if (this.nextMenu) {
                    this.menuTrigger.openMenu();
                    this.nextMenu = undefined;
                }
            });

            this.subscriptions.add(timerSubscription);
        });

        this.subscriptions.add(subscription);
    }

    getNotifications() {
        const subscription = this.notificationsService.getNotifications({}).subscribe(response => {

            const responseData = response.data;

            if (!responseData) {
                return;
            }

            responseData.notifications.forEach(notification => {

                const key = this.getNotificationKey(notification.id);

                const localNotificationItem = localStorage.getItem(key);

                let localNotification: GetUserNotificationsResponseNotification;

                if (localNotificationItem) {

                    localNotification = JSON.parse(localNotificationItem);

                    if (localNotification.isDismissed) {
                        return;
                    }
                }
                else {
                    localNotification = {
                        id: notification.id,
                        title: notification.title,
                        message: notification.message,
                        type: notification.type,
                        source: notification.source,
                        metadata: notification.metadata,
                        isOpened: false,
                        isViewed: false,
                        isDismissed: false,
                        isExpired: notification.isExpired,
                        createdOn: notification.createdOn,
                        creatorName: notification.creatorName
                    };
                }

                if (localNotification.isOpened) {
                    this.notificationCounts.opened++;
                } else {
                    this.notificationCounts.notOpened++;
                }

                if (localNotification.isViewed) {
                    this.notificationCounts.viewed++;
                } else {
                    this.notificationCounts.notViewed++;
                }

                this.notificationCounts.notDismissed++;
                
                this.notifications.push(localNotification);

                localStorage.setItem(key, JSON.stringify(localNotification));
            });
        });

        this.subscriptions.add(subscription);
    }

    logout(): void {
        this.authService.logout();

        if (!this.authService.isAuthenticated && this.authService.isAuthorizationRequired) {
            this.router.navigate(['login']);
        }
    }

    changeMenu(menu?: string) {
        this.nextMenu = menu;

        if (this.nextMenu === 'notifications') {
            this.markNotificationsAsOpened();
        }
    }

    changeMenuWithoutClosing($event: any, menu?: string) {
        $event.stopPropagation();
        this.selectedMenu = menu;
    }

    returnMenuWithoutClosing($event: any) {
        $event.stopPropagation();
        this.selectedMenu = undefined;
    }

    returnMenu(menu?: string) {
        this.changeMenu(menu);
        this.menuTrigger.closeMenu();
    }

    selectTheme($event: Event, preference: ThemePreference) {
        $event.stopPropagation();
        this.themeService.setThemePreference(preference);
        this.themeInfo = this.themeService.getThemeInfo(preference);
    }

    markNotificationsAsOpened() {

        if (!(this.notificationCounts.notOpened > 0)) {
            return;
        }

        const unopenedNotifications = this.notifications.filter(n => !n.isOpened);

        if (!(unopenedNotifications.length > 0)) {
            return;
        }

        if (this.userId) {
            const subscription = this.notificationsService.markNotificationsAsOpened({
                userId: this.userId
            }).subscribe();

            this.subscriptions.add(subscription);
        }

        this.notificationsOpened(unopenedNotifications);
    }

    notificationsOpened(unOpenedNotifications: GetUserNotificationsResponseNotification[]) {

        unOpenedNotifications.forEach(notification => {

            this.notificationCounts.opened++;
            this.notificationCounts.notOpened--;

            setTimeout(() => notification.isOpened = true, 1250);

            if (!this.userId) {

                const key = this.getNotificationKey(notification.id);

                const notificationCopy = { ...notification, isOpened: true };

                localStorage.setItem(key, JSON.stringify(notificationCopy));
            }
        });
    }

    private getNotificationKey(notificationId: string) {
        return `system:notification:${notificationId}:user:${this.userId}`;
    }

    markNotificationAsViewed(notification: GetUserNotificationsResponseNotification, event: Event) {
        event.stopPropagation();

        if (notification.isViewed) {
            return;
        }

        if (this.userId) {

            const subscription = this.notificationsService.markNotificationAsViewed({
                userId: this.userId,
                notificationId: notification.id
            }).subscribe();

            this.subscriptions.add(subscription);
        }

        this.notificationViewed(notification);
    }

    notificationViewed(notification: GetUserNotificationsResponseNotification) {

        if (!notification.isOpened) {
            notification.isOpened = true;
            this.notificationCounts.opened++;
            this.notificationCounts.notOpened--;
        }

        notification.isViewed = true;
        this.notificationCounts.viewed++;
        this.notificationCounts.notViewed--;

        if (!this.userId) {

            const key = this.getNotificationKey(notification.id);

            localStorage.setItem(key, JSON.stringify(notification));
        }
    }

    markNotificationAsDismissed(notification: GetUserNotificationsResponseNotification, event: Event) {
        event.stopPropagation();

        if (notification.isDismissed) {
            return;
        }

        if (this.userId) {

            const subscription = this.notificationsService.markNotificationAsDismissed({
                userId: this.userId,
                notificationId: notification.id
            }).subscribe();

            this.subscriptions.add(subscription);
        }

        this.notificationDismissed(notification);
    }

    notificationDismissed(notification: GetUserNotificationsResponseNotification) {

        if (!notification.isOpened) {
            notification.isOpened = true;
            this.notificationCounts.opened++;
            this.notificationCounts.notOpened--;
        }

        if (!notification.isViewed) {
            notification.isViewed = true;
            this.notificationCounts.viewed++;
            this.notificationCounts.notViewed--;
        }

        notification.isDismissed = true;
        this.notificationCounts.dismissed++;
        this.notificationCounts.notDismissed--;

        if (!this.userId) {

            const key = this.getNotificationKey(notification.id);

            localStorage.setItem(key, JSON.stringify(notification));
        }

        const index = this.notifications.findIndex(n => n.id === notification.id);

        if (index === -1) {
            return;
        }

        this.notifications.splice(index, 1);
    }

    formatTimestamp(date: string): string {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ago`;
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return `${seconds}s ago`;
        }
    }
}