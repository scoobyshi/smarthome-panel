import React from 'react';
import Websocket from 'react-websocket';
import Client from './Client';
import PlayButton from './PlayButton';
import AlarmBox from './Alarm';

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Menu from 'material-ui/Menu';
import Dialog from 'material-ui/Dialog';

import ActionHome from 'material-ui/svg-icons/action/home';
import ActionAlarm from 'material-ui/svg-icons/action/alarm';
import AVFForward from 'material-ui/svg-icons/av/fast-forward';
import AVFRewind from 'material-ui/svg-icons/av/fast-rewind';
import AVPause from 'material-ui/svg-icons/av/pause';
import AVPlay from 'material-ui/svg-icons/av/play-arrow';
import AVPlaylistPlay from 'material-ui/svg-icons/av/playlist-play';
import AVTracklist from 'material-ui/svg-icons/av/queue-music';
import AVShuffle from 'material-ui/svg-icons/av/shuffle';

// No Image/size for coverart until Song playing?
// Add a new Card for Alarm? pass track and date picker selection
// Show list of Songs with Filter?
// Set default to Random?
// Set a Favourite, and load initially

var playlistItems = [];

var tracklistItems = [];

const styles = {
  container: {
    // textAlign: 'center',
    // paddingTop: 200,
    margin: 30,
    // width: '30%'
  },
};

const style = {
  marginRight: 10,
  marginTop:10,
};

const imageStyle = {
  width: '20%'
};

class MusicBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      openPlaylist: false,
      openTracklist: false,
      currentMusic: "Unknown",
      currentAlbum: "Unknown",
      playMode: "play/stop",
      playlist: "",
      togglePause: false,
      cover_art_uri: "",
      showPlayPauseButton: (<AVPlay />),
      // playlists: [],
      nextMusic: "Unknown"
    };
    this.changeMusicNext = this.changeMusicNext.bind(this);
    this.loadMusicPlay = this.loadMusicPlay.bind(this);
    this.changeMusicPrev = this.changeMusicPrev.bind(this);

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

  getPlaylists = (callback) => {
    playlistItems = [];
    Client.musicGetService(this.resturl + '/music/api/playlists', (playlists) => {
      playlists.forEach(function (playlist) {
        console.log(playlist.name);
        playlistItems.push(<MenuItem value={playlist.uri} key={playlist.uri} primaryText={playlist.name} />);
      });
      callback();
    });
  }

  getTracklist = (callback) => {
    tracklistItems = [];
    Client.musicGetService(this.resturl + '/music/api/tracklist', (tracklist) => {
      tracklist.forEach( (track) => {
        console.log(track.name);
        tracklistItems.push(<MenuItem value={track.uri} key={track.uri} primaryText={track.name} />);
      });
      callback();
    });
  }

  handlePlaylist = (event, playlistid) => {
    if (this.state.openPlaylist) {
      this.handlePlaylistClose();
    }
    this.setState({ playlist: playlistid });
    console.log(playlistid);
    this.loadMusicPlay(playlistid, this.handlePlayClick);
    // Need to make a promise to play only after loading
    // this.handlePlayClick();
  }

  tracklistShuffle() {
    Client.musicPostService(this.resturl + '/music/api/tracklist/shuffle', (response) => {
      console.log("Shuffle Tracks");
    });
  }

  musicDataSource() {
    Client.musicGetService(this.resturl + '/music/api/track/current', (music) => {
      console.log("Set Current Song: " + music.name);
      this.setState({ currentMusic: music.name });
    });
  }

  changeMusicNext() {
    Client.musicPostService(this.resturl + '/music/api/control/next', (response) => {
      // May not work as Mopidy next() doesn't wait/return result and thus we may end up querying for a new song before it's actually switched
      // Basically Mopidy next() is a fake promise, again, switch to websocket!
      console.log("Switching to Next Song.. ");
    });
  }

  changeMusicPrev() {
    Client.musicPostService(this.resturl + '/music/api/control/prev', (response) => {
      console.log("Switching to Previous Song.. ");
    });
  }

  loadMusicPlay(playlistid, callback) {
    // Default playlistid=spotify:user:spotify:playlist:2DIkzkPnHOIK6VtFPx8ciD
    Client.musicPostService(this.resturl + '/music/api/load?playlistid=' + playlistid, (response) => {
      console.log("Loaded Playlist");
      this.tracklistShuffle();
      callback();
    });
  }

  handleWSData = (data) => {
    // Should test if JSON
    let result = JSON.parse(data);
    // console.log(result);
    if (result.album) {
      console.log("Websocket - New Song: " + result.name + " Album: " + result.album.name);
      console.log("Image: " + result.cover_art.uri);
      this.setState({ currentAlbum: result.album.name, currentMusic: result.name, cover_art_uri: result.cover_art.uri });
    }

    if (result.new_state === 'playing') {
      console.log("In Play Mode");
      this.setState({ playMode: "Playing", togglePause: true, showPlayPauseButton: (<AVPause />) });
    } else if (result.new_state === 'stopped') {
      console.log("In Stopped Mode");
      this.setState({ playMode: "Stopped", togglePause: false, showPlayPauseButton: (<AVPlay />) });
    }
  }

  handlePlayClick = () => {
    if (this.state.togglePause) {
      this.setState({ togglePause: false, showPlayPauseButton: (<AVPlay />) });
      Client.musicPostService(this.resturl + '/music/api/control/stop', (response) => {
        console.log("Switching to Stop/Pause.");
      });
    } else {
      this.setState({ togglePause: true, showPlayPauseButton: (<AVPause />) });
      Client.musicPostService(this.resturl + '/music/api/control/play', (response) => {
        console.log("Switching to Play Mode.. ");
      });
    }
  }

  handlePlaylistOpen = () => {
    this.getPlaylists( (response) => {
      this.setState({openPlaylist: true});
    });
  };

  handlePlaylistClose = () => {
    this.setState({openPlaylist: false});
  };

  handleTracklistOpen = () => {
    this.getTracklist( (response) => {
      this.setState({openTracklist: true});
    });
    // Make a call back function or promise to open dialog, or loading anim
  };

  handleTracklistClose = () => {
    this.setState({openTracklist: false});
  };

  handleAOpen = () => {
    this._alarm.handleAlarmOpen();
  };

  render() {
    const actionsPlaylistDialog = [
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handlePlaylistClose}
      />,
    ];

    const actionsTracklistDialog = [
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleTracklistClose}
      />,
    ];

    return (
      <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={styles.container}>
        <CardHeader
          title={this.props.name}
          titleStyle={{paddingTop:5}}
          subtitle={"Playing: " + this.state.currentMusic}
          avatar={this.props.avatar}
          actAsExpander={true}
          showExpandableButton={true}
        />

        <Card style={{width:300, height:300, margin:20}} expandable={true}>
          <CardMedia overlay={<CardTitle title={this.state.currentAlbum} subtitle={this.state.currentMusic} />}>
            <div style={{display: 'flex', justifyContent: 'left', alignItems: 'center'}}>
              <img style={{width:300, height:300}} src={this.state.cover_art_uri} />
            </div>
          </CardMedia>
        </Card>

        <CardActions style={{paddingLeft:20, paddingBottom:20}}>
          <FloatingActionButton mini={true} style={style} onClick={this.changeMusicPrev}>
            <AVFRewind />
          </FloatingActionButton>
          <FloatingActionButton style={style} mini={true} onClick={this.handlePlayClick}>
            {this.state.showPlayPauseButton}
          </FloatingActionButton>
          <FloatingActionButton mini={true} style={style} onClick={this.changeMusicNext}>
            <AVFForward />
          </FloatingActionButton>
          <FloatingActionButton secondary={true} style={style} mini={true} onClick={this.handlePlaylistOpen}>
            <AVPlaylistPlay />
          </FloatingActionButton>
          <FloatingActionButton secondary={true} style={style} mini={true} onClick={this.handleTracklistOpen}>
            <AVTracklist />
          </FloatingActionButton>
          <FloatingActionButton secondary={true} style={style} mini={true} onClick={this.handleAOpen}>
            <ActionAlarm />
          </FloatingActionButton>
        </CardActions>

        <Dialog
          title="Select Playlist"
          actions={actionsPlaylistDialog}
          modal={false}
          open={this.state.openPlaylist}
          onRequestClose={this.handlePlaylistClose}
          autoScrollBodyContent={true}
        >
          <Menu
            onChange={this.handlePlaylist}
            maxHeight={200}
          >
            {playlistItems}
          </Menu>
        </Dialog>

        <Dialog
          title="List of Tracks"
          actions={actionsTracklistDialog}
          modal={false}
          open={this.state.openTracklist}
          onRequestClose={this.handleTracklistClose}
          autoScrollBodyContent={true}
        >
          <Menu
            maxHeight={200}
          >
            {tracklistItems}
          </Menu>
        </Dialog>

        <AlarmBox ref={(alarm) => { this._alarm = alarm; }}/>

        <Websocket url={this.wsurl} onMessage={this.handleWSData.bind(this)}/>
      </Card>
    );
  }
}

export default MusicBox;
