import React from 'react';
import Websocket from 'react-websocket';
import Client from './Client';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const playlistItems = [];

const styles = {
  container: {
    // textAlign: 'center',
    // paddingTop: 200,
    // width: '30%'
  },
};

class MusicBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      currentMusic: "Song: None",
      playMode: "play/stop",
      playToggle: false,
      playlist: "",
      // playlists: [],
      nextMusic: "Unknown"
    };
    this.changeMusicNext = this.changeMusicNext.bind(this);
    this.changeMusicPlay = this.changeMusicPlay.bind(this);
    this.loadMusicPlay = this.loadMusicPlay.bind(this);

    this.port = '5001';
    this.resturl = 'http://' + props.host + ':' + this.port;
    this.wsurl = 'ws://' + props.host + ':' + this.port + '/music/ws';
  }

  handleExpandChange = (expanded) => {
    this.setState({expanded: expanded});
  };

  // Need to bind the call to musicNext to bind to component vs window, also if bind in render will create a new function on every render vs in constructor
  // When using createClass instead of ES6 classes component is automatically bound; since we are using ES6, we need to bind

  // Poll for API changes, unless props change (eg route), then componentWillReceiveProps will get called
  // Swap this out for event driven websocket wrapper
  componentDidMount() {
    this.getPlaylists();
    this.musicDataSource();
    // setInterval(this.musicDataSource.bind(this), 10000);
  }

  getPlaylists() {
    Client.musicGetService(this.resturl + '/music/api/playlists', (playlists) => {
      playlists.forEach(function (playlist) {
        console.log(playlist.name);
        playlistItems.push(<MenuItem value={playlist.uri} key={playlist.uri} primaryText={playlist.name} />);
      });
    });
  }

  handlePlaylist = (event, index, playlistid) => {
    this.setState({ playlist: playlistid });
    this.loadMusicPlay(playlistid);
  }

  musicDataSource() {
    Client.musicGetService(this.resturl + '/music/api/track/current', (music) => {
      console.log("Set Current Song: " + music.name);
      this.setState({ currentMusic: music.name });
    });
  }

  changeMusicPlay = (event, toggle) => {
    if (toggle) {
      Client.musicPostService(this.resturl + '/music/api/control/play', (response) => {
        console.log("Switching to Play Mode.. ");
      });
    } else {
      Client.musicPostService(this.resturl + '/music/api/control/stop', (response) => {
        console.log("Switching to Stop.");
      });
    }
  }

  changeMusicNext() {
    Client.musicPostService(this.resturl + '/music/api/control/next', (response) => {
      // May not work as Mopidy next() doesn't wait/return result and thus we may end up querying for a new song before it's actually switched
      // Basically Mopidy next() is a fake promise, again, switch to websocket!
      console.log("Switching to Next Song.. ");
    });
  }

  loadMusicPlay(playlistid) {
    // Default playlistid=spotify:user:spotify:playlist:2DIkzkPnHOIK6VtFPx8ciD
    Client.musicPostService(this.resturl + '/music/api/load?playlistid=' + playlistid, (response) => {
      console.log("Loaded Playlist");
    });
  }

  handleWSData = (data) => {
    // Should test if JSON
    let result = JSON.parse(data);
    // console.log(result);
    if (result.album) {
      console.log("Websocket - New Song: " + result.name);
      this.setState({ currentMusic: "Song: " + result.name });
    }

    if (result.new_state === 'playing') {
      console.log("In Play Mode");
      this.setState({ playMode: "Playing", playToggle: true });
    } else if (result.new_state === 'stopped') {
      console.log("In Stopped Mode");
      this.setState({ playMode: "Stopped", playToggle: false });
    }
  }

  render() {
    return (
      <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={styles.container}>
        <CardHeader
          title={this.props.name}
          subtitle={this.state.currentMusic}
          avatar={this.props.avatar}
          actAsExpander={true}
          showExpandableButton={true}
        />

        <CardText>
          <Toggle
            onToggle={this.changeMusicPlay}
            toggled={this.state.playToggle}
            labelPosition="right"
            label={this.state.playMode}
          />
        </CardText>

        <SelectField value={this.state.playlist}  onChange={this.handlePlaylist}  maxHeight={200}>
          {playlistItems}
        </SelectField>

        <CardActions expandable={true}>
          <RaisedButton label="Load" onTouchTap={this.loadMusicPlay} />
          <RaisedButton label="Next" onTouchTap={this.changeMusicNext} />
        </CardActions>

        <Websocket url={this.wsurl} onMessage={this.handleWSData.bind(this)}/>
      </Card>
    );
  }
}

export default MusicBox;
