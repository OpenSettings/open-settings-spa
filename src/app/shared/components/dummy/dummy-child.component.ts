import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DummyComponentService } from "./dummy-component.service";

@Component({
    template: ''
})
export class DummyChildComponent implements OnInit, OnDestroy {

    constructor(
        private route: ActivatedRoute,
        private dummyComponentService: DummyComponentService
    ) { }

    ngOnInit(): void {
        const path = this.route.snapshot.data['path'] as string;
        const data = this.route.snapshot.data['data'] as any;

        if (path) {
            this.dummyComponentService.emitEvent({
                path: path,
                data: data,
                activatedSnapshot: this.route.snapshot,
                activatedRoute: this.route
            });
        }
    }

    ngOnDestroy(): void {
        this.dummyComponentService.emitEvent(undefined);
    }
}