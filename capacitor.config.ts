import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'no.nve.regobs4',
  appName: 'Varsom Regobs',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'ionic'
  },
  plugins: {
    'SplashScreen': {
      'launchAutoHide': false
    }
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '24',
      'android-compileSdkVersion': '30',
      'android-build-tool': '30.0.3',
      'android-targetSdkVersion': '30',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      AutoHideSplashScreen: 'true',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000',
      FadeSplashScreenDuration: '300',
      AndroidLaunchMode: 'singleTask',
      StatusBarStyle: 'lightcontent',
      StatusBarBackgroundColor: '#99044962',
      KeyboardDisplayRequiresUserAction: 'false',
      KeyboardResize: 'true',
      KeyboardResizeMode: 'ionic',
      HideKeyboardFormAccessoryBar: 'false',
      AndroidPersistentFileLocation: 'Compatibility',
      WKWebViewOnly: 'true',
      ResolveServiceWorkerRequests: 'true',
      AndroidXEnabled: 'true'
    }
  }
};

export default config;
