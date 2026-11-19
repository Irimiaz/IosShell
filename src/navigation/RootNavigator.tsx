import { BottomNavLayout } from './bottom/BottomNavLayout';
import { DrawerLayout } from './drawer/DrawerLayout';
import { FlowStack } from './FlowStack';

// Both layouts are active: the floating hamburger menu from DrawerLayout and
// the classic tab bar from BottomNavLayout. The screens are the innermost content.
export function RootNavigator() {
  return (
    <DrawerLayout>
      <BottomNavLayout>
        <FlowStack />
      </BottomNavLayout>
    </DrawerLayout>
  );
}
