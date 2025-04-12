'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Card, Typography, Space, App } from 'antd';
import axios from '../../../lib/axios';
import { useParams } from 'next/navigation';

const { Title } = Typography;

type Note = {
  id: number;
  title: string;
};

export default function NotesPage() {
  const [notesName, setNotesName] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const { message } = App.useApp();
  const params = useParams();
  const vaultId = params?.vault_id as string;

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/vaults/${vaultId}/notes`);
      setNotes(response.data);
    } catch (error) {
      message.error('Failed to fetch notes');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [vaultId, message]);

  const handleCreateNotes = async () => {
    if (!notesName.trim()) return;

    try {
      setLoading(true);
      await axios.post(`/vaults/${vaultId}/notes`, {
        title: notesName.trim(),
      });

      message.success('Note created successfully');
      setNotesName('');
      fetchNotes();
    } catch (error) {
      message.error('Failed to create note');
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      setLoading(true);
      await axios.delete(`/notes/${noteId}`);

      message.success('Note deleted successfully');
      fetchNotes();
    } catch (error) {
      message.error('Failed to delete note');
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div style={{ display: 'flex', padding: '24px', backgroundColor: '#0f1014', minHeight: '100vh', color: 'white', gap: '24px' }}>
      <div style={{ flex: 7, backgroundColor: '#1c1d22', padding: '16px', borderRadius: '6px' }}>
        <Title level={3} style={{ color: 'white', marginBottom: '24px' }}>My Notes</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          {notes.map((note) => (
            <Card
              key={note.id}
              style={{
                backgroundColor: '#25262b',
                borderColor: '#373a40',
                marginBottom: '12px',
              }}
              styles={{
                body: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  color: 'white',
                },
              }}
            >
              <span style={{ fontSize: '16px' }}>{note.title}</span>
              <Space>
                <Button type="primary" size="middle">View</Button>
                <Button size="middle">Edit</Button>
                <Button
                  danger
                  size="middle"
                  onClick={() => handleDeleteNote(note.id)}
                  loading={loading}
                >
                  Delete
                </Button>
              </Space>
            </Card>
          ))}
        </Space>
      </div>

      <div style={{ flex: 3, backgroundColor: '#1c1d22', padding: '24px', borderRadius: '6px', height: 'fit-content' }}>
        <Title level={4} style={{ color: 'white', marginBottom: '16px' }}>Create New Note</Title>
        <Input
          placeholder="Notes Name"
          value={notesName}
          onChange={(e) => setNotesName(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <Button
          type="primary"
          block
          onClick={handleCreateNotes}
          disabled={!notesName.trim() || loading}
          size="large"
          loading={loading}
        >
          Create
        </Button>
      </div>
    </div>
  );
}