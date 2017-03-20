import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MusicBox from './MusicBox';
import Avatar from 'material-ui/Avatar';

import {
  blue300,
  indigo900,
} from 'material-ui/styles/colors';

import LivingRoom from 'material-ui/svg-icons/content/weekend';
import Kitchen from 'material-ui/svg-icons/places/free-breakfast';
import Bedroom from 'material-ui/svg-icons/notification/airline-seat-flat';

// import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider>
        <div>
          <MusicBox name="The Boys' Room" host="192.168.1.60" avatar={
            <Avatar icon={<Bedroom />} color={blue300} backgroundColor={indigo900} size={50} />
          } />
          <MusicBox name="Kitchen" host="192.168.1.70" avatar={
            <Avatar icon={<Kitchen />} color={blue300} backgroundColor={indigo900} size={50}/>
          } />
          <MusicBox name="Living Room" host="192.168.1.3" avatar={
            <Avatar icon={<LivingRoom />} color={blue300} backgroundColor={indigo900} size={50}/>
          } />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
