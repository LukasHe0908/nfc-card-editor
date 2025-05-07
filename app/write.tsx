import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Appbar, Text, Surface, useTheme, Button, Chip,
  Dialog, Portal, ActivityIndicator, Snackbar
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WritePage() {
  const router = useRouter();
  const { colors } = useTheme();

  const [cardType, setCardType] = useState<'old' | 'new' | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [writing, setWriting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');

  const cardOptions = [
    {
      key: 'old',
      label: '旧卡',
      icon: 'credit-card-outline',
      description: '适用于2019年前的M1卡片，如校园卡、饭卡等。',
    },
    {
      key: 'new',
      label: '新卡',
      icon: 'credit-card-chip-outline',
      description: '适用于新版支持加密的IC卡，安全性更高。',
    },
  ];

  const amountOptions = [1.00, 4.00, 10.00, 16.00];
  const selectedCard = cardOptions.find(item => item.key === cardType);

  const handleWrite = async () => {
    setConfirmVisible(false);
    setWriting(true);

    try {
      // 模拟写入流程
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟2秒写入时间
      setSnackbarText(`写入成功：¥${amount?.toFixed(2)} 到 ${selectedCard?.label}`);
    } catch (error) {
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
        <Appbar.Content title="写入数据" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 卡片类型选择 */}
        <Surface style={styles.card} elevation={2}>
          <Text style={styles.sectionTitle}>卡片类型</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionRow}>
            {cardOptions.map((item) => {
              const isSelected = cardType === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setCardType(item.key as 'old' | 'new')}
                  style={[
                    styles.optionItem,
                    {
                      borderColor: isSelected ? colors.primary : '#ccc',
                      backgroundColor: isSelected ? colors.primaryContainer : '#fff',
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color={isSelected ? colors.primary : '#555'}
                  />
                  <Text style={[styles.optionLabel, { color: isSelected ? colors.primary : '#333' }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedCard && (
            <Text style={[styles.optionDescription, { marginTop: 12 }]}>
              {selectedCard.description}
            </Text>
          )}
        </Surface>

        {/* 金额选择 */}
        <Surface style={[styles.card, { marginTop: 20 }]} elevation={2}>
          <Text style={styles.sectionTitle}>金额</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {amountOptions.map((amt) => (
              <Chip
                key={amt}
                selected={amount === amt}
                onPress={() => setAmount(amt)}
                mode="outlined"
                style={{
                  backgroundColor: amount === amt ? colors.primaryContainer : undefined,
                }}
              >
                ¥{amt.toFixed(2)}
              </Chip>
            ))}
          </View>
        </Surface>

        {/* 写入按钮 */}
        <Button
          mode="contained"
          onPress={() => setConfirmVisible(true)}
          style={{ marginTop: 32 }}
          disabled={!cardType || amount === null || writing}
        >
          {writing ? '写入中...' : '写入数据'}
        </Button>

        {writing && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <ActivityIndicator animating={true} size={32} />
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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
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
    color: '#666',
    textAlign: 'left',
  },
});
