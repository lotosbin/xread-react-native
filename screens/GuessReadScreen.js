import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl,
    Picker,
    Button,
} from 'react-native';
import {WebBrowser} from 'expo';
import {
    AdMobBanner,
    AdMobInterstitial,
    PublisherBanner,
    AdMobRewarded
} from 'expo';
import {MonoText} from '../components/StyledText';
import {gql} from "apollo-boost";
import {ApolloProvider, Query} from "react-apollo";
import {client} from '../apollo'
import ButtonMarkRead from "./Home/components/ButtonMarkRead";
import ButtonMarkSpam from "./Home/components/ButtonMarkSpam";

export const fragment_article_list_item = gql`fragment fragment_article_list_item on Article{
    id
    title
    summary
    link
    time
    tags
    box
    priority
    feed{
        title
        link
    }
}`;
let query = gql`query articles($cursor: String="",$box:String="all",$read:String="all",$priority:Int) {
    articles(last:10,before: $cursor,box:$box,read:$read,priority:$priority) {
        pageInfo{
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
        }
        edges{
            cursor
            node{
                ...fragment_article_list_item
            }
        }
    }
}
${fragment_article_list_item}
`;
export default class HomeScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            read: 'unread',
        };
    }

    bannerError = () => {
    };

    _onRefresh = () => {
        const that = this;
        this.setState({refreshing: true});
        this.refetch && this.refetch().then(() => that.setState({refreshing: false}));
    };

    render() {
        const that = this;
        const variables = {cursor: "", box: "inbox", read: this.state.read};
        return (
            <ApolloProvider client={client}>
                <View style={styles.container}>
                    <Picker
                        selectedValue={this.state.read}
                        style={{height: 150, width: 100}}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({read: itemValue})
                        }>
                        <Picker.Item label="All" value="all"/>
                        <Picker.Item label="Unread" value="unread"/>
                        <Picker.Item label="Read" value="readed"/>
                    </Picker>
                    <AdMobBanner
                        bannerSize="fullBanner"
                        adUnitID="ca-app-pub-2225047970234229/9027250817" // Test ID, Replace with your-admob-unit-id
                        testDeviceID="EMULATOR"
                        onDidFailToReceiveAdWithError={this.bannerError}/>
                    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this._onRefresh}
                                    />
                                }>
                        {/*<View style={styles.welcomeContainer}>*/}
                        {/*    <Image*/}
                        {/*        source={*/}
                        {/*            __DEV__*/}
                        {/*                ? require('../assets/images/robot-dev.png')*/}
                        {/*                : require('../assets/images/robot-prod.png')*/}
                        {/*        }*/}
                        {/*        style={styles.welcomeImage}*/}
                        {/*    />*/}
                        {/*</View>*/}

                        {/*<View style={styles.getStartedContainer}>*/}
                        {/*    {this._maybeRenderDevelopmentModeWarning()}*/}

                        {/*    <Text style={styles.getStartedText}>Get started by opening</Text>*/}

                        {/*    <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>*/}
                        {/*        <MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>*/}
                        {/*    </View>*/}

                        {/*    <Text style={styles.getStartedText}>*/}
                        {/*        Change this text and your app will automatically reload.*/}
                        {/*    </Text>*/}
                        {/*</View>*/}

                        {/*<View style={styles.helpContainer}>*/}
                        {/*    <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>*/}
                        {/*        <Text style={styles.helpLinkText}>Help, it didn’t automatically reload!</Text>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*</View>*/}
                        <Query query={query} variables={variables}>
                            {({loading, error, data, refetch, fetchMore}) => {
                                that.refetch = refetch;
                                if (loading) return <Text>Loading...</Text>;
                                if (error) return <Text>Error :(</Text>;
                                return <View>
                                    {data.articles.edges.map(({node: {id, title, link}}) => (
                                        <View key={id}>
                                            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(link)} style={styles.helpLink}>
                                                <Text>{title}</Text>
                                            </TouchableOpacity>
                                            <ButtonMarkRead id={id} read={'unread'} query={query} variables={variables}/>
                                            <ButtonMarkSpam id={id} query={query} variables={variables}/>
                                        </View>
                                    ))}
                                    <Button title={"Load More"} onPress={() => fetchMore({
                                        variables: {
                                            cursor: data.articles.pageInfo.endCursor
                                        },
                                        updateQuery: (previousResult, {fetchMoreResult}) => {
                                            const newEdges = fetchMoreResult.articles.edges;
                                            const pageInfo = fetchMoreResult.articles.pageInfo;

                                            return newEdges.length
                                                ? {
                                                    // Put the new comments at the end of the list and update `pageInfo`
                                                    // so we have the new `endCursor` and `hasNextPage` values
                                                    articles: {
                                                        __typename: previousResult.articles.__typename,
                                                        edges: [...previousResult.articles.edges, ...newEdges],
                                                        pageInfo
                                                    }
                                                }
                                                : previousResult;
                                        }
                                    })}/>
                                </View>
                            }}
                        </Query>
                    </ScrollView>

                    {/*<View style={styles.tabBarInfoContainer}>*/}
                    {/*    <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>*/}

                    {/*    <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>*/}
                    {/*        <MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>*/}
                    {/*    </View>*/}
                    {/*</View>*/}
                </View>
            </ApolloProvider>
        );
    }

    _maybeRenderDevelopmentModeWarning() {
        if (__DEV__) {
            const learnMoreButton = (
                <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
                    Learn more
                </Text>
            );

            return (
                <Text style={styles.developmentModeText}>
                    Development mode is enabled, your app will be slower but you can use useful development
                    tools. {learnMoreButton}
                </Text>
            );
        } else {
            return (
                <Text style={styles.developmentModeText}>
                    You are not in development mode, your app will run at full speed.
                </Text>
            );
        }
    }

    _handleLearnMorePress = () => {
        WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
    };

    _handleHelpPress = () => {
        WebBrowser.openBrowserAsync(
            'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    contentContainer: {
        paddingTop: 30,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)',
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    getStartedText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center',
    },
    tabBarInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: {height: -3},
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 20,
            },
        }),
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        paddingVertical: 20,
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center',
    },
    navigationFilename: {
        marginTop: 5,
    },
    helpContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    helpLink: {
        paddingVertical: 15,
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
