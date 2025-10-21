import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import type { Category } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { Edit, Trash, PlusCircle, Tag } from 'lucide-react';
import Card from './ui/Card';

const CategoryForm: React.FC<{ category?: Category; onSave: (category: Omit<Category, 'id'> | Category) => void; onCancel: () => void; }> = ({ category, onSave, onCancel }) => {
    const [name, setName] = useState(category?.name || '');
    const [icon, setIcon] = useState(category?.icon || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const categoryData = { name, icon };
        if (category) {
            onSave({ ...category, ...categoryData });
        } else {
            onSave(categoryData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Category Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Icon (Optional Emoji)</label>
                <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g., 🛒" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"/>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
};


const CategoryManager: React.FC = () => {
    const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    const openAddModal = () => {
        setEditingCategory(undefined);
        setModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setModalOpen(true);
    };

    const handleSave = (categoryData: Omit<Category, 'id'> | Category) => {
        if ('id' in categoryData) {
            updateCategory(categoryData);
        } else {
            addCategory(categoryData);
        }
        setModalOpen(false);
    };
    
    const confirmDelete = () => {
        if (deletingCategory) {
            deleteCategory(deletingCategory.id);
            setDeletingCategory(null);
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Categories</h2>
                <Button onClick={openAddModal}>
                    <PlusCircle size={20} className="mr-2" />
                    Add Category
                </Button>
            </div>
            {categories.length > 0 ? (
                <ul className="space-y-2">
                    {categories.map(category => (
                        <li key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center">
                               {category.icon ? (
                                    <span className="text-2xl mr-4">{category.icon}</span>
                                ) : (
                                    <span className="text-2xl mr-4 text-gray-400"><Tag /></span>
                                )}
                               <span className="font-medium">{category.name}</span>
                            </div>
                            <div>
                                <button onClick={() => openEditModal(category)} className="text-primary-600 hover:text-primary-800 mr-2"><Edit size={18} /></button>
                                <button onClick={() => setDeletingCategory(category)} className="text-red-600 hover:text-red-800"><Trash size={18} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <p>No categories found. Add one to get started!</p>
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'}>
                <CategoryForm
                    category={editingCategory}
                    onSave={handleSave}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
            
            {deletingCategory && (
                <Modal 
                    isOpen={!!deletingCategory} 
                    onClose={() => setDeletingCategory(null)} 
                    title="Confirm Deletion"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setDeletingCategory(null)}>Cancel</Button>
                            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                        </>
                    }
                >
                    <p>Are you sure you want to delete the category <strong>{deletingCategory.name}</strong>? This action cannot be undone.</p>
                </Modal>
            )}
        </Card>
    );
};

export default CategoryManager;
