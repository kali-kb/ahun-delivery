import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";

export default function HelpCenter() {
    const router = useRouter();
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: "How do I place an order?",
            answer: "Browse restaurants, select items, add to cart, and proceed to checkout. You can track your order in real-time."
        },
        {
            question: "What payment methods are accepted?",
            answer: "We accept Telebirr and CBE Birr. More payment options coming soon!"
        },
        {
            question: "How long does delivery take?",
            answer: "Delivery typically takes 30-45 minutes depending on your location and restaurant preparation time."
        },
        {
            question: "Can I cancel my order?",
            answer: "You can cancel your order within 5 minutes of placing it. After that, please contact support."
        },
        {
            question: "How do I track my order?",
            answer: "Go to the Orders tab to see real-time updates on your order status and delivery location."
        },
        {
            question: "What if my order is wrong?",
            answer: "Contact our support team immediately through the app or call us. We'll resolve the issue promptly."
        },
    ];

    const contactOptions = [
        {
            icon: 'call-outline',
            title: 'Phone Support',
            subtitle: '0968183639',
            action: () => Linking.openURL('tel:0968183639'),
            color: '#10B981',
        },
        {
            icon: 'mail-outline',
            title: 'Email Support',
            subtitle: 'kaleb.mate@yahoo.com',
            action: () => Linking.openURL('mailto:kaleb.mate@yahoo.com'),
            color: '#3B82F6',
        },
        {
            icon: 'paper-plane-outline',
            title: 'Telegram',
            subtitle: '@kbmati9',
            action: () => Linking.openURL('https://t.me/kbmati9'),
            color: '#0088cc',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={28} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Contact Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Support</Text>
                    {contactOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.contactCard}
                            onPress={option.action}
                        >
                            <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
                                <Ionicons name={option.icon as any} size={24} color={option.color} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactTitle}>{option.title}</Text>
                                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FAQs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    {faqs.map((faq, index) => (
                        <View key={index} style={styles.faqItem}>
                            <TouchableOpacity
                                style={styles.faqQuestion}
                                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                            >
                                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                <Ionicons
                                    name={expandedFaq === index ? 'chevron-up-outline' : 'chevron-down-outline'}
                                    size={20}
                                    color="gray"
                                />
                            </TouchableOpacity>
                            {expandedFaq === index && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Quick Links */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Links</Text>
                    
                    <TouchableOpacity style={styles.linkItem}>
                        <Ionicons name="document-text-outline" size={24} color="red" />
                        <Text style={styles.linkText}>Terms & Conditions</Text>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem}>
                        <Ionicons name="shield-checkmark-outline" size={24} color="red" />
                        <Text style={styles.linkText}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem}>
                        <Ionicons name="information-circle-outline" size={24} color="red" />
                        <Text style={styles.linkText}>About Us</Text>
                        <Ionicons name="chevron-forward-outline" size={22} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
                    <Text style={styles.infoText}>
                        Can't find what you're looking for? Our support team is available 24/7 to help you.
                    </Text>
                </View>
            </ScrollView>
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
    },
    backButton: {
        position: 'absolute',
        left: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: 'white',
        marginTop: 15,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        marginBottom: 15,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        marginBottom: 12,
    },
    contactIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
        marginLeft: 15,
    },
    contactTitle: {
        fontSize: 16,
        fontFamily: 'Inter-SemiBold',
        marginBottom: 2,
    },
    contactSubtitle: {
        fontSize: 13,
        color: 'gray',
        fontFamily: 'Inter-Regular',
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 5,
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Inter-SemiBold',
        marginRight: 10,
    },
    faqAnswer: {
        paddingBottom: 15,
        paddingRight: 30,
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        fontFamily: 'Inter-Regular',
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    linkText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#92400E',
        fontFamily: 'Inter-Regular',
    },
});
