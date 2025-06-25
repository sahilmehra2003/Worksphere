import { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';

// Import components (we'll create these next)
import InitiateReviewTab from './components/InitiateReviewTab';
import PendingReviewsTab from './components/PendingReviewsTab';
import MyReviewsTab from './components/MyReviewsTab';
import TeamReviewsTab from './components/TeamReviewsTab';
import ReviewDetailsModal from './components/ReviewDetailsModal';

const PerformancePage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
    }, []);

    const handleOpenModal = useCallback((reviewId) => {
        setSelectedReviewId(reviewId);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedReviewId(null);
    }, []);

    const tabs = [
        {
            label: "Initiate Review",
            icon: <AddIcon />,
            component: <InitiateReviewTab />
        },
        {
            label: "Pending Reviews",
            icon: <AssignmentIcon />,
            component: <PendingReviewsTab onReviewClick={handleOpenModal} />
        },
        {
            label: "My Reviews",
            icon: <PersonIcon />,
            component: <MyReviewsTab onReviewClick={handleOpenModal} />
        },
        {
            label: "Team Reviews",
            icon: <GroupIcon />,
            component: <TeamReviewsTab onReviewClick={handleOpenModal} />
        }
    ];

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Performance Reviews
            </Typography>

            <Paper elevation={2}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="performance reviews tabs"
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                label={tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Only render the active tab */}
                <Box sx={{ p: 0 }}>
                    {tabs[activeTab]?.component}
                </Box>
            </Paper>

            {/* Review Details Modal */}
            {selectedReviewId && (
                <ReviewDetailsModal
                    open={isModalOpen}
                    handleClose={handleCloseModal}
                    reviewId={selectedReviewId}
                />
            )}
        </Box>
    );
};

export default PerformancePage; 