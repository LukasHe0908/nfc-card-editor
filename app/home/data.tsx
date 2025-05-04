import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';

export default function Wrapper() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Component></Component>
    </View>
  );
}

export function Component() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ScrollView style={{ flex: 1, marginTop: safeAreaInsets.top }}>
      <Text>Data</Text>
    </ScrollView>
  );
}
