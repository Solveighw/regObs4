import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';
import { TranslateModule } from '@ngx-translate/core';
import { UserSettingService } from '../../../core/services/user-setting/user-setting.service';
import { LoggingService } from '../../shared/services/logging/logging.service';
import { SharedModule } from '../../shared/shared.module';

import { RegobsAuthService } from './regobs-auth.service';

describe('RegobsAuthService', () => {
  let service: RegobsAuthService;
  let logger: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientModule, TranslateModule.forRoot(), RouterModule.forRoot([], { relativeLinkResolution: 'legacy' })],
      providers: [{ provide: LoggingService, useClass: logger }, SafariViewController, InAppBrowser]
    });
    TestBed.inject(UserSettingService) as jasmine.SpyObj<UserSettingService>;
    TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    logger = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    service = TestBed.inject(RegobsAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
