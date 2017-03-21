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
    console.log("Date: ", date.getHours(), date.getMinutes());
  };

  handleAlarmOpen = () => {
    this.setState({ openAlarm: true });
  };

  handleAlarmClose = () => {
    this.setState({ openAlarm: false });
  };

  handleAlarmSubmit = () => {
    if (this.state.value24 && this.props.playlistid) {
      let newCron = '00 ' + this.state.value24.getMinutes() + ' ' + this.state.value24.getHours() + ' * * *';

      console.log("Setting Playlist to:", this.props.playlistid, "and Cron to:", newCron);

      Client.musicPostService(this.props.url + '/music/api/schedule?' + 'playlistid=' + this.props.playlistid + '&cron="' + newCron + '"', (response) => {
        console.log("Submit Alarm Schedule, recieved:", response);
      });
    }
    this.setState({ openAlarm: false });
  };

  render() {

    const actionsAlarmDialog = [
      <RaisedButton
        label="Cancel"
        primary={false}
        onTouchTap={this.handleAlarmClose}
        style={{marginRight: 20}}
      />,
      <RaisedButton
        label="Submit"
        primary={true}
        onTouchTap={this.handleAlarmSubmit}
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
