import React from "react";
import _ from "lodash";
import {Mutation} from "react-apollo";
import {gql} from "apollo-boost";
import {Button} from 'react-native-material-ui';
let mutationMarkSpam = gql`mutation markSpam($id:String) {
    markSpam(id:$id){
        id
    }
}
`;
type TProps = {
    ids: Array<string>;
}
const ButtonMarkAllSpam = ({ids = [], query, variables}: TProps) => {
    return <Mutation mutation={mutationMarkSpam}>
        {(markSpam, {data}) => (<Button accent onPress={() => {
                console.debug(`ButtonMarkAllSpam:ids=${ids}`);
                return ids.forEach(id => markSpam({
                    variables: {id: id},
                    optimisticResponse: {
                        __typename: "Mutation",
                        markSpam: {
                            __typename: "Article",
                            id: id,
                        }
                    },
                    update: (proxy, {data: {markSpam: {id}}}) => {
                        if (!query) return;
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
                }));
            }} text={"Mark All Spam"}/>
        )}
    </Mutation>
};
export default ButtonMarkAllSpam;