import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>首页</Text>
      <Button title="跳转到详情页" onPress={() => router.push('/detail')} />
    </View>
  );
}
