import { Injectable } from "@angular/core";
import { DummyComponentServiceModel } from "./dummy-component-service.model";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DummyComponentService {
    private eventSubject = new BehaviorSubject<DummyComponentServiceModel | undefined>(undefined);
    event$ = this.eventSubject.asObservable();

    emitEvent(model: DummyComponentServiceModel | undefined) {
        this.eventSubject.next(model);
    }
}