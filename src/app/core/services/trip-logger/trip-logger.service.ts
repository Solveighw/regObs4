import { Injectable } from '@angular/core';
import { TripLogItem } from './trip-log-item.model';
import moment from 'moment';
import { TripLogState } from './trip-log-state.enum';
import { TripLogActivity } from './trip-log-activity.model';
import { NanoSql } from '../../../../nanosql';
import { Observable, from, BehaviorSubject, throwError, firstValueFrom } from 'rxjs';
import { CreateTripDto } from 'src/app/modules/common-regobs-api/models';
import { TripService } from 'src/app/modules/common-regobs-api/services';
import { switchMap, take, map, concatMap, filter, tap, catchError } from 'rxjs/operators';
import { UserSettingService } from '../user-setting/user-setting.service';
import { ToastController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LegacyTrip } from './legacy-trip.model';
import { LoggingService } from '../../../modules/shared/services/logging/logging.service';
import { nSQL } from '@nano-sql/core';
import { NSqlFullUpdateObservable } from '../../helpers/nano-sql/NSqlFullUpdateObservable';
import { AppMode } from 'src/app/modules/common-core/models';

const DEBUG_TAG = 'TripLoggerService';

@Injectable({
  providedIn: 'root'
})
export class TripLoggerService {
  get isTripRunning$(): Observable<boolean> {
    return this.tripStartedSubject.asObservable();
  }

  private tripStartedSubject = new BehaviorSubject(false);

  constructor(
    private tripService: TripService,
    private userSettingService: UserSettingService,
    private translateService: TranslateService,
    private alertController: AlertController,
    private loggingService: LoggingService,
    private toastController: ToastController
  ) {
    this.userSettingService.appMode$
      .pipe(switchMap((appMode) => from(this.getLegacyTripFromDbByAppMode(appMode))))
      .subscribe((legacyTrip) => {
        this.tripStartedSubject.next(legacyTrip != null);
      });
  }

  saveTripLogItem(item: TripLogItem): Promise<unknown> {
    return nSQL(NanoSql.TABLES.TRIP_LOG.name).query('upsert', item).exec();
  }

  getTripLogAsObservable(): Observable<TripLogItem[]> {
    return new NSqlFullUpdateObservable<TripLogItem[]>(nSQL(NanoSql.TABLES.TRIP_LOG.name).query('select').listen());
  }

  updateState(state: TripLogState): Promise<unknown> {
    return nSQL(NanoSql.TABLES.TRIP_LOG_ACTIVITY.name).query('upsert', { state, timestamp: moment().unix() }).exec();
  }

  getTripLogStateAsObservable(): Observable<TripLogActivity> {
    return new NSqlFullUpdateObservable<TripLogActivity[]>(
      nSQL(NanoSql.TABLES.TRIP_LOG_ACTIVITY.name).query('select').orderBy(['id: desc']).limit(1).listen({})
    ).pipe(map((ta) => ta[0]));
  }

  getTripLogActivityAsObservable(): Observable<TripLogActivity[]> {
    return new NSqlFullUpdateObservable<TripLogActivity[]>(nSQL(NanoSql.TABLES.TRIP_LOG_ACTIVITY.name).query('select').listen());
  }

  getLegacyTripAsObservable(): Observable<LegacyTrip> {
    return this.userSettingService.appMode$.pipe(switchMap((appMode) => from(this.getLegacyTripFromDbByAppMode(appMode))));
  }

  async getLegacyTripFromDbByAppMode(appMode: AppMode): Promise<LegacyTrip> {
    const result = (await NanoSql.getInstance(NanoSql.TABLES.LEGACY_TRIP_LOG.name, appMode).query('select').exec()) as LegacyTrip[];
    return result[0];
  }

  startLegacyTrip(tripDto: CreateTripDto): Observable<void> {
    const legacyTrip: LegacyTrip = {
      id: 'legacytrip',
      timestamp: moment().unix(),
      request: tripDto
    };
    return this.userSettingService.appMode$.pipe(
      take(1),
      switchMap((appMode) =>
        this.tripService
          .TripPost(tripDto)
          .pipe(switchMap(() => from(NanoSql.getInstance(NanoSql.TABLES.LEGACY_TRIP_LOG.name, appMode).query('upsert', legacyTrip).exec())))
      ),
      tap(() => this.tripStartedSubject.next(true)),
      switchMap(() => this.infoMessage(true)),
      catchError((err) => {
        this.tripStartedSubject.next(false);
        return throwError(err);
      })
    );
  }

