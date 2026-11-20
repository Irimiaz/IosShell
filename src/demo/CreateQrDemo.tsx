import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {
  ECL_LEVELS,
  encodeDocument,
  type ErrorCorrectionLevel,
  isHexColor,
  maxBytesFor,
  utf8Bytes,
} from '../device/qr';
import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Heading, inputClass, Label } from './ui';

export function CreateQrDemo() {
  const [qrOpen, setQrOpen] = useState(false);
  const [qrContent, setQrContent] = useState('https://example.com');
  const [qrLevel, setQrLevel] = useState<ErrorCorrectionLevel>('M');
  const [qrDark, setQrDark] = useState('#000000');
  const [qrLight, setQrLight] = useState('#FFFFFF');
  // Document mode: the content must be a JSON object, which is stored with a prefix
  // so that the scanning app can turn it into a PDF.
  const [qrDocumentMode, setQrDocumentMode] = useState(false);
  const encoded = qrDocumentMode
    ? encodeDocument(qrContent)
    : ({ ok: true, value: qrContent } as const);
  const qrValue = encoded.ok ? encoded.value : '';
  const qrError = encoded.ok ? undefined : encoded.reason;
  const qrBytes = utf8Bytes(qrValue);
  const qrLimit = maxBytesFor(qrLevel);
  const qrTooLong = qrBytes > qrLimit;

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Create QR code</Heading>

        <Card
          icon="qr-code"
          title="Create"
          description="Creates a QR code from the content below. It can hold long text, several lines, links, Wi-Fi details or contact cards. A higher error correction level lets the code still be read when damaged, but it holds less."
          action={
            <ActionButton
              title={qrOpen ? 'Hide QR code' : 'Create QR code'}
              onPress={() => setQrOpen((open) => !open)}
            />
          }
        >
          {qrOpen && (
            <View className="gap-4">
              <TextInput
                value={qrContent}
                onChangeText={setQrContent}
                multiline
                placeholder="Text, link or any other content"
                placeholderTextColor="#888"
                className={`min-h-24 ${inputClass}`}
                textAlignVertical="top"
              />

              <ActionButton
                variant="outline"
                title={
                  qrDocumentMode
                    ? 'Document mode: on (JSON object)'
                    : 'Document mode: off'
                }
                onPress={() => setQrDocumentMode((on) => !on)}
              />

              <Text
                className={`text-sm ${qrTooLong ? 'font-bold text-amber-700' : 'text-neutral-600'}`}
              >
                {qrBytes} / {qrLimit} bytes at level {qrLevel}
                {qrTooLong
                  ? ' – too long, choose a lower level or shorten the text'
                  : ''}
              </Text>

              <Label>Error correction</Label>
              <View className="flex-row gap-2">
                {ECL_LEVELS.map((level) => {
                  const selected = level === qrLevel;
                  return (
                    <Pressable
                      key={level}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => setQrLevel(level)}
                      className={`flex-1 items-center rounded-xl py-2.5`}
                    >
                      <Text
                        className={
                          selected ? 'font-bold text-white' : 'text-neutral-900'
                        }
                      >
                        {level}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 gap-1.5">
                  <Label>Colour</Label>
                  <TextInput
                    value={qrDark}
                    onChangeText={setQrDark}
                    autoCapitalize="none"
                    placeholder="#000000"
                    placeholderTextColor="#888"
                    className={inputClass}
                  />
                </View>
                <View className="flex-1 gap-1.5">
                  <Label>Background</Label>
                  <TextInput
                    value={qrLight}
                    onChangeText={setQrLight}
                    autoCapitalize="none"
                    placeholder="#FFFFFF"
                    placeholderTextColor="#888"
                    className={inputClass}
                  />
                </View>
              </View>
              {(!isHexColor(qrDark) || !isHexColor(qrLight)) && (
                <Text className="text-sm text-amber-700">
                  Colours must look like #1A2B3C. Black and white are used until
                  they do.
                </Text>
              )}

              {qrError ? (
                <Text className="text-sm font-bold text-amber-700">
                  {qrError}
                </Text>
              ) : qrContent.length === 0 ? (
                <Text className="text-center text-neutral-600">
                  Type something to create a code.
                </Text>
              ) : qrTooLong ? null : (
                <View className="items-center rounded-2xl border border-neutral-200 bg-white p-5">
                  <QRCode
                    value={qrValue}
                    size={240}
                    ecl={qrLevel}
                    color={isHexColor(qrDark) ? qrDark : '#000000'}
                    backgroundColor={isHexColor(qrLight) ? qrLight : '#FFFFFF'}
                  />
                </View>
              )}
            </View>
          )}
        </Card>
      </View>
    </BaseScreen>
  );
}
