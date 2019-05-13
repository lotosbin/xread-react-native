import React from "react";
import {Button} from 'react-native';
import _ from "lodash";
import {Mutation} from "react-apollo";
import {gql} from "apollo-boost";

let mutationMarkRead = gql`mutation markRead($id:String) {
    markReaded(id:$id){
        id
    }
}
`;
const ButtonMarkRead = ({id, read, query, variables}) => {
    return <Mutation mutation={mutationMarkRead}>
        {(markRead, {data}) => (<Button onPress={() => markRead({
                variables: {id: id},
                optimisticResponse: {
                    __typename: "Mutation",
                    markReaded: {
                        __typename: "Article",
                        id: id,
                    }
                },
                update: (proxy, {data: {markReaded: {id}}}) => {
                    // Read the data from our cache for this query.
                    if (!query) return;
                    if (read === "unread") {
                        const data = proxy.readQuery({query: query, variables: variables});
                        if (data.node) {
                            const find = _.find(data.node.articles.edges || [], {node: {id: id}});
                            if (find) {
                                console.log(`find`);
                                data.node.articles.edges = _.without(data.node.articles.edges || [], find) || [];
                                // Write our data back to the cache.
                                proxy.writeQuery({query: query, data});
                            }
                        } else {
                            const find = _.find(data.articles.edges || [], {node: {id: id}});
                            if (find) {
                                console.log(`find`);
                                data.articles.edges = _.without(data.articles.edges || [], find) || [];
                                // Write our data back to the cache.
                                proxy.writeQuery({query: query, data});
                            }
                        }
                    }
                }
            })} title={"Mark Read"}/>
        )}
    </Mutation>
};
export default ButtonMarkRead;