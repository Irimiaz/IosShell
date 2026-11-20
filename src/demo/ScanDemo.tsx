import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { createDocumentPdf, sharePdf } from '../device/pdf';
import { decodeDocument } from '../device/qr';
import { type ScanResult, scanQrCode } from '../device/scanner';
import { BaseScreen } from '../screens/BaseScreen';
import { requireBiometry } from '../security/deviceSecurity';
import { ActionButton, Card, Heading } from './ui';

export function ScanDemo() {
  // The text of the last code scanned that is not a document.
  const [scanned, setScanned] = useState<string | undefined>();

  // A document opens as a PDF, anything else is shown below the scan button.
  async function handleScan(result: ScanResult) {
    if (!result.ok) {
      Alert.alert('Not scanned', result.reason);
      return;
    }
    const data = decodeDocument(result.data);
    if (!data) {
      setScanned(result.data);
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

  return (
    <BaseScreen>
      <View className="flex-1 gap-8">
        <Heading>Scan QR code</Heading>

        <Card
          icon="scan"
          title="Scan"
          description="Checks biometry (Face ID or Touch ID), then opens the scanner. A document code is turned into a PDF you can save or share. Any other code's content is shown below."
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
        >
          {scanned !== undefined && (
            <Text selectable className="text-base text-white">
              {scanned}
            </Text>
          )}
        </Card>
      </View>
    </BaseScreen>
  );
}
