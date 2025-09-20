import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { MatAccordion } from "@angular/material/expansion";
import { MatDialog } from "@angular/material/dialog";
import { AppInstanceService } from "../../services/app-instance.service";
import { UtilityService } from "../../../../shared/services/utility.service";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { Subscription, tap } from "rxjs";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { AppViewService } from "../../../app/services/app-view.service";
import { InstanceListComponentData } from "../../models/instance-list-component-data";
import { InstanceData } from "../../../app/models/instance-data.model";
import { WindowService } from "../../../../core/services/window.service";
import { ServiceType } from "../../../../shared/models/service-type";
import { Data } from "@angular/router";
import { DataAccessType } from "../../../../shared/models/data-access-type";
import { ReloadStrategy } from "../../../../shared/models/reload-strategy";

@Component({
    selector: 'instance-list',
    templateUrl: './instance-list.component.html',
    styleUrls: ['./instance-list.component.css']
})
export class InstanceListComponent implements OnInit, OnDestroy {
    multiSelectionEnabled: boolean = false;
    subscriptions: Subscription = new Subscription();
    isConnectionSecure?: boolean;

    @Input() data!: InstanceListComponentData;
    @ViewChild(MatAccordion) accordion!: MatAccordion;
    @Output() instanceDeleteEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private instancesService: AppInstanceService,
        private utilityService: UtilityService,
        private windowService: WindowService,
        private dialog: MatDialog,
        private appViewService: AppViewService
    ) {
    }

    ngOnInit(): void {
        this.subscriptions.add(this.appViewService.appViewMultiSelectionEnabled$.subscribe(isEnabled => {
            this.multiSelectionEnabled = isEnabled;
        }));

        this.isConnectionSecure = this.windowService.isConnectionSecure;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onToggleMultiSelection(event: MatSlideToggleChange) {
        this.appViewService.emitAppViewMultiSelectionEnabled(event.checked);
    }

    copyToClipboard(content: string, event: Event) {
        event.stopPropagation();
        this.utilityService.copyToClipboard(content);
    }

    delete(data: InstanceData) {
        const title = 'Confirm delete';
        const message = `Is "${data.name}" instance no longer active? You can delete it, and it will be re-created upon restart if it exists.`;

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { title, message }
        }).afterClosed().subscribe(result => {
            if (result) {

                const internalSubscription = this.instancesService.deleteAppInstance({
                    instanceId: data.id
                }).subscribe(() => {

                    const instance = this.data.instances!.findIndex(i => i.id === data.id);

                    this.data.instances!.splice(instance, 1);

                    this.instanceDeleteEmitter.emit(data.id);
                });

                this.subscriptions.add(internalSubscription);
            }
        });

        this.subscriptions.add(subscription);
    }

    expandAll() {
        this.accordion.openAll();
    }

    collapseAll() {
        this.accordion.closeAll();
    }

    getServiceType(serviceType: ServiceType) : string{
        return ServiceType[serviceType];
    }

    getDataAccessType(dataAccessType: DataAccessType) : string{
        return DataAccessType[dataAccessType];
    }

    getReloadStrategies(reloadStrategies: ReloadStrategy[]){
        return reloadStrategies.map(r => ReloadStrategy[r]).join(', ');
    }

}