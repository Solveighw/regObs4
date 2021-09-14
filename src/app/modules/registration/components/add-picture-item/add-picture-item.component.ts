import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  ActionSheetController,
  Platform,
  ToastController
} from '@ionic/angular';
import {
  Camera,
  CameraOptions,
  PictureSourceType
} from '@ionic-native/camera/ngx';
import { settings } from '../../../../../settings';
import { AttachmentType, AttachmentUploadEditModel, NewAttachmentService, RegistrationTid } from '@varsom-regobs-common/registration';
import { DataUrlHelper } from '../../../../core/helpers/data-url.helper';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { File, FileEntry, IFile } from '@ionic-native/file/ngx';
import { LoggingService } from '../../../shared/services/logging/logging.service';
import { LogLevel } from '../../../shared/services/logging/log-level.model';
import * as utils from '@nano-sql/core/lib/utilities';
import { GeoHazard } from '@varsom-regobs-common/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { NgDestoryBase } from 'src/app/core/helpers/observable-helper';

// const DATA_URL_TAG = 'data:image/jpeg;base64,';
const DEBUG_TAG = 'AddPictureItemComponent';
const MIME_TYPE = 'image/jpeg';

export interface AttachmentUploadEditModelWithBlob extends AttachmentUploadEditModel {
  blob: Blob;
}

