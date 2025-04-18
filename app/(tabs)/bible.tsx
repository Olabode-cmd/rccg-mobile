import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import bible from "../../assets/bible/en_kjv.json";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FadingHeaderScrollView from '@/components/FadingHeaderScroll';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const Bible = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingVerse, setCurrentSpeakingVerse] = useState<number | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const [currentVerse, setCurrentVerse] = useState<number>(0);
    const [isPaused, setIsPaused] = useState(false);
    const [speechText, setSpeechText] = useState<string>('');

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 20,
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            paddingHorizontal: 1,
            borderBottomWidth: 1,
            borderBottomColor: colors.icon, // using icon color for borders
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            flex: 1,
            textAlign: 'center',
        },
        backButton: {
            padding: 8,
            position: 'absolute',
            left: 16,
            zIndex: 1,
        },
        backButtonText: {
            color: colors.tint,
            fontSize: 16,
        },
        list: {
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        item: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.icon,
        },
        itemText: {
            fontSize: 18,
            color: colors.text,
        },
        headerText: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            padding: 16,
        },
        chapterGrid: {
            padding: 16,
            alignItems: 'center',
        },
        chapterItem: {
            width: '22%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            margin: '1.5%',
            backgroundColor: colors.tint + '20', // Using tint color with 20% opacity
            borderRadius: 8,
        },
        chapterText: {
            fontSize: 18,
            color: colors.text,
        },
        verseContainer: {
            padding: 16,
        },
        verseWrapper: {
            flexDirection: 'row',
            marginBottom: 16,
        },
        verseNumber: {
            fontSize: 14,
            fontWeight: 'bold',
            color: colors.tint,
            marginRight: 8,
            width: 24,
            textAlign: 'right',
        },
        verseText: {
            fontSize: 18,
            color: colors.text,
            flex: 1,
            lineHeight: 26,
        },
        navigationButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 30,
            marginBottom: 40,
            paddingHorizontal: 10,
        },
        navigationButton: {
            backgroundColor: colors.tint + '20',
            padding: 14,
            borderRadius: 8,
            minWidth: 130,
            alignItems: 'center',
        },
        navigationButtonText: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
        },
        disabledButton: {
            backgroundColor: colors.icon + '40',
            opacity: 0.5,
        },
        headerRight: {
            position: 'absolute',
            right: 16,
            zIndex: 1,
        },
        speakingVerse: {
            backgroundColor: colors.tint + '20',
        },
        playButton: {
            padding: 8,
        },
        headerControls: {
            flexDirection: 'row',
            position: 'absolute',
            right: 16,
            alignItems: 'center',
        },
        headerButton: {
            padding: 8,
        },
        restartButton: {
            marginRight: 8,
        },
        controlsContainer: {
            position: 'absolute',
            bottom: 20, // Closer to bottom
            left: 20,
            right: 20,
            backgroundColor: colors.background,
            borderRadius: 25,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginHorizontal: 20,
        },
        controlButton: {
            padding: 10,
        },
    });

    // Type assertion for Bible structure
    const typedBible = bible as Array<{
        abbrev: string,
        name?: string,
        chapters: string[][]
    }>;

    const [selectedBook, setSelectedBook] = useState(0);
    const [selectedChapter, setSelectedChapter] = useState(0);
    const [view, setView] = useState('book'); // 'book', 'chapter', 'verse'
    const [bookNames, setBookNames] = useState<string[]>([]);

    // Get all book names on component mount
    useEffect(() => {
        const names = typedBible.map((book, index) => {
            return book.name || book.abbrev || `Book ${index + 1}`;
        });
        setBookNames(names);
    }, []);

    // Handler for book selection
    const handleBookSelect = (index: number) => {
        setSelectedBook(index);
        setSelectedChapter(0);
        setView('chapter');
    };

    // Handler for chapter selection
    const handleChapterSelect = (index: number) => {
        setSelectedChapter(index);
        setView('verse');
    };

    // Go back to previous view
    const handleBack = () => {
        if (view === 'verse') {
            setView('chapter');
        } else if (view === 'chapter') {
            setView('book');
        }
    };

    // Navigate to next chapter
    const handleNextChapter = () => {
        const currentBookChapters = typedBible[selectedBook].chapters.length;

        // If this is the last chapter of the book
        if (selectedChapter >= currentBookChapters - 1) {
            // If this is not the last book
            if (selectedBook < typedBible.length - 1) {
                setSelectedBook(selectedBook + 1);
                setSelectedChapter(0);
            }
        } else {
            // Move to next chapter in current book
            setSelectedChapter(selectedChapter + 1);
        }
    };

    // Navigate to previous chapter
    const handlePreviousChapter = () => {
        // If this is the first chapter of the book
        if (selectedChapter <= 0) {
            // If this is not the first book
            if (selectedBook > 0) {
                const prevBookChapters = typedBible[selectedBook - 1].chapters.length;
                setSelectedBook(selectedBook - 1);
                setSelectedChapter(prevBookChapters - 1);
            }
        } else {
            // Move to previous chapter in current book
            setSelectedChapter(selectedChapter - 1);
        }
    };

    // Render book selection screen
    const renderBookSelection = () => {
        return (
            <FlatList
                data={bookNames}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => handleBookSelect(index)}
                    >
                        <Text style={styles.itemText}>{item}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.list}
            />
        );
    };

    // Render chapter selection screen
    const renderChapterSelection = () => {
        const chapters = typedBible[selectedBook].chapters.length;
        const chapterArray = Array.from({ length: chapters }, (_, i) => i + 1);

        return (
            <View style={styles.container}>
                <Text style={styles.headerText}>{bookNames[selectedBook]}</Text>
                <FlatList
                    data={chapterArray}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={styles.chapterItem}
                            onPress={() => handleChapterSelect(index)}
                        >
                            <Text style={styles.chapterText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.toString()}
                    numColumns={4}
                    contentContainerStyle={styles.chapterGrid}
                />
            </View>
        );
    };

    // Render verse screen
    const renderVerseScreen = () => {
        const verses = typedBible[selectedBook].chapters[selectedChapter];
        const currentBookChapters = typedBible[selectedBook].chapters.length;
        const isLastChapter = selectedChapter >= currentBookChapters - 1;
        const isLastBook = selectedBook >= typedBible.length - 1;
        const isFirstChapter = selectedChapter <= 0;
        const isFirstBook = selectedBook <= 0;

        // Create data array with verse numbers and text
        const versesData = verses.map((verse, index) => ({
            verse: verse,
            number: index + 1,
        }));

        return (
            <View style={styles.container}>
                <Text style={styles.headerText}>
                    {bookNames[selectedBook]} {selectedChapter + 1}
                </Text>
                <FlatList
                    ref={flatListRef}
                    data={versesData}
                    renderItem={({ item, index }) => (
                        <View style={[
                            styles.verseWrapper,
                            currentSpeakingVerse === index && styles.speakingVerse
                        ]}>
                            <Text style={styles.verseNumber}>{item.number}</Text>
                            <Text style={styles.verseText}>{item.verse}</Text>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.verseContainer}
                    ListFooterComponent={() => (
                        <View style={styles.navigationButtonsContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.navigationButton,
                                    (isFirstChapter && isFirstBook) ? styles.disabledButton : {}
                                ]}
                                onPress={handlePreviousChapter}
                                disabled={isFirstChapter && isFirstBook}
                            >
                                <Text style={styles.navigationButtonText}>
                                    {isFirstChapter && !isFirstBook ? `← ${bookNames[selectedBook - 1]}` : '← Previous'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.navigationButton,
                                    (isLastChapter && isLastBook) ? styles.disabledButton : {}
                                ]}
                                onPress={handleNextChapter}
                                disabled={isLastChapter && isLastBook}
                            >
                                <Text style={styles.navigationButtonText}>
                                    {isLastChapter && !isLastBook ? `${bookNames[selectedBook + 1]} →` : 'Next →'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        );
    };

    const speakVerse = (text: string, onComplete?: () => void) => {
        console.log('speakVerse called with:', text);
        Speech.speak(text, {
            onStart: () => {
                console.log('Started speaking:', text.substring(0, 30) + '...');
            },
            onDone: () => {
                console.log('Finished speaking current text');
                // Always call onComplete when verse is done, regardless of pause state
                onComplete?.();
            },
            onError: (error) => {
                console.error('Speech error:', error);
                setIsSpeaking(false);
                setCurrentSpeakingVerse(null);
            },
            rate: 0.9,
            pitch: 1.0,
            language: 'en-US'
        });
    };

    const speakVerses = (verses: string[], startIndex: number = 0, force: boolean = false) => {
        console.log('speakVerses called with startIndex:', startIndex, 'force:', force);
        if (!isSpeaking && !force) {
            console.log('Not speaking and not forced, returning early');
            return;
        }
        
        setCurrentVerse(startIndex);
        setCurrentSpeakingVerse(startIndex);

        const verseText = String(verses[startIndex]);
        const verseToSpeak = `Verse ${startIndex + 1}. ${verseText}`;
        console.log('Preparing to speak:', verseToSpeak.substring(0, 30) + '...');

        flatListRef.current?.scrollToIndex({
            index: startIndex,
            animated: true,
            viewPosition: 0.5,
        });

        speakVerse(verseToSpeak, () => {
            console.log('Verse complete callback');
            if ((isSpeaking || force) && startIndex + 1 < verses.length) {
                speakVerses(verses, startIndex + 1, force);
            } else if (startIndex + 1 >= verses.length) {
                console.log('Reached end of verses');
                setIsSpeaking(false);
                setCurrentSpeakingVerse(null);
                setCurrentVerse(0);
            }
        });
    };

    const restartSpeech = () => {
        Speech.stop();
        if (view === 'verse') {
            const verses = typedBible[selectedBook].chapters[selectedChapter];
            speakVerses(verses, 0);
        }
    };

    const togglePause = async () => {
        console.log('togglePause called, current isPaused:', isPaused);
        if (isPaused) {
            // Resume by starting current verse again
            setIsPaused(false);
            const verses = typedBible[selectedBook].chapters[selectedChapter];
            speakVerses(verses, currentVerse, true);
        } else {
            // Simple pause - just stop speaking
            setIsPaused(true);
            await Speech.stop();
        }
    };

    const moveToVerse = (direction: 'next' | 'prev') => {
        const verses = typedBible[selectedBook].chapters[selectedChapter];
        const newIndex = direction === 'next' ? 
            Math.min(currentVerse + 1, verses.length - 1) : 
            Math.max(currentVerse - 1, 0);

        Speech.stop();
        speakVerses(verses, newIndex);
    };

    const stopSpeech = () => {
        console.log('stopSpeech called');
        Speech.stop();
        setIsSpeaking(false);
        setCurrentSpeakingVerse(null);
        setCurrentVerse(0);
        setIsPaused(false);
    };

    const startReading = () => {
        console.log('startReading called');
        if (view === 'verse') {
            const verses = typedBible[selectedBook].chapters[selectedChapter];
            if (verses.length > 0) {
                console.log('Starting to read verses:', verses.length);
                speakVerses(verses, 0, true);
                setIsSpeaking(true);
                setIsPaused(false);
            }
        }
    };

    const toggleSpeech = () => {
        console.log('toggleSpeech called, current isSpeaking:', isSpeaking);
        if (isSpeaking) {
            stopSpeech();
        } else {
            startReading();
        }
    };

    // Clean up speech when component unmounts
    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    // Stop speech when changing views
    useEffect(() => {
        Speech.stop();
        setIsSpeaking(false);
        setCurrentSpeakingVerse(null);
    }, [view, selectedBook, selectedChapter]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#141414" />
            <View style={styles.container}>
                <View style={styles.header}>
                    {view !== 'book' && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.title}>Holy Bible</Text>
                    {view === 'verse' && !isSpeaking && (
                        <TouchableOpacity 
                            onPress={startReading} 
                            style={styles.headerButton}
                        >
                            <Ionicons 
                                name="play" 
                                size={24} 
                                color={colors.tint}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {view === 'book' && renderBookSelection()}
                {view === 'chapter' && renderChapterSelection()}
                {view === 'verse' && renderVerseScreen()}

                {/* Reading Controls */}
                {isSpeaking && view === 'verse' && (
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity onPress={() => moveToVerse('prev')} style={styles.controlButton}>
                            <Ionicons name="play-skip-back" size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={restartSpeech} style={styles.controlButton}>
                            <Ionicons name="refresh" size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePause} style={styles.controlButton}>
                            <Ionicons name={isPaused ? "play" : "pause"} size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={stopSpeech} style={styles.controlButton}>
                            <Ionicons name="stop" size={24} color={colors.tint} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveToVerse('next')} style={styles.controlButton}>
                            <Ionicons name="play-skip-forward" size={24} color={colors.tint} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Bible;