'use client';
import * as React from 'react';
import { Drawer, Box } from '@mui/joy';

interface PersistentDrawerProps {
    open: boolean;
    onClose: () => void;
    anchor?: 'top' | 'bottom' | 'left' | 'right';
    children: React.ReactNode;
}

const PersistentDrawer: React.FC<PersistentDrawerProps> = ({
    open,
    onClose,
    anchor = 'bottom',
    children,
}) => {
    return (
        <Drawer
            anchor={anchor}
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.4)' } },
            }}
            sx={{
                '& .MuiDrawer-content': {
                    borderTopLeftRadius: anchor === 'bottom' ? '24px' : 0,
                    borderTopRightRadius: anchor === 'bottom' ? '24px' : 0,
                    overflow: 'visible',
                },
            }}
        >
            <Box
                sx={{
                    p: 3,
                    minHeight: anchor === 'bottom' ? '40vh' : 'auto',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()} // ✅ prevents drawer from closing when clicking inside
            >
                {children}
            </Box>
        </Drawer>
    );
};

export default PersistentDrawer;
