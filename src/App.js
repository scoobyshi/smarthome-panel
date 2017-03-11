import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MusicBox from './MusicBox';

import livingAvatar from './images/livingroom.jpeg';
import roomAvatar from './images/charizard.jpeg';
import kitchenAvatar from './images/kitchen2.jpeg';

// import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
 
class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>
          <MusicBox name="The Boys' Room" host="192.168.1.60" avatar={roomAvatar}/>
          <MusicBox name="Kitchen" host="192.168.1.70" avatar={kitchenAvatar}/>
          <MusicBox name="Living Room" host="192.168.1.3" avatar={livingAvatar}/>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
