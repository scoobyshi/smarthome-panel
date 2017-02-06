import React from 'react';
import Websocket from 'react-websocket';

const url = 'http://192.168.1.60';
const port = '5001';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMusic: "None",
      nextMusic: "Unknown"
    };
    this.changeMusicNext = this.changeMusicNext.bind(this);
    this.changeMusicPlay = this.changeMusicPlay.bind(this);
    this.loadMusicPlay = this.loadMusicPlay.bind(this);
  }
  // Need to bind the call to musicNext to bind to component vs window, also if bind in render will create a new function on every render vs in constructor
  // When using createClass instead of ES6 classes component is automatically bound; since we are using ES6, we need to bind

  // Poll for API changes, unless props change (eg route), then componentWillReceiveProps will get called
  // Swap this out for event driven websocket wrapper
  componentDidMount() {
    this.musicDataSource();
    // setInterval(this.musicDataSource.bind(this), 10000);
  }

  musicDataSource() {
    return fetch(url + ':' + port + '/music/api/track/current', {
      method: 'GET',
      accept: 'application/json'
    }).then( (response) => {
      return response.json();
    }).then( (music) => {
      console.log("Set Current Song: " + music.name);
      this.setState({ currentMusic: music.name });
    });
  }

  changeMusicPlay() {
    fetch(url + ':' + port + '/music/api/control/play', {
      method: 'POST',
      accept: 'application/json'
    }).then( (response) => {
      // May not work as Mopidy next() doesn't wait/return result and thus we may end up querying for a new song before it's actually switched
      // Basically Mopidy next() is a fake promise, again, switch to websocket!
      console.log("Switching to Play Mode.. ");
      // this.musicDataSource();
    });
  }

  changeMusicNext() {
    fetch(url + ':' + port + '/music/api/control/next', {
      method: 'POST',
      accept: 'application/json'
    }).then( (response) => {
      // May not work as Mopidy next() doesn't wait/return result and thus we may end up querying for a new song before it's actually switched
      // Basically Mopidy next() is a fake promise, again, switch to websocket!
      console.log("Switching to Next Song.. ");
      // this.musicDataSource();
    });
  }

  loadMusicPlay() {
    fetch(url + ':' + port + '/music/api/load?playlistid=spotify:user:spotify:playlist:2DIkzkPnHOIK6VtFPx8ciD', {
      method: 'POST',
      accept: 'application/json'
    }).then( (response) => {
      console.log("Loaded Playlist");
      // May not work if source is remote, and still switching to next song, server will respond with 400 for current song
      // Another reason to switch to websocket
      // this.musicDataSource();
    });
  }

  handleData(data) {
    // Should test if JSON
    let result = JSON.parse(data);
    // console.log(result);
    if (result.album) {
      console.log("Websocket - New Song: " + result.name);
      this.setState({ currentMusic: result.name });
    }
  }

  render() {
    return (
      <div className='App'>
        <div className='ui text container'>
      	  <h1>Current Music: {this.state.currentMusic}</h1>
      	  <h2>Next Music: {this.state.nextMusic}</h2>
          <button type="button" onClick={this.changeMusicPlay}>Play</button>
      	  <button type="button" onClick={this.changeMusicNext}>Next</button>
          <button type="button" onClick={this.loadMusicPlay}>Load Songs</button>

          <Websocket url="ws://192.168.1.60:5001/music/ws"
            onMessage={this.handleData.bind(this)}/>
        </div>
      </div>
    );
  }
}

export default App;
