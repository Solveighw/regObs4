import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { Platform } from '@ionic/angular';
import { Observable, of, ReplaySubject } from 'rxjs';
import { SyncStatus } from 'src/app/modules/common-registration/registration.models';
import { RegistrationViewModel } from 'src/app/modules/common-regobs-api';
import { LoggingService } from 'src/app/modules/shared/services/logging/logging.service';
import { AddUpdateDeleteRegistrationService } from '../add-update-delete-registration/add-update-delete-registration.service';
import { NetworkStatusService } from '../network-status/network-status.service';
import { RegistrationDraft, RegistrationDraftErrorCode } from './draft-model';
import { DraftRepositoryService } from './draft-repository.service';
import { DraftToRegistrationService } from './draft-to-registration.service';


describe('DraftToRegistrationService', () => {
  let service: DraftToRegistrationService;
  let addUpdateDeleteRegService: jasmine.SpyObj<AddUpdateDeleteRegistrationService>;
  let connected: ReplaySubject<boolean>;
  let networkService: NetworkStatusService;

  const draft: RegistrationDraft = {  // Default test draft
    uuid: 'abc',
    syncStatus: SyncStatus.Sync,
    registration: {
      GeoHazardTID: 10,
      DtObsTime: 'Test'
    }
  };
  let drafts: ReplaySubject<RegistrationDraft[]>;
  let draftService: {
    drafts$: Observable<RegistrationDraft[]>;
    delete: jasmine.Spy<DraftRepositoryService['delete']>;
    save: jasmine.Spy<DraftRepositoryService['save']>;
  };

  let loggerService: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    drafts = new ReplaySubject<RegistrationDraft[]>();
    draftService = {
      drafts$: drafts.asObservable(),
      delete: jasmine.createSpy('DraftService.delete'),
      save: jasmine.createSpy('DraftService.save')
    };

    addUpdateDeleteRegService = jasmine.createSpyObj(
      'AddUpdateDeleteRegistrationService', ['add', 'update']
    );

    connected = new ReplaySubject<boolean>();
    networkService = {
      connected$: connected.asObservable()
    };

    loggerService = jasmine.createSpyObj('LoggingService', ['debug', 'error']);

    service = new DraftToRegistrationService(
      { resume: of(true) } as unknown as Platform,
      draftService as unknown as DraftRepositoryService,
      addUpdateDeleteRegService,
      loggerService,
      networkService
    );
  });

  it('Adds a network error to the draft if we try to upload without a connection', fakeAsync(() => {
    // Test database for drafts
    let testDrafts = [
      { ...draft, uuid: 'a' },
      { ...draft, uuid: 'b' }
    ];

    draftService.save.and.callFake((draftToSave) => {
      return new Promise(resolve => {
        setTimeout(() => {
          testDrafts = [
            ...testDrafts.filter(d => d.uuid !== draftToSave.uuid),
            draftToSave
          ];
          drafts.next(testDrafts);
          resolve();
        }, 100);
      });
    });

    // Start with no connection to internet and with two drafts to upload
    connected.next(false);
    drafts.next(testDrafts);

    // Start listening
    service.createSubscriptions();

    // Saving takes 100ms. After 50ms, add another draft.
    tick(50);
    testDrafts = [...testDrafts, { ...draft, uuid: 'c' }];
    drafts.next(testDrafts);

    // Let all timeouts etc complete
    flush();

    // The drafts should have been saved with an error object on it
    const error = jasmine.objectContaining({
      code: RegistrationDraftErrorCode.NoNetworkOrTimedOut
    });
    expect(draftService.save).toHaveBeenCalledTimes(3);
    expect(draftService.save.calls.allArgs()).toEqual([
      [{ ...draft, uuid: 'a', error }],
      [{ ...draft, uuid: 'b', error }],
      [{ ...draft, uuid: 'c', error }]
    ]);

    // We should not try to upload any drafts
    expect(addUpdateDeleteRegService.add).toHaveBeenCalledTimes(0);

    discardPeriodicTasks();
  }));

  it('Handles errors while uploading registrations', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: HttpStatusCode.InternalServerError });
    addUpdateDeleteRegService.add.and.rejectWith(error);

    // Start connected to internet and with one draft to upload
    connected.next(true);
    drafts.next([{ ...draft }]);

    // Start listening
    service.createSubscriptions();

    // Let all timeouts etc complete
    flush();

    // The draft should have been saved with an error object on it
    expect(draftService.save).toHaveBeenCalledWith({
      ...draft,
      error: {
        code: RegistrationDraftErrorCode.ServerError,
        message: jasmine.any(String),
        timestamp: jasmine.any(Number)
      }
    });

    // We should have logged the error
    expect(loggerService.error).toHaveBeenCalledTimes(1);

    discardPeriodicTasks();
  }));

  it('Removes network errors when we have a connection', fakeAsync(() => {
    draftService.save.calls.saveArgumentsByValue();

    // We start with not beeing connected, and with drafts that have a network error
    connected.next(false);
    drafts.next([
      { ...draft, uuid: 'a', error: { code: RegistrationDraftErrorCode.NoNetworkOrTimedOut }},
      { ...draft, uuid: 'b', error: { code: RegistrationDraftErrorCode.NoNetworkOrTimedOut }},
      // Some drafts without network error
      { ...draft, uuid: 'c', error: { code: RegistrationDraftErrorCode.ServerError }},
      { ...draft, uuid: 'd', syncStatus: SyncStatus.Draft }
    ]);

    // Start listening
    service.createSubscriptions();

    tick(50);

    // Expect no drafts to have been updated yet
    expect(draftService.save).toHaveBeenCalledTimes(0);

    // Then we get a connection - now drafts should be updated, network errors removed
    // so they can be retried
    connected.next(true);

    flush();

    // We expect that draftService.save have been called two times with each draft with network error, a and b
    expect(draftService.save).toHaveBeenCalledTimes(2);
    expect(draftService.save.calls.allArgs()).toEqual([
      [{ ...draft, uuid: 'a'}],
      [{ ...draft, uuid: 'b'}]
    ]);

    discardPeriodicTasks();
  }));

  it('Remove network errors handles that drafts$ is updated', fakeAsync(() => {
    // Simulate save taking some time
    draftService.save.and.callFake(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 51);
      });
    });
    draftService.save.calls.saveArgumentsByValue();

    // We start with beeing connected, and with drafts that have network errors
    connected.next(true);
    drafts.next([
      { ...draft, uuid: 'a', error: { code: RegistrationDraftErrorCode.NoNetworkOrTimedOut }},
      { ...draft, uuid: 'b', error: { code: RegistrationDraftErrorCode.NoNetworkOrTimedOut }},
      // Some drafts without network error
      { ...draft, uuid: 'c', error: { code: RegistrationDraftErrorCode.ServerError }},
      { ...draft, uuid: 'd', syncStatus: SyncStatus.Draft }
    ]);

    // Start listening
    service.createSubscriptions();

    // Wait 50 ms
    tick(50);

    // service should have started saving the updated drafts without network errors
    expect(draftService.save).toHaveBeenCalledTimes(2);

    // Update drafts
    drafts.next([
      // The first draft has its error removed
      { ...draft, uuid: 'a'},
      { ...draft, uuid: 'b', error: { code: RegistrationDraftErrorCode.NoNetworkOrTimedOut }},
      // Some drafts without network error
      { ...draft, uuid: 'c', error: { code: RegistrationDraftErrorCode.ServerError }},
      { ...draft, uuid: 'd', syncStatus: SyncStatus.Draft }
    ]);

    tick(2);

    // Then one of the drafts has a danger sign added to it
    drafts.next([
      // The first draft has its error removed
      { ...draft, uuid: 'a'},
      { ...draft, uuid: 'b', error: { code: RegistrationDraftErrorCode.NoNetworkOrTimedOut }},
      // Some drafts without network error
      { ...draft, uuid: 'c', error: { code: RegistrationDraftErrorCode.ServerError }},
      // One of the drafts are updated with a danger sign
      { ...draft, uuid: 'd', syncStatus: SyncStatus.Draft, registration: {
        ...draft.registration,
        DangerObs: [{ DangerSignTID: 1 }]
      }}
    ]);

    flush();

    // We expect that draftService.save have been called two times with each draft with network error, a and b
    expect(draftService.save).toHaveBeenCalledTimes(2);
    expect(draftService.save.calls.allArgs()).toEqual([
      [{ ...draft, uuid: 'a'}],
      [{ ...draft, uuid: 'b'}]
    ]);

    discardPeriodicTasks();
  }));

  it(
    'Uploads drafts once and deletes the draft after upload, ' +
    'even if drafts$ changes while doing an upload',
    fakeAsync(() => {
    // Make addUpdateDeleteRegService.add return a registration after 500 ms
      const registration: RegistrationViewModel = {
        RegId: 123456,
        GeoHazardTID: 10,
        DtObsTime: 'Test'
      };
      addUpdateDeleteRegService.add.and.callFake(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(registration), 500);
        });
      });

      // Make sure we are connected to internet
      connected.next(true);

      // Start listening
      service.createSubscriptions();

      // Send the first draft
      drafts.next([draft]);

      // Wait 100 ms
      tick(100);

      // After 100 ms, we expect addUpdateDeleteRegService.add to have been called,
      // but as the request has not been finished yet, the draft should not have been deleted
      expect(addUpdateDeleteRegService.add).toHaveBeenCalledOnceWith(draft);
      expect(draftService.delete).toHaveBeenCalledTimes(0);

      // Drafts is updated, we are editing another draft while the draft is being submitted
      drafts.next([draft, { ...draft, uuid: 'def', syncStatus: SyncStatus.Draft }]);

      flush();

      // Even though drafts$ updates, we should only upload the draft a single time
      expect(addUpdateDeleteRegService.add).toHaveBeenCalledOnceWith(draft);

      // Check that we try to delete the uploaded draft after a successful upload
      expect(draftService.delete).toHaveBeenCalledTimes(1);
      expect(draftService.delete).toHaveBeenCalledWith(draft.uuid);

      discardPeriodicTasks();
    }));
});
