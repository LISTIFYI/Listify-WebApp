'use client';
import * as React from 'react';
import { Drawer, Box } from '@mui/joy';
import { Button } from '@mui/joy';

interface CustomDrawerProps {
    anchor?: 'top' | 'left' | 'bottom' | 'right';
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const CustomDrawer = ({
    anchor = 'bottom',
    open,
    onClose,
    children,
}: CustomDrawerProps) => {
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
                    borderTopLeftRadius: anchor === 'bottom' ? '24px' : '0px',
                    borderTopRightRadius: anchor === 'bottom' ? '24px' : '0px',
                    overflow: 'visible',
                },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    minHeight: anchor === 'bottom' ? '40vh' : '100%',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()} // ✅ prevent accidental close when clicking inside
            >
                {children}
            </Box>
        </Drawer>
    );
};

export default CustomDrawer;
