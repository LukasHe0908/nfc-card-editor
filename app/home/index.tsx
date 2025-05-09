import { useEffect, useState, useCallback } from 'react';
import {
  Appbar,
  Surface,
  Text,
  Button,
  TouchableRipple,
  Avatar,
  useTheme,
  Snackbar,
  IconButton,
  ActivityIndicator,
  Chip,
  Portal,
  Dialog,
} from 'react-native-paper';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

// Pre-step, call this before any NFC operations
NfcManager.start();

export default function Component(props: any) {
  const [tagInfo, setTagInfo] = useState<any>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanFinished, setScanFinished] = useState(true); // 扫描流程是否结束（包括取消）
  const router = useRouter();
  const { colors } = useTheme();

  const [oringinInfoDialogVisible, setOringinInfoDialogVisible] = useState(false); // 扫描流程是否结束（包括取消）

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setNfcSupported(await NfcManager.isSupported());
        setNfcEnabled(await NfcManager.isEnabled());
      })();
      const timer = setInterval(async () => {
        setNfcEnabled(await NfcManager.isEnabled());
      }, 2000);
      return () => {
        clearInterval(timer);
        // 自动取消扫描
        setIsScanning(false);
        NfcManager.cancelTechnologyRequest().catch(() => {});
        setScanFinished(true);
      };
    }, [])
  );

  async function readMifareClassicBlock(
  sectorIndex = 0,
  keyA = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff]
) {
  try {
    await NfcManager.start();

    await NfcManager.requestTechnology(NfcTech.MifareClassic);
    const tagInfo = await NfcManager.getTag();

    const mifare = NfcManager.mifareClassicHandlerAndroid;

    const auth = await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);
    if (!auth) {
      throw new Error('认证失败');
    }

    const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
    const blockCount = await mifare.mifareClassicGetBlockCountInSector(sectorIndex);

    const dataList: number[][] = [];

    for (let i = 0; i < blockCount; i++) {
      const blockIndex = blockStart + i;
      const data = await mifare.mifareClassicReadBlock(blockIndex);
      dataList.push(data);
    }

    console.log(`读取成功 sector ${sectorIndex}:`, dataList);
    return { tag: tagInfo, data: dataList };
  } catch (ex) {
    console.warn('读取失败:', ex);
  } finally {
    // 注意：建议释放资源，避免技术请求挂起
    // await NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

  const startScan = async () => {
  if (!scanFinished) return;
  setTagInfo(null);
  setIsScanning(true);
  setScanFinished(false);

  try {
    await NfcManager.cancelTechnologyRequest().catch(() => {});

    const key = '4E324C663430'.match(/.{1,2}/g)!.map(b => parseInt(b, 16));
    const result = await readMifareClassicBlock(7, key);

    if (result?.data) {
      // 转换为十六进制字符串
      const hexBlocks = result.data.map(block =>
        block.map(byte => byte.toString(16).padStart(2, '0')).join(' ')
      );

      // 提取用户 ID（block1 第2-3字节，大端）
      let userId: number | null = null;
      const block1 = result.data[0];
      if (block1?.length >= 3) {
        userId = (block1[1] << 8) | block1[2];
      }

      // 提取余额（block2 前4字节，大端）
      let balance: number | null = null;
      const block2 = result.data[1];
      if (block2?.length >= 4) {
        balance =
          (block2[0] << 24) |
          (block2[1] << 16) |
          (block2[2] << 8) |
          block2[3];
        balance = balance / 100
      }

      // 整理 summary
      result.summary = {
        userId,
        balance,
        hexBlocks,
      };
    }

    console.log('result', result);
    setTagInfo(result);
  } catch (e) {
    console.warn('Scan error or cancelled', e);
  } finally {
    setIsScanning(false);
    await NfcManager.cancelTechnologyRequest().catch(() => {});
    setScanFinished(true);
  }
};

  const toggleScan = () => {
    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };

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
      <ScrollView style={{ marginTop: 20, paddingHorizontal: 12 }}>
        <Surface style={styles.card} mode='flat' elevation={2}>
          <View style={styles.row}>
            <Text style={styles.title}>数据</Text>
            <Text style={{ fontSize: 14 }}>{new Date().toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>卡片ID：</Text>
            <Text style={styles.value}>{tagInfo?.tag?.id || '等待读取'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>用户ID：</Text>
            <Text style={styles.value}>{tagInfo?.summary?.userId || '---'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>余额：</Text>
            <Text style={styles.value}>{tagInfo?.summary?.balance || '---'}</Text>
          </View>
          <View style={{ marginTop: 8, alignItems: 'flex-start' }}>
            <Chip icon='information' mode='outlined' onPress={() => setOringinInfoDialogVisible(true)}>
              原始信息
            </Chip>
            <OringinInfoDialog visible={oringinInfoDialogVisible} setVisible={setOringinInfoDialogVisible} copyJson={tagInfo}>
              <Text>{JSON.stringify(tagInfo, null, 2)}</Text>
            </OringinInfoDialog>
          </View>
          <View style={{ flex: 1, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Button
              icon={scanFinished ? 'nfc' : 'close'}
              mode='contained-tonal'
              onPress={toggleScan}
              style={{ flexGrow: 1 }}
              loading={!isScanning && !scanFinished}
              disabled={(!isScanning && !scanFinished) || !nfcEnabled}>
              {nfcEnabled ? (isScanning ? '取消' : scanFinished ? '读取' : '完成中') : '未开启NFC'}
            </Button>
            <IconButton icon='content-save' mode='contained' style={{ margin: 0 }}></IconButton>
          </View>
        </Surface>
        <Button icon='pencil' mode='contained' onPress={() => router.push('/write')} style={{ marginTop: 20 }}>
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

function OringinInfoDialog(props: any) {
  const visible = props?.visible;
  const setVisible = props?.setVisible;
  const copyText = props?.copyText;
  const copyJson = props?.copyJson;
  const hideDialog = () => setVisible(false);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>原始信息</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>{props?.children}</ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button
            onPress={async () => {
              if (copyText) {
                await Clipboard.setStringAsync(copyText);
              } else if (copyJson) {
                await Clipboard.setStringAsync(JSON.stringify(copyText));
              }
            }}>
            复制
          </Button>
          <Button onPress={() => hideDialog()}>完成</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 12,
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
  },
});
