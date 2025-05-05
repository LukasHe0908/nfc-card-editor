import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name='home'
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name='home' size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name='test'
        options={{
          title: '测试',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name='bug' size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name='test2'
        options={{
          title: '测试2',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name='bug' size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
