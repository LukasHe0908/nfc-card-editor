import { ScrollView, View, StyleSheet, Pressable, BackHandler } from 'react-native';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Home from '.';
import Data from './data';
import History from './history';
import More from './more';

export default function App() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Router></Router>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function Router() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        tabBar={({ navigation, state, descriptors, insets }) => (
          <BottomNavigation.Bar
            navigationState={state}
            safeAreaInsets={insets}
            onTabPress={({ route, preventDefault }) => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (event.defaultPrevented) {
                preventDefault();
              } else {
                navigation.dispatch({
                  ...CommonActions.navigate(route.name, route.params),
                  target: state.key,
                });
              }
            }}
            renderIcon={({ route, focused, color }) =>
              descriptors[route.key].options.tabBarIcon?.({
                focused,
                color,
                size: 24,
              }) || null
            }
            getLabelText={({ route }) => {
              const { options } = descriptors[route.key];
              const label =
                typeof options.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : typeof options.title === 'string'
                  ? options.title
                  : route.name;

              return label;
            }}
          />
        )}>
        <Tab.Screen
          name='主页'
          component={Home}
          options={{
            tabBarIcon: ({ focused, color }) => <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} color={color} size={26} />,
          }}
        />
        <Tab.Screen
          name='数据管理'
          component={Data}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <MaterialCommunityIcons name={focused ? 'cloud' : 'cloud-outline'} color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name='历史'
          component={History}
          options={{
            tabBarIcon: ({ focused, color }) => <MaterialCommunityIcons name='history' color={color} size={26} />,
          }}
        />
        <Tab.Screen
          name='更多'
          component={More}
          options={{
            tabBarIcon: ({ focused, color }) => <MaterialCommunityIcons name='dots-horizontal' color={color} size={26} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
