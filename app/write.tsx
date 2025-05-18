import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Text, Surface, useTheme, Button, Chip, Dialog, Portal, ActivityIndicator, Snackbar, Banner } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { writeMifareClassicBlocksWithKeys } from '@/components/mifareClassic';
import { AESTool } from '@/components/crypt';

export default function WritePage() {
  const router = useRouter();
  const { colors } = useTheme();

  async function fetchAmountOptions() {
    setLoadingAmountOptions(true);
    try {
      const cacheKey = 'amountOptionsCache';
      const timestampKey = 'amountOptionsTimestamp';

      const cached = await AsyncStorage.getItem(cacheKey);
      const cachedTime = await AsyncStorage.getItem(timestampKey);

      const now = Date.now();
      const cacheTimeMax = 60 * 60 * 1000;

      if (cached && cachedTime && now - parseInt(cachedTime, 10) < cacheTimeMax) {
        setAmountOptions(JSON.parse(cached));
        setLoadingAmountOptions(false);
        return;
      }

      function decryptAndParse(text: string) {
        let decryptedData = AESTool.decrypt(text);
        const parsedOptions = JSON.parse(decryptedData);
        return parsedOptions;
      }

      const res = await fetch('https://dns.alidns.com/resolve?name=balance-data.nfc-reader.app.lukas1.eu.org&type=txt');
      const json = await res.json();
      let txtData = json.Answer?.[0]?.data;
      txtData = txtData.replaceAll(/"(.*?)"/g, '$1').replaceAll(' ', '');
      const parsedOptions = decryptAndParse(txtData);

      await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedOptions));
      await AsyncStorage.setItem(timestampKey, now.toString());

      setAmountOptions(parsedOptions);
    } catch (error) {
      console.error('获取金额选项失败', error);
      setAmountOptions(['failed']);
    } finally {
      setLoadingAmountOptions(false);
    }
  }

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
      description: '适用于未写入过数据卡片，例如新生成的空白卡。需要选择用户ID。',
    },
    {
      key: 'fix',
      label: '修复',
      icon: 'construct-outline',
      description: '适用于新卡写入一半失败。',
    },
  ];

  const [nfcEnabled, setNfcEnabled] = useState(true);
  const [amountOptions, setAmountOptions] = useState<any[]>([]);
  const [loadingAmountOptions, setLoadingAmountOptions] = useState(false);
  const [cardType, setCardType] = useState<'old' | 'new' | null>('old');
  const [amount, setAmount] = useState<number | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [writing, setWriting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userDialogVisible, setUserDialogVisible] = useState(false);

  useEffect(() => {
    fetchAmountOptions();
  }, []);

  useEffect(() => {
    let timer = undefined;
    (async () => {
      try {
        const nfcSupported = await NfcManager.isSupported();
        if (nfcSupported) {
          setNfcEnabled(await NfcManager.isEnabled());
          setInterval(async () => {
            setNfcEnabled(await NfcManager.isEnabled());
          }, 2000);
        } else {
          setNfcEnabled(false);
        }
      } catch (error) {
        console.error('NFC Initial', error);
        setNfcEnabled(false);
      }
    })();
    return () => {
      clearInterval(timer);
      // 自动取消扫描
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const selectedCard = cardOptions.find(item => item.key === cardType);

  async function handleWrite() {
    setConfirmVisible(false);
    setWriting(true);

    try {
      let optionMatches = amountOptions.find((item: any) => {
        return item.key === amount;
      });

      const hexString: string = optionMatches.data;
      const bytes = hexString.match(/.{1,2}/g)!.map(x => parseInt(x, 16));
      const key = (selectedCard?.key === 'old' ? '4E324C663430' : 'FFFFFFFFFFFF').match(/.{1,2}/g)!.map(x => parseInt(x, 16));
      const authBlock = '4E324C663430 FF078069 4E324C663430'
        .replaceAll(' ', '')
        .match(/.{1,2}/g)!
        .map(x => parseInt(x, 16));

      if (selectedCard?.key === 'new') {
        if (!selectedUserId) throw new Error('未选择用户');
        const selectedHistory = userHistory.find(item => item.userId === selectedUserId);
        if (!selectedHistory) throw new Error('未找到对应用户历史记录');
        const block0Bytes = selectedHistory.hexBlocks[0]
          .replaceAll(' ', '')
          .match(/.{1,2}/g)!
          .map((x: string) => parseInt(x, 16));

        await writeMifareClassicBlocksWithKeys({
          7: {
            keyA: key,
            blocks: {
              0: block0Bytes,
              1: bytes,
              2: bytes,
              3: authBlock,
            },
          },
          8: {
            keyA: key,
            blocks: {
              3: authBlock,
            },
          },
        });
      } else {
        await writeMifareClassicBlocksWithKeys({
          7: {
            keyA: key,
            blocks: {
              1: bytes,
              2: bytes,
            },
          },
        });
      }

      setSnackbarText(`写入成功: ${amount?.toFixed(2)} 到 ${selectedCard?.label}`);
    } catch (error: any) {
      console.error(error);
      setSnackbarText(`写入失败，请重试: ${error}`);
    } finally {
      setWriting(false);
      setSnackbarVisible(true);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Appbar.Header elevated={false}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title='写入数据' />
      </Appbar.Header>

      <ScrollView>
        <View style={{ padding: 16, paddingBottom: 80, flex: 1, gap: 16 }}>
          {nfcEnabled ? (
            <></>
          ) : (
            <Surface style={{ backgroundColor: colors.errorContainer, borderRadius: 16, padding: 16 }}>
              <Text>未启用NFC</Text>
            </Surface>
          )}
          {/* 卡片类型选择 */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.sectionTitle}>写入类型</Text>
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

          {/* 新卡选择用户ID */}
          {cardType === 'new' && (
            <Surface style={styles.card} elevation={1}>
              <Text style={styles.sectionTitle}>用户 ID</Text>
              {selectedUserId ? (
                <Text style={{ marginBottom: 12 }}>{selectedUserId}</Text>
              ) : (
                <Text style={{ marginBottom: 12, color: colors.onSurfaceVariant }}>未选择</Text>
              )}
              <Button
                mode='outlined'
                onPress={async () => {
                  const historyRaw = await AsyncStorage.getItem('history');
                  if (historyRaw) {
                    const parsed = JSON.parse(historyRaw);
                    const filtered = parsed.filter((item: any) => item.userId);
                    setUserHistory(filtered);
                  }
                  setUserDialogVisible(true);
                }}>
                选择
              </Button>
              <Portal>
                <Dialog visible={userDialogVisible} onDismiss={() => setUserDialogVisible(false)}>
                  <Dialog.Title>选择用户ID</Dialog.Title>
                  <Dialog.Content>
                    <ScrollView style={{ maxHeight: 300 }}>
                      {userHistory.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setSelectedUserId(item.userId);
                            setUserDialogVisible(false);
                          }}
                          style={{ paddingVertical: 8 }}>
                          <Text>{item.userId}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button onPress={() => setUserDialogVisible(false)}>关闭</Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </Surface>
          )}

          {/* 金额选择 */}
          <Surface style={styles.card} elevation={1}>
            <Text style={styles.sectionTitle}>金额</Text>
            {loadingAmountOptions ? (
              <ActivityIndicator />
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {amountOptions.map((item, index) => {
                  if (item === 'failed') {
                    return (
                      <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                        <Image
                          source={require('@/assets/svgs/wi-fi-disconnected.svg')}
                          style={{ width: 48, height: 48 }}
                          contentFit='contain'
                        />
                        <Text style={{ fontSize: 16 }}>获取失败</Text>
                        <Button
                          onPress={() => {
                            fetchAmountOptions();
                          }}>
                          重试
                        </Button>
                      </View>
                    );
                  }
                  const isSelected = amount === item.key;
                  return (
                    <Chip
                      key={index}
                      selected={isSelected}
                      onPress={() => setAmount(item.key)}
                      mode='outlined'
                      style={{
                        backgroundColor: isSelected ? colors.primaryContainer : undefined,
                      }}>
                      ¥{Number(item.key).toFixed(2)}
                    </Chip>
                  );
                })}
              </View>
            )}
          </Surface>

          {/* 写入按钮 */}
          <Button
            mode='contained'
            onPress={() => setConfirmVisible(true)}
            style={{ marginTop: 32 }}
            disabled={!cardType || amount === null || writing || (cardType === 'new' && !selectedUserId)}>
            {writing ? '写入中...' : '写入数据'}
          </Button>
          {writing && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <ActivityIndicator animating={true} size={32} />
              <Text>请将卡片贴近手机NFC区域</Text>
            </View>
          )}
        </View>
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
            <Button
              onPress={() => {
                handleWrite();
              }}>
              确认
            </Button>
          </Dialog.Actions>
        </Dialog>
        {/* 写入结果 Snackbar */}
        <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
          {snackbarText}
        </Snackbar>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
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
