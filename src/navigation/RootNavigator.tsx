import { BackSwipe } from './BackSwipe';
import { BottomNavLayout } from './bottom/BottomNavLayout';
import { DrawerLayout } from './drawer/DrawerLayout';
import { FlowStack } from './FlowStack';

// Both layouts are active: the floating hamburger menu from DrawerLayout and
// the classic tab bar from BottomNavLayout. The screens are the innermost content.
// BackSwipe wraps everything, so its blob is centred on the whole screen and
// the back gesture works with or without a layout.
export function RootNavigator() {
  return (
    <BackSwipe>
      <DrawerLayout>
        <BottomNavLayout>
          <FlowStack />
        </BottomNavLayout>
      </DrawerLayout>
    </BackSwipe>
  );
}
