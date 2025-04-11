import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, FlatList, StatusBar } from 'react-native';
import bible from "../../assets/bible/en_kjv.json";

const Bible = () => {
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

        return (
            <View style={styles.container}>
                <Text style={styles.headerText}>
                    {bookNames[selectedBook]} {selectedChapter + 1}
                </Text>
                <ScrollView style={styles.verseContainer}>
                    {verses.map((verse, index) => (
                        <View key={index} style={styles.verseWrapper}>
                            <Text style={styles.verseNumber}>{index + 1}</Text>
                            <Text style={styles.verseText}>{verse}</Text>
                        </View>
                    ))}

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
                </ScrollView>
            </View>
        );
    };

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
                </View>

                {view === 'book' && renderBookSelection()}
                {view === 'chapter' && renderChapterSelection()}
                {view === 'verse' && renderVerseScreen()}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#141414',
        paddingTop: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#141414',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
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
        color: '#6495ED',
        fontSize: 16,
    },
    list: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    itemText: {
        fontSize: 18,
        color: '#fff',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
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
        backgroundColor: '#222',
        borderRadius: 8,
    },
    chapterText: {
        fontSize: 18,
        color: '#fff',
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
        color: '#6495ED',
        marginRight: 8,
        width: 24,
        textAlign: 'right',
    },
    verseText: {
        fontSize: 18,
        color: '#fff',
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
        backgroundColor: '#2E3F5E',
        padding: 14,
        borderRadius: 8,
        minWidth: 130,
        alignItems: 'center',
    },
    navigationButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    disabledButton: {
        backgroundColor: '#1F2937',
        opacity: 0.5,
    }
});

export default Bible;