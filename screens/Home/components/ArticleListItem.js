import React from "react";
import moment from "moment";
import {Card} from 'react-native-material-ui';

import gql from "graphql-tag";
import ButtonMarkRead from "./ButtonMarkRead";
import ButtonMarkSpam from "./ButtonMarkSpam";
import {Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {WebBrowser} from "expo";
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
const ArticleListItem = ({data: {id, title, summary, link, time, feed,}, query, variables}) => {
    let {feed_link, feed_title} = feed || {};
    let time_moment = moment(time);
    return (
        <View key={id} style={styles.card}>
            <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(link)} style={styles.helpLink}>
                <Text style={styles.title_text}>{title} {time_moment.fromNow()} {feed_title || feed_link || ''}</Text>
            </TouchableOpacity>
            <Text ellipsizeMode="tail" numberOfLines={5} textAlignVertical="top">
                {summary.replace(/^[\s]+/, '')}
            </Text>
            <View style={styles.row}>
                <ButtonMarkRead id={id} read={'unread'} query={query} variables={variables}/>
                <ButtonMarkSpam id={id} query={query} variables={variables}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginTop: 2, marginBottom: 2, marginLeft: 8, marginRight: 8,
        padding: 4,
        backgroundColor: '#00ff0040'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    title_text: {
        fontSize: 18
    },
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

export default ArticleListItem;