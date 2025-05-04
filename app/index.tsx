import { useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { View } from 'react-native';

export default function Index() {
  const { colors } = useTheme();
  const ViewRef = useRef(null) as any;
  useEffect(() => {
    if (ViewRef.current) {
      setTimeout(() => {
        router.replace('/home');
      }, 0);
    }
  }, [ViewRef.current]);

  return <View style={{ backgroundColor: colors.background }} ref={ViewRef}></View>;
}
