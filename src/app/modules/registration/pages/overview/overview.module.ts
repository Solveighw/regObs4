import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OverviewPage } from './overview.page';
import { SendButtonComponent } from '../../components/send-button/send-button.component';
import { SummaryItemComponent } from '../../components/summary-item/summary-item.component';
import { SharedComponentsModule } from '../../shared-components.module';
import { FailedRegistrationComponent } from '../../components/failed-registration/failed-registration.component';
import { SaveAsDraftRouteGuard } from '../save-as-draft.guard';
import { VersionConflictComponent } from '../../components/version-conflict/version-conflict.component';

const routes: Routes = [
  {
    path: '',
    component: OverviewPage,
    canDeactivate: [SaveAsDraftRouteGuard]
  }
];

@NgModule({
  imports: [SharedComponentsModule, RouterModule.forChild(routes)],
  declarations: [
    OverviewPage,
    SendButtonComponent,
    SummaryItemComponent,
    FailedRegistrationComponent,
    VersionConflictComponent
  ]
})
export class OverviewPageModule {}
