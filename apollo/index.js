import ApolloClient from "apollo-boost";

export const client = new ApolloClient({
    uri: "http://www.xread.yuanjingtech.com/graphql"
});