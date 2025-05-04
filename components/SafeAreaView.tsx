import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Temporary component instead of SafeAreaView from react-native-safe-area-context
export function TempSafeAreaView({ children, style }: any) {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        paddingTop: safeAreaInsets.top,
        ...style,
      }}>
      {children}
    </View>
  );
}
