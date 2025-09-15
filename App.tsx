import React, { useEffect, useState } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { useAuthStore } from './src/store/useAuthStore'
import LoginScreen from './src/screens/LoginScreen'
import SignUpScreen from './src/screens/SignUpScreen'
import NotesListScreen from './src/screens/NotesListScreen'
import NoteEditorScreen from './src/screens/NoteEditorScreen'
import { Note } from './src/types/database'

type Screen = 'login' | 'signup' | 'notes' | 'editor'

export default function App() {
  const { user, loading } = useAuthStore()
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  useEffect(() => {
    if (user) {
      setCurrentScreen('notes')
    } else {
      setCurrentScreen('login')
    }
  }, [user])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  const handleNavigateToSignUp = () => setCurrentScreen('signup')
  const handleNavigateToLogin = () => setCurrentScreen('login')
  const handleNotePress = (note: Note) => {
    setSelectedNote(note)
    setCurrentScreen('editor')
  }
  const handleCreateNote = () => {
    setSelectedNote(null)
    setCurrentScreen('editor')
  }
  const handleBackToNotes = () => setCurrentScreen('notes')

  switch (currentScreen) {
    case 'login':
      return <LoginScreen onNavigateToSignUp={handleNavigateToSignUp} />
    case 'signup':
      return <SignUpScreen onNavigateToLogin={handleNavigateToLogin} />
    case 'notes':
      return (
        <NotesListScreen
          onNotePress={handleNotePress}
          onCreateNote={handleCreateNote}
        />
      )
    case 'editor':
      return (
        <NoteEditorScreen
          note={selectedNote}
          onBack={handleBackToNotes}
        />
      )
    default:
      return <LoginScreen onNavigateToSignUp={handleNavigateToSignUp} />
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
})
