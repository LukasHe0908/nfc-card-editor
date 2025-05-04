import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';

export default function Home() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1, marginTop: safeAreaInsets.top }}>
      <Text>Data</Text>
    </ScrollView>
  );
}
