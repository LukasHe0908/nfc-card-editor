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
            <Text>确定要删除全部记录吗？</Text>
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
  const { colors } = useTheme();
  const [history, setHistory] = useState<object[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [jsonDialogVisible, setJsonDialogVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  useEffect(() => {
    (async () => {
      const history = await readHistory();
      setHistory(history);
    })();
  });

  return (
    <ScrollView>
      <View  style={{ flex: 1, gap: 0, flexDirection: 'column' }}>
        {history.map((item: any, index) => (
          <View key={index}>
            <TouchableRipple
              onPress={() => {
                setSelectedItem(item);
                setJsonDialogVisible(true);
              }}
              style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View>
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
                </View>
                <TouchableRipple
                  onPress={() => {
                    setDeleteIndex(index);
                    setDeleteConfirmVisible(true);
                  }}
                  borderless
                  rippleColor='rgba(0,0,0,0.1)'
                  style={{ borderRadius: 999999, padding: 8, marginLeft: 8 }}>
                  <MaterialCommunityIcons name='delete-outline' size={24} color={colors.onBackground} />
                </TouchableRipple>
              </View>
            </TouchableRipple>
            <Divider></Divider>
          </View>
        ))}
      </View>
      <Portal>
        <Dialog visible={jsonDialogVisible} onDismiss={() => setJsonDialogVisible(false)}>
          <Dialog.Title>详细数据</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ paddingHorizontal: 24, maxHeight: 400 }}>
              <Text style={{ fontFamily: 'monospace' }}>{JSON.stringify(selectedItem, null, 2)}</Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setJsonDialogVisible(false)}>关闭</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog
          visible={deleteConfirmVisible}
          onDismiss={() => {
            setDeleteConfirmVisible(false);
            setDeleteIndex(null);
          }}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除这条记录吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDeleteConfirmVisible(false);
                setDeleteIndex(null);
              }}>
              取消
            </Button>
            <Button
              onPress={async () => {
                if (deleteIndex !== null) {
                  const updatedHistory = history.filter((_, i) => i !== deleteIndex);
                  setHistory(updatedHistory);
                  await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));
                  setSnackbarText('删除成功');
                  setSnackbarVisible(true);
                }
                setDeleteConfirmVisible(false);
                setDeleteIndex(null);
              }}>
              确认
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarText}
      </Snackbar>
    </ScrollView>
  );
}
