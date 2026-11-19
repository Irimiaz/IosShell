import { Text, View } from 'react-native';

import buildInfo from '../config/build-info.json';
import { BaseScreen } from './BaseScreen';

// The build details, written by scripts/build/write-build-info.mjs at build time.
export function Build() {
  return (
    <BaseScreen>
      <View className="gap-6">
        <Text className="text-center text-2xl font-bold text-white">Build</Text>

        <Group title="Build">
          <Row label="App" value={buildInfo.appName} />
          <Row label="Version" value={buildInfo.bundleVersion} />
          <Row label="Build number" value={buildInfo.buildNumber} />
          <Row label="Package version" value={buildInfo.packageVersion} />
          <Row label="Configuration" value={buildInfo.configuration} />
          <Row label="Built at (Romania)" value={buildInfo.builtAtRomania} />
          <Row label="Built at (UTC)" value={buildInfo.builtAtIso} />
        </Group>

        <Group title="Source">
          <Row label="Git branch" value={buildInfo.gitBranch} />
          <Row label="Git commit" value={buildInfo.gitCommit} />
          <Row label="Uncommitted changes" value={buildInfo.gitDirty} />
          <Row label="Node version" value={buildInfo.nodeVersion} />
        </Group>
      </View>
    </BaseScreen>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2 rounded-xl bg-white/10 p-4">
      <Text className="text-sm font-semibold uppercase text-white/70">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-xs text-white/70">{label}</Text>
      <Text selectable className="text-base text-white">
        {value}
      </Text>
    </View>
  );
}
