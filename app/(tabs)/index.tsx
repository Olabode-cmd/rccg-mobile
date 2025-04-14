import React from 'react';
import { Image, StyleSheet, Platform, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

// Hardcoded image import
import OpenHeavensImg from "@/assets/images/bible-img.jpg";

// Type definitions
interface Devotional {
  id: number;
  title: string;
  theme: string;
  scripture: string;
  preview: string;
  date: string;
  author?: string;
}

interface Program {
  id: number;
  title: string;
  theme: string;
  preview: string;
  schedule?: string;
  icon: string;
  color: string;
}

const todaysDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});

// Sample data from API (without images)
const devotionalData = {
  id: 1,
  title: "Open Heavens",
  theme: "Walking in Divine Wisdom",
  scripture: "Proverbs 4:7",
  preview: "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.",
  date: todaysDate,
  author: "Pastor E.A. Adeboye"
};

const programsData: Program[] = [
  {
    id: 2,
    title: "Sunday School",
    theme: "Faith and Works",
    preview: "Understanding the balance between faith and action in our Christian walk.",
    schedule: "Sundays, 9:00 AM",
    icon: "book-open",
    color: "#4C51BF" // Indigo
  },
  {
    id: 3,
    title: "Bible Study",
    theme: "The Book of Romans",
    preview: "Exploring Paul's theological masterpiece on salvation and grace.",
    schedule: "Wednesdays, 6:00 PM",
    icon: "book",
    color: "#2B6CB0" // Blue
  },
  {
    id: 4,
    title: "Prayer Vigil",
    theme: "Night of Divine Encounter",
    preview: "Preparing our hearts for a night of powerful prayer and supplication.",
    schedule: "Last Friday, 10:00 PM",
    icon: "moon",
    color: "#6B46C1" // Purple
  },
  {
    id: 5,
    title: "Youth Fellowship",
    theme: "Purpose Driven Life",
    preview: "Discovering God's unique purpose for your life as a young believer.",
    schedule: "Saturdays, 4:00 PM",
    icon: "users",
    color: "#2F855A" // Green
  },
  {
    id: 6,
    title: "Marriage Counseling",
    theme: "Building a Godly Home",
    preview: "Biblical principles for maintaining a Christ-centered marriage.",
    schedule: "By Appointment",
    icon: "heart",
    color: "#C53030" // Red
  },
  {
    id: 7,
    title: "Choir Practice",
    theme: "Worship as Lifestyle",
    preview: "Understanding that worship goes beyond Sunday service.",
    schedule: "Thursdays, 5:30 PM",
    icon: "music",
    color: "#B7791F" // Yellow
  }
];

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>{todaysDate}</Text>
            <Text style={styles.headerTitle}>Daily Devotional</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Feather name="user" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Featured Open Heavens Devotional - with hardcoded image */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Today's Devotional</Text>
          <TouchableOpacity style={styles.featuredCard}>
            {/* Hardcoded image */}
            <Image
              source={OpenHeavensImg}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{devotionalData.title}</Text>
              </View>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTheme}>{devotionalData.theme}</Text>
              <Text style={styles.scriptureText}>{devotionalData.scripture}</Text>
              <Text numberOfLines={2} style={styles.previewText}>
                {devotionalData.preview}
              </Text>
              <View style={styles.readMoreContainer}>
                <Text style={styles.readMoreText}>Read Today's Devotional</Text>
                <Feather name="arrow-right" size={16} color="#3B82F6" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Other Programs List - redesigned without images */}
        <View style={styles.programsSection}>
          <Text style={styles.sectionTitle}>Other Programs</Text>
          <View style={styles.programsList}>
            {programsData.map((program) => (
              <TouchableOpacity
                key={program.id}
                style={styles.programCard}
              >
                <View style={[styles.iconContainer, { backgroundColor: program.color }]}>
                  <Feather name={program.icon} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.programContent}>
                  <View style={styles.programHeader}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    {/* {program.schedule && (
                      <Text style={styles.scheduleText}>
                        {program.schedule}
                      </Text>
                    )} */}
                  </View>
                  <Text style={styles.programTheme}>{program.theme}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#CBD5E0" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Grow your faith daily with us</Text>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#334155',
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  badgeContainer: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTheme: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  scriptureText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 16,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginRight: 4,
  },
  programsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  programsList: {
    flexDirection: 'column',
  },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  programContent: {
    flex: 1,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  programTheme: {
    fontSize: 14,
    color: '#64748B',
  },
  scheduleText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#94A3B8',
  }
});

export default HomeScreen;