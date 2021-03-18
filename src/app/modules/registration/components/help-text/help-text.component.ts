import { Component, OnInit, Input, NgZone } from '@angular/core';
import { GeoHazard } from '@varsom-regobs-common/core';
import { UserSettingService } from '../../../../core/services/user-setting/user-setting.service';
import { HelpTextService } from '../../services/help-text/help-text.service';
import { HelptextDto } from '@varsom-regobs-common/regobs-api';
import { ModalController } from '@ionic/angular';
import { HelpModalPage } from '../../pages/modal-pages/help-modal/help-modal.page';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-help-text',
  templateUrl: './help-text.component.html',
  styleUrls: ['./help-text.component.scss']
})
export class HelpTextComponent implements OnInit {
  @Input() registrationTid: number;
  @Input() geoHazard: GeoHazard;

  isVisible = false;
  helpText: HelptextDto;

  constructor(
    private helpTextService: HelpTextService,
    private userSettingService: UserSettingService,
    private modalController: ModalController,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    const userSetting = await this.userSettingService.userSetting$
      .pipe(take(1))
      .toPromise();
    this.helpText = await this.helpTextService.getHelpTextByKey(
      userSetting.language,
      userSetting.appMode,
      this.geoHazard,
      this.registrationTid
    );
    if (this.helpText) {
      this.ngZone.run(() => {
        this.isVisible = true;
      });
    }
  }

  async showHelp() {
    const modal = await this.modalController.create({
      component: HelpModalPage,
      componentProps: {
        helpText: this.helpText.Text
      }
    });
    modal.present();
  }
}
