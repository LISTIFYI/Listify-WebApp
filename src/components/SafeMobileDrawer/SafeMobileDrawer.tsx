import { Drawer, DrawerContent } from "../ui/drawer";

export const SafeMobileDrawer = ({ open, onClose, children }: any) => {
    return (
        <Drawer
            open={open}
            onOpenChange={(drawerOpen) => {
                if (!drawerOpen && !document.activeElement?.tagName.match(/input|textarea/i)) {
                    onClose?.();
                }
            }}
        >
            <DrawerContent
                showIndicator={false}
                className="sm:max-w-lg mx-auto overflow-hidden rounded-t-2xl absolute bottom-0 left-0 right-0"
            >
                <div className="max-h-[70vh] overflow-y-auto">{children}</div>
            </DrawerContent>
        </Drawer>
    );
};
