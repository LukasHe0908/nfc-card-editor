import { View, StyleSheet } from 'react-native';
import * as React from 'react';
import { Appbar, Avatar, BottomNavigation, Text, Icon } from 'react-native-paper';
import Home from './home';
import Data from './data';
import History from './history';
import More from './more';

export default function App() {
  const [index, setIndex] = React.useState(0);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated={true}>
        <Appbar.Content title={'水卡编辑器'} />
        <Avatar.Image
          size={36}
          source={{ uri: 'https://picsum.photos/200' }}
          onTouchEnd={() => {
            setIndex(3);
          }}
        />
      </Appbar.Header>
      <Router index={index} setIndex={setIndex}></Router>
    </View>
  );
}

function Router({ index, setIndex }: any) {
  const [routes] = React.useState([
    { key: 'home', title: '主页', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'dataManage', title: '数据管理', focusedIcon: 'cloud' },
    { key: 'recents', title: '历史', focusedIcon: 'history' },
    { key: 'more', title: '更多', focusedIcon: 'dots-horizontal' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: Home,
    dataManage: Data,
    recents: History,
    more: More,
  });

  return (
    <BottomNavigation sceneAnimationEnabled={true} navigationState={{ index, routes }} onIndexChange={setIndex} renderScene={renderScene} />
  );
}
