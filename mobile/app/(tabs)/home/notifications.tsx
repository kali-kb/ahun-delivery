import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { authClient } from "../../../lib/authClient";
import { apiGet, apiPatch } from "../../../lib/api";

interface Notification {
    id: number;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsScreen() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            const session = await authClient.getSession();
            if (session.data?.user?.id) {
                setUserId(session.data.user.id);
                const response = await apiGet(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${session.data.user.id}/notifications`);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    }, []);

    const markAsRead = async (notificationId: number) => {
        if (!userId) return;
        
        try {
            await apiPatch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${userId}/notifications/${notificationId}`, {
                isRead: true
            });
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (message: string) => {
        if (message.toLowerCase().includes('order')) return 'receipt';
        if (message.toLowerCase().includes('delivery')) return 'bicycle';
        if (message.toLowerCase().includes('payment')) return 'card';
        if (message.toLowerCase().includes('promo') || message.toLowerCase().includes('offer')) return 'pricetag';
        return 'notifications';
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                {notifications.some(n => !n.isRead) && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{notifications.filter(n => !n.isRead).length}</Text>
                    </View>
                )}
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="red" />
                </View>
            ) : notifications.length === 0 ? (
                <ScrollView 
                    contentContainerStyle={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['red']} />
                    }
                >
                    <Ionicons name="notifications-off-outline" size={80} color="#cccccc" />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                    <Text style={styles.emptySubtext}>We'll notify you when something arrives</Text>
                </ScrollView>
            ) : (
                <ScrollView 
                    style={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['red']} />
                    }
                >
                    {notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            style={[
                                styles.notificationCard,
                                !notification.isRead && styles.unreadCard
                            ]}
                            onPress={() => markAsRead(notification.id)}
                        >
                            <View style={[
                                styles.iconContainer,
                                !notification.isRead && styles.unreadIconContainer
                            ]}>
                                <Ionicons 
                                    name={getNotificationIcon(notification.message) as any} 
                                    size={24} 
                                    color={notification.isRead ? 'gray' : 'red'} 
                                />
                            </View>
                            <View style={styles.notificationContent}>
                                <Text style={[
                                    styles.notificationMessage,
                                    !notification.isRead && styles.unreadMessage
                                ]}>
                                    {notification.message}
                                </Text>
                                <Text style={styles.notificationTime}>
                                    {getTimeAgo(notification.createdAt)}
                                </Text>
                            </View>
                            {!notification.isRead && (
                                <View style={styles.unreadDot} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    header: {
        height: 60,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e2e2',
        flexDirection: 'row',
    },
    backButton: {
        position: 'absolute',
        left: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    badge: {
        position: 'absolute',
        right: 20,
        backgroundColor: 'red',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Inter-Bold',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        fontFamily: 'Inter-Bold',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: 'gray',
        fontFamily: 'Inter-Regular',
        marginTop: 8,
        textAlign: 'center',
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 12,
        alignItems: 'center',
        // shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        // elevation: 1,
    },
    unreadCard: {
        backgroundColor: 'white',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    unreadIconContainer: {
        backgroundColor: '#ffebee',
    },
    notificationContent: {
        flex: 1,
    },
    notificationMessage: {
        fontSize: 15,
        color: '#666',
        fontFamily: 'Inter-Regular',
        lineHeight: 20,
    },
    unreadMessage: {
        color: '#333',
        fontFamily: 'Inter-SemiBold',
    },
    notificationTime: {
        fontSize: 12,
        color: 'gray',
        fontFamily: 'Inter-Regular',
        marginTop: 4,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        marginLeft: 8,
    },
});