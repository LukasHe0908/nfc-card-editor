import { ScrollView, View, StyleSheet, Pressable, BackHandler } from 'react-native';
import { useEffect, useState } from 'react';
import { Appbar, Avatar, BottomNavigation, Text, Icon, TouchableRipple } from 'react-native-paper';
import Home from './home/home';
import Data from './home/data';
import History from './home/history';
import More from './home/more';

export default function App() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const backAction = () => {
      if (index !== 0) {
        setIndex(0);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Cleanup the event listener
  }, [index]);

  return (
    <View style={{ flex: 1 }}>
      <Router index={index} setIndex={setIndex}></Router>
    </View>
  );
}

function Router({ index, setIndex }: any) {
  const [routes] = useState([
    { key: 'home', title: '主页', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'dataManage', title: '数据管理', focusedIcon: 'cloud', unfocusedIcon: 'cloud-outline'  },
    { key: 'recents', title: '历史', focusedIcon: 'history' },
    { key: 'more', title: '更多', focusedIcon: 'dots-horizontal' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: () => {
      return <Home setIndex={setIndex} />;
    },
    dataManage: Data,
    recents: History,
    more: More,
  });

  return (
    <BottomNavigation
      sceneAnimationEnabled={true}
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      style={{ flex: 1 }}
    />
  );
}
