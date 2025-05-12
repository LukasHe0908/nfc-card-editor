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


export async function readMifareClassicBlocksWithKeys(
  keyMap: { [sectorIndex: number]: number[] }, // sectorIndex -> keyA
  useStartUp = true,
  cancelTechRequest: boolean = true
) {
  try {
    if (useStartUp) {
      await NfcManager.start();
      await NfcManager.cancelTechnologyRequest();
    }

    await NfcManager.requestTechnology(NfcTech.MifareClassic);
    const tagInfo = await NfcManager.getTag();
    const mifare = NfcManager.mifareClassicHandlerAndroid;
    const result: { [sectorIndex: number]: number[][] | string } = {};

    for (const [sectorIndexStr, keyA] of Object.entries(keyMap)) {
      const sectorIndex = parseInt(sectorIndexStr, 10);
      try {
        const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
        const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);

        await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);

        const dataList: number[][] = [];
        for (let i = 0; i < blockCount; i++) {
          const blockIndex = (blockStart as any) + i;
          const data = await mifare.mifareClassicReadBlock(blockIndex);
          dataList.push(data as number[]);
        }

        result[sectorIndex] = dataList;
      } catch (err) {
        console.log(`读取扇区 ${sectorIndex} 失败: ${err}`);
        result[sectorIndex] = `读取失败: ${err}`;
      }
    }

    return { tag: tagInfo, data: result };

  } catch (ex) {
    throw new Error(`NFC Read Error: ${ex}`);
  } finally {
    if (cancelTechRequest) {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
   
    }
  }
}

export async function writeMifareClassicBlocksWithKeys(
  dataMap: {
    [sectorIndex: number]: {
      keyA: number[],
      blocks: { [blockOffset: number]: number[] }  // blockOffset 相对于该扇区
    }
  },
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
    const writeResults: { [sectorIndex: number]: string } = {};

    for (const [sectorIndexStr, sectorData] of Object.entries(dataMap)) {
      const sectorIndex = parseInt(sectorIndexStr, 10);
      const { keyA, blocks } = sectorData;

      try {
        const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
        const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);

        await mifare.mifareClassicAuthenticateA(sectorIndex, keyA);

        for (const [offsetStr, data] of Object.entries(blocks)) {
          const blockOffset = parseInt(offsetStr, 10);
          if (blockOffset < 0 || blockOffset >= blockCount) {
            throw new Error(`blockOffset ${blockOffset} 超出扇区 ${sectorIndex} 范围`);
          }
          if (data.length !== 16) {
            throw new Error(`扇区 ${sectorIndex} 的 block ${blockOffset} 数据长度不是16字节`);
          }

          const blockIndex = (blockStart as any) + blockOffset;
          await mifare.mifareClassicWriteBlock(blockIndex, data);
          console.log(`写入 block ${blockIndex} 成功`);
        }

        writeResults[sectorIndex] = '写入成功';
      } catch (err) {
        console.log(`写入扇区 ${sectorIndex} 失败: ${err}`);
        writeResults[sectorIndex] = `写入失败: ${err}`;
      }
    }

    console.log('写入完成');
    return writeResults;

  } catch (ex) {
    throw new Error(`NFC Write Error: ${ex}`);
  } finally {
    if (cancelTechRequest) {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  }
}
