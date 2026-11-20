import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { BaseScreen } from '../screens/BaseScreen';
import { ActionButton, Card, Group, Heading, Row } from './ui';

const WAIT_MS = 2000;

// Pull down on this screen to refresh it. The time below changes each time.
export function AlertsDemo() {
  const [working, setWorking] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  // Runs when the user pulls down. The spinner stops when this finishes.
  const refresh = () =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        setRefreshedAt(new Date());
        resolve();
      }, WAIT_MS),
    );

  const wait = () => {
    setWorking(true);
    setTimeout(() => setWorking(false), WAIT_MS);
  };

  return (
    <BaseScreen pullToRefresh onRefresh={refresh}>
      <View className="flex-1 gap-8">
        <Heading>Alerts & loading</Heading>

        <Group title="Alerts">
          <Card
            icon="chatbubble-ellipses"
            title="Alert"
            description="A message the user must dismiss. Give it buttons to ask a question."
            action={
              <View className="gap-2">
                <ActionButton
                  title="Show a message"
                  onPress={() =>
                    Alert.alert('Hello', 'This is a simple alert.')
                  }
                />
                <ActionButton
                  title="Ask a question"
                  variant="outline"
                  onPress={() =>
                    Alert.alert('Delete this item?', 'This cannot be undone.', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => Alert.alert('Deleted'),
                      },
                    ])
                  }
                />
              </View>
            }
          />
        </Group>

        <Group title="Loading">
          <Card
            icon="hourglass"
            title="Loading indicator"
            description={`Shows a spinner while something runs. This one waits ${WAIT_MS / 1000} seconds.`}
            action={
              <ActionButton
                title={working ? 'Working…' : 'Start'}
                onPress={wait}
              />
            }
          >
            {working && (
              <View className="items-center py-2">
                <ActivityIndicator size="large" color="#171717" />
              </View>
            )}
          </Card>
        </Group>

        <Group title="Pull to refresh">
          <Card
            icon="reload-circle"
            title="Last refreshed"
            description="Pull this screen down. The spinner shows while the refresh runs."
          >
            <Row
              label="Refreshed at"
              value={refreshedAt.toLocaleTimeString()}
            />
          </Card>
        </Group>
      </View>
    </BaseScreen>
  );
}
