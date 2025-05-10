import NfcManager, { NfcTech } from 'react-native-nfc-manager';

// export async function readMifareClassicBlock(
//   sectorIndex = 0,
//   keys: { A?: number[]; B?: number[] } = { A: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], B: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff] },
//   cancelTechRequest: boolean = false
// ) {
//   try {
//     await NfcManager.start();
//     await NfcManager.requestTechnology(NfcTech.MifareClassic);
//     const tagInfo = await NfcManager.getTag();

//     const mifare = NfcManager.mifareClassicHandlerAndroid;
//     const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
//     const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);

//     const dataList: number[][] = [];

//     try {
//       await mifare.mifareClassicAuthenticateA(sectorIndex, keys.A!);
//       await action();
//     } catch (eA) {
//       console.log(`Can't use Key A Read Sector${sectorIndex}`);
//       try {
//         await mifare.mifareClassicAuthenticateB(sectorIndex, keys.B!);
//         await action();
//       } catch (eB) {
//         throw new Error(`Key A/B Both Can't Read Sector ${sectorIndex}`);
//       }
//     }
//     async function action() {
//       for (let i = 0; i < blockCount; i++) {
//         const blockIndex = (blockStart as any) + i;
//         const data = await mifare.mifareClassicReadBlock(blockIndex);
//         dataList.push(data as any);
//       }
//     }

//     return { tag: tagInfo, data: dataList };
//   } catch (ex) {
//     throw new Error(`NFC Read ${ex}`);
//   } finally {
//     if (cancelTechRequest) await NfcManager.cancelTechnologyRequest().catch(() => {});
//   }
// }

export async function readMifareClassicBlock(
  sectorIndex = 0,
  keys: { A?: number[]; B?: number[] } = { A: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], B: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff] },
  cancelTechRequest: boolean = false
) {
  const timings: Record<string, number> = {};
  const startTime = Date.now();

  try {
    const t1 = Date.now();
    await NfcManager.cancelTechnologyRequest();
    await NfcManager.start();
    timings['start'] = Date.now() - t1;

    const t2 = Date.now();
    await NfcManager.requestTechnology(NfcTech.MifareClassic);
    timings['requestTechnology'] = Date.now() - t2;

    const t3 = Date.now();
    const tagInfo = await NfcManager.getTag();
    timings['getTag'] = Date.now() - t3;

    const mifare = NfcManager.mifareClassicHandlerAndroid;

    const t4 = Date.now();
    const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
    const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);
    timings['getBlockInfo'] = Date.now() - t4;

    const dataList: number[][] = [];

    const authStart = Date.now();
    let usedKey: 'A' | 'B' | null = null;

    try {
      await mifare.mifareClassicAuthenticateA(sectorIndex, keys.A!);
      usedKey = 'A';
    } catch (eA) {
      console.log(`Can't use Key A to read Sector ${sectorIndex}`);
      try {
        await mifare.mifareClassicAuthenticateB(sectorIndex, keys.B!);
        usedKey = 'B';
      } catch (eB) {
        throw new Error(`Key A/B Both Can't Read Sector ${sectorIndex}`);
      }
    }
    timings['authentication'] = Date.now() - authStart;

    const readStart = Date.now();
    for (let i = 0; i < blockCount; i++) {
      const blockIndex = (blockStart as any) + i;
      const data = await mifare.mifareClassicReadBlock(blockIndex);
      dataList.push(data as any);
    }
    timings['readBlocks'] = Date.now() - readStart;

    timings['total'] = Date.now() - startTime;

    return {
      tag: tagInfo,
      data: dataList,
      timings,
      usedKey,
    };
  } catch (ex) {
    throw new Error(`NFC Read ${ex}`);
  } finally {
    if (cancelTechRequest) await NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export async function writeMifareClassicBlocks(
  sectorIndex = 7,
  keys: { A?: number[]; B?: number[] } = { A: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], B: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff] },
  blockData: { [blockOffset: number]: number[] },
  cancelTechRequest: boolean = true
) {
  try {
    await NfcManager.cancelTechnologyRequest();
    await NfcManager.start();
    await NfcManager.requestTechnology(NfcTech.MifareClassic);

    const mifare = NfcManager.mifareClassicHandlerAndroid;
    const blockStart = await mifare.mifareClassicSectorToBlock(sectorIndex);
    const blockCount: number = await (mifare as any).mifareClassicGetBlockCountInSector(sectorIndex);

    try {
      await mifare.mifareClassicAuthenticateA(sectorIndex, keys.A!);
      await action();
    } catch (eA) {
      console.log(`Can't use Key A Write Sector${sectorIndex}`);
      try {
        await mifare.mifareClassicAuthenticateB(sectorIndex, keys.B!);
        await action();
      } catch (eB) {
        throw new Error(`Key A/B Both Can't Write Sector ${sectorIndex}`);
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
