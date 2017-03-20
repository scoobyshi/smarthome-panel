import React from 'react';
import Client from './Client';

import Dialog from 'material-ui/Dialog';
import TimePicker from 'material-ui/TimePicker';
import RaisedButton from 'material-ui/RaisedButton';

class AlarmBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openAlarm: false,
      value24: null,
    };
  }

  handleChangeTimePicker24 = (event, date) => {
    this.setState({value24: date});
  };

  handleAlarmOpen = () => {
    this.setState({ openAlarm: true });
  };

  handleAlarmClose = () => {
    this.setState({ openAlarm: false });
  };

  render() {

    const actionsAlarmDialog = [
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleAlarmClose}
      />,
    ];

    return (
      <Dialog
        title="Set an Alarm"
        actions={actionsAlarmDialog}
        modal={false}
        open={this.state.openAlarm}
        onRequestClose={this.handleAlarmClose}
        autoScrollBodyContent={true}
      >
        <TimePicker
          format="24hr"
          hintText="24hr Format"
          value={this.state.value24}
          onChange={this.handleChangeTimePicker24}
        />
      </Dialog>
    );
  }
}

export default AlarmBox;
