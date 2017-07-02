import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { WorkType } from './work-type.model';
import { WorkTypePopupService } from './work-type-popup.service';
import { WorkTypeService } from './work-type.service';
import { WorkTypeCategory, WorkTypeCategoryService } from '../work-type-category';
import { Worker, WorkerService } from '../worker';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-work-type-dialog',
    templateUrl: './work-type-dialog.component.html'
})
export class WorkTypeDialogComponent implements OnInit {

    workType: WorkType;
    authorities: any[];
    isSaving: boolean;

    worktypecategories: WorkTypeCategory[];

    workers: Worker[];

    constructor(
        public activeModal: NgbActiveModal,
        private alertService: JhiAlertService,
        private workTypeService: WorkTypeService,
        private workTypeCategoryService: WorkTypeCategoryService,
        private workerService: WorkerService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.workTypeCategoryService.query()
            .subscribe((res: ResponseWrapper) => { this.worktypecategories = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
        this.workerService.query()
            .subscribe((res: ResponseWrapper) => { this.workers = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.workType.id !== undefined) {
            this.subscribeToSaveResponse(
                this.workTypeService.update(this.workType), false);
        } else {
            this.subscribeToSaveResponse(
                this.workTypeService.create(this.workType), true);
        }
    }

    private subscribeToSaveResponse(result: Observable<WorkType>, isCreated: boolean) {
        result.subscribe((res: WorkType) =>
            this.onSaveSuccess(res, isCreated), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: WorkType, isCreated: boolean) {
        this.alertService.success(
            isCreated ? 'fixitApp.workType.created'
            : 'fixitApp.workType.updated',
            { param : result.id }, null);

        this.eventManager.broadcast({ name: 'workTypeListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }

    trackWorkTypeCategoryById(index: number, item: WorkTypeCategory) {
        return item.id;
    }

    trackWorkerById(index: number, item: Worker) {
        return item.id;
    }

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }
}

@Component({
    selector: 'jhi-work-type-popup',
    template: ''
})
export class WorkTypePopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private workTypePopupService: WorkTypePopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.modalRef = this.workTypePopupService
                    .open(WorkTypeDialogComponent, params['id']);
            } else {
                this.modalRef = this.workTypePopupService
                    .open(WorkTypeDialogComponent);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
