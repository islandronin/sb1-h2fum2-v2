import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { AddContactModal } from '../components/AddContactModal';
import { ContactCard } from '../components/ContactCard';
import { UserCircle, LogOut, Plus } from 'lucide-react';
import type { Contact } from '../types/Contact';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, [user]);

  const loadContacts = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async (contactData: Partial<Contact>) => {
    try {
      if (!user?.id) return;

      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert([{
          user_id: user.id,
          name: contactData.name,
          job_title: contactData.jobTitle,
          image_url: contactData.imageUrl,
          about: contactData.about,
          website: contactData.website,
          calendar_link: contactData.calendarLink,
          category: contactData.category,
          tags: contactData.tags || [],
        }])
        .select()
        .single();

      if (contactError) throw contactError;

      setContacts(prev => [...prev, newContact]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    try {
      if (!user?.id || !updatedContact.id) return;

      const { error } = await supabase
        .from('contacts')
        .update({
          name: updatedContact.name,
          job_title: updatedContact.jobTitle,
          image_url: updatedContact.imageUrl,
          about: updatedContact.about,
          website: updatedContact.website,
          calendar_link: updatedContact.calendarLink,
          category: updatedContact.category,
          tags: updatedContact.tags,
        })
        .eq('id', updatedContact.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev =>
        prev.map(contact =>
          contact.id === updatedContact.id ? updatedContact : contact
        )
      );
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Networking CRM</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCircle className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={() => logout()}
                className="text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Contacts</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onUpdateContact={handleUpdateContact}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
            <p className="text-gray-500">Click the Add Contact button to get started</p>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddContactModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddContact}
        />
      )}
    </div>
  );
}