import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SaveAndGoBackButtonComponent } from './components/save-and-go-back-button/save-and-go-back-button.component';
import { TextCommentComponent } from './components/text-comment/text-comment.component';
import { EditImagesComponent } from './components/edit-images/edit-images.component';
import { KdvRadiobuttonListComponent } from './components/kdv-radiobutton-list/kdv-radiobutton-list.component';
import { NavigationButtonsComponent } from './components/navigation-buttons/navigation-buttons.component';
import { SetLocationInMapComponent } from './components/set-location-in-map/set-location-in-map.component';
import { MapModule } from '../map/map.module';
import { Base64ImageComponent } from './components/base64-image/base64-image.component';
import { KdvDescriptionPipe } from './pipes/kdv-description.pipe';
import { AddWebUrlItemComponent } from './components/add-web-url-item/add-web-url-item.component';
import { ModalSaveOrDeleteButtonsComponent } from './components/modal-save-or-delete-buttons/modal-save-or-delete-buttons.component';
import { ExposedHeightComponent } from './components/snow/exposed-height/exposed-height.component';
import { ValidExpositionComponent } from './components/snow/valid-exposition/valid-exposition.component';
import { RegistrationContentWrapperComponent } from './components/registration-content-wrapper/registration-content-wrapper.component';
import { HelpTextComponent } from './components/help-text/help-text.component';
import { HelpModalPageModule } from './pages/modal-pages/help-modal/help-modal.module';
import { YesNoSelectComponent } from './components/yes-no-select/yes-no-select.component';
import { NumericInputComponent } from './components/numeric-input/numeric-input.component';
import { NumericInputModalPageModule } from './pages/modal-pages/numeric-input-modal/numeric-input-modal.module';
import { MetersToCmPipe } from './pipes/meters-to-cm.pipe';
import { CompressionTestListComponent } from './components/snow/compression-test-list/compression-test-list.component';
import { KdvSelectComponent } from './components/kdv-select/kdv-select.component';
import { BlobImageComponent } from './components/blob-image/blob-image.component';

@NgModule({
  imports: [
    SharedModule,
    MapModule,
    HelpModalPageModule,
    NumericInputModalPageModule
  ],
  exports: [
    SharedModule,
    MapModule,
    SaveAndGoBackButtonComponent,
    EditImagesComponent,
    TextCommentComponent,
    KdvRadiobuttonListComponent,
    NavigationButtonsComponent,
    SetLocationInMapComponent,
    Base64ImageComponent,
    KdvDescriptionPipe,
    MetersToCmPipe,
    AddWebUrlItemComponent,
    ModalSaveOrDeleteButtonsComponent,
    ExposedHeightComponent,
    ValidExpositionComponent,
    RegistrationContentWrapperComponent,
    HelpTextComponent,
    HelpModalPageModule,
    YesNoSelectComponent,
    NumericInputComponent,
    NumericInputModalPageModule,
    CompressionTestListComponent,
    KdvSelectComponent,
    BlobImageComponent
  ],
  declarations: [
    SaveAndGoBackButtonComponent,
    EditImagesComponent,
    TextCommentComponent,
    KdvRadiobuttonListComponent,
    NavigationButtonsComponent,
    SetLocationInMapComponent,
    Base64ImageComponent,
    KdvDescriptionPipe,
    MetersToCmPipe,
    AddWebUrlItemComponent,
    ModalSaveOrDeleteButtonsComponent,
    ExposedHeightComponent,
    ValidExpositionComponent,
    RegistrationContentWrapperComponent,
    HelpTextComponent,
    YesNoSelectComponent,
    NumericInputComponent,
    CompressionTestListComponent,
    KdvSelectComponent,
    BlobImageComponent
  ]
})
export class SharedComponentsModule {}
