import React, { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { fetchLinkedInProfile } from '../services/linkedinApi';
import { uploadContactImage, uploadImageFromUrl } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import type { Contact } from '../types/Contact';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Partial<Contact>) => void;
}

export function AddContactModal({ isOpen, onClose, onSubmit }: AddContactModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    imageUrl: '',
    about: '',
    website: '',
    calendarLink: '',
    linkedinUrl: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = await uploadContactImage(file, user.id);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInFetch = async () => {
    if (!formData.linkedinUrl || !user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First fetch the LinkedIn profile
      const profile = await fetchLinkedInProfile(formData.linkedinUrl);
      
      // Update form data with profile info first
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        jobTitle: profile.jobTitle || prev.jobTitle,
        about: profile.about || prev.about,
      }));

      // Then handle the image separately
      if (profile.imageUrl) {
        const imageUrl = await uploadImageFromUrl(profile.imageUrl, user.id);
        if (imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl }));
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch LinkedIn profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const contactData: Partial<Contact> = {
      name: formData.name,
      jobTitle: formData.jobTitle,
      imageUrl: formData.imageUrl,
      about: formData.about,
      website: formData.website,
      calendarLink: formData.calendarLink,
      contactMethods: [],
      socialLinks: [],
      conversations: [],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    onSubmit(contactData);
  };

  // Rest of the component remains the same...
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {/* Form JSX remains the same */}
      </div>
    </div>
  );
}