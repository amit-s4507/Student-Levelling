"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface StudyGroup {
  id: string;
  name: string;
  topic: string;
  members: number;
  isLive: boolean;
  description: string;
  creator: {
    name: string;
    image: string;
  };
  schedule: {
    day: string;
    time: string;
  };
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (group: Omit<StudyGroup, 'id' | 'members' | 'isLive'>) => void;
}

function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useUser();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      topic,
      description,
      creator: {
        name: user?.fullName || 'Anonymous',
        image: user?.imageUrl || '/default-avatar.png'
      },
      schedule: {
        day: '',
        time: ''
      }
    });
    setName('');
    setTopic('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-6">Create New Study Group</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter topic (e.g., Programming, Mathematics)"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your study group"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              required
            />
          </div>
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function StudyGroups() {
  const { user } = useUser();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [displayGroups, setDisplayGroups] = useState<StudyGroup[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mockGroups = useMemo(() => ([
    {
      id: '1',
      name: 'Web Development Study Group',
      description: 'Learn HTML, CSS, and JavaScript together',
      topic: 'Programming',
      members: 15,
      isLive: true,
      creator: {
        name: 'John Doe',
        image: '/default-avatar.png'
      },
      schedule: {
        day: 'Monday',
        time: '18:00'
      }
    },
    {
      id: '2',
      name: 'Math Problem Solving',
      description: 'Practice advanced mathematics problems',
      topic: 'Mathematics',
      members: 8,
      isLive: false,
      creator: {
        name: 'Jane Smith',
        image: '/default-avatar.png'
      },
      schedule: {
        day: 'Wednesday',
        time: '17:00'
      }
    }
  ]), []); // Empty dependency array since this is static data

  useEffect(() => {
    setGroups(mockGroups);
    setDisplayGroups(mockGroups);
  }, [mockGroups]);

  const handleCreateGroup = (newGroup: Omit<StudyGroup, 'id' | 'members' | 'isLive' | 'creator'>) => {
    const group: StudyGroup = {
      ...newGroup,
      id: Date.now().toString(),
      members: 1,
      isLive: false,
      creator: {
        name: user?.fullName || 'Anonymous',
        image: user?.imageUrl || '/default-avatar.png'
      }
    };
    const updatedGroups = [...groups, group];
    setGroups(updatedGroups);
    setDisplayGroups(updatedGroups);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(term.toLowerCase()) ||
      group.topic.toLowerCase().includes(term.toLowerCase()) ||
      group.description.toLowerCase().includes(term.toLowerCase())
    );
    setDisplayGroups(filtered);
  };

  const displayedGroups = activeTab === 'my-groups'
    ? groups.filter(group => group.creator?.name === user?.fullName)
    : displayGroups;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">Study Groups</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Join live study sessions or create your own group to learn together
          </p>
        </motion.div>

        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab('all')}
            variant={activeTab === 'all' ? 'default' : 'outline'}
            className="px-6"
          >
            All Groups
          </Button>
          <Button
            onClick={() => setActiveTab('my-groups')}
            variant={activeTab === 'my-groups' ? 'default' : 'outline'}
            className="px-6"
          >
            My Groups
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            Create New Group
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={group.creator.image}
                      alt={group.creator.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {group.creator.name}
                      </p>
                    </div>
                  </div>
                  {group.isLive && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                    {group.topic}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {group.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {group.members} members
                    </span>
                  </div>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    {group.isLive ? 'Join Session' : 'Join Group'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
} 