import { useState, useEffect } from 'react';
import { View, ScrollView, Text, TextInput, Button } from 'react-native';
import { AESTool } from '@/components/crypt';

export default function App() {
  const [result, setresult] = useState('');
  const [encryptText, setencryptText] = useState('');
  const [decryptText, setdecryptText] = useState('');

  function en() {
    const res = AESTool.encrypt(encryptText);
    setresult(res);
  }
  function de() {
    const res = AESTool.decrypt(decryptText);
    setresult(res);
  }
  return (
    <ScrollView>
      <Text>加解密：</Text>
      <TextInput
        multiline={true}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          marginVertical: 10,
        }}
        placeholder='加密文本'
        value={encryptText}
        onChangeText={setencryptText}></TextInput>
      <Button title='加密' onPress={en}></Button>
      <TextInput
        multiline={true}
        style={{
          borderColor: 'gray',
          borderWidth: 1,
          marginVertical: 10,
        }}
        placeholder='解密文本'
        value={decryptText}
        onChangeText={setdecryptText}></TextInput>
      <Button title='解密' onPress={de}></Button>
      <TextInput multiline={true} value={result}></TextInput>
    </ScrollView>
  );
}
