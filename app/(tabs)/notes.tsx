import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Modal, SafeAreaView, Pressable, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getDb } from '@/util/db';
import { StatusBar } from 'expo-status-bar';

interface Note {
    id: number;
    title: string;
    content: string;
    created_at: number;
}

const Notes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentNote, setCurrentNote] = useState<Partial<Note>>({ id: null, title: '', content: '' });
    const [isEditing, setIsEditing] = useState(false);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme];

    // CREATE TABLE on mount
    useEffect(() => {
        (async () => {
            const db = await getDb();
            try {
                await db.execAsync(`
          CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            created_at INTEGER
          );
        `);
                console.log('✅ Table ensured');
                await loadNotes();
            } catch (error) {
                console.error('❌ Error creating table:', error);
            }
        })();
    }, []);

    // LOAD NOTES
    const loadNotes = async () => {
        const db = await getDb();
        try {
            const result = await db.getAllAsync<Note>('SELECT * FROM notes ORDER BY created_at DESC');
            setNotes(result);
        } catch (error) {
            console.error('❌ Error loading notes:', error);
        }
    };

    // SAVE OR UPDATE NOTE
    const saveNote = async () => {
        const db = await getDb();
        if (!currentNote.title?.trim() && !currentNote.content?.trim()) {
            Alert.alert('Error', 'Please enter a title or content for your note');
            return;
        }

        try {
            if (isEditing && currentNote.id !== null) {
                await db.runAsync(
                    'UPDATE notes SET title = ?, content = ? WHERE id = ?',
                    currentNote.title,
                    currentNote.content,
                    currentNote.id
                );
            } else {
                await db.runAsync(
                    'INSERT INTO notes (title, content, created_at) VALUES (?, ?, ?)',
                    currentNote.title,
                    currentNote.content,
                    Date.now()
                );
            }
            await loadNotes();
            closeModal();
        } catch (error) {
            console.error('❌ Error saving note:', error);
        }
    };

    // DELETE NOTE
    const deleteNote = async (id: number) => {
        Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const db = await getDb();
                    try {
                        await db.runAsync('DELETE FROM notes WHERE id = ?', id);
                        await loadNotes();
                        if (modalVisible && currentNote.id === id) closeModal();
                    } catch (error) {
                        console.error('❌ Error deleting note:', error);
                    }
                },
            },
        ]);
    };

    // MODAL HANDLERS
    const openNewNoteModal = () => {
        setCurrentNote({ id: null, title: '', content: '' });
        setIsEditing(false);
        setModalVisible(true);
    };

    const openEditNoteModal = (note: Note) => {
        setCurrentNote(note);
        setIsEditing(true);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setCurrentNote({ id: null, title: '', content: '' });
    };

    const renderNoteItem = ({ item }: { item: Note }) => {
        const noteTitle = item.title.trim() ? item.title : 'Untitled Note';
        const notePreview = item.content.length > 30 ? `${item.content.substring(0, 30)}...` : item.content;
        const createdDate = new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        return (
            <TouchableOpacity
                style={styles.noteItem}
                onPress={() => openEditNoteModal(item)}
                activeOpacity={0.8}
            >
                <View style={styles.noteContent}>
                    <View style={{ display: 'flex', flexDirection: 'column', gap: 4}}>
                        <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">
                            {noteTitle}
                        </Text>

                        <View style={styles.dateContainer}>
                            <Feather name="calendar" size={12} color="#7B8794" />
                            <Text style={styles.dateText}>{createdDate}</Text>
                        </View>
                    </View>
                    <View style={styles.noteDetailsContainer}>
                        <Text style={styles.notePreview} numberOfLines={1} ellipsizeMode="tail">
                            {notePreview}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNote(item.id)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Feather name="trash-2" size={18} color="#FF6B6B" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>Click + to add a new note</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={styles.container}>
                <Text style={[styles.header, { color: colors.text }]}>Notes</Text>

                <FlatList
                    data={notes}
                    renderItem={renderNoteItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.notesList}
                    ListEmptyComponent={renderEmptyList}
                />

                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: '#2196F3' }]}
                    onPress={openNewNoteModal}
                >
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Note Editor Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={closeModal} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="#2196F3" />
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            {isEditing && (
                                <TouchableOpacity
                                    style={styles.deleteButtonModal}
                                    onPress={() => deleteNote(currentNote.id)}
                                >
                                    <Feather name="trash-2" size={24} color="#FF6B6B" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                                <Feather name="check" size={24} color="#2196F3" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.editorContainer}>
                        <TextInput
                            style={[styles.titleInput, { color: colors.text }]}
                            placeholder="Title"
                            placeholderTextColor={colors.text + '80'}
                            value={currentNote.title}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, title: text })}
                        />

                        <TextInput
                            style={[styles.contentInput, { color: colors.text }]}
                            placeholder="Start typing..."
                            placeholderTextColor={colors.text + '80'}
                            multiline
                            value={currentNote.content}
                            onChangeText={(text) => setCurrentNote({ ...currentNote, content: text })}
                        />
                    </View>
                </SafeAreaView>
            </Modal>

            <StatusBar style='dark' />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        paddingTop: 14,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 12,
    },
    notesList: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.7,
    },
    // noteItem: {
    //     flexDirection: 'row',
    //     borderRadius: 10,
    //     padding: 16,
    //     marginBottom: 12,
    //     elevation: 2,
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 1 },
    //     shadowOpacity: 0.2,
    //     shadowRadius: 2,
    // },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f8fc',
        borderColor: 'transparent',
        borderRadius: 32,
        paddingHorizontal: 22,
        paddingVertical: 12,
        marginBottom: 12,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.05,
        // shadowRadius: 2,
        elevation: 1,
    },
    noteContent: {
        flex: 1,
        marginRight: 12,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 4,
    },
    noteDetailsContainer: {
        flexDirection: 'column',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    dateText: {
        fontSize: 12,
        color: '#7B8794',
        marginLeft: 4,
    },
    notePreview: {
        fontSize: 14,
        color: '#4A5568',
    },
    deleteButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF',
    },
    addButton: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        padding: 8,
    },
    modalActions: {
        flexDirection: 'row',
    },
    saveButton: {
        padding: 8,
    },
    deleteButtonModal: {
        padding: 8,
        marginRight: 8,
    },
    editorContainer: {
        flex: 1,
        padding: 16,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        padding: 8,
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
        padding: 8,
    },
});

export default Notes;