@Component({
  selector: 'app-add-picture-item',
  templateUrl: './add-picture-item.component.html',
  styleUrls: ['./add-picture-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPictureItemComponent extends NgDestoryBase implements OnInit {
  @Input() registrationId: string;
  @Input() registrationTid: RegistrationTid;
  @Input() geoHazard: GeoHazard;
  @Output() imagesChange = new EventEmitter();
  @Input() title = 'REGISTRATION.ADD_IMAGES';
  @Input() pictureCommentText = 'REGISTRATION.IMAGE_DESCRIPTION';
  @Input() pictureCommentPlaceholder =
    'REGISTRATION.IMAGE_DESCRIPTION_PLACEHOLDER';
  @Input() icon = 'camera';
  @Input() showIcon = true;
  @Input() iconColor = 'dark';
  @Input() onBeforeAdd: () => Promise<void> | void;
  @Input() attachmentType: AttachmentType = 'Attachment';
  @Input() ref?: string;

  attachments: AttachmentUploadEditModelWithBlob[];

  constructor(
    private translateService: TranslateService,
    private camera: Camera,
    private platform: Platform,
    private file: File,
    private logger: LoggingService,
    private webView: WebView,
    private toastController: ToastController,
    private domSanitizer: DomSanitizer,
    private actionSheetController: ActionSheetController,
    private newAttachmentService: NewAttachmentService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.newAttachmentService.getUploadedAttachments(this.registrationId)
      .pipe(
          map((attachments) => attachments.filter((a) => (a.RegistrationTID === this.registrationTid && a.type === this.attachmentType && a.ref === this.ref))), 
          switchMap((attachments) => attachments.length === 0 ? of([]) : forkJoin([...attachments.map((a) => 
            this.newAttachmentService.getBlob(this.registrationId, a.id).pipe(take(1), map((blob) => ({ ...a, blob })), catchError((err) => { 
                  this.logger.error(err,  DEBUG_TAG, 'Could not get blob from attachment');
                  return of(({ ...a, blob: undefined }));
            })
          ))])),
          takeUntil(this.ngDestroy$)
      ).subscribe((result) => {
        this.attachments = result;
        this.cdr.detectChanges();
      })
  }

  async addClick() {
    if (this.onBeforeAdd !== undefined) {
      await Promise.resolve(this.onBeforeAdd());
    }
    const translations = await this.translateService
      .get([
        'REGISTRATION.GENERAL_COMMENT.ADD_PICTURE',
        'REGISTRATION.GENERAL_COMMENT.TAKE_NEW_PHOTO',
        'REGISTRATION.GENERAL_COMMENT.CHOOSE_FROM_LIBRARY',
        'DIALOGS.CANCEL'
      ])
      .toPromise();
    const actionSheet = await this.actionSheetController.create({
      header: translations['REGISTRATION.GENERAL_COMMENT.ADD_PICTURE'],
      buttons: [
        {
          text: translations['REGISTRATION.GENERAL_COMMENT.TAKE_NEW_PHOTO'],
          handler: () => this.getPicture(this.camera.PictureSourceType.CAMERA)
        },
        {
          text:
            translations['REGISTRATION.GENERAL_COMMENT.CHOOSE_FROM_LIBRARY'],
          handler: () =>
            this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY)
        },
        {
          text: translations['DIALOGS.CANCEL'],
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  async getPicture(sourceType: PictureSourceType) {
    if (!this.platform.is('cordova')) {
      await this.addDummyImage();
      return true;
    }
    try {
      const options: CameraOptions = {
        quality: settings.images.quality,
        destinationType: this.camera.DestinationType.FILE_URI,
        // NOTE: Base64 encode. If API supports upload image blob later,
        // this should be changed to FILE_URL and uploaded separatly
        sourceType: sourceType,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        targetHeight: settings.images.size,
        targetWidth: settings.images.size,
        correctOrientation: true,
        saveToPhotoAlbum: sourceType === PictureSourceType.CAMERA,
        // NOTE: saveToPhotoAlbum=true causes a bug in latest cordova cameraplugin
      };
      const imageUrl = await this.camera.getPicture(options);
      if (await !this.validateImage(imageUrl)) {
        this.showErrorToast();
        return true;
      }

      this.logger.debug(
        `Got image url from camera plugin: ${imageUrl}`,
        DEBUG_TAG
      );
      // const permanentUrl = await this.moveImageToPermanentStorage(imageUrl);
      // this.logger.debug(
      //   `Image moved to permanent image url: ${permanentUrl}`,
      //   DEBUG_TAG
      // );
      const arrayBuffer = await this.getArrayBuffer(imageUrl);
      this.addImage(new Blob([arrayBuffer]), MIME_TYPE);
    } catch (err) {
      this.logger.log(
        'User could not add image, most likely no access or invalid image',
        err,
        LogLevel.Warning,
        DEBUG_TAG
      );
      this.showErrorToast();
    }
    return true;
  }

  private async getArrayBuffer(fileUrl: string): Promise<ArrayBuffer> {
    const entry = await this.file.resolveLocalFilesystemUrl(fileUrl);
    if (!entry.isFile) {
      throw Error(`${fileUrl} is not a file!`);
    }
    const pathSplitted = entry.nativeURL.split('/');
    const filename = pathSplitted.pop();
    const directory = pathSplitted.join('/');
    const arrayBuffer = await this.file.readAsArrayBuffer(directory, filename);
    return arrayBuffer;
  }

  private async validateImage(src: string) {
    if (src) {
      const entry = await this.file.resolveLocalFilesystemUrl(src);
      return entry.name.endsWith('jpg');
    }
    return false;
  }

  showErrorToast() {
    this.translateService
      .get('REGISTRATION.INVALID_IMAGE')
      .subscribe(async (translation) => {
        const toast = await this.toastController.create({
          message: translation,
          mode: 'md',
          duration: 4000
        });
        toast.present();
      });
  }

  // private async moveImageToPermanentStorage(src: string): Promise<string> {
  //   const entry = await this.file.resolveLocalFilesystemUrl(src);
  //   const rootDir = await this.file.resolveDirectoryUrl(
  //     this.file.dataDirectory
  //   );
  //   const obsImgFolder = await this.file.getDirectory(rootDir, 'obsimages', {
  //     create: true
  //   });
  //   const newSrc = await this.moveFile(entry, obsImgFolder);
  //   return newSrc;
  // }

  // private moveFile(file: Entry, directory: DirectoryEntry): Promise<string> {
  //   const newName = `${utils.uuid()}.jpg`;
  //   return new Promise((resolve, reject) =>
  //     file.moveTo(
  //       directory,
  //       newName,
  //       (entry) => resolve(entry.toURL()),
  //       (err) => reject(err)
  //     )
  //   );
  // }

  // private async deleteFile(src: string) {
  //   try {
  //     const entry = await this.file.resolveLocalFilesystemUrl(src);
  //     await new Promise<void>((resolve, reject) =>
  //       entry.remove(resolve, reject)
  //     );
  //   } catch (err) {
  //     this.logger.log(
  //       'Could not delete image',
  //       err,
  //       LogLevel.Warning,
  //       DEBUG_TAG
  //     );
  //   }
  // }

  private async addDummyImage() {
    const dummyImage = await DataUrlHelper.getDataUrlFromSrcUrl(
      '/assets/images/dummyregobsimage.jpeg'
    );
    const blob = DataUrlHelper.convertDataURIToBinary(dummyImage);
    this.addImage(new Blob([blob]), 'image/jpeg');
  }

  addImage(data: Blob, mimeType: string) {
    // this.images.push({
    //   PictureImageBase64: dataUrl, 
    //   RegistrationTID: this.registrationTid
    // });
    // TODO: Use new attachment service instead
    // this.imagesChange.emit(this.images);
    this.newAttachmentService.addAttachment(this.registrationId, data, mimeType, this.geoHazard, this.registrationTid, this.attachmentType,
       this.ref);
  }

  removeImage(image: AttachmentUploadEditModel) {
    this.newAttachmentService.removeAttachment(this.registrationId, image.id);
    // const index = this.images.indexOf(image);
    // if (index >= 0) {
    //   const imgSrc = image.PictureImageBase64;
    //   this.images.splice(index, 1);
    //   this.imagesChange.emit(this.images);
    //   if (!this.isBase64Image(imgSrc)) {
    //     this.deleteFile(imgSrc);
    //   }
    // }
  }

  // isBase64Image(img: string) {
  //   return img && img.startsWith('data:image');
  // }

  convertFileSrc(fileUrl: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(
      this.webView.convertFileSrc(fileUrl)
    );
  }
}
