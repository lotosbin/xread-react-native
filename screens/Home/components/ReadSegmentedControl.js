import React, {Component} from 'react';
import SegmentedControlTab from "react-native-segmented-control-tab";

type P = { onValueChange: (any, number)=>void }
type S = { selectedIndex: number; }
const values = ["all", "unread", "readed"];
const titles = ["All", "Unread", "Read"];

class ReadSegmentedControl extends Component<P, S> {

    constructor() {
        super();
        this.state = {
            selectedIndex: 1
        };
    }

    handleIndexChange = index => {
        this.setState({
            ...this.state,
            selectedIndex: index
        });
        this.props.onValueChange(values[index], index)
    };

    render() {
        return (
            <SegmentedControlTab
                values={titles}
                selectedIndex={this.state.selectedIndex}
                onTabPress={this.handleIndexChange}
            />
        );
    }
}

export default ReadSegmentedControl;