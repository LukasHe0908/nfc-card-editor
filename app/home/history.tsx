import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Appbar, Text, useTheme, TouchableRipple, Button, Surface, Portal, Dialog, Snackbar, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

async function readHistory() {
  try {
    const historyStorage = await AsyncStorage.getItem('history');
    if (historyStorage) {
      const historyArray = JSON.parse(historyStorage);
      return historyArray;
    } else {
      return [];
    }
  } catch (e: any) {
    console.error(`读取错误: ${e.toString()}`);
    return [];
  }
}
async function clearHistory() {
  try {
    await AsyncStorage.removeItem('history');
    return true;
  } catch (e: any) {
    return false;
  }
}

export default function Wrapper() {
  const { colors } = useTheme();
  const [clearHistoryConfirmVisible, setClearHistoryConfirmVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header elevated={false}>
        <Appbar.Content title={'历史'} />
        <TouchableRipple
          onPress={() => {
            setClearHistoryConfirmVisible(true);
          }}
          borderless
          rippleColor='rgba(0, 0, 0, 0.05)'
          style={{ borderRadius: 999999, padding: 6 }}>
          <MaterialCommunityIcons name={'delete-sweep-outline'} size={24} color={colors.onBackground} />
        </TouchableRipple>
        <View style={{ paddingRight: 8 }}></View>
      </Appbar.Header>
      <Portal>
        <Dialog visible={clearHistoryConfirmVisible} onDismiss={() => setClearHistoryConfirmVisible(false)}>
          <Dialog.Title>全部删除</Dialog.Title>
          <Dialog.Content>
            <Text>全部历史记录将被删除。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearHistoryConfirmVisible(false)}>取消</Button>
            <Button
              onPress={async () => {
                setClearHistoryConfirmVisible(false);
                const result = await clearHistory();
                setSnackbarText(result ? '删除成功' : '删除失败，请重试');
                setSnackbarVisible(true);
              }}>
              确认
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarText}
      </Snackbar>
      <Component></Component>
    </View>
  );
}

export function Component() {
  const [history, setHistory] = useState<object[]>([]);

  useEffect(() => {
    (async () => {
      const history = await readHistory();
      setHistory(history);
    })();
  });

  return (
    <ScrollView>
      <Surface elevation={0} style={{ flex: 1, gap: 0, flexDirection: 'column' }}>
        {history.map((item: any, index) => (
          <>
            <TouchableRipple key={index} onPress={() => {}} style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              <Surface elevation={0}>
                {/* <Text>{JSON.stringify(item)}</Text> */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>卡片ID： </Text>
                  <Text style={{ fontSize: 16 }}>{item?.cardId}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>用户ID： </Text>
                  <Text style={{ fontSize: 16 }}>{item?.userId}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>余额： </Text>
                  <Text style={{ fontSize: 16 }}>{(typeof item?.balance === 'number' && (item?.balance).toFixed(2)) || '---'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>读取时间： </Text>
                  <Text style={{ fontSize: 16 }}>{new Date(item?.storageTime).toLocaleString()}</Text>
                </View>
              </Surface>
            </TouchableRipple>
            <Divider></Divider>
          </>
        ))}
      </Surface>
    </ScrollView>
  );
}
