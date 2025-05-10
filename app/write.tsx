import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Text, Surface, useTheme, Button, Chip, Dialog, Portal, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export default function WritePage() {
  const router = useRouter();
  const { colors } = useTheme();

  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [cardType, setCardType] = useState<'old' | 'new' | null>('old');
  const [amount, setAmount] = useState<number | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [writing, setWriting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  useEffect(() => {
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
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const cardOptions = [
    {
      key: 'old',
      label: '旧卡',
      icon: 'credit-card-outline',
      description: '适用于已写入过数据、有金额的Mifare Classic卡片。',
    },
    {
      key: 'new',
      label: '新卡',
      icon: 'credit-card-chip-outline',
      description: '适用于未写入过数据卡片，例如新生成的空白卡。目前此选项不可用。',
    },
  ];

  const amountOptions = [
    { key: 0, data: '0000000000006784FFFFFFFF01EBF900' },
    { key: 16, data: '0000064000006144FFFFF9BF01C33500' },
  ];
  const selectedCard = cardOptions.find(item => item.key === cardType);

  async function writeMifareClassicBlocks(
    sectorIndex = 7,
    keyA = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
    blockData: { [blockOffset: number]: number[] },
    cancelTechRequest: boolean = true
  ) {
    try {
      await NfcManager.start();
      await NfcManager.requestTechnology(NfcTech.MifareClassic);

      const mifare = NfcManager.mifareClassicHandlerAndroid;
      try {
        await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);
      } catch (error: any) {
        throw new Error(error);
      }

      const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
      const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);

      for (const [offsetStr, data] of Object.entries(blockData)) {
        const blockOffset = parseInt(offsetStr, 10);
        const blockIndex = (blockStart as any) + blockOffset;

        if (data.length !== 16) {
          throw new Error(`数据长度错误，block ${blockOffset} 不是16字节`);
        }

        await mifare.mifareClassicWriteBlock(blockIndex, data);
        console.log(`写入 block ${blockIndex} 成功`);
      }

      console.log(`写入完成 sector ${sectorIndex}`);
    } catch (ex) {
      throw new Error(`NFC Write ${ex}`);
    } finally {
      if (cancelTechRequest) await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  }

  const handleWrite = async () => {
    setConfirmVisible(false);
    setWriting(true);
    console.log(selectedCard, amount);

    try {
      const sector = 7;
      const hexString = '0000064000006144FFFFF9BF01C33500';
      const bytes = hexString.match(/.{1,2}/g)!.map(x => parseInt(x, 16));
      const keyA = (selectedCard?.key === 'old' ? '4E324C663430' : 'FFFFFFFFFFFF').match(/.{1,2}/g)!.map(x => parseInt(x, 16));
      await writeMifareClassicBlocks(sector, keyA, {
        1: bytes,
        2: bytes,
      });

      setSnackbarText(`写入成功：${amount?.toFixed(2)} 到 ${selectedCard?.label}`);
    } catch (error: any) {
      console.error(error);
      setSnackbarText('写入失败，请重试');
    } finally {
      setWriting(false);
      setSnackbarVisible(true);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header elevated={false}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title='写入数据' />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 卡片类型选择 */}
        <Surface style={styles.card} elevation={2}>
          <Text style={styles.sectionTitle}>卡片类型</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
            {cardOptions.map(item => {
              const isSelected = cardType === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setCardType(item.key as 'old' | 'new')}
                  style={[
                    styles.optionItem,
                    {
                      borderColor: isSelected ? colors.primary : colors.outline,
                      backgroundColor: isSelected ? colors.primaryContainer : 'transparent',
                    },
                  ]}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color={isSelected ? colors.primary : colors.onSurface} />
                  <Text style={[styles.optionLabel, { color: isSelected ? colors.primary : colors.onSurface }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedCard && (
            <Text style={[styles.optionDescription, { marginTop: 12, color: colors.onSurface }]}>{selectedCard.description}</Text>
          )}
        </Surface>

        {/* 金额选择 */}
        <Surface style={[styles.card, { marginTop: 20 }]} elevation={2}>
          <Text style={styles.sectionTitle}>金额</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {amountOptions.map(item => {
              const isSelected = amount === item.key;
              return (
                <Chip
                  key={item.key}
                  selected={isSelected}
                  onPress={() => setAmount(item.key)}
                  mode='outlined'
                  style={{
                    backgroundColor: isSelected ? colors.primaryContainer : undefined,
                  }}>
                  ¥{item.key.toFixed(2)}
                </Chip>
              );
            })}
          </View>
        </Surface>

        {/* 写入按钮 */}
        <Button
          mode='contained'
          onPress={() => setConfirmVisible(true)}
          style={{ marginTop: 32 }}
          disabled={!cardType || amount === null || writing}>
          {writing ? '写入中...' : '写入数据'}
        </Button>

        {writing && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <ActivityIndicator animating={true} size={32} />
            <Text>请将卡片贴近手机NFC区域</Text>
          </View>
        )}
      </ScrollView>

      {/* 确认写入提示框 */}
      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>确认写入？</Dialog.Title>
          <Dialog.Content>
            <Text>
              将写入 <Text style={{ fontWeight: 'bold' }}>¥{amount?.toFixed(2)}</Text> 到
              <Text style={{ fontWeight: 'bold' }}> {selectedCard?.label}</Text>
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>取消</Button>
            <Button onPress={handleWrite}>确认</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 写入结果 Snackbar */}
      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
        {snackbarText}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
  },
  optionItem: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 100,
  },
  optionLabel: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'left',
  },
});
