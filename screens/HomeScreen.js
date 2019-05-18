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
    SafeAreaView,
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
import ReadSegmentedControl from "./Home/components/ReadSegmentedControl";
import ArticleListItem, {fragment_article_list_item} from "./Home/components/ArticleListItem";

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
        const {navigation} = this.props;
        const priority = navigation.getParam('priority', 0);
        const box = navigation.getParam('box', 'inbox');
        const that = this;
        const variables = {cursor: "", box: box, read: this.state.read, priority: priority};
        return (
            <ApolloProvider client={client}>
                <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                    <View style={styles.container}>
                        <AdMobBanner
                            bannerSize="fullBanner"
                            adUnitID="ca-app-pub-2225047970234229/9027250817" // Test ID, Replace with your-admob-unit-id
                            testDeviceID="EMULATOR"
                            onDidFailToReceiveAdWithError={this.bannerError}/>
                        <ReadSegmentedControl onValueChange={(itemValue) => this.setState({read: itemValue})}/>
                        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={this._onRefresh}
                                        />
                                    }>
                            <Query query={query} variables={variables}>
                                {({loading, error, data, refetch, fetchMore}) => {
                                    that.refetch = refetch;
                                    if (loading) return <Text>Loading...</Text>;
                                    if (error) return <Text>Error :(</Text>;
                                    return <View>
                                        {data.articles.edges.map(({node}) => <ArticleListItem key={node.id} data={node} query={query} variables={variables}/>)}
                                        {data.articles.pageInfo.hasNextPage ? <Button title={"Load More"} onPress={() => fetchMore({
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
                                        })}/> : <Text>no more data</Text>}
                                    </View>
                                }}
                            </Query>
                        </ScrollView>
                    </View>
                </SafeAreaView>
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
