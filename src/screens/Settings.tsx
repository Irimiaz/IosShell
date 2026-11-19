import { type ComponentProps, type ReactNode, useState } from 'react';
import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import {
  downloadFile,
  openCamera,
  pickPhotoFromGallery,
  saveToPhotos,
} from '../device/photos';
import { createDocumentPdf, sharePdf } from '../device/pdf';
import {
  decodeDocument,
  ECL_LEVELS,
  encodeDocument,
  type ErrorCorrectionLevel,
  isHexColor,
  maxBytesFor,
  utf8Bytes,
} from '../device/qr';
import { scanQrCode, type ScanResult } from '../device/scanner';
import { copyText, shareContent } from '../device/text';
import { requireBiometry } from '../security/deviceSecurity';
import { BaseScreen } from './BaseScreen';

// Used by the download button when no photo has been added yet.
const SAMPLE_PHOTO_URL = 'https://picsum.photos/800/600';

const inputClass = 'rounded-xl bg-white px-3 py-3 text-base text-black';

export function Settings() {
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [text, setText] = useState('Hello from IosShell');

  // QR code generator
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

  // A scan result: a document opens as a PDF, anything else is shown in the text box.
  async function handleScan(result: ScanResult) {
    if (!result.ok) {
      Alert.alert('Not scanned', result.reason);
      return;
    }
    const data = decodeDocument(result.data);
    if (!data) {
      setText(result.data);
      Alert.alert('QR code scanned', result.data);
      return;
    }
    const pdf = await createDocumentPdf(data);
    if (!pdf.ok) {
      Alert.alert('Not created', pdf.reason);
      return;
    }
    if (!(await sharePdf(pdf.uri))) {
      Alert.alert('Not shared', 'Sharing is not available on this phone.');
    }
  }

  // Shows the outcome of a photo action, or its reason when it failed.
  const handle = (
    result: { ok: true; uri: string } | { ok: false; reason: string },
  ) => {
    if (result.ok) {
      setPhotoUri(result.uri);
    } else {
      Alert.alert('Not done', result.reason);
    }
  };

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Group title="Security">
          <Card
            icon="finger-print"
            title="Biometry"
            description="Checks biometry (Face ID or Touch ID) before running the action. If biometry is not set up, it asks for the phone's PIN or passcode."
            action={
              <ActionButton
                title="Run secured action"
                onPress={() =>
                  requireBiometry(
                    () => Alert.alert('Done', 'Face ID / Touch ID confirmed.'),
                    (reason) =>
                      Alert.alert(
                        'Not confirmed',
                        `Authentication failed: ${reason}`,
                      ),
                  )
                }
              />
            }
          />
        </Group>

        <Group title="Camera & photos">
          <Card
            icon="camera"
            title="Camera"
            description="Opens the phone's camera app. The photo you take becomes the current photo."
            action={
              <ActionButton
                title="Open camera"
                onPress={async () => handle(await openCamera())}
              />
            }
          />

          <Card
            icon="images"
            title="Gallery"
            description="Adds an image to the screen from your photo gallery."
            action={
              <ActionButton
                title="Add image from gallery"
                onPress={async () => handle(await pickPhotoFromGallery())}
              />
            }
          >
            {photoUri && (
              <Image
                source={{ uri: photoUri }}
                className="h-56 w-full rounded-xl"
                resizeMode="cover"
              />
            )}
          </Card>

          <Card
            icon="download"
            title="Download"
            description="Saves the current photo to your Photos app. If there is no photo yet, a sample photo is downloaded and saved."
            action={
              <ActionButton
                title="Download photo"
                onPress={async () => {
                  const downloaded = photoUri
                    ? { ok: true as const, uri: photoUri }
                    : await downloadFile(SAMPLE_PHOTO_URL);
                  if (!downloaded.ok) return handle(downloaded);
                  const saved = await saveToPhotos(downloaded.uri);
                  if (saved.ok) {
                    Alert.alert('Saved', 'The photo is in your Photos app.');
                  } else {
                    Alert.alert('Not saved', saved.reason);
                  }
                }}
              />
            }
          />
        </Group>

        <Group title="QR codes">
          <Card
            icon="scan"
            title="Scan"
            description="Checks biometry (Face ID or Touch ID), then opens the scanner. A document code is turned into a PDF you can save or share. Any other code's content is put in the text box below."
            action={
              <ActionButton
                title="Scan QR code"
                onPress={() =>
                  requireBiometry(
                    () => scanQrCode(handleScan),
                    (reason) =>
                      Alert.alert(
                        'Not confirmed',
                        `Authentication failed: ${reason}`,
                      ),
                  )
                }
              />
            }
          />

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
                  className={`text-sm ${qrTooLong ? 'font-bold text-yellow-200' : 'text-white/80'}`}
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
                        className={`flex-1 items-center rounded-xl py-2.5 ${selected ? 'bg-white' : 'bg-white/20'}`}
                      >
                        <Text
                          className={
                            selected ? 'font-bold text-black' : 'text-white'
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
                  <Text className="text-sm text-yellow-200">
                    Colours must look like #1A2B3C. Black and white are used
                    until they do.
                  </Text>
                )}

                {qrError ? (
                  <Text className="text-sm font-bold text-yellow-200">
                    {qrError}
                  </Text>
                ) : qrContent.length === 0 ? (
                  <Text className="text-center text-white/80">
                    Type something to create a code.
                  </Text>
                ) : qrTooLong ? null : (
                  <View className="items-center rounded-2xl bg-white p-5">
                    <QRCode
                      value={qrValue}
                      size={240}
                      ecl={qrLevel}
                      color={isHexColor(qrDark) ? qrDark : '#000000'}
                      backgroundColor={
                        isHexColor(qrLight) ? qrLight : '#FFFFFF'
                      }
                    />
                  </View>
                )}
              </View>
            )}
          </Card>
        </Group>

        <Group title="Text & sharing">
          <Card
            icon="copy"
            title="Copy"
            description="Copies the text below to the clipboard, so you can paste it in another app."
            action={
              <ActionButton
                title="Copy text"
                onPress={async () => {
                  const copied = await copyText(text);
                  Alert.alert(
                    copied ? 'Copied' : 'Not copied',
                    copied
                      ? 'The text is on the clipboard.'
                      : 'The text could not be copied.',
                  );
                }}
              />
            }
          >
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              placeholder="Type something to copy"
              placeholderTextColor="#888"
              className={`min-h-16 ${inputClass}`}
              textAlignVertical="top"
            />
          </Card>

          <Card
            icon="share-social"
            title="Share"
            description="Opens the share sheet. Shares the current photo if there is one, otherwise the text above."
            action={
              <ActionButton
                title="Share"
                onPress={async () => {
                  const shared = await shareContent(text, photoUri);
                  if (!shared) {
                    Alert.alert(
                      'Not shared',
                      'Sharing is not available on this phone.',
                    );
                  }
                }}
              />
            }
          />
        </Group>
      </View>
    </BaseScreen>
  );
}

type IconName = ComponentProps<typeof Ionicons>['name'];

// A titled set of cards.
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="px-1 text-xs font-semibold uppercase tracking-widest text-white/60">
        {title}
      </Text>
      {children}
    </View>
  );
}

// One feature: an icon and title, a line explaining it, its button, and any extra content.
function Card({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: IconName;
  title: string;
  description: string;
  action: ReactNode;
  children?: ReactNode;
}) {
  return (
    <View className="gap-3 rounded-2xl bg-white/10 p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={20} color="#FFFFFF" />
        <Text className="text-lg font-bold text-white">{title}</Text>
      </View>
      <Text className="text-sm leading-5 text-white/80">{description}</Text>
      {action}
      {children}
    </View>
  );
}

// The main button style of the screen. `outline` is a quieter version for toggles.
function ActionButton({
  title,
  onPress,
  variant = 'solid',
}: {
  title: string;
  onPress: () => void;
  variant?: 'solid' | 'outline';
}) {
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`items-center rounded-xl py-3 active:opacity-80 ${solid ? 'bg-white' : 'bg-white/20'}`}
    >
      <Text
        className={`text-base font-semibold ${solid ? 'text-black' : 'text-white'}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <Text className="text-sm text-white/80">{children}</Text>;
}
