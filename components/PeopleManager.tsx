import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { HouseholdMember } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Edit, Trash, PlusCircle } from 'lucide-react';
import Card from './ui/Card';

const PersonForm: React.FC<{ person?: HouseholdMember; onSave: (person: Omit<HouseholdMember, 'id'> | HouseholdMember) => Promise<void>; onCancel: () => void; }> = ({ person, onSave, onCancel }) => {
    const [name, setName] = useState(person?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const personData = { name };
        try {
            if (person) {
                await onSave({ ...person, ...personData });
            } else {
                await onSave(personData);
            }
            onCancel();
        } catch (error) {
            console.error("Save failed in form:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Person's Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
};


const PeopleManager: React.FC = () => {
    const { people, addPerson, updatePerson, deletePerson } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<HouseholdMember | undefined>(undefined);
    const [deletingPerson, setDeletingPerson] = useState<HouseholdMember | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openAddModal = () => {
        setEditingPerson(undefined);
        setModalOpen(true);
    };

    const openEditModal = (person: HouseholdMember) => {
        setEditingPerson(person);
        setModalOpen(true);
    };

    const handleSave = async (personData: Omit<HouseholdMember, 'id'> | HouseholdMember) => {
        if ('id' in personData) {
            await updatePerson(personData);
        } else {
            await addPerson(personData);
        }
    };
    
    const confirmDelete = async () => {
        if (deletingPerson) {
            setIsDeleting(true);
            try {
                await deletePerson(deletingPerson.id);
                setDeletingPerson(null);
            } catch (error) {
                console.error("Delete failed:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage People</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Person
                </Button>
            </div>
            {people.length > 0 ? (
                <ul className="space-y-2">
                    {people.map(person => (
                        <li key={person.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium">{person.name}</span>
                            <div>
                                <button onClick={() => openEditModal(person)} className="text-primary-600 hover:text-primary-800 mr-2"><Edit size={18} /></button>
                                <button onClick={() => setDeletingPerson(person)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
             ) : (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <p>No people found. Add one to get started!</p>
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingPerson ? 'Edit Person' : 'Add Person'}>
                <PersonForm
                    person={editingPerson}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
            
            {deletingPerson && (
                <Modal 
                    isOpen={!!deletingPerson} 
                    onClose={() => setDeletingPerson(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingPerson(null)} disabled={isDeleting}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete <strong>{deletingPerson.name}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </Card>
    );
};

export default PeopleManager;