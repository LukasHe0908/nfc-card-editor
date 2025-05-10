import NfcManager, { NfcTech } from 'react-native-nfc-manager';

export async function readMifareClassicBlock(
  sectorIndex = 0,
  keyA = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
  useStartUp = true,
  cancelTechRequest: boolean = false
) {
  try {
    if (useStartUp) {
      await NfcManager.start();
      await NfcManager.cancelTechnologyRequest();
    }
    await NfcManager.requestTechnology(NfcTech.MifareClassic);
    const tagInfo = await NfcManager.getTag();

    const mifare = NfcManager.mifareClassicHandlerAndroid;
    const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
    const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);

    const dataList: number[][] = [];

    try {
      await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);
      await action();
    } catch (eA) {
      console.log(`Can't Read Sector ${sectorIndex} ${eA}`);
      try {
        await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);
        await action();
      } catch (eB) {
        return { tag: tagInfo, data: `Can't Read Sector ${sectorIndex} ${eA} ${eB}` };
        throw new Error(`Can't Read Sector ${sectorIndex} ${eA} ${eB}`);
      }
    }
    async function action() {
      for (let i = 0; i < blockCount; i++) {
        const blockIndex = (blockStart as any) + i;
        const data = await mifare.mifareClassicReadBlock(blockIndex);
        dataList.push(data as any);
      }
    }

    return { tag: tagInfo, data: dataList };
  } catch (ex) {
    throw new Error(`NFC Read ${ex}`);
  } finally {
    if (cancelTechRequest) await NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export async function writeMifareClassicBlocks(
  sectorIndex = 1,
  keyA = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
  blockData: { [blockOffset: number]: number[] },
  useStartUp = true,
  cancelTechRequest: boolean = true
) {
  try {
    if (useStartUp) {
      await NfcManager.start();
      await NfcManager.cancelTechnologyRequest();
    }
    await NfcManager.requestTechnology(NfcTech.MifareClassic);

    const mifare = NfcManager.mifareClassicHandlerAndroid;
    const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
    const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);

    try {
      await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);
      await action();
    } catch (eA) {
      console.log(`Can't Write Sector ${sectorIndex} ${eA}`);
      try {
        await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);
        await action();
      } catch (eB) {
        throw new Error(`Can't Write Sector ${sectorIndex} ${eA} ${eB}`);
      }
    }
    async function action() {
      for (const [offsetStr, data] of Object.entries(blockData)) {
        const blockOffset = parseInt(offsetStr, 10);
        if (blockOffset < 0 || blockOffset >= blockCount) {
          throw new Error(`blockOffset ${blockOffset} 超出扇区范围`);
        }
        if (data.length !== 16) {
          throw new Error(`数据长度错误，block ${blockOffset} 不是16字节`);
        }

        const blockIndex = (blockStart as any) + blockOffset;
        await mifare.mifareClassicWriteBlock(blockIndex, data);
        console.log(`写入 block ${blockIndex} 成功`);
      }
    }

    console.log(`写入完成 sector ${sectorIndex}`);
  } catch (ex) {
    throw new Error(`NFC Write ${ex}`);
  } finally {
    if (cancelTechRequest) await NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
