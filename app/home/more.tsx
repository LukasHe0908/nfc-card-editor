import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Divider, Avatar, Icon, TouchableRipple, useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialSwitch } from '@/components/MaterialSwitch';

export default function Wrapper() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Component></Component>
    </View>
  );
}

export function Component() {
  let [isLogin, setIsLogin] = useState(false);
  const safeAreaInsets = useSafeAreaInsets();
  const { colors } = useTheme();
  // , borderColor: '#f00', borderWidth: 1

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, marginTop: safeAreaInsets.top }}>
      <View style={{ paddingHorizontal: 8, paddingVertical: 22, flex: 1, alignItems: 'center' }}>
        <Image source={require('@/assets/svgs/icon.svg')} style={{ width: 100, height: 100 }} contentFit='contain' />
      </View>
      <Divider style={{ height: 0.8 }} />
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View
          style={{ paddingHorizontal: 16, paddingVertical: 16, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 }}
          onTouchEnd={() => {
            setIsLogin(!isLogin);
          }}>
          {isLogin ? (
            <Image
              source={{ uri: 'https://picsum.photos/200' }}
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                borderColor: colors.primaryContainer,
                borderWidth: 0.5,
                backgroundColor: colors.primary,
              }}
            />
          ) : (
            <Icon source='account-circle-outline' color={colors.primary} size={42} />
          )}
          <Text style={{ fontSize: 24, flexGrow: 1 }}>{isLogin ? 'Anonymouse' : '登录/注册'}</Text>
          <Icon source='chevron-right' size={24} color={colors.onBackground} />
        </View>
      </TouchableRipple>
      <Divider style={{ height: 0.8 }} />
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Icon source='cloud-off-outline' color={colors.primary} size={26} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text variant='bodyLarge'>离线模式</Text>
            <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
              缓存数据到本地
            </Text>
          </View>
          <MaterialSwitch selected={false} onPress={() => {}} disabled={false} />
        </View>
      </TouchableRipple>
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Icon source='glasses' color={colors.primary} size={26} />
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <Text variant='bodyLarge'>无痕模式</Text>
            <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
              你的读写不会被保存
            </Text>
          </View>
          <MaterialSwitch selected={false} onPress={() => {}} />
        </View>
      </TouchableRipple>
      <Divider style={{ height: 0.8 }} />
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Icon source='cog-outline' color={colors.primary} size={26} />
          <Text variant='bodyLarge'>设置</Text>
        </View>
      </TouchableRipple>
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Icon source='information-outline' color={colors.primary} size={26} />
          <Text variant='bodyLarge'>关于</Text>
        </View>
      </TouchableRipple>
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Icon source='help-circle-outline' color={colors.primary} size={26} />
          <Text variant='bodyLarge'>帮助</Text>
        </View>
      </TouchableRipple>
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Icon source='message-reply-outline' color={colors.primary} size={26} />
          <Text variant='bodyLarge'>提交反馈</Text>
        </View>
      </TouchableRipple>
      <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
        <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
          <Icon source='vector-intersection' color={colors.primary} size={26} />
          <Text variant='bodyLarge'>Wiki</Text>
        </View>
      </TouchableRipple>
      {isLogin ? (
        <View>
          <Divider style={{ height: 0.8 }} />
          <TouchableRipple rippleColor='rgba(0, 0, 0, .1)' onPress={() => {}}>
            <View style={{ marginVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <Icon source='exit-to-app' color={colors.primary} size={26} />
              <Text variant='bodyLarge'>退出账号</Text>
            </View>
          </TouchableRipple>
        </View>
      ) : (
        <View></View>
      )}
    </ScrollView>
  );
}