  stopLegacyTrip(showConfirm = true): void {
    if (showConfirm) {
      this.confirmStopTrip();
    } else {
      this.callStopLegacyTripApiAndDeleteFromDb();
    }
  }

  async showTripErrorMessage(start: boolean): Promise<void> {
    const translations = await this.translateService.get(['ALERT.DEFAULT_HEADER', 'ALERT.OK', 'TRIP.ERROR', 'TRIP.END_ERROR']).toPromise();
    const alert = await this.alertController.create({
      header: translations['ALERT.DEFAULT_HEADER'],
      message: start ? translations['TRIP.ERROR'] : translations['TRIP.END_ERROR'],
      buttons: [translations['ALERT.OK']]
    });
    return alert.present();
  }

  async showTripNoPositionErrorMessage(): Promise<void> {
    const translations = await this.translateService.get(['ALERT.DEFAULT_HEADER', 'ALERT.OK', 'TRIP.ERROR_POSITION']).toPromise();
    const alert = await this.alertController.create({
      header: translations['ALERT.DEFAULT_HEADER'],
      message: translations['TRIP.ERROR_POSITION'],
      buttons: [translations['ALERT.OK']]
    });
    return alert.present();
  }

  private async confirmStopTrip(): Promise<void> {
    const translations = await firstValueFrom(this.translateService
      .get(['TRIP.STOP_TRIP', 'DIALOGS.ARE_YOU_SURE', 'ALERT.OK', 'ALERT.CANCEL']));
    const alert = await this.alertController.create({
      header: translations['TRIP.STOP_TRIP'] + '?',
      message: translations['DIALOGS.ARE_YOU_SURE'],
      buttons: [
        {
          text: translations['ALERT.CANCEL'],
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: translations['ALERT.OK'],
          handler: () => this.callStopLegacyTripApiAndDeleteFromDb()
        }
      ]
    });
    await alert.present();
  }

  private callStopLegacyTripApiAndDeleteFromDb() {
    this.getLegacyTripAsObservable()
      .pipe(
        take(1),
        filter((trip) => !!trip),
        concatMap((trip) => this.tripService.TripPut({ DeviceGuid: trip.request.DeviceGuid })),
        concatMap(() => this.deleteLegacyTripsFromDb()),
        concatMap(() => this.infoMessage(false))
      )
      .subscribe(
        () => {
          this.tripStartedSubject.next(false);
        },
        async (error) => {
          this.loggingService.error(error, DEBUG_TAG, 'Could not stop trip');
          this.tripStartedSubject.next(false);
          await this.showTripErrorMessage(false);
        }
      );
  }

  private deleteLegacyTripsFromDb() {
    return this.userSettingService.appMode$.pipe(
      concatMap((appMode) => from(NanoSql.getInstance(NanoSql.TABLES.LEGACY_TRIP_LOG.name, appMode).query('delete').exec()))
    );
  }

  cleanupOldLegacyTrip(): Promise<unknown> {
    return this.getLegacyTripAsObservable()
      .pipe(
        filter((trip) => trip && trip.timestamp < moment().startOf('day').unix()),
        concatMap(() => this.deleteLegacyTripsFromDb()),
        take(1)
      )
      .toPromise();
  }

  private infoMessage(started: boolean) {
    const key = started ? 'TRIP.STARTED' : 'TRIP.STOPPED';
    return this.translateService.get(key).pipe(switchMap((message) => from(this.presentToast(message))));
  }

  async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      mode: 'md',
      duration: 2000
    });
    return toast.present();
  }

  // getTripLogSummaryAsObservable(): Observer<TripLogSummary> {
  //   return nSQL().observable<TripLogItem[]>(() => {
  //     return nSQL(tableName).query('select').emit();
  //   }).map((tripLog) => ({
  //       started: moment(tripLog[0].timestamp)
  //    }));
  // }

  // async endTrip() {
  //   await nSQL(tableName)
  //     .query('upsert', { stop: new Date() })
  //     .where(['tripLogId', '=', this.currentTripLoggerId])
  //     .exec();
  //   this.currentTripLoggerId = null;
  // }
}
