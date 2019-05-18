import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';
import {
  AdMobBanner,
  AdMobInterstitial,
  AdMobRewarded
} from 'expo';
import {COLOR, ThemeContext, getTheme} from 'react-native-material-ui';
// you can set your style right here, it'll be propagated to application
const uiTheme = {
  palette: {
    primaryColor: COLOR.green500,
  },
  toolbar: {
    container: {
      height: 50,
    },
  },
};
export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  componentDidMount(): void {
    AdMobInterstitial.setTestDeviceID('EMULATOR');
    // ALWAYS USE TEST ID for Admob ads
    AdMobInterstitial.setAdUnitID('ca-app-pub-2225047970234229/1719606437');

    AdMobInterstitial.addEventListener('interstitialDidLoad',
        () => console.log('interstitialDidLoad')
    );

    AdMobInterstitial.addEventListener('interstitialDidFailToLoad',
        () => console.log('interstitialDidFailToLoad')
    );

    AdMobInterstitial.addEventListener('interstitialDidOpen',
        () => console.log('interstitialDidOpen')
    );
    AdMobInterstitial.addEventListener('interstitialDidClose',
        () => console.log('interstitialDidClose')
    );
    AdMobInterstitial.addEventListener('interstitialWillLeaveApplication',
        () => console.log('interstitialWillLeaveApplication')
    );
    this.showInterstitial()
  }

  componentWillUnmount() {
    AdMobInterstitial.removeAllListeners();
  }

  async showInterstitial() {
    await AdMobInterstitial.requestAdAsync();
    await AdMobInterstitial.showAdAsync();
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <ThemeContext.Provider value={getTheme(uiTheme)}>
            <AppNavigator/>
          </ThemeContext.Provider>
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
