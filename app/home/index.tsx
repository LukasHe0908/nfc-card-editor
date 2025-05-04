import { useEffect, useState } from 'react';
import { Appbar, Surface, Text, Button, TouchableRipple, Avatar, useTheme, Snackbar } from 'react-native-paper';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useFocusEffect } from '@react-navigation/native';

// Pre-step, call this before any NFC operations
NfcManager.start();

export default function Component(props: any) {
  const [tagInfo, setTagInfo] = useState<any>(null);
  const router = useRouter();
  const { colors } = useTheme();

  useFocusEffect(() => {
    let isActive = true;

    async function scanLoop() {
      console.log('starting from useEffect');
      while (isActive) {
        try {
          await NfcManager.requestTechnology(NfcTech.Ndef);
          const tag = await NfcManager.getTag();
          console.log('Tag found', tag);
          setTagInfo(tag); // 设置读取到的数据
        } catch (ex: any) {
          if (ex.toString().includes('TypeError')) isActive = false;
          console.log('Scan failed or cancelled', ex.toString());
        } finally {
          await NfcManager.cancelTechnologyRequest();
        }
      }
    }

    scanLoop();

    return () => {
      console.log('returning from useEffect');

      isActive = false;
      NfcManager.cancelTechnologyRequest();
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header elevated={false}>
        <Appbar.Content title={'主页'} />
        <TouchableRipple
          onPress={() => {
            const goToMore = () => {
              props.navigation?.navigate('更多');
            };
            setTimeout(() => {
              goToMore();
            }, 100);
          }}
          borderless
          rippleColor='rgba(0, 0, 0, 0.1)'
          style={{ borderRadius: 999999 }}>
          <Image
            source={{ uri: 'https://picsum.photos/200' }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              borderColor: colors.primaryContainer,
              borderWidth: 0.5,
              backgroundColor: colors.primary,
            }}
          />
        </TouchableRipple>
        <View style={{ paddingRight: 12 }}></View>
      </Appbar.Header>
      <ScrollView style={{ marginTop: 20, paddingHorizontal: 20 }} contentInsetAdjustmentBehavior={'always'}>
        <Surface style={styles.card} mode='flat' elevation={2}>
          <View style={styles.row}>
            <Text style={styles.title}>数据</Text>
            <Text style={{ fontSize: 14 }}>{new Date().toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>卡片ID：</Text>
            <Text style={styles.value}>{tagInfo?.id || '等待扫描...'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>卡ID：</Text>
            <Text style={styles.value}>{tagInfo?.type || '---'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>余额：</Text>
            <Text style={styles.value}>--</Text>
          </View>
        </Surface>
        <Button icon='pencil' mode='contained' onPress={() => router.push('/home')} style={{ marginTop: 20 }}>
          写入数据
        </Button>
        <Button mode='contained-tonal' onPress={() => router.push('/tabs/home')} style={{ marginTop: 20 }}>
          Test: To Tabs
        </Button>
        <Button mode='contained-tonal' onPress={() => router.push('/home')} style={{ marginTop: 20 }}>
          Test: To This Page
        </Button>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#888',
            paddingVertical: 40,
          }}>{`Alpha 1.0.0\n注意：Alpha版本仅用于测试。\n您的使用数据将会发送至Sentry，这将帮助我们更好地提供服务。`}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
