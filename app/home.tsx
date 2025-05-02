import { useEffect, useState } from 'react';
import { Surface, Text } from 'react-native-paper';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

// Pre-step, call this before any NFC operations
NfcManager.start();

export default function Home() {
  const [tagInfo, setTagInfo] = useState<any>(null);

  useEffect(() => {
    let isActive = true;

    async function scanLoop() {
      while (isActive) {
        try {
          await NfcManager.requestTechnology(NfcTech.Ndef);
          const tag = await NfcManager.getTag();
          console.log('Tag found', tag);
          setTagInfo(tag); // 设置读取到的数据
        } catch (ex) {
          console.log('Scan failed or cancelled', ex);
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
  }, []);

  return (
    <View style={{ marginTop: 20, alignItems: 'center' }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '90%',
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
