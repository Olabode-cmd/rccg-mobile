import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import bible from "../../assets/bible/en_kjv.json";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import FadingHeaderScrollView from '@/components/FadingHeaderScroll';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const Bible = () => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];
    
    // Define Old and New Testament book indices
    const OLD_TESTAMENT_BOOKS = Array.from({ length: 39 }, (_, i) => i); // 0-38
    const NEW_TESTAMENT_BOOKS = Array.from({ length: 27 }, (_, i) => i + 39); // 39-65

    // State declarations
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentSpeakingVerse, setCurrentSpeakingVerse] = useState<number | null>(null);
    const [currentVerse, setCurrentVerse] = useState<number>(0);
    const [isPaused, setIsPaused] = useState(false);
    const [speechText, setSpeechText] = useState<string>('');
    const [view, setView] = useState<'testament' | 'oldTestament' | 'newTestament' | 'chapter' | 'verse'>('testament');
    const [selectedBook, setSelectedBook] = useState(0);
    const [selectedChapter, setSelectedChapter] = useState(0);
    const [bookNames, setBookNames] = useState<string[]>([]);
    const [quickNavBook, setQuickNavBook] = useState<number>(0);
    const [quickNavChapter, setQuickNavChapter] = useState<number>(1);
    const [quickNavVerse, setQuickNavVerse] = useState<number>(1);

    // Refs
    const flatListRef = useRef<FlatList>(null);

    // Type assertion for Bible structure
    const typedBible = bible as Array<{
        abbrev: string,
        name?: string,
        chapters: string[][]
    }>;

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
        switch (view) {
            case 'verse':
                setView('chapter');
                break;
            case 'chapter':
                setView(selectedBook < 39 ? 'oldTestament' : 'newTestament');
                break;
            case 'oldTestament':
            case 'newTestament':
                setView('testament');
                break;
            default:
                break;
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

    // Render testament selection screen
    const renderTestamentSelection = () => {
        return (
            <View>
                <QuickNavigation />
                <Text style={styles.testamentTitle}>Testaments</Text>
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => setView('oldTestament')}
                >
                    <Text style={styles.itemText}>Old Testament</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.item}
                    onPress={() => setView('newTestament')}
                >
                    <Text style={styles.itemText}>New Testament</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render books for a specific testament
    const renderTestamentBooks = (isOldTestament: boolean) => {
        const testamentBooks = getTestamentBooks(isOldTestament);
        const bookIndices = isOldTestament ? OLD_TESTAMENT_BOOKS : NEW_TESTAMENT_BOOKS;

        return (
            <View>
                <Text style={styles.testamentTitle}>
                    {isOldTestament ? 'Old Testament' : 'New Testament'}
                </Text>
                <FlatList
                    data={testamentBooks}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() => {
                                setSelectedBook(bookIndices[index]);
                                setSelectedChapter(0);
                                setView('chapter');
                            }}
                        >
                            <Text style={styles.itemText}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.list}
                />
            </View>
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
        Speech.speak(text, {
            onStart: () => {
                // Verse started speaking
            },
            onDone: () => {
                // Always call onComplete when verse is done, regardless of pause state
                onComplete?.();
            },
            onError: (error) => {
                setIsSpeaking(false);
                setCurrentSpeakingVerse(null);
            },
            rate: 0.9,
            pitch: 1.0,
            language: 'en-US'
        });
    };

    const speakVerses = (verses: string[], startIndex: number = 0, force: boolean = false) => {
        if (!isSpeaking && !force) {
            return;
        }
        
        setCurrentVerse(startIndex);
        setCurrentSpeakingVerse(startIndex);

        const verseText = String(verses[startIndex]);
        const verseToSpeak = `Verse ${startIndex + 1}. ${verseText}`;

        flatListRef.current?.scrollToIndex({
            index: startIndex,
            animated: true,
            viewPosition: 0.5,
        });

        speakVerse(verseToSpeak, () => {
            if ((isSpeaking || force) && startIndex + 1 < verses.length) {
                speakVerses(verses, startIndex + 1, force);
            } else if (startIndex + 1 >= verses.length) {
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
        Speech.stop();
        setIsSpeaking(false);
        setCurrentSpeakingVerse(null);
        setCurrentVerse(0);
        setIsPaused(false);
    };

    const startReading = () => {
        if (view === 'verse') {
            const verses = typedBible[selectedBook].chapters[selectedChapter];
            if (verses.length > 0) {
                speakVerses(verses, 0, true);
                setIsSpeaking(true);
                setIsPaused(false);
            }
        }
    };

    const toggleSpeech = () => {
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

    // Add helper function to get chapter count
    const getChapterCount = (bookIndex: number) => {
        return typedBible[bookIndex]?.chapters.length || 0;
    };

    // Add helper function to get verse count
    const getVerseCount = (bookIndex: number, chapterIndex: number) => {
        return typedBible[bookIndex]?.chapters[chapterIndex]?.length || 0;
    };

    // Add navigation handler
    const handleQuickNavigation = () => {
        setSelectedBook(quickNavBook);
        setSelectedChapter(quickNavChapter - 1);
        setView('verse');
        
        // Wait for state updates and then highlight the verse
        setTimeout(() => {
            const verseIndex = quickNavVerse - 1; // Convert to 0-based index
            setCurrentSpeakingVerse(verseIndex);
            
            // Scroll to the verse
            flatListRef.current?.scrollToIndex({
                index: verseIndex,
                animated: true,
                viewPosition: 0.3,
            });

            // Remove highlight after 2 seconds
            setTimeout(() => {
                setCurrentSpeakingVerse(null);
            }, 2000);
        }, 100);
    };

    // Add Quick Navigation component
    const QuickNavigation = () => {
        const chapterCount = getChapterCount(quickNavBook);
        const verseCount = getVerseCount(quickNavBook, quickNavChapter - 1);

        return (
            <View style={styles.quickNavContainer}>
                <Text style={styles.quickNavTitle}>Jump to verse</Text>
                <View style={styles.quickNavRow}>
                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>Book</Text>
                        <Picker
                            selectedValue={quickNavBook}
                            onValueChange={(itemValue: number) => {
                                setQuickNavBook(itemValue);
                                setQuickNavChapter(1);
                                setQuickNavVerse(1);
                            }}
                            style={styles.select}
                        >
                            {bookNames.map((book, index) => (
                                <Picker.Item key={index} label={book} value={index} />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>Chapter</Text>
                        <Picker
                            selectedValue={quickNavChapter}
                            onValueChange={(itemValue: number) => {
                                setQuickNavChapter(itemValue);
                                setQuickNavVerse(1);
                            }}
                            style={styles.select}
                        >
                            {Array.from({ length: chapterCount }, (_, i) => i + 1).map((num) => (
                                <Picker.Item key={num} label={num.toString()} value={num} />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>Verse</Text>
                        <Picker
                            selectedValue={quickNavVerse}
                            onValueChange={(itemValue: number) => setQuickNavVerse(itemValue)}
                            style={styles.select}
                        >
                            {Array.from({ length: verseCount }, (_, i) => i + 1).map((num) => (
                                <Picker.Item key={num} label={num.toString()} value={num} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <TouchableOpacity style={styles.goButton} onPress={handleQuickNavigation}>
                    <Text style={styles.goButtonText}>Go to Verse</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Get book names for a specific testament
    const getTestamentBooks = (isOldTestament: boolean) => {
        const bookIndices = isOldTestament ? OLD_TESTAMENT_BOOKS : NEW_TESTAMENT_BOOKS;
        return bookIndices.map(index => {
            const book = typedBible[index];
            return book.name || book.abbrev || `Book ${index + 1}`;
        });
    };

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
        quickNavContainer: {
            backgroundColor: colors.background,
            padding: 16,
            marginBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.icon + '40',
        },
        quickNavRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        selectContainer: {
            flex: 1,
            marginHorizontal: 4,
        },
        select: {
            backgroundColor: colors.tint + '10',
            borderRadius: 8,
            padding: 8,
            color: colors.text,
        },
        selectLabel: {
            color: colors.text,
            fontSize: 12,
            marginBottom: 4,
            opacity: 0.7,
        },
        goButton: {
            backgroundColor: colors.tint,
            borderRadius: 8,
            padding: 12,
            alignItems: 'center',
            marginTop: 8,
        },
        goButtonText: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
        quickNavTitle: {
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 12,
            opacity: 0.8,
        },
        testamentItem: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.icon,
            backgroundColor: colors.background,
        },
        testamentTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: 24,
            marginBottom: 8,
            paddingHorizontal: 20,
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#141414" />
            <View style={styles.container}>
                <View style={styles.header}>
                    {view !== 'testament' && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.title}>Holy Bible</Text>
                    {view === 'verse' && !isSpeaking && (
                        <TouchableOpacity onPress={toggleSpeech} style={styles.headerButton}>
                            <Ionicons 
                                name="play" 
                                size={24} 
                                color={colors.tint}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {view === 'testament' && renderTestamentSelection()}
                {view === 'oldTestament' && renderTestamentBooks(true)}
                {view === 'newTestament' && renderTestamentBooks(false)}
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